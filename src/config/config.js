/**
 * Configuración de la aplicación
 * 
 * Este módulo centraliza toda la configuración de la aplicación,
 * cargando las variables de entorno y proporcionando valores por defecto seguros.
 * 
 * @module config/config
 * @author Estudiante UA
 * @version 1.0.0
 */

require('dotenv').config();

/**
 * Objeto de configuración principal de la aplicación
 * @type {Object}
 */
const config = {
    // Configuración del servidor
    server: {
        port: parseInt(process.env.PORT, 10) || 3000,
        env: process.env.NODE_ENV || 'development',
        isProduction: process.env.NODE_ENV === 'production'
    },

    // Configuración de la base de datos
    database: {
        path: process.env.DB_PATH || './data/database.sqlite'
    },

    // Configuración de sesiones
    session: {
        secret: process.env.SESSION_SECRET || 'default_secret_change_in_production',
        maxAge: 24 * 60 * 60 * 1000 // 24 horas en milisegundos
    },

    // Configuración de JWT (JSON Web Tokens)
    jwt: {
        secret: process.env.JWT_SECRET || 'jwt_default_secret_change_in_production',
        expiresIn: parseInt(process.env.JWT_EXPIRES_IN, 10) || 3600 // 1 hora en segundos
    },

    // Configuración de rate limiting (limitación de peticiones)
    rateLimit: {
        windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000, // 15 minutos
        maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 100
    },

    // Configuración de seguridad
    security: {
        bcryptRounds: 12, // Número de rondas para el hash de contraseñas
        passwordMinLength: 8, // Longitud mínima de contraseñas
        maxLoginAttempts: 5, // Intentos máximos de login antes de bloqueo temporal
        lockoutTime: 15 * 60 * 1000 // 15 minutos de bloqueo
    }
};

// Validación de configuración crítica en producción
if (config.server.isProduction) {
    if (config.session.secret === 'default_secret_change_in_production') {
        console.error('ERROR: Debes configurar SESSION_SECRET en producción');
        process.exit(1);
    }
    if (config.jwt.secret === 'jwt_default_secret_change_in_production') {
        console.error('ERROR: Debes configurar JWT_SECRET en producción');
        process.exit(1);
    }
}

module.exports = config;
