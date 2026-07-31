# Plataforma de Gestión de Licencias Académicas - Backend (API REST)

Backend en Laravel 11 desarrollado para la materia **Tecnología Web 2**. Este sistema expone un API RESTful con autenticación por tokens (Sanctum), control de accesos basado en roles (RBAC) y soporte para almacenamiento y transmisión segura de documentos justificativos.

---

## Tecnologías Utilizadas

- **Framework:** Laravel 11
- **Lenguaje:** PHP 8.3+
- **Base de Datos:** PostgreSQL 17
- **Autenticación:** Laravel Sanctum (Personal Access Tokens)
- **Pruebas Automatizadas:** PHPUnit / Pest Feature Tests

---

## Control de Accesos Basado en Roles (RBAC)

1. **Estudiante:**
   - Puede crear solicitudes obligatoriamente adjuntando un documento justificativo (PDF/Imagen).
   - Solo puede visualizar sus propias solicitudes y documentos adjuntos.
2. **Revisor:**
   - Filtrado automático: solo visualiza las solicitudes asociadas a los tipos de licencias asignadas en la tabla pivote `revisor_tipo_licencia`.
   - Puede evaluar las solicitudes y transicionar su estado entre `PENDIENTE`, `EN_REVISION`, `APROBADA` o `RECHAZADA` (exigiendo un motivo si se rechaza).
3. **Administrador:**
   - Control total del sistema.
   - Gestión de Usuarios (creación de estudiantes y asignación de tipos de licencia a revisores).
   - CRUD completo de Tipos de Licencia y Solicitudes.

---

## Instalación y Configuración Local

1. **Clonar el repositorio y entrar a la carpeta:**
   ```bash
   git clone <URL_REPOSITORIO>
   cd plataforma-licencias

    Instalar dependencias de PHP:
    code Bash

    composer install

    Configurar el archivo de entorno .env:
    Copia el archivo de ejemplo:
    code Bash

    cp .env.example .env

    Asegúrate de configurar la conexión a PostgreSQL:
    code Env

    DB_CONNECTION=pgsql
    DB_HOST=127.0.0.1
    DB_PORT=5432
    DB_DATABASE=plataforma_licencias
    DB_USERNAME=postgres
    DB_PASSWORD=tu_contraseña
    APP_URL=http://127.0.0.1:8000

    Generar la clave de la aplicación:
    code Bash

    php artisan key:generate

    Ejecutar Migraciones y Seeders:
    code Bash

    php artisan migrate:fresh --seed

    (Opcional) Generador Masivo de Datos:
    Para poblar la base de datos con registros para pruebas de rendimiento:
    code Bash

    php artisan generar:solicitudes 100000

    Ejecutar Pruebas Automatizadas:
    code Bash

    php artisan test

    Iniciar el Servidor Local:
    code Bash

    php artisan serve --host=0.0.0.0 --port=8000

Endpoints Principales de la API
Método	Endpoint	Descripción
POST	/api/login	Autenticación y emisión de token Sanctum
GET	/api/solicitudes	Lista solicitudes según el rol del usuario autenticado
POST	/api/solicitudes	Crea solicitud con justificativo obligatorio
PUT	/api/solicitudes/{id}/estado	Cambia estado de solicitud (Revisor/Admin)
GET	/api/justificativos/{id}/descargar	Descarga/transmite el archivo justificativo
GET	/api/tipos-licencia	Lista tipos de licencias académicas
POST	/api/users/{id}/tipos-licencia	Asigna licencias a un revisor (Admin)
