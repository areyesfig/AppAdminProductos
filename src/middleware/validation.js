/**
 * Middleware de Validación
 * 
 * Este módulo contiene todas las reglas de validación para los formularios
 * de la aplicación, utilizando express-validator para prevenir datos maliciosos.
 * 
 * @module middleware/validation
 * @author Estudiante UA
 * @version 1.0.0
 */

const { body, param, query, validationResult } = require('express-validator');
const config = require('../config/config');

/**
 * Middleware para manejar errores de validación
 * 
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
 * @param {Function} next - Función next
 */
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
        // Si es petición AJAX o API, devolver JSON
        if (req.xhr || req.headers.accept?.includes('application/json')) {
            return res.status(400).json({
                success: false,
                errors: errors.array().map(err => ({
                    field: err.path,
                    message: err.msg
                }))
            });
        }

        // Para peticiones normales, guardar errores en flash
        const errorMessages = errors.array().map(err => err.msg);
        req.flash('errors', errorMessages);
        req.flash('oldInput', req.body);
        
        return res.redirect('back');
    }
    
    next();
};

/**
 * Reglas de validación para registro de usuarios
 */
const registerValidation = [
    body('nombre')
        .trim()
        .notEmpty().withMessage('El nombre es obligatorio')
        .isLength({ min: 2, max: 100 }).withMessage('El nombre debe tener entre 2 y 100 caracteres')
        .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/).withMessage('El nombre solo puede contener letras'),
    
    body('email')
        .trim()
        .notEmpty().withMessage('El email es obligatorio')
        .isEmail().withMessage('Debe proporcionar un email válido')
        .normalizeEmail()
        .isLength({ max: 255 }).withMessage('El email es demasiado largo'),
    
    body('password')
        .notEmpty().withMessage('La contraseña es obligatoria')
        .isLength({ min: config.security.passwordMinLength })
        .withMessage(`La contraseña debe tener al menos ${config.security.passwordMinLength} caracteres`)
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
        .withMessage('La contraseña debe contener al menos: una mayúscula, una minúscula, un número y un carácter especial (@$!%*?&)'),
    
    body('confirmPassword')
        .notEmpty().withMessage('Debe confirmar la contraseña')
        .custom((value, { req }) => {
            if (value !== req.body.password) {
                throw new Error('Las contraseñas no coinciden');
            }
            return true;
        }),
    
    handleValidationErrors
];

/**
 * Reglas de validación para login
 */
const loginValidation = [
    body('email')
        .trim()
        .notEmpty().withMessage('El email es obligatorio')
        .isEmail().withMessage('Debe proporcionar un email válido')
        .normalizeEmail(),
    
    body('password')
        .notEmpty().withMessage('La contraseña es obligatoria'),
    
    handleValidationErrors
];

/**
 * Reglas de validación para crear/editar productos
 */
const productValidation = [
    body('nombre')
        .trim()
        .notEmpty().withMessage('El nombre del producto es obligatorio')
        .isLength({ min: 2, max: 200 }).withMessage('El nombre debe tener entre 2 y 200 caracteres')
        .escape(), // Escapar caracteres HTML
    
    body('descripcion')
        .optional({ checkFalsy: true })
        .trim()
        .isLength({ max: 2000 }).withMessage('La descripción no puede exceder 2000 caracteres')
        .escape(),
    
    body('precio')
        .notEmpty().withMessage('El precio es obligatorio')
        .isFloat({ min: 0 }).withMessage('El precio debe ser un número positivo')
        .toFloat(),
    
    body('stock')
        .optional({ checkFalsy: true })
        .isInt({ min: 0 }).withMessage('El stock debe ser un número entero positivo')
        .toInt(),
    
    body('categoria')
        .optional({ checkFalsy: true })
        .trim()
        .isLength({ max: 100 }).withMessage('La categoría no puede exceder 100 caracteres')
        .escape(),
    
    body('imagen_url')
        .optional({ checkFalsy: true })
        .trim()
        .isURL().withMessage('Debe proporcionar una URL válida para la imagen'),
    
    handleValidationErrors
];

/**
 * Validación de ID en parámetros
 */
const idParamValidation = [
    param('id')
        .notEmpty().withMessage('ID es requerido')
        .isInt({ min: 1 }).withMessage('ID debe ser un número entero positivo')
        .toInt(),
    
    handleValidationErrors
];

/**
 * Validación de parámetros de paginación
 */
const paginationValidation = [
    query('page')
        .optional()
        .isInt({ min: 1 }).withMessage('La página debe ser un número positivo')
        .toInt(),
    
    query('limit')
        .optional()
        .isInt({ min: 1, max: 100 }).withMessage('El límite debe estar entre 1 y 100')
        .toInt(),
    
    query('busqueda')
        .optional()
        .trim()
        .isLength({ max: 100 }).withMessage('La búsqueda no puede exceder 100 caracteres')
        .escape(),
    
    query('categoria')
        .optional()
        .trim()
        .escape(),
    
    handleValidationErrors
];

/**
 * Validación para cambio de contraseña
 */
const changePasswordValidation = [
    body('currentPassword')
        .notEmpty().withMessage('La contraseña actual es obligatoria'),
    
    body('newPassword')
        .notEmpty().withMessage('La nueva contraseña es obligatoria')
        .isLength({ min: config.security.passwordMinLength })
        .withMessage(`La contraseña debe tener al menos ${config.security.passwordMinLength} caracteres`)
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
        .withMessage('La contraseña debe contener al menos: una mayúscula, una minúscula, un número y un carácter especial'),
    
    body('confirmNewPassword')
        .notEmpty().withMessage('Debe confirmar la nueva contraseña')
        .custom((value, { req }) => {
            if (value !== req.body.newPassword) {
                throw new Error('Las contraseñas no coinciden');
            }
            return true;
        }),
    
    handleValidationErrors
];

/**
 * Validación para actualizar perfil de usuario
 */
const updateProfileValidation = [
    body('nombre')
        .trim()
        .notEmpty().withMessage('El nombre es obligatorio')
        .isLength({ min: 2, max: 100 }).withMessage('El nombre debe tener entre 2 y 100 caracteres')
        .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/).withMessage('El nombre solo puede contener letras'),
    
    body('email')
        .trim()
        .notEmpty().withMessage('El email es obligatorio')
        .isEmail().withMessage('Debe proporcionar un email válido')
        .normalizeEmail(),
    
    handleValidationErrors
];

module.exports = {
    registerValidation,
    loginValidation,
    productValidation,
    idParamValidation,
    paginationValidation,
    changePasswordValidation,
    updateProfileValidation,
    handleValidationErrors
};
