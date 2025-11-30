/**
 * Script de inicialización de la base de datos
 * 
 * Este script crea las tablas necesarias para la aplicación y
 * opcionalmente inserta datos de ejemplo para pruebas.
 * 
 * Ejecutar con: npm run init-db
 * 
 * DISEÑO DE BASE DE DATOS:
 * - usuarios: Almacena información de usuarios con contraseñas hasheadas
 * - productos: Catálogo de productos con relación al usuario creador
 * - sesiones_activas: Control de sesiones para mayor seguridad
 * - intentos_login: Registro de intentos de login para prevenir ataques de fuerza bruta
 * 
 * @module database/init
 * @author Estudiante UA
 * @version 1.0.0
 */

const dbConnection = require('./connection');
const bcrypt = require('bcryptjs');
const config = require('../config/config');

/**
 * Esquema SQL para crear las tablas de la base de datos
 * Incluye medidas de seguridad como campos para auditoría y control de acceso
 */
const createTablesSQL = `
    -- Tabla de usuarios
    -- Almacena información de autenticación y perfil de usuarios
    CREATE TABLE IF NOT EXISTS usuarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre VARCHAR(100) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        rol VARCHAR(20) DEFAULT 'usuario' CHECK(rol IN ('admin', 'usuario', 'moderador')),
        activo BOOLEAN DEFAULT 1,
        intentos_fallidos INTEGER DEFAULT 0,
        bloqueado_hasta DATETIME,
        ultimo_login DATETIME,
        fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
        fecha_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Índice para búsquedas rápidas por email
    CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);

    -- Tabla de productos
    -- Catálogo de productos con información de auditoría
    CREATE TABLE IF NOT EXISTS productos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre VARCHAR(200) NOT NULL,
        descripcion TEXT,
        precio DECIMAL(10, 2) NOT NULL CHECK(precio >= 0),
        stock INTEGER DEFAULT 0 CHECK(stock >= 0),
        categoria VARCHAR(100),
        imagen_url VARCHAR(500),
        activo BOOLEAN DEFAULT 1,
        usuario_id INTEGER NOT NULL,
        fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
        fecha_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
    );

    -- Índices para búsquedas eficientes
    CREATE INDEX IF NOT EXISTS idx_productos_nombre ON productos(nombre);
    CREATE INDEX IF NOT EXISTS idx_productos_categoria ON productos(categoria);
    CREATE INDEX IF NOT EXISTS idx_productos_usuario ON productos(usuario_id);

    -- Tabla de sesiones activas
    -- Para control de sesiones y cierre de sesión remoto
    CREATE TABLE IF NOT EXISTS sesiones_activas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        usuario_id INTEGER NOT NULL,
        token_hash VARCHAR(255) NOT NULL,
        ip_address VARCHAR(45),
        user_agent TEXT,
        fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
        fecha_expiracion DATETIME NOT NULL,
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
    );

    -- Tabla de registro de intentos de login
    -- Para detección de ataques de fuerza bruta
    CREATE TABLE IF NOT EXISTS intentos_login (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email VARCHAR(255) NOT NULL,
        ip_address VARCHAR(45),
        exitoso BOOLEAN NOT NULL,
        fecha DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Índice para limpieza periódica de registros antiguos
    CREATE INDEX IF NOT EXISTS idx_intentos_fecha ON intentos_login(fecha);

    -- Tabla de logs de auditoría
    -- Registro de acciones importantes para seguridad
    CREATE TABLE IF NOT EXISTS logs_auditoria (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        usuario_id INTEGER,
        accion VARCHAR(100) NOT NULL,
        tabla_afectada VARCHAR(50),
        registro_id INTEGER,
        datos_anteriores TEXT,
        datos_nuevos TEXT,
        ip_address VARCHAR(45),
        fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL
    );

    -- Índice para consultas de auditoría
    CREATE INDEX IF NOT EXISTS idx_logs_usuario ON logs_auditoria(usuario_id);
    CREATE INDEX IF NOT EXISTS idx_logs_fecha ON logs_auditoria(fecha);
`;

/**
 * Inicializa la base de datos creando las tablas necesarias
 */
async function initializeDatabase() {
    console.log('🚀 Iniciando configuración de la base de datos...\n');

    try {
        const db = dbConnection.getConnection();

        // Ejecutar creación de tablas
        db.exec(createTablesSQL);
        console.log('✅ Tablas creadas correctamente\n');

        // Crear usuario administrador por defecto si no existe
        await createDefaultAdmin(db);

        // Insertar datos de ejemplo
        await insertSampleData(db);

        console.log('\n🎉 Base de datos inicializada correctamente');
        console.log('📧 Usuario admin: admin@ejemplo.com');
        console.log('🔑 Contraseña admin: Admin123!\n');

    } catch (error) {
        console.error('❌ Error al inicializar la base de datos:', error.message);
        process.exit(1);
    } finally {
        dbConnection.close();
    }
}

/**
 * Crea el usuario administrador por defecto
 * 
 * @param {Database} db - Instancia de la base de datos
 */
async function createDefaultAdmin(db) {
    const checkAdmin = db.prepare('SELECT id FROM usuarios WHERE email = ?');
    const adminExists = checkAdmin.get('admin@ejemplo.com');

    if (!adminExists) {
        // Generar hash seguro de la contraseña
        const passwordHash = await bcrypt.hash('Admin123!', config.security.bcryptRounds);

        const insertAdmin = db.prepare(`
            INSERT INTO usuarios (nombre, email, password_hash, rol, activo)
            VALUES (?, ?, ?, ?, ?)
        `);

        insertAdmin.run('Administrador', 'admin@ejemplo.com', passwordHash, 'admin', 1);
        console.log('👤 Usuario administrador creado');
    } else {
        console.log('ℹ️  Usuario administrador ya existe');
    }
}

/**
 * Inserta datos de ejemplo para pruebas
 * 
 * @param {Database} db - Instancia de la base de datos
 */
async function insertSampleData(db) {
    // Verificar si ya hay productos
    const checkProducts = db.prepare('SELECT COUNT(*) as count FROM productos');
    const { count } = checkProducts.get();

    if (count === 0) {
        // Obtener ID del admin
        const getAdmin = db.prepare('SELECT id FROM usuarios WHERE email = ?');
        const admin = getAdmin.get('admin@ejemplo.com');

        if (admin) {
            const insertProduct = db.prepare(`
                INSERT INTO productos (nombre, descripcion, precio, stock, categoria, usuario_id)
                VALUES (?, ?, ?, ?, ?, ?)
            `);

            // Productos de ejemplo
            const productos = [
                ['Laptop HP ProBook', 'Laptop profesional con Intel i7, 16GB RAM, 512GB SSD', 1299.99, 15, 'Electrónica', admin.id],
                ['Mouse Inalámbrico Logitech', 'Mouse ergonómico con conexión Bluetooth', 49.99, 50, 'Accesorios', admin.id],
                ['Teclado Mecánico RGB', 'Teclado gaming con switches Cherry MX', 129.99, 30, 'Accesorios', admin.id],
                ['Monitor 27" 4K', 'Monitor IPS con resolución 4K UHD', 449.99, 20, 'Electrónica', admin.id],
                ['Webcam HD 1080p', 'Cámara web con micrófono integrado', 79.99, 40, 'Accesorios', admin.id]
            ];

            const insertMany = db.transaction((products) => {
                for (const product of products) {
                    insertProduct.run(...product);
                }
            });

            insertMany(productos);
            console.log(`📦 ${productos.length} productos de ejemplo insertados`);
        }
    } else {
        console.log(`ℹ️  Ya existen ${count} productos en la base de datos`);
    }
}

// Ejecutar inicialización
initializeDatabase();
