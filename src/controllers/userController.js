/**
 * Controlador de Usuario/Dashboard
 * 
 * Gestiona las operaciones del dashboard y perfil de usuario
 * 
 * @module controllers/userController
 * @author Estudiante UA
 * @version 1.0.0
 */

const Usuario = require('../models/Usuario');
const Producto = require('../models/Producto');
const bcrypt = require('bcryptjs');

/**
 * Muestra el dashboard principal
 * 
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
 */
const dashboard = (req, res) => {
    try {
        const user = req.session.user;
        
        // Obtener estadísticas básicas
        const stats = Producto.getStats();
        
        // Obtener productos recientes del usuario
        const misProductos = Producto.findByUser(user.id, { limit: 5 });
        
        // Productos recientes generales
        const productosRecientes = Producto.findAll({ limit: 5 });

        res.render('dashboard/index', {
            title: 'Dashboard',
            user,
            stats,
            misProductos,
            productosRecientes,
            success: req.flash('success'),
            errors: req.flash('errors')
        });

    } catch (error) {
        console.error('Error en dashboard:', error);
        req.flash('errors', ['Error al cargar el dashboard']);
        res.redirect('/');
    }
};

/**
 * Muestra el perfil del usuario
 * 
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
 */
const profile = (req, res) => {
    try {
        const user = Usuario.findById(req.session.user.id);
        
        if (!user) {
            req.flash('errors', ['Usuario no encontrado']);
            return res.redirect('/dashboard');
        }

        res.render('dashboard/profile', {
            title: 'Mi Perfil',
            user,
            success: req.flash('success'),
            errors: req.flash('errors'),
            oldInput: req.flash('oldInput')[0] || {}
        });

    } catch (error) {
        console.error('Error al cargar perfil:', error);
        req.flash('errors', ['Error al cargar el perfil']);
        res.redirect('/dashboard');
    }
};

/**
 * Actualiza el perfil del usuario
 * 
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
 */
const updateProfile = async (req, res) => {
    try {
        const { nombre, email } = req.body;
        const userId = req.session.user.id;

        await Usuario.update(userId, { nombre, email });

        // Actualizar datos en la sesión
        req.session.user.nombre = nombre;
        req.session.user.email = email;

        req.flash('success', 'Perfil actualizado exitosamente');
        res.redirect('/dashboard/perfil');

    } catch (error) {
        console.error('Error al actualizar perfil:', error);
        req.flash('errors', [error.message]);
        req.flash('oldInput', req.body);
        res.redirect('/dashboard/perfil');
    }
};

/**
 * Muestra formulario de cambio de contraseña
 * 
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
 */
const showChangePassword = (req, res) => {
    res.render('dashboard/change-password', {
        title: 'Cambiar Contraseña',
        success: req.flash('success'),
        errors: req.flash('errors')
    });
};

/**
 * Cambia la contraseña del usuario
 * 
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
 */
const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.session.user.id;

        // Obtener usuario con contraseña
        const user = Usuario.findByEmail(req.session.user.email);

        if (!user) {
            req.flash('errors', ['Usuario no encontrado']);
            return res.redirect('/dashboard/cambiar-password');
        }

        // Verificar contraseña actual
        const isValid = await bcrypt.compare(currentPassword, user.password_hash);
        if (!isValid) {
            req.flash('errors', ['La contraseña actual es incorrecta']);
            return res.redirect('/dashboard/cambiar-password');
        }

        // Cambiar contraseña
        await Usuario.changePassword(userId, newPassword);

        req.flash('success', 'Contraseña cambiada exitosamente');
        res.redirect('/dashboard/perfil');

    } catch (error) {
        console.error('Error al cambiar contraseña:', error);
        req.flash('errors', [error.message]);
        res.redirect('/dashboard/cambiar-password');
    }
};

/**
 * Lista todos los usuarios (solo admin)
 * 
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
 */
const listUsers = (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        const usuarios = Usuario.findAll({ limit, offset });
        const total = Usuario.count();
        const totalPages = Math.ceil(total / limit);

        if (req.xhr || req.headers.accept?.includes('application/json')) {
            return res.json({
                success: true,
                data: {
                    usuarios,
                    pagination: { page, limit, total, totalPages }
                }
            });
        }

        res.render('admin/users', {
            title: 'Gestión de Usuarios',
            usuarios,
            pagination: { page, limit, total, totalPages },
            success: req.flash('success'),
            errors: req.flash('errors')
        });

    } catch (error) {
        console.error('Error al listar usuarios:', error);
        req.flash('errors', ['Error al cargar usuarios']);
        res.redirect('/dashboard');
    }
};

/**
 * Activa/Desactiva un usuario (solo admin)
 * 
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
 */
const toggleUserStatus = (req, res) => {
    try {
        const { id } = req.params;
        const { activo } = req.body;

        // No permitir desactivarse a uno mismo
        if (parseInt(id) === req.session.user.id) {
            if (req.xhr || req.headers.accept?.includes('application/json')) {
                return res.status(400).json({
                    success: false,
                    message: 'No puede desactivar su propia cuenta'
                });
            }
            req.flash('errors', ['No puede desactivar su propia cuenta']);
            return res.redirect('/admin/usuarios');
        }

        if (activo) {
            Usuario.activate(id);
        } else {
            Usuario.deactivate(id);
        }

        if (req.xhr || req.headers.accept?.includes('application/json')) {
            return res.json({
                success: true,
                message: `Usuario ${activo ? 'activado' : 'desactivado'} exitosamente`
            });
        }

        req.flash('success', `Usuario ${activo ? 'activado' : 'desactivado'} exitosamente`);
        res.redirect('/admin/usuarios');

    } catch (error) {
        console.error('Error al cambiar estado de usuario:', error);
        
        if (req.xhr || req.headers.accept?.includes('application/json')) {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }

        req.flash('errors', [error.message]);
        res.redirect('/admin/usuarios');
    }
};

module.exports = {
    dashboard,
    profile,
    updateProfile,
    showChangePassword,
    changePassword,
    listUsers,
    toggleUserStatus
};
