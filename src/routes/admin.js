/**
 * Rutas de Administración
 * 
 * Define las rutas para funciones administrativas
 * 
 * @module routes/admin
 * @author Estudiante UA
 * @version 1.0.0
 */

const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { isAuthenticated, isAdmin } = require('../middleware/auth');
const { idParamValidation, paginationValidation } = require('../middleware/validation');

/**
 * Middleware: Todas las rutas de admin requieren autenticación y rol admin
 */
router.use(isAuthenticated, isAdmin);

/**
 * @route GET /admin/usuarios
 * @desc Lista todos los usuarios
 * @access Admin
 */
router.get('/usuarios', paginationValidation, userController.listUsers);

/**
 * @route POST /admin/usuarios/:id/toggle
 * @desc Activa/desactiva un usuario
 * @access Admin
 */
router.post('/usuarios/:id/toggle', idParamValidation, userController.toggleUserStatus);

module.exports = router;
