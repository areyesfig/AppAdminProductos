/**
 * Modelo de Producto
 * 
 * Este modelo gestiona todas las operaciones CRUD relacionadas con productos.
 * Implementa consultas preparadas para prevenir inyección SQL.
 * 
 * @module models/Producto
 * @author Estudiante UA
 * @version 1.0.0
 */

const dbConnection = require('../database/connection');

/**
 * Clase Producto - Modelo para gestión de productos
 */
class Producto {
    /**
     * Busca un producto por su ID
     * 
     * @param {number} id - ID del producto
     * @returns {Object|null} Producto encontrado o null
     */
    static findById(id) {
        const db = dbConnection.getConnection();
        const stmt = db.prepare(`
            SELECT p.*, u.nombre as creador_nombre
            FROM productos p
            JOIN usuarios u ON p.usuario_id = u.id
            WHERE p.id = ? AND p.activo = 1
        `);
        return stmt.get(id);
    }

    /**
     * Obtiene todos los productos activos con paginación
     * 
     * @param {Object} options - Opciones de búsqueda
     * @param {number} options.limit - Límite de resultados
     * @param {number} options.offset - Desplazamiento
     * @param {string} [options.categoria] - Filtrar por categoría
     * @param {string} [options.busqueda] - Término de búsqueda
     * @param {string} [options.ordenarPor] - Campo para ordenar
     * @param {string} [options.orden] - Dirección del orden (ASC/DESC)
     * @returns {Array} Lista de productos
     */
    static findAll({ 
        limit = 10, 
        offset = 0, 
        categoria = null, 
        busqueda = null,
        ordenarPor = 'fecha_creacion',
        orden = 'DESC'
    } = {}) {
        const db = dbConnection.getConnection();
        
        // Construir consulta dinámica de forma segura
        let query = `
            SELECT p.*, u.nombre as creador_nombre
            FROM productos p
            JOIN usuarios u ON p.usuario_id = u.id
            WHERE p.activo = 1
        `;
        const params = [];

        // Filtro por categoría
        if (categoria) {
            query += ' AND p.categoria = ?';
            params.push(categoria);
        }

        // Búsqueda por nombre o descripción
        if (busqueda) {
            query += ' AND (p.nombre LIKE ? OR p.descripcion LIKE ?)';
            const searchTerm = `%${busqueda}%`;
            params.push(searchTerm, searchTerm);
        }

        // Validar campo de ordenamiento para prevenir inyección SQL
        const camposValidos = ['nombre', 'precio', 'stock', 'fecha_creacion', 'categoria'];
        const ordenValido = camposValidos.includes(ordenarPor) ? ordenarPor : 'fecha_creacion';
        const direccionValida = orden.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

        query += ` ORDER BY p.${ordenValido} ${direccionValida}`;
        query += ' LIMIT ? OFFSET ?';
        params.push(limit, offset);

        const stmt = db.prepare(query);
        return stmt.all(...params);
    }

    /**
     * Cuenta el total de productos (con filtros opcionales)
     * 
     * @param {Object} options - Opciones de filtrado
     * @returns {number} Total de productos
     */
    static count({ categoria = null, busqueda = null } = {}) {
        const db = dbConnection.getConnection();
        
        let query = 'SELECT COUNT(*) as total FROM productos WHERE activo = 1';
        const params = [];

        if (categoria) {
            query += ' AND categoria = ?';
            params.push(categoria);
        }

        if (busqueda) {
            query += ' AND (nombre LIKE ? OR descripcion LIKE ?)';
            const searchTerm = `%${busqueda}%`;
            params.push(searchTerm, searchTerm);
        }

        const stmt = db.prepare(query);
        return stmt.get(...params).total;
    }

    /**
     * Obtiene todas las categorías únicas
     * 
     * @returns {Array} Lista de categorías
     */
    static getCategories() {
        const db = dbConnection.getConnection();
        const stmt = db.prepare(`
            SELECT DISTINCT categoria
            FROM productos
            WHERE activo = 1 AND categoria IS NOT NULL
            ORDER BY categoria ASC
        `);
        return stmt.all().map(row => row.categoria);
    }

    /**
     * Crea un nuevo producto
     * 
     * @param {Object} productData - Datos del producto
     * @param {string} productData.nombre - Nombre del producto
     * @param {string} [productData.descripcion] - Descripción
     * @param {number} productData.precio - Precio
     * @param {number} [productData.stock=0] - Stock disponible
     * @param {string} [productData.categoria] - Categoría
     * @param {string} [productData.imagen_url] - URL de la imagen
     * @param {number} productData.usuario_id - ID del usuario creador
     * @returns {Object} Producto creado con su ID
     */
    static create({ nombre, descripcion, precio, stock = 0, categoria, imagen_url, usuario_id }) {
        const db = dbConnection.getConnection();

        const stmt = db.prepare(`
            INSERT INTO productos (nombre, descripcion, precio, stock, categoria, imagen_url, usuario_id)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `);

        const result = stmt.run(
            nombre.trim(),
            descripcion?.trim() || null,
            parseFloat(precio),
            parseInt(stock, 10),
            categoria?.trim() || null,
            imagen_url?.trim() || null,
            usuario_id
        );

        return {
            id: result.lastInsertRowid,
            nombre: nombre.trim(),
            descripcion: descripcion?.trim(),
            precio: parseFloat(precio),
            stock: parseInt(stock, 10),
            categoria: categoria?.trim(),
            imagen_url: imagen_url?.trim(),
            usuario_id
        };
    }

    /**
     * Actualiza un producto existente
     * 
     * @param {number} id - ID del producto
     * @param {Object} productData - Datos a actualizar
     * @param {number} [userId] - ID del usuario que realiza la actualización (para verificación)
     * @returns {boolean} true si se actualizó correctamente
     */
    static update(id, { nombre, descripcion, precio, stock, categoria, imagen_url }, userId = null) {
        const db = dbConnection.getConnection();

        // Si se proporciona userId, verificar que el producto pertenece al usuario
        if (userId) {
            const product = this.findById(id);
            if (!product) {
                throw new Error('Producto no encontrado');
            }
            // Solo el creador o admin puede editar (esto se maneja en el controlador)
        }

        const stmt = db.prepare(`
            UPDATE productos
            SET nombre = COALESCE(?, nombre),
                descripcion = COALESCE(?, descripcion),
                precio = COALESCE(?, precio),
                stock = COALESCE(?, stock),
                categoria = COALESCE(?, categoria),
                imagen_url = COALESCE(?, imagen_url),
                fecha_actualizacion = CURRENT_TIMESTAMP
            WHERE id = ? AND activo = 1
        `);

        const result = stmt.run(
            nombre?.trim(),
            descripcion?.trim(),
            precio !== undefined ? parseFloat(precio) : null,
            stock !== undefined ? parseInt(stock, 10) : null,
            categoria?.trim(),
            imagen_url?.trim(),
            id
        );

        return result.changes > 0;
    }

    /**
     * Actualiza el stock de un producto
     * 
     * @param {number} id - ID del producto
     * @param {number} cantidad - Cantidad a agregar (puede ser negativa)
     * @returns {boolean} true si se actualizó correctamente
     * @throws {Error} Si el stock resultante sería negativo
     */
    static updateStock(id, cantidad) {
        const db = dbConnection.getConnection();

        // Verificar stock actual
        const product = this.findById(id);
        if (!product) {
            throw new Error('Producto no encontrado');
        }

        const nuevoStock = product.stock + cantidad;
        if (nuevoStock < 0) {
            throw new Error('Stock insuficiente');
        }

        const stmt = db.prepare(`
            UPDATE productos
            SET stock = ?,
                fecha_actualizacion = CURRENT_TIMESTAMP
            WHERE id = ?
        `);

        const result = stmt.run(nuevoStock, id);
        return result.changes > 0;
    }

    /**
     * Elimina un producto (soft delete)
     * 
     * @param {number} id - ID del producto
     * @param {number} [userId] - ID del usuario que elimina (para verificación)
     * @returns {boolean} true si se eliminó correctamente
     */
    static delete(id, userId = null) {
        const db = dbConnection.getConnection();

        // Verificar permisos si se proporciona userId
        if (userId) {
            const product = this.findById(id);
            if (!product) {
                throw new Error('Producto no encontrado');
            }
        }

        const stmt = db.prepare(`
            UPDATE productos
            SET activo = 0,
                fecha_actualizacion = CURRENT_TIMESTAMP
            WHERE id = ?
        `);

        const result = stmt.run(id);
        return result.changes > 0;
    }

    /**
     * Restaura un producto eliminado
     * 
     * @param {number} id - ID del producto
     * @returns {boolean} true si se restauró correctamente
     */
    static restore(id) {
        const db = dbConnection.getConnection();
        const stmt = db.prepare(`
            UPDATE productos
            SET activo = 1,
                fecha_actualizacion = CURRENT_TIMESTAMP
            WHERE id = ?
        `);
        const result = stmt.run(id);
        return result.changes > 0;
    }

    /**
     * Obtiene productos por usuario
     * 
     * @param {number} userId - ID del usuario
     * @param {Object} options - Opciones de paginación
     * @returns {Array} Lista de productos del usuario
     */
    static findByUser(userId, { limit = 10, offset = 0 } = {}) {
        const db = dbConnection.getConnection();
        const stmt = db.prepare(`
            SELECT *
            FROM productos
            WHERE usuario_id = ? AND activo = 1
            ORDER BY fecha_creacion DESC
            LIMIT ? OFFSET ?
        `);
        return stmt.all(userId, limit, offset);
    }

    /**
     * Obtiene estadísticas de productos
     * 
     * @returns {Object} Estadísticas de productos
     */
    static getStats() {
        const db = dbConnection.getConnection();
        const stmt = db.prepare(`
            SELECT 
                COUNT(*) as total,
                SUM(stock) as stock_total,
                AVG(precio) as precio_promedio,
                MIN(precio) as precio_minimo,
                MAX(precio) as precio_maximo,
                COUNT(DISTINCT categoria) as categorias
            FROM productos
            WHERE activo = 1
        `);
        return stmt.get();
    }
}

module.exports = Producto;
