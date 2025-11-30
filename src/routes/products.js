/**
 * Rutas de Productos
 * 
 * Define las rutas CRUD para la gestión de productos
 * 
 * @module routes/products
 * @author Estudiante UA
 * @version 1.0.0
 */

const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { isAuthenticated } = require('../middleware/auth');
const { productValidation, idParamValidation, paginationValidation } = require('../middleware/validation');

/**
 * @route GET /productos
 * @desc Lista todos los productos con paginación
 * @access Privado
 */
router.get('/', 
    isAuthenticated, 
    paginationValidation, 
    productController.index
);

/**
 * @route GET /productos/nuevo
 * @desc Muestra formulario para crear producto
 * @access Privado
 */
router.get('/nuevo', 
    isAuthenticated, 
    productController.create
);

/**
 * @route POST /productos
 * @desc Crea un nuevo producto
 * @access Privado
 */
router.post('/', 
    isAuthenticated, 
    productValidation, 
    productController.store
);

/**
 * @route GET /productos/stats
 * @desc Obtiene estadísticas de productos
 * @access Privado
 */
router.get('/stats', 
    isAuthenticated, 
    productController.stats
);

/**
 * @route GET /productos/:id
 * @desc Muestra un producto específico
 * @access Privado
 */
router.get('/:id', 
    isAuthenticated, 
    idParamValidation, 
    productController.show
);

/**
 * @route GET /productos/:id/editar
 * @desc Muestra formulario para editar producto
 * @access Privado (solo creador o admin)
 */
router.get('/:id/editar', 
    isAuthenticated, 
    idParamValidation, 
    productController.edit
);

/**
 * @route PUT /productos/:id
 * @desc Actualiza un producto
 * @access Privado (solo creador o admin)
 */
router.put('/:id', 
    isAuthenticated, 
    idParamValidation, 
    productValidation, 
    productController.update
);

/**
 * @route DELETE /productos/:id
 * @desc Elimina un producto
 * @access Privado (solo creador o admin)
 */
router.delete('/:id', 
    isAuthenticated, 
    idParamValidation, 
    productController.destroy
);

module.exports = router;
