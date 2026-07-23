# Portal WEB — WEB LTDA (B2B)

**Portal WEB** es la plataforma digital de abastecimiento comercial B2B para **WEB LTDA** (distribuidora comercial de materiales). Permite a los clientes gestionar su stock local, consultar catálogos, generar nuevos pedidos, realizar seguimiento en tiempo real y recibir asesoramiento comercial mediante el **Asistente WEB** (Inteligencia Artificial de Abastecimiento).

---

## 🚀 Stack Tecnológico

### **Backend**
* **Runtime:** Node.js (ES Modules)
* **Framework:** Express.js
* **Base de Datos:** MongoDB + Mongoose ORM
* **Autenticación:** JWT (JSON Web Tokens) & Bcryptjs
* **IA & LLM:** OpenRouter API (`google/gemma-4-26b-a4b-it:free` con fallback automático)

### **Frontend**
* **Librería UI:** React 19 (Vite)
* **Estilos:** Vanilla CSS modular con sistema de variables CSS y diseño responsive (Desktop, Tablet y Mobile)
* **Enrutamiento:** React Router DOM v7
* **Iconografía:** Lucide React

---

## 📁 Estructura del Proyecto

```text
PortalWEB/
├── backend/
│   ├── config/            # Conexión a MongoDB (db.js)
│   ├── controllers/       # Controladores de lógica de negocio
│   ├── middleware/        # Autenticación JWT y roles (authMiddleware.js)
│   ├── models/            # Esquemas Mongoose (Producto, Cliente, Pedido, etc.)
│   ├── routes/            # Definición de rutas API REST
│   ├── seed/              # Script de carga inicial de datos desde Excel
│   ├── services/          # Integración con OpenRouter API (openRouterService.js)
│   ├── utils/             # Algoritmos de abastecimiento e intenciones (abastecimiento.js)
│   ├── server.js          # Servidor principal Express
│   └── .env.example       # Plantilla de variables de entorno
├── frontend/
│   ├── src/
│   │   ├── components/    # Componentes UI (Header, Sidebar, AsistenteDrawer, SuccessOverlay)
│   │   ├── context/       # Estado global (UserContext, CartContext, NotificationContext)
│   │   ├── layouts/       # Estructuras de diseño (ClienteLayout, AdminLayout)
│   │   ├── pages/         # Vistas de Cliente y Administración
│   │   ├── services/      # Cliente HTTP Axios (api.js)
│   │   └── index.css      # Estilos globales y media queries responsive
├── IA_ASISTENTE_WEB.md    # Documentación completa del Asistente WEB AI
└── README.md              # Guía principal del proyecto
```

---

## ⚙️ Configuración e Instalación Local

### **1. Requisitos Previos**
* Node.js (v18 o superior)
* MongoDB corriendo localmente (`mongodb://127.0.0.1:27017/portalweb`) o URI de MongoDB Atlas.

### **2. Configuración del Backend**
1. Accede a la carpeta `backend`:
   ```bash
   cd backend
   ```
2. Instala las dependencias:
   ```bash
   npm install
   ```
3. Crea un archivo `.env` basado en `.env.example`:
   ```env
   PORT=5001
   MONGODB_URI=mongodb://127.0.0.1:27017/portalweb
   JWT_SECRET=super_secret_portal_web_token_key_2026
   OPENROUTER_API_KEY=tu_api_key_de_openrouter
   OPENROUTER_MODEL=google/gemma-4-26b-a4b-it:free
   ```
4. Cargar datos de prueba (Seed):
   ```bash
   npm run seed
   ```
5. Iniciar servidor backend en modo desarrollo:
   ```bash
   npm run dev
   ```

### **3. Configuración del Frontend**
1. Accede a la carpeta `frontend`:
   ```bash
   cd frontend
   ```
2. Instala las dependencias:
   ```bash
   npm install
   ```
3. Iniciar la aplicación frontend en modo desarrollo:
   ```bash
   npm run dev
   ```
4. Abre tu navegador en `http://localhost:5173`.

---

## 👥 Usuarios de Prueba Creados por el Seed

### **Rol Cliente**
* **Código de Cliente:** `CLI001` | **Contraseña:** `123456`
* **Código de Cliente:** `CLI002` | **Contraseña:** `123456`

### **Rol Administrador**
* **Usuario:** `admin` | **Contraseña:** `admin123`

---

## 📄 Documentación Adicional
* Consulte [IA_ASISTENTE_WEB.md](file:///Users/gerorevetria/Desktop/ORT/Semestre%205/Disen%CC%83o%20Interactivo/Obligatorio%202/IA_ASISTENTE_WEB.md) para conocer la arquitectura, prompts de sistema y endpoints del Asistente WEB de Abastecimiento.
* Consulte [PortalWEB_ESPECIFICACION.md](file:///Users/gerorevetria/Desktop/ORT/Semestre%205/Disen%CC%83o%20Interactivo/Obligatorio%202/PortalWEB_ESPECIFICACION.md) para la especificación funcional detallada.
