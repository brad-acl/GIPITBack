# GIPIT - Sistema de Gestión de Procesos de Reclutamiento

## Descripción
GIPIT es una plataforma integral diseñada para optimizar y gestionar procesos de reclutamiento, facilitando la interacción entre empresas y candidatos. El sistema permite gestionar vacantes, evaluar candidatos y realizar seguimiento de procesos de contratación.

## Tabla de Contenidos
1. [Instalación](#instalación)
2. [Configuración](#configuración)
3. [Uso](#uso)
4. [Estructura del Proyecto](#estructura-del-proyecto)
5. [Funcionalidades](#funcionalidades)
6. [Tecnologías Utilizadas](#tecnologías-utilizadas)
7. [Contribución](#contribución)
8. [Pruebas](#pruebas)
9. [Despliegue](#despliegue)
10. [Contacto](#contacto)
11. [Licencia](#licencia)

## Instalación
### Requisitos previos
- Node.js (versión recomendada: 18.x o superior)
- npm o yarn
- Base de datos compatible con Prisma

### Instrucciones de instalación
1. Clonar el repositorio
- `git clone [url-del-repositorio]`

2. Instalar dependencias del backend
- `cd gipit-back`
- `npm install`

3. Instalar dependencias del frontend
- `cd ../gipit-react`
- `npm install`

## Configuración
### Variables de entorno
- Backend
- `DATABASE_URL`: URL de conexión a la base de datos
- `API_PORT`: Puerto para el servidor (default: 3001)   

- Frontend
- `NEXT_PUBLIC_API_URL`: URL de la API (default: http://localhost:3001)
- `NEXT_PUBLIC_BASE_URL`: URL base de la aplicación (default: http://localhost:3000)

## Uso
### Desarrollo
# Backend
- `cd gipit-back`
- `npm run dev`

# Frontend
- `cd gipit-react`
- `npm run dev`

### Producción
- `npm run build`

## Estructura del Proyecto
### Backend
- `/app`: Código principal de la aplicación
- `/api`: Endpoints y controladores
- `/lib`: Utilidades y configuraciones

### Frontend
- `/app`: Código fuente del frontend
- `/(routes)`: Rutas y páginas
- `/components`: Componentes reutilizables
- `/lib`: Utilidades y tipos

## Documentación API
La documentación de la API está disponible a través de Swagger:
- URL: `http://localhost:3001/api-docs`
- Para agregar nuevos endpoints, seguir el formato JSDoc como se muestra a continuación:

   ```typescript
   /**
    * @swagger
    * /tu-ruta:
    *   get:
    *     summary: Descripción corta
    *     description: Descripción detallada
    *     tags: [Nombre del Grupo]
    *     parameters:
    *       - in: query
    *         name: parametro
    *         schema:
    *           type: string
    *         description: Descripción del parámetro
    *     responses:
    *       200:
    *         description: Respuesta exitosa
    */
   ```

## Tecnologías Utilizadas
### Backend: 
- Next.js (App Router)
- Swagger para documentación API
- Prisma ORM

### Frontend: 
- Next.js
- React
- TypeScript
- CSS Modules   

## Contribución
- Hacer un fork del repositorio
- Crear una nueva rama (`git checkout -b feature/XYZ`)
- Hacer commit de los cambios (`git commit -m 'Add feature XYZ'`)
- Enviar un pull request

## Pruebas
- `npm test`

## Despliegue
### Backend
- `cd gipit-back`
- `npm run build`

### Frontend
- `cd gipit-react`
- `npm run build`

## Contacto
- Correo: ejemplo@correo.com

## Licencia
Distribuido bajo la licencia MIT.