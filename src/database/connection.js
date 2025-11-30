/**
 * Configuración y conexión a la base de datos SQLite
 * 
 * Este módulo gestiona la conexión a la base de datos SQLite usando better-sqlite3,
 * proporcionando una conexión segura y eficiente.
 * 
 * SEGURIDAD: Se utiliza better-sqlite3 que previene inyección SQL mediante
 * el uso de consultas preparadas (prepared statements).
 * 
 * @module database/connection
 * @author Estudiante UA
 * @version 1.0.0
 */

const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
const config = require('../config/config');

/**
 * Clase para gestionar la conexión a la base de datos
 * Implementa el patrón Singleton para asegurar una única instancia de conexión
 */
class DatabaseConnection {
    constructor() {
        this.db = null;
    }

    /**
     * Obtiene la instancia de la base de datos
     * Si no existe, crea una nueva conexión
     * 
     * @returns {Database} Instancia de la base de datos SQLite
     */
    getConnection() {
        if (!this.db) {
            // Asegurar que el directorio de la base de datos existe
            const dbPath = path.resolve(config.database.path);
            const dbDir = path.dirname(dbPath);
            
            if (!fs.existsSync(dbDir)) {
                fs.mkdirSync(dbDir, { recursive: true });
                console.log(`📁 Directorio de base de datos creado: ${dbDir}`);
            }

            try {
                // Crear conexión a SQLite con opciones de seguridad
                this.db = new Database(dbPath, {
                    // Modo verbose en desarrollo para depuración
                    verbose: config.server.env === 'development' ? console.log : null
                });

                // Habilitar claves foráneas para integridad referencial
                this.db.pragma('foreign_keys = ON');
                
                // Configurar modo de journal para mejor rendimiento y seguridad
                this.db.pragma('journal_mode = WAL');

                console.log(`✅ Conexión a base de datos establecida: ${dbPath}`);
            } catch (error) {
                console.error('❌ Error al conectar con la base de datos:', error.message);
                throw error;
            }
        }
        return this.db;
    }

    /**
     * Cierra la conexión a la base de datos
     * Debe llamarse al cerrar la aplicación
     */
    close() {
        if (this.db) {
            this.db.close();
            this.db = null;
            console.log('🔒 Conexión a base de datos cerrada');
        }
    }

    /**
     * Ejecuta una transacción de forma segura
     * 
     * @param {Function} callback - Función que contiene las operaciones de la transacción
     * @returns {*} Resultado de la transacción
     */
    transaction(callback) {
        const db = this.getConnection();
        const transaction = db.transaction(callback);
        return transaction();
    }
}

// Exportar instancia única (Singleton)
const dbConnection = new DatabaseConnection();

// Manejar cierre graceful de la conexión
process.on('SIGINT', () => {
    dbConnection.close();
    process.exit(0);
});

process.on('SIGTERM', () => {
    dbConnection.close();
    process.exit(0);
});

module.exports = dbConnection;
