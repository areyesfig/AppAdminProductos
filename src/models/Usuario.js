/**
 * Modelo de Usuario
 * 
 * Este modelo gestiona todas las operaciones relacionadas con usuarios,
 * incluyendo autenticación, autorización y gestión de perfil.
 * 
 * SEGURIDAD IMPLEMENTADA:
 * - Contraseñas hasheadas con bcrypt (12 rondas)
 * - Consultas preparadas para prevenir inyección SQL
 * - Control de intentos de login fallidos
 * - Bloqueo temporal de cuentas tras múltiples intentos fallidos
 * 
 * @module models/Usuario
 * @author Estudiante UA
 * @version 1.0.0
 */

const dbConnection = require('../database/connection');
const bcrypt = require('bcryptjs');
const config = require('../config/config');

/**
 * Clase Usuario - Modelo para gestión de usuarios
 */
class Usuario {
    /**
     * Busca un usuario por su ID
     * 
     * @param {number} id - ID del usuario
     * @returns {Object|null} Usuario encontrado o null
     */
    static findById(id) {
        const db = dbConnection.getConnection();
        const stmt = db.prepare(`
            SELECT id, nombre, email, rol, activo, ultimo_login, fecha_creacion
            FROM usuarios
            WHERE id = ? AND activo = 1
        `);
        return stmt.get(id);
    }

    /**
     * Busca un usuario por su email
     * 
     * @param {string} email - Email del usuario
     * @returns {Object|null} Usuario encontrado o null
     */
    static findByEmail(email) {
        const db = dbConnection.getConnection();
        const stmt = db.prepare(`
            SELECT *
            FROM usuarios
            WHERE email = ?
        `);
        return stmt.get(email.toLowerCase().trim());
    }

    /**
     * Obtiene todos los usuarios (para administradores)
     * 
     * @param {Object} options - Opciones de paginación
     * @param {number} options.limit - Límite de resultados
     * @param {number} options.offset - Desplazamiento
     * @returns {Array} Lista de usuarios
     */
    static findAll({ limit = 10, offset = 0 } = {}) {
        const db = dbConnection.getConnection();
        const stmt = db.prepare(`
            SELECT id, nombre, email, rol, activo, ultimo_login, fecha_creacion
            FROM usuarios
            ORDER BY fecha_creacion DESC
            LIMIT ? OFFSET ?
        `);
        return stmt.all(limit, offset);
    }

    /**
     * Cuenta el total de usuarios
     * 
     * @returns {number} Total de usuarios
     */
    static count() {
        const db = dbConnection.getConnection();
        const stmt = db.prepare('SELECT COUNT(*) as total FROM usuarios');
        return stmt.get().total;
    }

    /**
     * Crea un nuevo usuario
     * 
     * @param {Object} userData - Datos del usuario
     * @param {string} userData.nombre - Nombre del usuario
     * @param {string} userData.email - Email del usuario
     * @param {string} userData.password - Contraseña en texto plano
     * @param {string} [userData.rol='usuario'] - Rol del usuario
     * @returns {Object} Usuario creado con su ID
     * @throws {Error} Si el email ya está registrado
     */
    static async create({ nombre, email, password, rol = 'usuario' }) {
        const db = dbConnection.getConnection();

        // Verificar si el email ya existe
        const existingUser = this.findByEmail(email);
        if (existingUser) {
            throw new Error('El email ya está registrado');
        }

        // Hashear la contraseña con bcrypt
        const passwordHash = await bcrypt.hash(password, config.security.bcryptRounds);

        const stmt = db.prepare(`
            INSERT INTO usuarios (nombre, email, password_hash, rol)
            VALUES (?, ?, ?, ?)
        `);

        const result = stmt.run(
            nombre.trim(),
            email.toLowerCase().trim(),
            passwordHash,
            rol
        );

        return {
            id: result.lastInsertRowid,
            nombre: nombre.trim(),
            email: email.toLowerCase().trim(),
            rol
        };
    }

    /**
     * Actualiza los datos de un usuario
     * 
     * @param {number} id - ID del usuario
     * @param {Object} userData - Datos a actualizar
     * @returns {boolean} true si se actualizó correctamente
     */
    static async update(id, { nombre, email, rol }) {
        const db = dbConnection.getConnection();

        // Si se cambia el email, verificar que no exista
        if (email) {
            const existingUser = this.findByEmail(email);
            if (existingUser && existingUser.id !== id) {
                throw new Error('El email ya está registrado por otro usuario');
            }
        }

        const stmt = db.prepare(`
            UPDATE usuarios
            SET nombre = COALESCE(?, nombre),
                email = COALESCE(?, email),
                rol = COALESCE(?, rol),
                fecha_actualizacion = CURRENT_TIMESTAMP
            WHERE id = ?
        `);

        const result = stmt.run(nombre, email?.toLowerCase().trim(), rol, id);
        return result.changes > 0;
    }

    /**
     * Cambia la contraseña de un usuario
     * 
     * @param {number} id - ID del usuario
     * @param {string} newPassword - Nueva contraseña
     * @returns {boolean} true si se actualizó correctamente
     */
    static async changePassword(id, newPassword) {
        const db = dbConnection.getConnection();
        const passwordHash = await bcrypt.hash(newPassword, config.security.bcryptRounds);

        const stmt = db.prepare(`
            UPDATE usuarios
            SET password_hash = ?,
                fecha_actualizacion = CURRENT_TIMESTAMP
            WHERE id = ?
        `);

        const result = stmt.run(passwordHash, id);
        return result.changes > 0;
    }

    /**
     * Verifica las credenciales de un usuario
     * 
     * @param {string} email - Email del usuario
     * @param {string} password - Contraseña a verificar
     * @returns {Object|null} Usuario si las credenciales son válidas, null si no
     * @throws {Error} Si la cuenta está bloqueada
     */
    static async verifyCredentials(email, password) {
        const user = this.findByEmail(email);

        if (!user) {
            // Registrar intento fallido
            this.registerLoginAttempt(email, false);
            return null;
        }

        // Verificar si la cuenta está bloqueada
        if (user.bloqueado_hasta && new Date(user.bloqueado_hasta) > new Date()) {
            throw new Error('Cuenta bloqueada temporalmente. Intente más tarde.');
        }

        // Verificar si la cuenta está activa
        if (!user.activo) {
            throw new Error('La cuenta está desactivada');
        }

        // Verificar contraseña
        const isValid = await bcrypt.compare(password, user.password_hash);

        if (!isValid) {
            // Incrementar intentos fallidos
            this.incrementFailedAttempts(user.id);
            this.registerLoginAttempt(email, false);
            return null;
        }

        // Login exitoso - resetear intentos y actualizar último login
        this.resetFailedAttempts(user.id);
        this.updateLastLogin(user.id);
        this.registerLoginAttempt(email, true);

        // Retornar usuario sin datos sensibles
        return {
            id: user.id,
            nombre: user.nombre,
            email: user.email,
            rol: user.rol
        };
    }

    /**
     * Incrementa el contador de intentos fallidos
     * 
     * @param {number} userId - ID del usuario
     * @private
     */
    static incrementFailedAttempts(userId) {
        const db = dbConnection.getConnection();
        
        // Obtener intentos actuales
        const user = db.prepare('SELECT intentos_fallidos FROM usuarios WHERE id = ?').get(userId);
        const newAttempts = (user?.intentos_fallidos || 0) + 1;

        let bloqueadoHasta = null;
        if (newAttempts >= config.security.maxLoginAttempts) {
            // Bloquear cuenta temporalmente
            bloqueadoHasta = new Date(Date.now() + config.security.lockoutTime).toISOString();
        }

        const stmt = db.prepare(`
            UPDATE usuarios
            SET intentos_fallidos = ?,
                bloqueado_hasta = ?
            WHERE id = ?
        `);
        stmt.run(newAttempts, bloqueadoHasta, userId);
    }

    /**
     * Resetea el contador de intentos fallidos
     * 
     * @param {number} userId - ID del usuario
     * @private
     */
    static resetFailedAttempts(userId) {
        const db = dbConnection.getConnection();
        const stmt = db.prepare(`
            UPDATE usuarios
            SET intentos_fallidos = 0,
                bloqueado_hasta = NULL
            WHERE id = ?
        `);
        stmt.run(userId);
    }

    /**
     * Actualiza la fecha del último login
     * 
     * @param {number} userId - ID del usuario
     * @private
     */
    static updateLastLogin(userId) {
        const db = dbConnection.getConnection();
        const stmt = db.prepare(`
            UPDATE usuarios
            SET ultimo_login = CURRENT_TIMESTAMP
            WHERE id = ?
        `);
        stmt.run(userId);
    }

    /**
     * Registra un intento de login para auditoría
     * 
     * @param {string} email - Email utilizado
     * @param {boolean} exitoso - Si el intento fue exitoso
     * @param {string} [ipAddress] - Dirección IP
     * @private
     */
    static registerLoginAttempt(email, exitoso, ipAddress = null) {
        const db = dbConnection.getConnection();
        const stmt = db.prepare(`
            INSERT INTO intentos_login (email, ip_address, exitoso)
            VALUES (?, ?, ?)
        `);
        stmt.run(email.toLowerCase(), ipAddress, exitoso ? 1 : 0);
    }

    /**
     * Desactiva un usuario (soft delete)
     * 
     * @param {number} id - ID del usuario
     * @returns {boolean} true si se desactivó correctamente
     */
    static deactivate(id) {
        const db = dbConnection.getConnection();
        const stmt = db.prepare(`
            UPDATE usuarios
            SET activo = 0,
                fecha_actualizacion = CURRENT_TIMESTAMP
            WHERE id = ?
        `);
        const result = stmt.run(id);
        return result.changes > 0;
    }

    /**
     * Activa un usuario previamente desactivado
     * 
     * @param {number} id - ID del usuario
     * @returns {boolean} true si se activó correctamente
     */
    static activate(id) {
        const db = dbConnection.getConnection();
        const stmt = db.prepare(`
            UPDATE usuarios
            SET activo = 1,
                fecha_actualizacion = CURRENT_TIMESTAMP
            WHERE id = ?
        `);
        const result = stmt.run(id);
        return result.changes > 0;
    }
}

module.exports = Usuario;
