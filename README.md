
# Plataforma de Gestión de Licencias Académicas - Frontend (React + Vite)

Aplicación Single Page Application (SPA) desarrollada en React + Vite para la materia **Tecnología Web 2**, diseñada bajo la identidad visual institucional del Portal Académico de la **Universidad Privada Domingo Savio (UPDS)**.

---

## Tecnologías Utilizadas

- **Librería UI:** React 18
- **Herramienta de Compilación:** Vite
- **Cliente HTTP:** Axios (con interceptores para Tokens Sanctum)
- **Estilos:** CSS3 institucional (Azul Marino UPDS `#0f4c81`, tarjetas académicas blancas `#ffffff`, fondo `#f4f6f9` y badges de estado en colores planos).

---

## Arquitectura Modular por Features

La estructura sigue un patrón modular limpio dentro de `src/features/`:

src/
├── components/ # Componentes globales (Header institucional, Axios instance)
└── features/
├── auth/ # Contexto de Autenticación, Login y Token Storage
├── solicitudes/ # Lista, Formulario con File Upload, Detalle y Cambio de Estado
├── tiposLicencia/ # Gestión CRUD de tipos de licencias académicas
└── usuarios/ # Panel de administración de usuarios y asignación de revisores
code Code

---

## Características Destacadas

- **Diseño Institucional UPDS:** Navegador superior azul marino con pestañas horizontales y perfil de usuario activo.
- **Validación de Subida:** Deshabilitación de envío si el estudiante no adjunta un documento justificativo (PDF/Imagen).
- **Visualizador y Descargador de Documentos:** Descarga segura de archivos justificativos mediante consumo de `blob` autenticado.
- **Vistas dinámicas según el Rol:**
  - **Estudiantes:** Formulario de solicitud y vista de detalles en modo solo lectura.
  - **Revisores:** Filtro automático de licencias asignadas y botones de evaluación rápida (`Aprobar` / `Rechazar` con motivo obligatorio).
  - **Administradores:** Control total de solicitudes, usuarios y permisos.

---

## Instalación y Configuración Local

1. **Clonar el repositorio y entrar a la carpeta:**
   ```bash
   git clone <URL_REPOSITORIO>
   cd plataforma-licencias-frontend

    Instalar dependencias de NPM:
    code Bash

    npm install

    Verificar la configuración de Axios (src/components/api/axios.js):
    Asegúrate de que apunte al servidor backend de Laravel:
    code JavaScript

    baseURL: 'http://127.0.0.1:8000/api'

    Iniciar el servidor de desarrollo de Vite:
    code Bash

    npm run dev

    Abrir en el navegador:
    Ingresa a http://localhost:5173.

   ```

Credenciales de Prueba

    Administrador: admin@admin.com / password

    Estudiantes y Revisores: Correo institucional registrado / password

