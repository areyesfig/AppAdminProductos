/**
 * Rutas de Autenticación
 * 
 * Define las rutas para login, registro y logout
 * 
 * @module routes/auth
 * @author Estudiante UA
 * @version 1.0.0
 */

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { isNotAuthenticated, isAuthenticated } = require('../middleware/auth');
const { loginValidation, registerValidation } = require('../middleware/validation');
const { authLimiter, createAccountLimiter } = require('../middleware/security');

/**
 * @route GET /auth/login
 * @desc Muestra el formulario de login
 * @access Público (solo usuarios no autenticados)
 */
router.get('/login', isNotAuthenticated, authController.showLoginForm);

/**
 * @route POST /auth/login
 * @desc Procesa el login
 * @access Público con rate limiting
 */
router.post('/login', 
    authLimiter, 
    isNotAuthenticated, 
    loginValidation, 
    authController.login
);

/**
 * @route GET /auth/register
 * @desc Muestra el formulario de registro
 * @access Público (solo usuarios no autenticados)
 */
router.get('/register', isNotAuthenticated, authController.showRegisterForm);

/**
 * @route POST /auth/register
 * @desc Procesa el registro de nuevo usuario
 * @access Público con rate limiting
 */
router.post('/register', 
    createAccountLimiter, 
    isNotAuthenticated, 
    registerValidation, 
    authController.register
);

/**
 * @route GET /auth/logout
 * @desc Cierra la sesión del usuario
 * @access Privado (usuarios autenticados)
 */
router.get('/logout', isAuthenticated, authController.logout);

module.exports = router;
