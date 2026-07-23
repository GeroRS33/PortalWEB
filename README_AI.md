# Guía de Trabajo - Portal WEB

Este documento sirve como guía oficial de desarrollo para el proyecto **Portal WEB** de **WEB LTDA**.

## Stack Tecnológico
* **Frontend:** React (Vite)
* **Estilos:** CSS tradicional (Vanilla CSS)
* **Backend:** Node.js + Express
* **Base de Datos:** MongoDB Atlas
* **Autenticación:** JWT + bcrypt
* **Comunicación:** Axios

---

## Fases de Desarrollo

### Fase 1: Fundación del Proyecto
* [ ] Configuración del repositorio y estructura básica.
* [ ] Modelos de datos en Mongoose.
* [ ] Proceso de Seed (Productos desde Excel, 3 clientes, 2 administradores, 1 novedad).
* [ ] Backend básico y JWT Auth.
* [ ] Frontend base: React Router, Contextos de Usuario, Carrito y Notificaciones.
* [ ] Autenticación de Cliente y Administrador.
* [ ] Páginas del Cliente (Home, Nuevo Pedido, Mis Pedidos, Mi Stock, Novedades).
* [ ] Panel básico de Administración (Listados de Pedidos, Clientes y Novedades).

### Fase 2: Lógica Avanzada y Reglas de Negocio
* [ ] Flujo de estados de pedidos (Generado → Confirmado → En preparación → Entregado, y Cancelado).
* [ ] Detalle de Pedido (Cliente y Admin con modificaciones/cancelaciones).
* [ ] Actualización automática de stock del cliente al entregar el pedido.
* [ ] Sistema básico de notificaciones flotantes en el cliente.
* [ ] Gestión de novedades (reemplazar archivo PNG/PDF).
* [ ] Validaciones completas en frontend y backend.

### Fase 3: Pulido y Optimización
* [ ] Diseño visual premium, sombras, bordes, animaciones sutiles.
* [ ] Estados de carga (Loading states) y alertas visuales (Toasts).
* [ ] Pruebas finales y preparación para despliegue.

---

## Estructura de Base de Datos

* **productos**: codigo, nombre, marca, precioSinIVA, stockCritico, imagen.
* **clientes**: codigoCliente, nombre, direccion, diaReparto, contrasegna.
* **administradores**: usuario, contrasegna.
* **pedidos**: clienteId, fechaCreacion, estado, observaciones.
* **detallePedidos**: pedidoId, productoId, cantidad, precioUnitario.
* **stockClientes**: clienteId, productoId, cantidad, ultimaActualizacion.
* **notificaciones**: clienteId, titulo, mensaje, fecha, leida.
* **novedades**: archivoUrl, fechaActualizacion.

---

## Instrucciones de Ejecución

### Backend
1. Instalar dependencias en `/backend`: `npm install`
2. Configurar el archivo `.env` con `PORT`, `MONGODB_URI` y `JWT_SECRET`.
3. Ejecutar el seed o iniciar el servidor: `npm run dev` o `node server.js`

### Frontend
1. Instalar dependencias en `/frontend`: `npm install`
2. Configurar la URL base de Axios para apuntar al backend.
3. Ejecutar la app de desarrollo: `npm run dev`
