/**
 * Configuración central de rutas
 * 
 * Este módulo agrupa y exporta todas las rutas de la aplicación
 * 
 * @module routes/index
 * @author Estudiante UA
 * @version 1.0.0
 */

const express = require('express');
const router = express.Router();

// Importar rutas
const authRoutes = require('./auth');
const dashboardRoutes = require('./dashboard');
const productRoutes = require('./products');
const adminRoutes = require('./admin');
const apiRoutes = require('./api');

// Página de inicio
router.get('/', (req, res) => {
    // Si el usuario está autenticado, redirigir al dashboard
    if (req.session && req.session.user) {
        return res.redirect('/dashboard');
    }
    
    // Mostrar página de bienvenida
    res.render('home', {
        title: 'Bienvenido - Sistema de Gestión de Productos'
    });
});

// Montar rutas
router.use('/auth', authRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/productos', productRoutes);
router.use('/admin', adminRoutes);
router.use('/api', apiRoutes);

// Página de error 404
router.use((req, res) => {
    res.status(404).render('errors/404', {
        title: 'Página no encontrada'
    });
});

module.exports = router;
