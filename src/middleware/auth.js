/**
 * Middleware de Autenticación
 * 
 * Este módulo proporciona middleware para verificar la autenticación
 * de usuarios mediante sesiones y JWT.
 * 
 * SEGURIDAD IMPLEMENTADA:
 * - Verificación de sesiones activas
 * - Validación de tokens JWT
 * - Control de acceso basado en roles
 * 
 * @module middleware/auth
 * @author Estudiante UA
 * @version 1.0.0
 */

const jwt = require('jsonwebtoken');
const config = require('../config/config');
const Usuario = require('../models/Usuario');

/**
 * Middleware para verificar si el usuario está autenticado
 * Verifica la sesión del usuario
 * 
 * @param {Object} req - Objeto de solicitud Express
 * @param {Object} res - Objeto de respuesta Express
 * @param {Function} next - Función para continuar al siguiente middleware
 */
const isAuthenticated = (req, res, next) => {
    // Verificar si existe sesión de usuario
    if (req.session && req.session.user) {
        // Agregar usuario a res.locals para las vistas
        res.locals.user = req.session.user;
        return next();
    }

    // Si es una petición AJAX, devolver error JSON
    if (req.xhr || req.headers.accept?.includes('application/json')) {
        return res.status(401).json({
            success: false,
            message: 'No autorizado. Por favor, inicie sesión.'
        });
    }

    // Guardar la URL original para redirección después del login
    req.session.returnTo = req.originalUrl;
    
    // Mensaje flash para el usuario
    req.flash('error', 'Debe iniciar sesión para acceder a esta página');
    
    return res.redirect('/auth/login');
};

/**
 * Middleware para verificar si el usuario NO está autenticado
 * Útil para páginas de login/registro
 * 
 * @param {Object} req - Objeto de solicitud Express
 * @param {Object} res - Objeto de respuesta Express
 * @param {Function} next - Función para continuar al siguiente middleware
 */
const isNotAuthenticated = (req, res, next) => {
    if (req.session && req.session.user) {
        return res.redirect('/dashboard');
    }
    return next();
};

/**
 * Middleware para verificar token JWT (para APIs)
 * 
 * @param {Object} req - Objeto de solicitud Express
 * @param {Object} res - Objeto de respuesta Express
 * @param {Function} next - Función para continuar al siguiente middleware
 */
const verifyToken = (req, res, next) => {
    // Obtener token del header Authorization
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            success: false,
            message: 'Token de acceso no proporcionado'
        });
    }

    const token = authHeader.split(' ')[1];

    try {
        // Verificar y decodificar el token
        const decoded = jwt.verify(token, config.jwt.secret);
        
        // Verificar que el usuario aún existe y está activo
        const user = Usuario.findById(decoded.userId);
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Usuario no encontrado o inactivo'
            });
        }

        // Agregar información del usuario a la solicitud
        req.user = user;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token expirado. Por favor, inicie sesión nuevamente.'
            });
        }
        
        return res.status(401).json({
            success: false,
            message: 'Token inválido'
        });
    }
};

/**
 * Middleware para verificar roles de usuario
 * 
 * @param {...string} roles - Roles permitidos
 * @returns {Function} Middleware de verificación de rol
 */
const hasRole = (...roles) => {
    return (req, res, next) => {
        // Obtener usuario de sesión o de token
        const user = req.session?.user || req.user;

        if (!user) {
            if (req.xhr || req.headers.accept?.includes('application/json')) {
                return res.status(401).json({
                    success: false,
                    message: 'No autorizado'
                });
            }
            req.flash('error', 'Debe iniciar sesión');
            return res.redirect('/auth/login');
        }

        if (!roles.includes(user.rol)) {
            if (req.xhr || req.headers.accept?.includes('application/json')) {
                return res.status(403).json({
                    success: false,
                    message: 'No tiene permisos para realizar esta acción'
                });
            }
            req.flash('error', 'No tiene permisos para acceder a esta página');
            return res.redirect('/dashboard');
        }

        next();
    };
};

/**
 * Middleware para verificar si el usuario es administrador
 * 
 * @param {Object} req - Objeto de solicitud Express
 * @param {Object} res - Objeto de respuesta Express
 * @param {Function} next - Función para continuar al siguiente middleware
 */
const isAdmin = hasRole('admin');

/**
 * Middleware para verificar si el usuario es admin o moderador
 */
const isModeratorOrAdmin = hasRole('admin', 'moderador');

/**
 * Middleware opcional de autenticación
 * No bloquea si no hay usuario, pero agrega info si existe
 * 
 * @param {Object} req - Objeto de solicitud Express
 * @param {Object} res - Objeto de respuesta Express
 * @param {Function} next - Función para continuar al siguiente middleware
 */
const optionalAuth = (req, res, next) => {
    if (req.session && req.session.user) {
        res.locals.user = req.session.user;
        req.user = req.session.user;
    }
    next();
};

/**
 * Genera un token JWT para un usuario
 * 
 * @param {Object} user - Datos del usuario
 * @returns {string} Token JWT
 */
const generateToken = (user) => {
    return jwt.sign(
        {
            userId: user.id,
            email: user.email,
            rol: user.rol
        },
        config.jwt.secret,
        {
            expiresIn: config.jwt.expiresIn
        }
    );
};

module.exports = {
    isAuthenticated,
    isNotAuthenticated,
    verifyToken,
    hasRole,
    isAdmin,
    isModeratorOrAdmin,
    optionalAuth,
    generateToken
};
