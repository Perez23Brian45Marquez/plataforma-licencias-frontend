
# 🎨 Plataforma de Gestión de Licencias Académicas - Frontend (React + Vite)

Aplicación **Single Page Application (SPA)** desarrollada con **React + Vite** para la materia **Tecnología Web 2**, diseñada bajo la identidad visual institucional del Portal Académico de la **Universidad Privada Domingo Savio (UPDS)**.

---

# 🛠️ Tecnologías Utilizadas

- **Librería UI:** React 18
- **Herramienta de compilación:** Vite
- **Cliente HTTP:** Axios (con interceptores para Tokens Sanctum)
- **Estilos:** CSS3 institucional (Azul Marino UPDS `#0f4c81`, tarjetas blancas `#ffffff`, fondo `#f4f6f9` y badges de estado).

---

# 📁 Arquitectura del Proyecto

La aplicación sigue una arquitectura modular basada en *features*.

```text
src/
├── components/
│   ├── Header.jsx
│   └── api/
│       └── axios.js
└── features/
    ├── auth/
    ├── solicitudes/
    ├── tiposLicencia/
    └── usuarios/
```

### Descripción

| Carpeta            | Descripción                                           |
| ------------------ | ------------------------------------------------------ |
| `components/`    | Componentes compartidos e instancia de Axios           |
| `auth/`          | Login, autenticación y almacenamiento del token       |
| `solicitudes/`   | Listado, formulario, detalle y cambio de estado        |
| `tiposLicencia/` | CRUD de tipos de licencias                             |
| `usuarios/`      | Administración de usuarios y asignación de revisores |

---

# 🌟 Características

- Diseño institucional basado en el Portal Académico de la UPDS.
- Autenticación mediante **Laravel Sanctum**.
- Validación obligatoria de documentos justificativos (PDF o imagen).
- Descarga segura de archivos mediante respuestas `blob`.
- Interfaces dinámicas según el rol del usuario.

### 👨‍🎓 Estudiante

- Crear solicitudes.
- Adjuntar justificativos.
- Consultar únicamente sus propias solicitudes.

### 👨‍💼 Revisor

- Visualizar únicamente las solicitudes correspondientes a los tipos de licencia asignados.
- Aprobar o rechazar solicitudes.
- Registrar el motivo del rechazo.

### 👨‍💻 Administrador

- Gestión completa de usuarios.
- Gestión de tipos de licencia.
- Administración de solicitudes.

---

# ⚙️ Instalación y Configuración

## 1. Clonar el repositorio

```bash
git clone <URL_REPOSITORIO>
cd plataforma-licencias-frontend
```

## 2. Instalar dependencias

```bash
npm install
```

## 3. Configurar Axios

Verifica que el archivo `src/components/api/axios.js` tenga configurada la URL del backend.

```javascript
baseURL: "http://127.0.0.1:8000/api"
```

## 4. Ejecutar el servidor de desarrollo

```bash
npm run dev
```

## 5. Abrir la aplicación

Visita:

```text
http://localhost:5173
```

---

# 🔑 Credenciales de Prueba

| Rol           | Usuario                        | Contraseña     |
| ------------- | ------------------------------ | --------------- |
| Administrador | `admin@plataforma.test`      | `password123` |
| Estudiante    | `estudiante@plataforma.test` | `password123` |
| Revisor       | `revisor@plataforma.test`    | `password123` |

---


