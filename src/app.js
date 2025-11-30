/**
 * Aplicación Web con Acceso Seguro a Base de Datos Relacional
 * 
 * Esta aplicación implementa un sistema de gestión de productos con
 * autenticación robusta, validación de datos y protección contra
 * vulnerabilidades de seguridad comunes.
 * 
 * TECNOLOGÍAS UTILIZADAS:
 * - Node.js con Express como framework web
 * - SQLite con better-sqlite3 como base de datos relacional
 * - EJS como motor de plantillas
 * - bcrypt para hash de contraseñas
 * - JWT para autenticación de API
 * - Helmet para headers de seguridad
 * - express-validator para validación de datos
 * 
 * MEDIDAS DE SEGURIDAD IMPLEMENTADAS:
 * 1. Contraseñas hasheadas con bcrypt (12 rondas)
 * 2. Consultas preparadas para prevenir inyección SQL
 * 3. Protección CSRF
 * 4. Headers de seguridad HTTP con Helmet
 * 5. Rate limiting para prevenir ataques de fuerza bruta
 * 6. Validación y sanitización de datos de entrada
 * 7. Sesiones seguras con regeneración de ID
 * 8. Protección XSS (escape automático en EJS)
 * 
 * @author Estudiante UA
 * @version 1.0.0
 * @license MIT
 */

// Cargar variables de entorno
require('dotenv').config();

// Importar dependencias
const express = require('express');
const path = require('path');
const session = require('express-session');
const flash = require('connect-flash');
const cookieParser = require('cookie-parser');
const expressLayouts = require('express-ejs-layouts');

// Importar configuración
const config = require('./config/config');

// Importar middleware de seguridad
const {
    helmetConfig,
    generalLimiter,
    additionalSecurityHeaders,
    securityLogger
} = require('./middleware/security');

// Importar rutas
const routes = require('./routes');

// Crear aplicación Express
const app = express();

// =============================================================================
// CONFIGURACIÓN DE SEGURIDAD
// =============================================================================

// Aplicar Helmet para headers de seguridad HTTP
app.use(helmetConfig);

// Headers de seguridad adicionales
app.use(additionalSecurityHeaders);

// Rate limiting general
app.use(generalLimiter);

// Logger de seguridad (detecta patrones sospechosos)
app.use(securityLogger);

// Deshabilitar header X-Powered-By
app.disable('x-powered-by');

// Confiar en proxy (necesario si está detrás de nginx/cloudflare)
app.set('trust proxy', 1);

// =============================================================================
// CONFIGURACIÓN DE MIDDLEWARE
// =============================================================================

// Parser de JSON con límite de tamaño
app.use(express.json({ limit: '10kb' }));

// Parser de formularios URL-encoded con límite de tamaño
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Parser de cookies
app.use(cookieParser());

// Soporte para métodos HTTP (PUT, DELETE) en formularios
// Se usa query string ?_method=PUT/DELETE
const methodOverrideMiddleware = (req, res, next) => {
    if (req.query._method) {
        req.method = req.query._method.toUpperCase();
    }
    next();
};
app.use(methodOverrideMiddleware);

// =============================================================================
// CONFIGURACIÓN DE SESIONES
// =============================================================================

app.use(session({
    secret: config.session.secret,
    name: 'sessionId', // Nombre personalizado en lugar del predeterminado
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: config.server.isProduction, // Solo HTTPS en producción
        httpOnly: true, // Previene acceso desde JavaScript
        maxAge: config.session.maxAge,
        sameSite: 'strict' // Protección CSRF
    }
}));

// Mensajes flash
app.use(flash());

// =============================================================================
// CONFIGURACIÓN DE VISTAS
// =============================================================================

// Configurar EJS como motor de plantillas
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Configurar layouts
app.use(expressLayouts);
app.set('layout', 'layouts/main');
app.set('layout extractScripts', true);
app.set('layout extractStyles', true);

// Variables globales disponibles en todas las vistas
app.use((req, res, next) => {
    res.locals.user = req.session?.user || null;
    res.locals.currentPath = req.path;
    next();
});

// =============================================================================
// ARCHIVOS ESTÁTICOS
// =============================================================================

// Servir archivos estáticos desde la carpeta 'public'
app.use(express.static(path.join(__dirname, 'public'), {
    maxAge: config.server.isProduction ? '1d' : 0 // Cache de 1 día en producción
}));

// =============================================================================
// RUTAS
// =============================================================================

// Montar todas las rutas
app.use('/', routes);

// =============================================================================
// MANEJO DE ERRORES
// =============================================================================

// Manejador de errores 404 (página no encontrada)
app.use((req, res, next) => {
    res.status(404).render('errors/404', {
        title: 'Página no encontrada',
        layout: 'layouts/main'
    });
});

// Manejador de errores global
app.use((err, req, res, next) => {
    console.error('Error:', err);

    // No revelar detalles del error en producción
    const error = config.server.isProduction 
        ? 'Ha ocurrido un error inesperado'
        : err.message;

    // Si es petición AJAX/API, devolver JSON
    if (req.xhr || req.headers.accept?.includes('application/json')) {
        return res.status(err.status || 500).json({
            success: false,
            message: error
        });
    }

    // Renderizar página de error
    res.status(err.status || 500).render('errors/500', {
        title: 'Error del Servidor',
        error: config.server.isProduction ? null : error,
        layout: 'layouts/main'
    });
});

// =============================================================================
// INICIAR SERVIDOR
// =============================================================================

const PORT = config.server.port;

app.listen(PORT, () => {
    console.log('\n================================================');
    console.log('🚀 APLICACIÓN WEB SEGURA INICIADA');
    console.log('================================================');
    console.log(`📍 URL: http://localhost:${PORT}`);
    console.log(`🌍 Entorno: ${config.server.env}`);
    console.log(`🗄️  Base de datos: ${config.database.path}`);
    console.log('================================================');
    console.log('\n📋 Rutas disponibles:');
    console.log('   GET  /                - Página de inicio');
    console.log('   GET  /auth/login      - Formulario de login');
    console.log('   GET  /auth/register   - Formulario de registro');
    console.log('   GET  /dashboard       - Panel principal');
    console.log('   GET  /productos       - Lista de productos');
    console.log('   GET  /productos/nuevo - Crear producto');
    console.log('   GET  /admin/usuarios  - Gestión de usuarios (admin)');
    console.log('\n📡 API REST:');
    console.log('   POST /api/auth/login    - Login (devuelve JWT)');
    console.log('   POST /api/auth/register - Registro');
    console.log('   GET  /api/productos     - Listar productos');
    console.log('================================================\n');
    
    if (config.server.env === 'development') {
        console.log('💡 Ejecute "npm run init-db" para inicializar la base de datos');
        console.log('📧 Usuario demo: admin@ejemplo.com / Admin123!\n');
    }
});

// =============================================================================
// MANEJO DE SEÑALES DE CIERRE
// =============================================================================

// Cierre graceful de la aplicación
process.on('SIGINT', () => {
    console.log('\n🛑 Cerrando aplicación...');
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\n🛑 Cerrando aplicación...');
    process.exit(0);
});

// Capturar errores no manejados
process.on('uncaughtException', (err) => {
    console.error('❌ Error no capturado:', err);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Promesa rechazada no manejada:', reason);
});

module.exports = app;
