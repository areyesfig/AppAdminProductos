# 📦 Aplicación Web con Acceso Seguro a Base de Datos Relacional

## 📋 Descripción

Esta aplicación web fue desarrollada como proyecto para la materia de Bases de Datos Relacionales. Implementa un sistema completo de gestión de productos con autenticación robusta, operaciones CRUD y múltiples capas de seguridad.

## 🛠️ Tecnologías Utilizadas

### Backend
- **Node.js** - Entorno de ejecución JavaScript
- **Express.js** - Framework web para Node.js
- **SQLite** - Base de datos relacional ligera (con better-sqlite3)
- **bcryptjs** - Hash seguro de contraseñas
- **jsonwebtoken (JWT)** - Autenticación basada en tokens
- **express-validator** - Validación y sanitización de datos

### Frontend
- **EJS** - Motor de plantillas
- **Bootstrap 5** - Framework CSS
- **Bootstrap Icons** - Iconografía

### Seguridad
- **Helmet** - Headers de seguridad HTTP
- **express-rate-limit** - Limitación de peticiones
- **express-session** - Gestión de sesiones

## 📁 Estructura del Proyecto

```
appWeb/
├── src/
│   ├── app.js                 # Punto de entrada de la aplicación
│   ├── config/
│   │   └── config.js          # Configuración centralizada
│   ├── controllers/
│   │   ├── authController.js  # Controlador de autenticación
│   │   ├── productController.js # Controlador de productos
│   │   └── userController.js  # Controlador de usuarios/dashboard
│   ├── database/
│   │   ├── connection.js      # Conexión a SQLite
│   │   └── init.js            # Inicialización de la BD
│   ├── middleware/
│   │   ├── auth.js            # Middleware de autenticación
│   │   ├── security.js        # Middleware de seguridad
│   │   └── validation.js      # Reglas de validación
│   ├── models/
│   │   ├── Usuario.js         # Modelo de Usuario
│   │   └── Producto.js        # Modelo de Producto
│   ├── routes/
│   │   ├── index.js           # Rutas principales
│   │   ├── auth.js            # Rutas de autenticación
│   │   ├── dashboard.js       # Rutas del dashboard
│   │   ├── products.js        # Rutas CRUD de productos
│   │   ├── admin.js           # Rutas de administración
│   │   └── api.js             # Rutas de API REST
│   └── views/
│       ├── layouts/           # Plantillas base
│       ├── partials/          # Componentes reutilizables
│       ├── auth/              # Vistas de autenticación
│       ├── dashboard/         # Vistas del dashboard
│       ├── products/          # Vistas de productos
│       ├── admin/             # Vistas de administración
│       └── errors/            # Páginas de error
├── data/                      # Base de datos SQLite
├── package.json
├── .env                       # Variables de entorno
└── README.md
```

## 🗄️ Diseño de Base de Datos

### Diagrama Entidad-Relación

```
┌─────────────────────┐         ┌─────────────────────┐
│      USUARIOS       │         │      PRODUCTOS      │
├─────────────────────┤         ├─────────────────────┤
│ id (PK)             │────┐    │ id (PK)             │
│ nombre              │    │    │ nombre              │
│ email (UNIQUE)      │    │    │ descripcion         │
│ password_hash       │    │    │ precio              │
│ rol                 │    │    │ stock               │
│ activo              │    │    │ categoria           │
│ intentos_fallidos   │    │    │ imagen_url          │
│ bloqueado_hasta     │    │    │ activo              │
│ ultimo_login        │    └───>│ usuario_id (FK)     │
│ fecha_creacion      │         │ fecha_creacion      │
│ fecha_actualizacion │         │ fecha_actualizacion │
└─────────────────────┘         └─────────────────────┘
         │
         │
         v
┌─────────────────────┐         ┌─────────────────────┐
│  SESIONES_ACTIVAS   │         │   INTENTOS_LOGIN    │
├─────────────────────┤         ├─────────────────────┤
│ id (PK)             │         │ id (PK)             │
│ usuario_id (FK)     │         │ email               │
│ token_hash          │         │ ip_address          │
│ ip_address          │         │ exitoso             │
│ user_agent          │         │ fecha               │
│ fecha_creacion      │         └─────────────────────┘
│ fecha_expiracion    │
└─────────────────────┘
         │
         v
┌─────────────────────┐
│   LOGS_AUDITORIA    │
├─────────────────────┤
│ id (PK)             │
│ usuario_id (FK)     │
│ accion              │
│ tabla_afectada      │
│ registro_id         │
│ datos_anteriores    │
│ datos_nuevos        │
│ ip_address          │
│ fecha               │
└─────────────────────┘
```

### Descripción de Tablas

#### usuarios
Almacena la información de los usuarios del sistema.
- Contraseñas hasheadas con bcrypt (12 rondas)
- Control de intentos fallidos y bloqueo temporal
- Roles: admin, moderador, usuario

#### productos
Catálogo de productos con información completa.
- Relación con usuario creador (FK)
- Soft delete (campo activo)
- Auditoría de fechas

#### sesiones_activas
Control de sesiones para seguridad.
- Permite invalidar sesiones remotamente
- Registro de IP y User-Agent

#### intentos_login
Registro de intentos de autenticación.
- Detección de ataques de fuerza bruta
- Análisis de patrones sospechosos

#### logs_auditoria
Registro de acciones importantes.
- Trazabilidad de cambios
- Cumplimiento de seguridad

## 🚀 Instalación y Configuración

### Requisitos Previos
- Node.js v18 o superior
- npm v9 o superior

### Pasos de Instalación

1. **Clonar o descargar el proyecto**
   ```bash
   cd appWeb
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**
   ```bash
   # Copiar archivo de ejemplo
   cp .env.example .env
   
   # Editar .env con tus configuraciones
   # IMPORTANTE: Cambiar las claves secretas en producción
   ```

4. **Inicializar la base de datos**
   ```bash
   npm run init-db
   ```

5. **Iniciar la aplicación**
   ```bash
   # Modo desarrollo (con hot reload)
   npm run dev
   
   # Modo producción
   npm start
   ```

6. **Acceder a la aplicación**
   - URL: http://localhost:3000
   - Usuario admin: admin@ejemplo.com
   - Contraseña: Admin123!

## 🔐 Medidas de Seguridad Implementadas

### 1. Autenticación Robusta
- **Contraseñas hasheadas** con bcrypt (12 rondas de salt)
- **Requisitos de contraseña**: mínimo 8 caracteres, mayúscula, minúscula, número y carácter especial
- **Bloqueo de cuenta** tras 5 intentos fallidos (15 minutos)
- **Regeneración de ID de sesión** al iniciar sesión

### 2. Protección contra Inyección SQL
- **Consultas preparadas** (Prepared Statements) con better-sqlite3
- **Validación de tipos** en todos los parámetros
- Ninguna concatenación de strings en consultas SQL

### 3. Protección XSS (Cross-Site Scripting)
- **Escape automático** en plantillas EJS
- **Content Security Policy (CSP)** con Helmet
- **Sanitización de entrada** con express-validator

### 4. Protección CSRF
- **Cookies SameSite=Strict** para prevenir CSRF
- **Validación de origen** en peticiones

### 5. Headers de Seguridad HTTP (Helmet)
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Strict-Transport-Security` (HSTS en producción)
- `Content-Security-Policy` personalizado

### 6. Rate Limiting
- **General**: 100 peticiones por 15 minutos
- **Login**: 5 intentos por 15 minutos
- **Registro**: 3 cuentas por hora por IP
- **API**: 200 peticiones por 15 minutos

### 7. Validación de Datos
- Validación en servidor con express-validator
- Tipos de datos verificados
- Longitudes máximas establecidas
- Caracteres especiales escapados

### 8. Gestión Segura de Sesiones
- Cookies HttpOnly (no accesibles por JavaScript)
- Cookies Secure en producción (solo HTTPS)
- Tiempo de expiración configurado
- Regeneración de ID al autenticar

## 📡 API REST

La aplicación incluye una API REST protegida con JWT.

### Autenticación

**Login**
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "usuario@ejemplo.com",
  "password": "Password123!"
}
```

**Respuesta exitosa**
```json
{
  "success": true,
  "message": "Login exitoso",
  "data": {
    "user": {
      "id": 1,
      "nombre": "Usuario",
      "email": "usuario@ejemplo.com",
      "rol": "usuario"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Productos (requiere token)

**Listar productos**
```http
GET /api/productos
Authorization: Bearer <token>
```

**Crear producto**
```http
POST /api/productos
Authorization: Bearer <token>
Content-Type: application/json

{
  "nombre": "Nuevo Producto",
  "descripcion": "Descripción del producto",
  "precio": 99.99,
  "stock": 10,
  "categoria": "Electrónica"
}
```

## 🧪 Pruebas

### Pruebas Manuales Recomendadas

1. **Registro de usuario**
   - Validar requisitos de contraseña
   - Verificar email único

2. **Login**
   - Probar credenciales correctas
   - Probar credenciales incorrectas
   - Verificar bloqueo tras 5 intentos

3. **CRUD de productos**
   - Crear producto con todos los campos
   - Editar producto existente
   - Eliminar producto
   - Buscar y filtrar productos

4. **Control de acceso**
   - Verificar rutas protegidas sin sesión
   - Verificar roles (usuario vs admin)

5. **Seguridad**
   - Intentar inyección SQL en formularios
   - Intentar XSS en campos de texto
   - Verificar rate limiting

## 📝 Funcionalidades

### Usuario Normal
- ✅ Registro de cuenta
- ✅ Inicio/cierre de sesión
- ✅ Ver/editar perfil
- ✅ Cambiar contraseña
- ✅ Ver productos
- ✅ Crear productos propios
- ✅ Editar/eliminar productos propios

### Administrador
- ✅ Todo lo anterior
- ✅ Ver todos los usuarios
- ✅ Activar/desactivar usuarios
- ✅ Editar/eliminar cualquier producto

## 🚧 Posibles Mejoras Futuras

1. Recuperación de contraseña por email
2. Verificación de email al registrarse
3. Autenticación de dos factores (2FA)
4. Subida de imágenes de productos
5. Sistema de categorías jerárquico
6. Carrito de compras
7. Sistema de reportes y estadísticas
8. Exportación de datos (CSV, PDF)
9. Logs más detallados
10. Tests automatizados

## 👨‍💻 Autor

**Álvaro Reyes Figueroa**
- Universidad Autónoma de Chile
- Materia: Bases de Datos Relacionales
- 4to Trimestre, Semana 12

## 📄 Licencia

Este proyecto es de código abierto bajo la licencia MIT.

---

© 2025 - Proyecto Académico
