# CeSiente Backend API

Backend para la aplicación de Cooperativa CeSiente.

## Tecnologías
- Node.js + Express
- MongoDB Atlas
- Mongoose ODM

## Variables de Entorno Requeridas

```
MONGODB_URI=tu_connection_string_de_mongodb_atlas
PORT=5000
```

## Instalación

```bash
npm install
npm start
```

## API Endpoints

- GET  `/api/dashboard` - Estadísticas generales
- GET  `/api/usuarios` - Lista de usuarios
- POST `/api/usuarios` - Crear usuario
- GET  `/api/prestamos` - Lista de préstamos
- POST `/api/solicitudes` - Nueva solicitud de préstamo
- GET  `/api/configuracion` - Configuración del sistema
- PUT  `/api/configuracion/:clave` - Actualizar configuración

## Producción

Base de datos: MongoDB Atlas
Hosting: Render.com
