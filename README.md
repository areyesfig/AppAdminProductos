# 📦 Aplicación Web con Acceso Seguro a Base de Datos Relacional

<div align="center">

[![GitHub](https://img.shields.io/badge/GitHub-Repositorio-181717?style=for-the-badge&logo=github)](https://github.com/areyesfig/AppAdminProductos)
[![Render](https://img.shields.io/badge/Render-Live-46E3B7?style=for-the-badge&logo=render)](https://app-admin-productos.onrender.com)
[![Node.js](https://img.shields.io/badge/Node.js-20+-339933?style=for-the-badge&logo=node.js)](https://nodejs.org/)
[![SQLite](https://img.shields.io/badge/SQLite-Database-003B57?style=for-the-badge&logo=sqlite)](https://sqlite.org/)
[![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)
[![Status](https://img.shields.io/badge/Status-✅_Deployed-success?style=for-the-badge)]()

**Sistema de Gestión de Productos con Autenticación Segura**

[Ver Demo en Vivo](https://app-admin-productos.onrender.com) · [Reportar Bug](https://github.com/areyesfig/AppAdminProductos/issues) · [Código Fuente](https://github.com/areyesfig/AppAdminProductos)

</div>

---

## 🔗 Enlaces Rápidos

| Recurso | URL |
|---------|-----|
| 🌐 **Aplicación en Producción** | [https://app-admin-productos.onrender.com](https://app-admin-productos.onrender.com) |
| 📂 **Repositorio GitHub** | [https://github.com/areyesfig/AppAdminProductos](https://github.com/areyesfig/AppAdminProductos) |
| 📊 **Dashboard Render** | [https://dashboard.render.com/web/srv-d4md54a4d50c73eibjo0](https://dashboard.render.com/web/srv-d4md54a4d50c73eibjo0) |

### 🔑 Credenciales de Prueba

| Rol | Email | Contraseña |
|-----|-------|------------|
| 👑 **Administrador** | `admin@ejemplo.com` | `Admin123!` |

---

## 📋 Descripción

Esta aplicación web fue desarrollada como **proyecto final** para la materia de **Bases de Datos Relacionales** en la Universidad Autónoma de Chile. Implementa un sistema completo de gestión de productos con:

- ✅ **Autenticación robusta** con múltiples capas de seguridad
- ✅ **Operaciones CRUD** completas para productos
- ✅ **API REST** protegida con JWT
- ✅ **Panel de administración** con control de usuarios
- ✅ **Despliegue en producción** en Render.com

## 🛠️ Stack Tecnológico

### Backend
| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| **Node.js** | 20+ | Entorno de ejecución JavaScript |
| **Express.js** | 4.18+ | Framework web minimalista |
| **SQLite** | 3.x | Base de datos relacional embebida |
| **better-sqlite3** | 9.x | Driver nativo de alto rendimiento |
| **bcryptjs** | 2.4+ | Hash seguro de contraseñas |
| **jsonwebtoken** | 9.x | Tokens JWT para API |
| **express-validator** | 7.x | Validación y sanitización |

### Frontend
| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| **EJS** | 3.x | Motor de plantillas |
| **Bootstrap** | 5.3 | Framework CSS responsivo |
| **Bootstrap Icons** | 1.11 | Iconografía moderna |

### Seguridad
| Tecnología | Propósito |
|------------|-----------|
| **Helmet** | Headers HTTP seguros (CSP, HSTS, etc.) |
| **express-rate-limit** | Protección contra fuerza bruta |
| **express-session** | Gestión segura de sesiones |

### Despliegue
| Plataforma | Propósito |
|------------|-----------|
| **Render.com** | Hosting de producción (Plan Starter) |
| **GitHub** | Control de versiones y CI/CD |

## 📁 Estructura del Proyecto

```
appWeb/
├── 📂 src/
│   ├── 🚀 app.js                    # Punto de entrada de la aplicación
│   ├── 📂 config/
│   │   └── ⚙️ config.js             # Configuración centralizada
│   ├── 📂 controllers/
│   │   ├── 🔐 authController.js     # Controlador de autenticación
│   │   ├── 📦 productController.js  # Controlador de productos
│   │   └── 👤 userController.js     # Controlador de usuarios/dashboard
│   ├── 📂 database/
│   │   ├── 🔌 connection.js         # Conexión a SQLite (Singleton)
│   │   └── 🏗️ init.js               # Inicialización de la BD
│   ├── 📂 middleware/
│   │   ├── 🛡️ auth.js               # Middleware de autenticación
│   │   ├── 🔒 security.js           # Helmet, Rate Limiting, Sanitización
│   │   └── ✅ validation.js         # Reglas de validación
│   ├── 📂 models/
│   │   ├── 👤 Usuario.js            # Modelo de Usuario (bcrypt)
│   │   └── 📦 Producto.js           # Modelo de Producto (CRUD)
│   ├── 📂 routes/
│   │   ├── 🏠 index.js              # Rutas principales
│   │   ├── 🔐 auth.js               # Rutas de autenticación
│   │   ├── 📊 dashboard.js          # Rutas del dashboard
│   │   ├── 📦 products.js           # Rutas CRUD de productos
│   │   ├── 👑 admin.js              # Rutas de administración
│   │   └── 🔌 api.js                # Rutas de API REST (JWT)
│   ├── 📂 views/
│   │   ├── 📐 layouts/              # Plantillas base (main.ejs)
│   │   ├── 🧩 partials/             # Componentes reutilizables
│   │   ├── 🔐 auth/                 # Login, Register
│   │   ├── 📊 dashboard/            # Panel de usuario
│   │   ├── 📦 products/             # CRUD de productos
│   │   ├── 👑 admin/                # Panel de administración
│   │   └── ❌ errors/               # Páginas 404, 500
│   └── 📂 public/
│       └── 🎨 css/style.css         # Estilos personalizados
├── 📂 data/                         # 💾 Base de datos SQLite
├── 📄 package.json                  # 📋 Dependencias
├── 📄 .env                          # 🔐 Variables de entorno
├── 📄 .node-version                 # 📌 Versión de Node (20.10.0)
├── 📄 render.yaml                   # 🚀 Configuración de Render
└── 📄 README.md                     # 📖 Esta documentación
```

## 🗄️ Diseño de Base de Datos

### Diagrama Entidad-Relación

```
┌─────────────────────────┐              ┌─────────────────────────┐
│       USUARIOS          │              │       PRODUCTOS         │
├─────────────────────────┤              ├─────────────────────────┤
│ 🔑 id (PK)              │─────┐        │ 🔑 id (PK)              │
│ 📝 nombre VARCHAR(100)  │     │        │ 📝 nombre VARCHAR(200)  │
│ 📧 email (UNIQUE)       │     │        │ 📄 descripcion TEXT     │
│ 🔒 password_hash        │     │        │ 💰 precio DECIMAL       │
│ 👤 rol (admin/user/mod) │     │        │ 📦 stock INTEGER        │
│ ✅ activo BOOLEAN       │     │        │ 🏷️ categoria VARCHAR    │
│ ⚠️ intentos_fallidos    │     │        │ 🖼️ imagen_url VARCHAR   │
│ 🚫 bloqueado_hasta      │     │        │ ✅ activo BOOLEAN       │
│ 🕐 ultimo_login         │     └───────>│ 👤 usuario_id (FK)      │
│ 📅 fecha_creacion       │              │ 📅 fecha_creacion       │
│ 📅 fecha_actualizacion  │              │ 📅 fecha_actualizacion  │
└─────────────────────────┘              └─────────────────────────┘
         │
         │ 1:N
         ▼
┌─────────────────────────┐              ┌─────────────────────────┐
│   SESIONES_ACTIVAS      │              │    INTENTOS_LOGIN       │
├─────────────────────────┤              ├─────────────────────────┤
│ 🔑 id (PK)              │              │ 🔑 id (PK)              │
│ 👤 usuario_id (FK)      │              │ 📧 email VARCHAR        │
│ 🎫 token_hash           │              │ 🌐 ip_address VARCHAR   │
│ 🌐 ip_address           │              │ ✅ exitoso BOOLEAN      │
│ 💻 user_agent           │              │ 📅 fecha DATETIME       │
│ 📅 fecha_creacion       │              └─────────────────────────┘
│ 📅 fecha_expiracion     │
└─────────────────────────┘
         │
         │ 1:N
         ▼
┌─────────────────────────┐
│    LOGS_AUDITORIA       │
├─────────────────────────┤
│ 🔑 id (PK)              │
│ 👤 usuario_id (FK)      │
│ 📋 accion VARCHAR       │
│ 📊 tabla_afectada       │
│ 🆔 registro_id          │
│ 📄 datos_anteriores     │
│ 📄 datos_nuevos         │
│ 🌐 ip_address           │
│ 📅 fecha DATETIME       │
└─────────────────────────┘
```

### Descripción de Tablas

| Tabla | Descripción | Características |
|-------|-------------|-----------------|
| **usuarios** | Información de usuarios | bcrypt (12 rondas), bloqueo temporal, roles |
| **productos** | Catálogo de productos | FK a usuario, soft delete, auditoría |
| **sesiones_activas** | Control de sesiones | Invalidación remota, IP + User-Agent |
| **intentos_login** | Registro de autenticación | Detección de fuerza bruta |
| **logs_auditoria** | Trazabilidad de acciones | Cumplimiento de seguridad |

## 🚀 Instalación y Configuración

### Requisitos Previos
- Node.js v18+ (recomendado v20)
- npm v9+
- Git

### Instalación Local

```bash
# 1. Clonar el repositorio
git clone https://github.com/areyesfig/AppAdminProductos.git
cd AppAdminProductos

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# Editar .env con tus configuraciones

# 4. Inicializar la base de datos
npm run init-db

# 5. Iniciar la aplicación
npm run dev     # Desarrollo (hot reload)
npm start       # Producción
```

### Variables de Entorno

```env
# Servidor
NODE_ENV=development
PORT=3000

# Base de datos
DB_PATH=./data/database.sqlite

# Seguridad (CAMBIAR EN PRODUCCIÓN)
SESSION_SECRET=tu-clave-secreta-muy-larga-aqui
JWT_SECRET=otra-clave-secreta-diferente
```

### Acceso a la Aplicación
- **URL Local:** http://localhost:3000
- **Admin:** `admin@ejemplo.com` / `Admin123!`

---

## 🌐 Despliegue en Producción

### Render.com

La aplicación está desplegada en **Render.com** con la siguiente configuración:

| Configuración | Valor |
|---------------|-------|
| **Servicio** | Web Service |
| **Plan** | Starter |
| **Región** | Oregon (US West) |
| **Runtime** | Node.js 20 |
| **Build Command** | `npm install && npm run init-db` |
| **Start Command** | `npm start` |
| **Auto-Deploy** | ✅ Habilitado (desde GitHub) |

#### Variables de Entorno en Producción

| Variable | Valor |
|----------|-------|
| `NODE_ENV` | `production` |
| `SESSION_SECRET` | (generado automáticamente) |
| `JWT_SECRET` | (generado automáticamente) |
| `DB_PATH` | `./data/database.sqlite` |
| `NODE_VERSION` | `20.10.0` |

## 🔐 Análisis de Seguridad

### ✅ Medidas Implementadas

#### 1. Autenticación Robusta
| Medida | Implementación |
|--------|----------------|
| Hash de contraseñas | bcrypt con 12 rondas de salt |
| Requisitos de contraseña | 8+ caracteres, mayúscula, minúscula, número, especial |
| Bloqueo de cuenta | 5 intentos fallidos → 15 min de bloqueo |
| Regeneración de sesión | Al iniciar sesión (previene session fixation) |

#### 2. Protección contra Inyección SQL
| Medida | Implementación |
|--------|----------------|
| Consultas preparadas | ✅ better-sqlite3 con parámetros |
| Validación de tipos | ✅ express-validator |
| Sin concatenación | ✅ Ningún string SQL dinámico |

#### 3. Protección XSS (Cross-Site Scripting)
| Medida | Implementación |
|--------|----------------|
| Escape automático | ✅ Plantillas EJS |
| Content Security Policy | ✅ Helmet.js configurado |
| Sanitización de entrada | ✅ express-validator |

#### 4. Headers de Seguridad HTTP (Helmet)
```
✅ X-Content-Type-Options: nosniff
✅ X-Frame-Options: DENY
✅ X-XSS-Protection: 1; mode=block
✅ Strict-Transport-Security (HSTS en producción)
✅ Content-Security-Policy personalizado
```

#### 5. Rate Limiting
| Tipo | Límite | Ventana |
|------|--------|---------|
| 🌐 General | 100 peticiones | 15 minutos |
| 🔐 Login | 5 intentos | 15 minutos |
| 📝 Registro | 3 cuentas | 1 hora |
| 🔌 API | 200 peticiones | 15 minutos |

#### 6. Gestión Segura de Sesiones
| Medida | Estado |
|--------|--------|
| Cookies HttpOnly | ✅ No accesibles por JavaScript |
| Cookies Secure | ✅ Solo HTTPS en producción |
| SameSite=Strict | ✅ Previene CSRF |
| Expiración configurada | ✅ 24 horas |

### 📊 Evaluación de Seguridad

| Vulnerabilidad | Estado | Protección |
|----------------|--------|------------|
| Inyección SQL | ✅ Protegido | Prepared statements |
| XSS | ✅ Protegido | Escape + CSP |
| CSRF | ✅ Protegido | SameSite cookies |
| Fuerza Bruta | ✅ Protegido | Rate limiting + bloqueo |
| Contraseñas débiles | ✅ Protegido | bcrypt 12 rondas |
| Session Hijacking | ✅ Protegido | HttpOnly + Secure |
| Clickjacking | ✅ Protegido | X-Frame-Options |
| MIME Sniffing | ✅ Protegido | X-Content-Type-Options |

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

## 📝 Funcionalidades por Rol

### 👤 Usuario Normal
| Funcionalidad | Estado |
|---------------|--------|
| Registro de cuenta | ✅ |
| Inicio/cierre de sesión | ✅ |
| Ver/editar perfil | ✅ |
| Cambiar contraseña | ✅ |
| Ver productos | ✅ |
| Crear productos propios | ✅ |
| Editar/eliminar productos propios | ✅ |

### 👑 Administrador
| Funcionalidad | Estado |
|---------------|--------|
| Todo lo del usuario normal | ✅ |
| Ver todos los usuarios | ✅ |
| Activar/desactivar usuarios | ✅ |
| Editar/eliminar cualquier producto | ✅ |
| Cambiar roles de usuarios | ✅ |

---

## ✅ Cumplimiento de Requisitos de la Tarea

| Paso | Requisito | Estado | Implementación |
|------|-----------|--------|----------------|
| 1 | Selección de lenguaje y framework | ✅ | Node.js + Express.js |
| 2 | Diseño de base de datos relacional | ✅ | 5 tablas con FK y relaciones |
| 3 | Creación de base de datos | ✅ | SQLite con better-sqlite3 |
| 4.1 | Conexión segura a BD | ✅ | Prepared statements |
| 4.2 | Operaciones CRUD | ✅ | Productos completo |
| 4.3 | Formularios y vistas | ✅ | EJS + Bootstrap 5 |
| 4.4 | Autenticación y autorización | ✅ | Sesiones + JWT + Roles |
| 4.5 | Validación de datos | ✅ | express-validator |
| 4.6 | Medidas de seguridad | ✅ | Helmet, Rate Limit, bcrypt |
| 5 | Pruebas y depuración | ✅ | App funcional |
| 6 | Documentación y comentarios | ✅ | README + JSDoc |
| 7 | Implementación en producción | ✅ | Render.com |
| 8 | Evaluación en vivo | ✅ | [Ver Demo](https://app-admin-productos.onrender.com) |
| 9 | Mantenimiento | ✅ | Estructura modular |
| 10 | Presentación y documentación | ✅ | Este documento |

## 🚧 Posibles Mejoras Futuras

| Prioridad | Mejora | Descripción |
|-----------|--------|-------------|
| 🔴 Alta | Recuperación de contraseña | Envío de email para resetear |
| 🔴 Alta | Verificación de email | Confirmar email al registrarse |
| 🟡 Media | 2FA | Autenticación de dos factores |
| 🟡 Media | Subida de imágenes | Imágenes de productos con Cloudinary |
| 🟢 Baja | Carrito de compras | Sistema de compras completo |
| 🟢 Baja | Reportes PDF/CSV | Exportación de datos |
| 🟢 Baja | Tests automatizados | Jest + Supertest |

---

## 👨‍💻 Autor

<div align="center">

### **Álvaro Reyes Figueroa**

| | |
|---|---|
| 🎓 **Universidad** | Universidad Autónoma de Chile |
| 📚 **Materia** | Bases de Datos Relacionales |
| 📅 **Período** | 4to Trimestre, Semana 12 |
| 📆 **Fecha** | Noviembre 2025 |
| 📧 **Contacto** | [GitHub @areyesfig](https://github.com/areyesfig) |

</div>

---

## 📄 Licencia

Este proyecto es de código abierto bajo la licencia MIT.

```
MIT License

Copyright (c) 2025 Álvaro Reyes Figueroa

Se concede permiso, de forma gratuita, a cualquier persona que obtenga una copia
de este software para utilizar el Software sin restricción, incluyendo sin 
limitación los derechos de usar, copiar, modificar, fusionar, publicar, distribuir, 
sublicenciar y/o vender copias del Software.
```

---

<div align="center">

**🎓 Proyecto Académico - Universidad Autónoma de Chile**

[![Made with ❤️](https://img.shields.io/badge/Made%20with-❤️-red?style=flat-square)]()
[![Powered by Node.js](https://img.shields.io/badge/Powered%20by-Node.js-339933?style=flat-square&logo=node.js)]()
[![Deployed on Render](https://img.shields.io/badge/Deployed%20on-Render-46E3B7?style=flat-square&logo=render)]()

**© 2025 - Álvaro Reyes Figueroa**

</div>
