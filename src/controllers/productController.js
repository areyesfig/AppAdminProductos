/**
 * Controlador de Productos
 * 
 * Gestiona todas las operaciones CRUD relacionadas con productos:
 * - Listar productos con paginación y filtros
 * - Crear nuevos productos
 * - Editar productos existentes
 * - Eliminar productos
 * 
 * @module controllers/productController
 * @author Estudiante UA
 * @version 1.0.0
 */

const Producto = require('../models/Producto');

/**
 * Lista todos los productos con paginación y filtros
 * 
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
 */
const index = (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;
        const { busqueda, categoria, ordenarPor, orden } = req.query;

        // Obtener productos con filtros
        const productos = Producto.findAll({
            limit,
            offset,
            categoria,
            busqueda,
            ordenarPor,
            orden
        });

        // Obtener total para paginación
        const total = Producto.count({ categoria, busqueda });
        const totalPages = Math.ceil(total / limit);

        // Obtener categorías para el filtro
        const categorias = Producto.getCategories();

        // Si es petición AJAX/API, devolver JSON
        if (req.xhr || req.headers.accept?.includes('application/json')) {
            return res.json({
                success: true,
                data: {
                    productos,
                    pagination: {
                        page,
                        limit,
                        total,
                        totalPages
                    }
                }
            });
        }

        // Renderizar vista
        res.render('products/index', {
            title: 'Productos',
            productos,
            categorias,
            pagination: {
                page,
                limit,
                total,
                totalPages
            },
            filters: { busqueda, categoria, ordenarPor, orden },
            success: req.flash('success'),
            errors: req.flash('errors')
        });

    } catch (error) {
        console.error('Error al listar productos:', error);
        req.flash('errors', ['Error al cargar los productos']);
        res.redirect('/dashboard');
    }
};

/**
 * Muestra un producto específico
 * 
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
 */
const show = (req, res) => {
    try {
        const { id } = req.params;
        const producto = Producto.findById(id);

        if (!producto) {
            if (req.xhr || req.headers.accept?.includes('application/json')) {
                return res.status(404).json({
                    success: false,
                    message: 'Producto no encontrado'
                });
            }
            req.flash('errors', ['Producto no encontrado']);
            return res.redirect('/productos');
        }

        if (req.xhr || req.headers.accept?.includes('application/json')) {
            return res.json({
                success: true,
                data: { producto }
            });
        }

        res.render('products/show', {
            title: producto.nombre,
            producto
        });

    } catch (error) {
        console.error('Error al mostrar producto:', error);
        req.flash('errors', ['Error al cargar el producto']);
        res.redirect('/productos');
    }
};

/**
 * Muestra el formulario para crear un producto
 * 
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
 */
const create = (req, res) => {
    const categorias = Producto.getCategories();
    
    res.render('products/form', {
        title: 'Nuevo Producto',
        producto: null,
        categorias,
        action: '/productos',
        method: 'POST',
        errors: req.flash('errors'),
        oldInput: req.flash('oldInput')[0] || {}
    });
};

/**
 * Almacena un nuevo producto
 * 
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
 */
const store = (req, res) => {
    try {
        const { nombre, descripcion, precio, stock, categoria, imagen_url } = req.body;
        const usuario_id = req.session.user.id;

        const producto = Producto.create({
            nombre,
            descripcion,
            precio,
            stock,
            categoria,
            imagen_url,
            usuario_id
        });

        if (req.xhr || req.headers.accept?.includes('application/json')) {
            return res.status(201).json({
                success: true,
                message: 'Producto creado exitosamente',
                data: { producto }
            });
        }

        req.flash('success', 'Producto creado exitosamente');
        res.redirect('/productos');

    } catch (error) {
        console.error('Error al crear producto:', error);
        
        if (req.xhr || req.headers.accept?.includes('application/json')) {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }

        req.flash('errors', [error.message]);
        req.flash('oldInput', req.body);
        res.redirect('/productos/nuevo');
    }
};

/**
 * Muestra el formulario para editar un producto
 * 
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
 */
const edit = (req, res) => {
    try {
        const { id } = req.params;
        const producto = Producto.findById(id);

        if (!producto) {
            req.flash('errors', ['Producto no encontrado']);
            return res.redirect('/productos');
        }

        // Verificar permisos (solo el creador o admin puede editar)
        const user = req.session.user;
        if (producto.usuario_id !== user.id && user.rol !== 'admin') {
            req.flash('errors', ['No tiene permisos para editar este producto']);
            return res.redirect('/productos');
        }

        const categorias = Producto.getCategories();

        res.render('products/form', {
            title: 'Editar Producto',
            producto,
            categorias,
            action: `/productos/${id}?_method=PUT`,
            method: 'POST',
            errors: req.flash('errors'),
            oldInput: req.flash('oldInput')[0] || {}
        });

    } catch (error) {
        console.error('Error al cargar formulario de edición:', error);
        req.flash('errors', ['Error al cargar el producto']);
        res.redirect('/productos');
    }
};

/**
 * Actualiza un producto existente
 * 
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
 */
const update = (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, descripcion, precio, stock, categoria, imagen_url } = req.body;
        const user = req.session.user;

        // Verificar que el producto existe
        const productoExistente = Producto.findById(id);
        if (!productoExistente) {
            if (req.xhr || req.headers.accept?.includes('application/json')) {
                return res.status(404).json({
                    success: false,
                    message: 'Producto no encontrado'
                });
            }
            req.flash('errors', ['Producto no encontrado']);
            return res.redirect('/productos');
        }

        // Verificar permisos
        if (productoExistente.usuario_id !== user.id && user.rol !== 'admin') {
            if (req.xhr || req.headers.accept?.includes('application/json')) {
                return res.status(403).json({
                    success: false,
                    message: 'No tiene permisos para editar este producto'
                });
            }
            req.flash('errors', ['No tiene permisos para editar este producto']);
            return res.redirect('/productos');
        }

        // Actualizar producto
        Producto.update(id, {
            nombre,
            descripcion,
            precio,
            stock,
            categoria,
            imagen_url
        });

        if (req.xhr || req.headers.accept?.includes('application/json')) {
            return res.json({
                success: true,
                message: 'Producto actualizado exitosamente'
            });
        }

        req.flash('success', 'Producto actualizado exitosamente');
        res.redirect('/productos');

    } catch (error) {
        console.error('Error al actualizar producto:', error);
        
        if (req.xhr || req.headers.accept?.includes('application/json')) {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }

        req.flash('errors', [error.message]);
        res.redirect(`/productos/${req.params.id}/editar`);
    }
};

/**
 * Elimina un producto (soft delete)
 * 
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
 */
const destroy = (req, res) => {
    try {
        const { id } = req.params;
        const user = req.session.user;

        // Verificar que el producto existe
        const producto = Producto.findById(id);
        if (!producto) {
            if (req.xhr || req.headers.accept?.includes('application/json')) {
                return res.status(404).json({
                    success: false,
                    message: 'Producto no encontrado'
                });
            }
            req.flash('errors', ['Producto no encontrado']);
            return res.redirect('/productos');
        }

        // Verificar permisos
        if (producto.usuario_id !== user.id && user.rol !== 'admin') {
            if (req.xhr || req.headers.accept?.includes('application/json')) {
                return res.status(403).json({
                    success: false,
                    message: 'No tiene permisos para eliminar este producto'
                });
            }
            req.flash('errors', ['No tiene permisos para eliminar este producto']);
            return res.redirect('/productos');
        }

        // Eliminar producto
        Producto.delete(id);

        if (req.xhr || req.headers.accept?.includes('application/json')) {
            return res.json({
                success: true,
                message: 'Producto eliminado exitosamente'
            });
        }

        req.flash('success', 'Producto eliminado exitosamente');
        res.redirect('/productos');

    } catch (error) {
        console.error('Error al eliminar producto:', error);
        
        if (req.xhr || req.headers.accept?.includes('application/json')) {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }

        req.flash('errors', [error.message]);
        res.redirect('/productos');
    }
};

/**
 * Obtiene estadísticas de productos (solo admin)
 * 
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
 */
const stats = (req, res) => {
    try {
        const estadisticas = Producto.getStats();

        return res.json({
            success: true,
            data: { estadisticas }
        });

    } catch (error) {
        console.error('Error al obtener estadísticas:', error);
        return res.status(500).json({
            success: false,
            message: 'Error al obtener estadísticas'
        });
    }
};

module.exports = {
    index,
    show,
    create,
    store,
    edit,
    update,
    destroy,
    stats
};
