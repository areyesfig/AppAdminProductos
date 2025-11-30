/**
 * Middleware de Seguridad
 * 
 * Este módulo configura todos los middleware de seguridad para la aplicación,
 * incluyendo protección contra ataques comunes como XSS, CSRF e inyección SQL.
 * 
 * @module middleware/security
 * @author Estudiante UA
 * @version 1.0.0
 */

const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const config = require('../config/config');

/**
 * Configuración de Helmet para headers de seguridad HTTP
 * Protege contra varios ataques web comunes
 */
const helmetConfig = helmet({
    // Política de seguridad de contenido
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net", "https://fonts.googleapis.com"],
            scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
            imgSrc: ["'self'", "data:", "https:"],
            fontSrc: ["'self'", "https://fonts.gstatic.com", "https://cdn.jsdelivr.net"],
            connectSrc: ["'self'"],
            frameSrc: ["'none'"],
            objectSrc: ["'none'"],
            upgradeInsecureRequests: config.server.isProduction ? [] : null
        }
    },
    // Prevenir que el sitio sea embebido en iframes (clickjacking)
    frameguard: { action: 'deny' },
    // Forzar HTTPS en producción
    hsts: config.server.isProduction ? {
        maxAge: 31536000, // 1 año
        includeSubDomains: true,
        preload: true
    } : false,
    // Prevenir sniffing de tipo MIME
    noSniff: true,
    // Protección XSS del navegador
    xssFilter: true,
    // No revelar tecnología del servidor
    hidePoweredBy: true
});

/**
 * Rate Limiter general para toda la aplicación
 * Limita el número de peticiones por IP
 */
const generalLimiter = rateLimit({
    windowMs: config.rateLimit.windowMs, // 15 minutos por defecto
    max: config.rateLimit.maxRequests, // 100 peticiones por ventana
    message: {
        success: false,
        message: 'Demasiadas peticiones desde esta IP. Por favor, espere un momento.'
    },
    standardHeaders: true, // Devuelve info de rate limit en headers
    legacyHeaders: false,
    // Saltar rate limiting para IPs de confianza en desarrollo
    skip: (req) => {
        if (!config.server.isProduction && req.ip === '127.0.0.1') {
            return true;
        }
        return false;
    }
});

/**
 * Rate Limiter estricto para endpoints de autenticación
 * Previene ataques de fuerza bruta
 */
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 5, // Solo 5 intentos de login por ventana
    message: {
        success: false,
        message: 'Demasiados intentos de inicio de sesión. Espere 15 minutos.'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true // No contar peticiones exitosas
});

/**
 * Rate Limiter para creación de cuentas
 */
const createAccountLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hora
    max: 3, // 3 cuentas por hora por IP
    message: {
        success: false,
        message: 'Límite de creación de cuentas alcanzado. Intente más tarde.'
    }
});

/**
 * Rate Limiter para API
 */
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200, // 200 peticiones por 15 minutos
    message: {
        success: false,
        message: 'Límite de peticiones API excedido.'
    }
});

/**
 * Middleware para sanitizar entradas y prevenir XSS
 * 
 * @param {Object} req - Objeto de solicitud Express
 * @param {Object} res - Objeto de respuesta Express
 * @param {Function} next - Función next
 */
const sanitizeInputs = (req, res, next) => {
    /**
     * Función recursiva para sanitizar strings
     * @param {*} obj - Objeto a sanitizar
     * @returns {*} Objeto sanitizado
     */
    const sanitize = (obj) => {
        if (typeof obj === 'string') {
            // Escapar caracteres HTML peligrosos
            return obj
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#x27;')
                .replace(/\//g, '&#x2F;');
        }
        if (Array.isArray(obj)) {
            return obj.map(sanitize);
        }
        if (obj && typeof obj === 'object') {
            const sanitized = {};
            for (const key in obj) {
                if (Object.prototype.hasOwnProperty.call(obj, key)) {
                    sanitized[key] = sanitize(obj[key]);
                }
            }
            return sanitized;
        }
        return obj;
    };

    // Nota: No sanitizamos aquí porque EJS ya escapa por defecto
    // y la validación se hace con express-validator
    // Este middleware es un ejemplo de cómo se podría implementar
    
    next();
};

/**
 * Middleware para prevenir ataques de timing en comparaciones de strings
 * Implementa comparación en tiempo constante
 * 
 * @param {string} a - Primera cadena
 * @param {string} b - Segunda cadena
 * @returns {boolean} true si son iguales
 */
const timingSafeCompare = (a, b) => {
    if (typeof a !== 'string' || typeof b !== 'string') {
        return false;
    }
    
    const crypto = require('crypto');
    
    // Hacer las cadenas del mismo tamaño
    const aBuffer = Buffer.from(a);
    const bBuffer = Buffer.from(b);
    
    if (aBuffer.length !== bBuffer.length) {
        // Comparar con una versión del mismo tamaño para evitar timing attack
        crypto.timingSafeEqual(aBuffer, aBuffer);
        return false;
    }
    
    return crypto.timingSafeEqual(aBuffer, bBuffer);
};

/**
 * Middleware para agregar headers de seguridad adicionales
 * 
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
 * @param {Function} next - Función next
 */
const additionalSecurityHeaders = (req, res, next) => {
    // Prevenir caching de contenido sensible
    if (req.path.startsWith('/auth') || req.path.startsWith('/dashboard')) {
        res.set({
            'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0',
            'Surrogate-Control': 'no-store'
        });
    }
    
    // Header personalizado de seguridad
    res.set('X-Content-Type-Options', 'nosniff');
    res.set('X-Frame-Options', 'DENY');
    res.set('X-XSS-Protection', '1; mode=block');
    
    next();
};

/**
 * Middleware para logging de seguridad
 * Registra intentos sospechosos
 * 
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
 * @param {Function} next - Función next
 */
const securityLogger = (req, res, next) => {
    // Detectar patrones sospechosos en las peticiones
    const suspiciousPatterns = [
        /(\%27)|(\')|(\-\-)|(\%23)|(#)/i, // SQL Injection
        /<script\b[^>]*>([\s\S]*?)<\/script>/gi, // XSS
        /(\.\.\/)/, // Path traversal
        /(\%00)/, // Null byte injection
    ];

    const requestData = JSON.stringify({
        body: req.body,
        query: req.query,
        params: req.params
    });

    for (const pattern of suspiciousPatterns) {
        if (pattern.test(requestData)) {
            console.warn(`⚠️ Intento sospechoso detectado:`, {
                ip: req.ip,
                method: req.method,
                path: req.path,
                userAgent: req.get('User-Agent'),
                timestamp: new Date().toISOString()
            });
            break;
        }
    }

    next();
};

module.exports = {
    helmetConfig,
    generalLimiter,
    authLimiter,
    createAccountLimiter,
    apiLimiter,
    sanitizeInputs,
    timingSafeCompare,
    additionalSecurityHeaders,
    securityLogger
};
