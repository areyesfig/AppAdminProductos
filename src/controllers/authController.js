/**
 * Controlador de Autenticación
 * 
 * Gestiona todas las operaciones relacionadas con la autenticación de usuarios:
 * - Registro de nuevos usuarios
 * - Inicio de sesión
 * - Cierre de sesión
 * - Gestión de sesiones
 * 
 * @module controllers/authController
 * @author Estudiante UA
 * @version 1.0.0
 */

const Usuario = require('../models/Usuario');
const { generateToken } = require('../middleware/auth');

/**
 * Muestra el formulario de login
 * 
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
 */
const showLoginForm = (req, res) => {
    res.render('auth/login', {
        title: 'Iniciar Sesión',
        errors: req.flash('errors'),
        success: req.flash('success'),
        oldInput: req.flash('oldInput')[0] || {}
    });
};

/**
 * Procesa el inicio de sesión
 * 
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
 */
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Verificar credenciales
        const user = await Usuario.verifyCredentials(email, password);

        if (!user) {
            req.flash('errors', ['Email o contraseña incorrectos']);
            req.flash('oldInput', { email });
            return res.redirect('/auth/login');
        }

        // Crear sesión de usuario
        req.session.user = {
            id: user.id,
            nombre: user.nombre,
            email: user.email,
            rol: user.rol
        };

        // Regenerar ID de sesión para prevenir session fixation
        req.session.regenerate((err) => {
            if (err) {
                console.error('Error al regenerar sesión:', err);
            }
            
            // Restaurar datos del usuario después de regenerar
            req.session.user = {
                id: user.id,
                nombre: user.nombre,
                email: user.email,
                rol: user.rol
            };

            req.flash('success', `¡Bienvenido, ${user.nombre}!`);
            
            // Redirigir a la URL guardada o al dashboard
            const returnTo = req.session.returnTo || '/dashboard';
            delete req.session.returnTo;
            
            return res.redirect(returnTo);
        });

    } catch (error) {
        console.error('Error en login:', error);
        req.flash('errors', [error.message]);
        req.flash('oldInput', { email: req.body.email });
        return res.redirect('/auth/login');
    }
};

/**
 * Muestra el formulario de registro
 * 
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
 */
const showRegisterForm = (req, res) => {
    res.render('auth/register', {
        title: 'Crear Cuenta',
        errors: req.flash('errors'),
        oldInput: req.flash('oldInput')[0] || {}
    });
};

/**
 * Procesa el registro de nuevo usuario
 * 
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
 */
const register = async (req, res) => {
    try {
        const { nombre, email, password } = req.body;

        // Crear el usuario
        const user = await Usuario.create({
            nombre,
            email,
            password,
            rol: 'usuario' // Los nuevos usuarios siempre son "usuario" normal
        });

        // Mostrar mensaje de éxito y redirigir a login
        req.flash('success', '¡Cuenta creada exitosamente! Ahora puede iniciar sesión.');
        return res.redirect('/auth/login');

    } catch (error) {
        console.error('Error en registro:', error);
        req.flash('errors', [error.message]);
        req.flash('oldInput', {
            nombre: req.body.nombre,
            email: req.body.email
        });
        return res.redirect('/auth/register');
    }
};

/**
 * Cierra la sesión del usuario
 * 
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
 */
const logout = (req, res) => {
    // Destruir la sesión
    req.session.destroy((err) => {
        if (err) {
            console.error('Error al cerrar sesión:', err);
        }
        
        // Limpiar cookie de sesión
        res.clearCookie('connect.sid');
        
        return res.redirect('/auth/login');
    });
};

/**
 * API: Login que devuelve un token JWT
 * Para uso con aplicaciones móviles o SPAs
 * 
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
 */
const apiLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await Usuario.verifyCredentials(email, password);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Credenciales inválidas'
            });
        }

        // Generar token JWT
        const token = generateToken(user);

        return res.json({
            success: true,
            message: 'Login exitoso',
            data: {
                user: {
                    id: user.id,
                    nombre: user.nombre,
                    email: user.email,
                    rol: user.rol
                },
                token
            }
        });

    } catch (error) {
        console.error('Error en API login:', error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * API: Registro de usuario
 * 
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
 */
const apiRegister = async (req, res) => {
    try {
        const { nombre, email, password } = req.body;

        const user = await Usuario.create({
            nombre,
            email,
            password,
            rol: 'usuario'
        });

        // Generar token para el nuevo usuario
        const token = generateToken(user);

        return res.status(201).json({
            success: true,
            message: 'Usuario registrado exitosamente',
            data: {
                user,
                token
            }
        });

    } catch (error) {
        console.error('Error en API registro:', error);
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * API: Obtener información del usuario actual
 * 
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
 */
const apiGetCurrentUser = (req, res) => {
    return res.json({
        success: true,
        data: {
            user: req.user
        }
    });
};

module.exports = {
    showLoginForm,
    login,
    showRegisterForm,
    register,
    logout,
    apiLogin,
    apiRegister,
    apiGetCurrentUser
};
