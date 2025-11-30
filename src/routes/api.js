/**
 * Rutas de API REST
 * 
 * Define las rutas de la API para uso con aplicaciones externas
 * Todas las rutas están protegidas con JWT
 * 
 * @module routes/api
 * @author Estudiante UA
 * @version 1.0.0
 */

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const productController = require('../controllers/productController');
const { verifyToken } = require('../middleware/auth');
const { loginValidation, registerValidation, productValidation, idParamValidation, paginationValidation } = require('../middleware/validation');
const { apiLimiter, authLimiter } = require('../middleware/security');

/**
 * Middleware: Aplicar rate limiting a todas las rutas API
 */
router.use(apiLimiter);

// =====================
// Rutas de Autenticación
// =====================

/**
 * @route POST /api/auth/login
 * @desc Login de usuario, devuelve token JWT
 * @access Público
 */
router.post('/auth/login', authLimiter, loginValidation, authController.apiLogin);

/**
 * @route POST /api/auth/register
 * @desc Registro de nuevo usuario
 * @access Público
 */
router.post('/auth/register', registerValidation, authController.apiRegister);

/**
 * @route GET /api/auth/me
 * @desc Obtiene información del usuario actual
 * @access Privado (requiere token)
 */
router.get('/auth/me', verifyToken, authController.apiGetCurrentUser);

// =====================
// Rutas de Productos
// =====================

/**
 * @route GET /api/productos
 * @desc Lista productos
 * @access Privado
 */
router.get('/productos', verifyToken, paginationValidation, productController.index);

/**
 * @route GET /api/productos/:id
 * @desc Obtiene un producto
 * @access Privado
 */
router.get('/productos/:id', verifyToken, idParamValidation, productController.show);

/**
 * @route POST /api/productos
 * @desc Crea un producto
 * @access Privado
 */
router.post('/productos', verifyToken, productValidation, (req, res) => {
    // Agregar usuario de JWT a la sesión para compatibilidad
    req.session = { user: req.user };
    productController.store(req, res);
});

/**
 * @route PUT /api/productos/:id
 * @desc Actualiza un producto
 * @access Privado
 */
router.put('/productos/:id', verifyToken, idParamValidation, productValidation, (req, res) => {
    req.session = { user: req.user };
    productController.update(req, res);
});

/**
 * @route DELETE /api/productos/:id
 * @desc Elimina un producto
 * @access Privado
 */
router.delete('/productos/:id', verifyToken, idParamValidation, (req, res) => {
    req.session = { user: req.user };
    productController.destroy(req, res);
});

/**
 * @route GET /api/productos/stats
 * @desc Obtiene estadísticas de productos
 * @access Privado
 */
router.get('/stats', verifyToken, productController.stats);

module.exports = router;
