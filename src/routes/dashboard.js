/**
 * Rutas del Dashboard y Usuario
 * 
 * Define las rutas para el dashboard, perfil y configuración de usuario
 * 
 * @module routes/dashboard
 * @author Estudiante UA
 * @version 1.0.0
 */

const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { isAuthenticated, isAdmin } = require('../middleware/auth');
const { updateProfileValidation, changePasswordValidation } = require('../middleware/validation');

/**
 * @route GET /dashboard
 * @desc Muestra el dashboard principal
 * @access Privado
 */
router.get('/', isAuthenticated, userController.dashboard);

/**
 * @route GET /dashboard/perfil
 * @desc Muestra el perfil del usuario
 * @access Privado
 */
router.get('/perfil', isAuthenticated, userController.profile);

/**
 * @route POST /dashboard/perfil
 * @desc Actualiza el perfil del usuario
 * @access Privado
 */
router.post('/perfil', 
    isAuthenticated, 
    updateProfileValidation, 
    userController.updateProfile
);

/**
 * @route GET /dashboard/cambiar-password
 * @desc Muestra formulario de cambio de contraseña
 * @access Privado
 */
router.get('/cambiar-password', isAuthenticated, userController.showChangePassword);

/**
 * @route POST /dashboard/cambiar-password
 * @desc Procesa el cambio de contraseña
 * @access Privado
 */
router.post('/cambiar-password', 
    isAuthenticated, 
    changePasswordValidation, 
    userController.changePassword
);

module.exports = router;
