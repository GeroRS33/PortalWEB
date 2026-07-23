# PORTAL WEB — ESPECIFICACION.md

# VISIÓN GENERAL

Portal WEB es una aplicación web desarrollada para WEB LTDA orientada a mejorar la gestión de pedidos entre la empresa y sus clientes.

El sistema está pensado para barracas, ferreterías y comercios que realizan pedidos frecuentes a WEB.

El objetivo principal es reemplazar el proceso manual de generación de pedidos por una plataforma moderna, rápida y sencilla.

El cliente debe poder:

- iniciar sesión
- consultar información relevante
- crear pedidos
- repetir pedidos anteriores
- consultar el estado de sus pedidos
- administrar su stock interno
- visualizar novedades

El administrador debe poder:

- administrar pedidos
- administrar clientes
- actualizar novedades

El sistema NO procesa pagos.

Los pedidos continúan siendo procesados por WEB utilizando sus procedimientos habituales.

El proyecto representa un MVP funcional.

La prioridad es construir una base sólida, escalable y fácilmente mantenible.

---

# STACK TECNOLÓGICO

Utilizar obligatoriamente:

- React + Vite
- CSS tradicional
- Node.js
- Express
- MongoDB Atlas
- JWT para autenticación
- Axios para comunicación API

Frontend preparado para deploy en Vercel.

Backend preparado para deploy independiente.

MongoDB ya se encuentra disponible.

La conexión debe realizarse mediante:

MONGODB_URI

utilizando variables de entorno.

Nunca hardcodear credenciales.

---

# REPOSITORIO

Repositorio oficial del proyecto:

https://github.com/GeroRS33/PortalWEB

Todo el desarrollo debe realizarse utilizando este repositorio.

Mantener una estructura clara de commits.

---

# OBJETIVO DEL MVP

El sistema debe permitir demostrar un flujo completo de trabajo.

Cliente:

Login

↓

Crear pedido

↓

Administrador recibe pedido

↓

Administrador cambia estado

↓

Cliente consulta evolución del pedido

↓

Pedido entregado

↓

Actualización automática del stock del cliente

No agregar funcionalidades fuera de este alcance.

---

# REGLAS GENERALES

Priorizar:

- simplicidad
- claridad
- mantenibilidad
- escalabilidad

No agregar módulos innecesarios.

No implementar funcionalidades que no hayan sido especificadas.

Si existe alguna duda entre dos posibles soluciones, elegir siempre la más simple.

---

# RECURSOS ENTREGADOS

El proyecto ya dispone de todos los recursos necesarios.

Existe una carpeta llamada:

Imagenes/

Dentro de ella existen:

ImagenesCatalogo/

Elementos Graficos/

CatalogoJulio.pdf

Novedad.png

---

# ELEMENTOS GRÁFICOS

Dentro de:

Imagenes/Elementos Graficos/

existen:

Logo_PortalWEB.svg

icono_AsistenteWEB.svg

Utilizar estos recursos.

No recrearlos.

---

# CATÁLOGO

Existe un PDF llamado:

CatalogoJulio.pdf

Este archivo representa el catálogo oficial.

NO desarrollar un catálogo web.

Dentro de Nuevo Pedido únicamente debe existir un botón:

Abrir catálogo PDF

que abra este documento.

---

# NOVEDADES

Existe un archivo:

Novedad.png

Debe mostrarse tanto al cliente como al administrador.

El administrador podrá reemplazar dicho archivo.

No implementar un gestor de noticias.

Siempre existirá una única novedad activa.

---

# PRODUCTOS

Los productos se importan desde:

ListaProductos.xlsx

Cada producto contiene:

- código
- nombre
- marca
- precio sin IVA
- stock crítico
- imagen

La columna IMAGEN coincide exactamente con el nombre del archivo ubicado dentro de:

ImagenesCatalogo/

No modificar dichos nombres.

No utilizar categorías.

No utilizar descripción.

No utilizar stock WEB.

El precio siempre será sin IVA.

---

# IMPORTACIÓN DEL EXCEL

Al iniciar el proyecto por primera vez debe existir un proceso Seed.

El Seed debe:

leer ListaProductos.xlsx

↓

crear todos los productos

↓

guardar los datos en MongoDB

Si la colección ya contiene productos:

no volver a importarlos.

---

# BASE DE DATOS

Crear las siguientes colecciones:

productos

clientes

administradores

pedidos

detallePedidos

stockClientes

notificaciones

novedades

Mantener nombres claros.

Separar correctamente las entidades.

Evitar información duplicada.

---

# MODELO PRODUCTO

Cada producto contiene:

- id
- codigo
- nombre
- marca
- precioSinIVA
- stockCritico
- imagen

El código debe ser único.

---

# MODELO CLIENTE

Cada cliente contiene:

- id
- codigoCliente
- nombre
- direccion
- diaReparto
- contraseña

La contraseña debe almacenarse encriptada.

---

# MODELO ADMINISTRADOR

Cada administrador contiene:

- id
- usuario
- contraseña

La contraseña debe almacenarse encriptada.

---

# MODELO PEDIDO

Cada pedido contiene:

- id
- clienteId
- fechaCreacion
- estado
- observaciones

Las observaciones tienen un máximo de 500 caracteres.

---

# DETALLE PEDIDO

Cada producto del pedido se almacena por separado.

Cada registro contiene:

- pedidoId
- productoId
- cantidad
- precioUnitario

No guardar productos embebidos dentro del pedido.

---

# STOCK CLIENTE

Cada registro contiene:

- clienteId
- productoId
- cantidad
- ultimaActualizacion

Un cliente únicamente posee stock de productos que alguna vez compró.

Los productos con stock cero deben continuar apareciendo.

---

# NOTIFICACIONES

Cada notificación contiene:

- clienteId
- titulo
- mensaje
- fecha
- leida

Las notificaciones se muestran mediante pequeños avisos.

No implementar un centro complejo de notificaciones.

---

# ROLES

Existen únicamente dos roles.

Cliente

Administrador

No existen permisos adicionales.

---

# LOGIN

Existe una única pantalla de login.

Debe incluir un selector de rol.

Opciones:

Cliente

Administrador

Cliente inicia sesión mediante:

Código de cliente

Contraseña

Administrador inicia sesión mediante:

Usuario

Contraseña

Utilizar JWT.

Mantener persistencia de sesión.

Implementar logout.

---

# CLIENTE

El cliente dispone de las siguientes pantallas.

Home

Nuevo Pedido

Mis Pedidos

Detalle Pedido

Mi Stock

Novedades

No existen más módulos.

---

# HOME

Tomar como referencia:

cliente-home.png

La pantalla debe mostrar información resumida.

Mostrar:

últimos pedidos

estado del último pedido

accesos rápidos

botón Nuevo Pedido

No convertir esta pantalla en un dashboard.

Debe ser limpia y sencilla.

---

# NUEVO PEDIDO

Tomar como referencia:

cliente-nuevo-pedido.png

Debe contener:

buscador

listado de productos

carrito

observaciones

botón confirmar pedido

botón abrir catálogo PDF

Buscar únicamente por:

código

nombre

marca

No implementar filtros avanzados.

La búsqueda debe actualizarse en tiempo real.

El carrito debe mantenerse aunque el usuario cierre sesión.

---

# CARRITO

Debe permitir:

agregar productos

eliminar productos

modificar cantidades

visualizar subtotal sin IVA

Las cantidades nunca pueden ser negativas.

Eliminar automáticamente productos con cantidad cero.

---

# OBSERVACIONES

El pedido permite escribir observaciones.

Máximo:

500 caracteres.

No permitir superar dicho límite.

---

# CONFIRMAR PEDIDO

Al confirmar:

crear Pedido

↓

crear DetallePedido

↓

crear notificación

↓

vaciar carrito

El pedido inicia siempre con estado:

Generado

---

# MIS PEDIDOS

Tomar como referencia:

cliente-mis-pedidos.png

Mostrar historial completo.

Ordenar por fecha descendente.

Cada tarjeta debe mostrar:

fecha

estado

cantidad de productos

botón Ver detalle

---

# DETALLE PEDIDO

Tomar como referencia:

cliente-detalle-pedido.png

Mostrar:

productos

cantidades

precio unitario

observaciones

estado

fecha

Si el estado es:

Generado

o

Confirmado

permitir cancelar.

Solicitar confirmación antes de cancelar.

Una vez cancelado:

cambiar estado a Cancelado.

No eliminar registros.

---

# MI STOCK

Tomar como referencia:

cliente-mi-stock.png

Mostrar únicamente productos comprados.

Columnas:

imagen

código

nombre

marca

cantidad

estado

El usuario puede modificar manualmente las cantidades.

Registrar la fecha de actualización.

El estado debe calcularse utilizando el stock crítico.

Estados posibles:

Normal

Bajo

Sin Stock

Ordenar por código.

---

# ACTUALIZACIÓN AUTOMÁTICA DEL STOCK

Cuando un pedido cambia a:

Entregado

el sistema debe sumar automáticamente las cantidades recibidas al stock del cliente.

No realizar esta actualización en ningún otro estado.


---

# ADMINISTRACIÓN

El panel de administración está destinado únicamente al equipo interno de WEB.

No debe contener funcionalidades orientadas al cliente.

Debe ser simple, rápido y eficiente.

Las únicas secciones disponibles son:

- Pedidos
- Clientes
- Novedades

NO implementar Dashboard.

NO implementar módulo Productos.

NO implementar estadísticas avanzadas.

---

# PEDIDOS

Tomar como referencia:

admin-pedidos.png

Esta pantalla representa el centro operativo del sistema.

Mostrar todos los pedidos ordenados por fecha descendente.

Cada fila debe mostrar:

- número de pedido
- cliente
- fecha
- estado
- cantidad de productos

Agregar buscador por:

- cliente
- código de cliente
- número de pedido

No implementar filtros complejos.

---

# DETALLE DEL PEDIDO

Tomar como referencia:

admin-pedidos-detalle.png

Mostrar:

- datos del cliente
- listado de productos
- cantidades
- precios
- observaciones
- historial de estados

El administrador puede:

- cambiar estado
- quitar productos
- reducir cantidades

No puede:

- agregar productos
- aumentar cantidades

Toda modificación debe solicitar un motivo.

Registrar dicho motivo junto al pedido.

---

# ESTADOS DEL PEDIDO

Los estados válidos son:

Generado

↓

Confirmado

↓

En preparación

↓

Entregado

También existe:

Cancelado

No permitir estados personalizados.

No permitir volver hacia atrás desde Entregado.

Un pedido Cancelado no puede volver a activarse.

---

# CAMBIO DE ESTADO

Cada cambio de estado debe:

actualizar Pedido

↓

crear notificación

↓

actualizar fecha correspondiente

Si el nuevo estado es:

Entregado

↓

actualizar StockCliente

Este proceso debe realizarse automáticamente.

---

# CANCELACIÓN

Los pedidos solamente pueden cancelarse cuando se encuentran en:

Generado

Confirmado

El cliente puede cancelarlos.

El administrador también puede hacerlo.

Una vez cancelados:

no modificar stock

no eliminar registros

mantener historial completo.

---

# CLIENTES

Tomar como referencia:

admin-clientes.png

Mostrar listado completo.

Cada fila contiene:

- código
- nombre
- dirección
- día de reparto

Agregar buscador.

No utilizar paginación compleja.

---

# CREAR CLIENTE

Realizar mediante Modal.

Campos:

Código

Nombre

Dirección

Día de reparto

Contraseña

Validar:

Código único.

Todos los campos obligatorios.

Cerrar modal al guardar correctamente.

---

# EDITAR CLIENTE

Permitir modificar:

Nombre

Dirección

Día de reparto

Contraseña

No modificar:

Código de cliente.

---

# ELIMINAR CLIENTES

No implementar eliminación.

Los clientes permanecen siempre en el sistema.

---

# DETALLE CLIENTE

Tomar como referencia:

admin-clientes-detalle.png

Mostrar:

datos personales

últimos pedidos

estado actual

stock registrado

No implementar edición desde esta pantalla.

Debe ser principalmente informativa.

---

# NOVEDADES

Pantalla extremadamente sencilla.

Mostrar la imagen o PDF actual.

Agregar un único botón:

Actualizar archivo

El administrador podrá subir:

PNG

PDF

Al subir un nuevo archivo:

reemplazar el anterior.

Siempre existirá una única novedad activa.

---

# NOTIFICACIONES

Las notificaciones aparecen para el cliente.

Ubicación:

esquina inferior derecha.

Cada notificación contiene:

Título

Mensaje

Tiempo relativo

Ejemplos:

Hace 2 minutos

Hace 1 hora

Hace 3 días

No implementar un sistema complejo de bandeja.

---

# IMPORTACIÓN DE PRODUCTOS

Todos los productos provienen del archivo:

ListaProductos.xlsx

Nunca crear productos manualmente desde la interfaz.

El administrador no puede crear productos.

El administrador no puede eliminar productos.

Toda la información proviene del Excel.

---

# IMÁGENES

Cada producto obtiene su imagen utilizando:

Imagenes/ImagenesCatalogo/

La columna:

IMAGEN

del Excel coincide exactamente con el nombre del archivo.

Si una imagen no existe:

mostrar placeholder.

Nunca romper el diseño.

---

# REFERENCIAS VISUALES

Existe una carpeta:

Referencias Finales

Contiene todas las pantallas del proyecto.

Estas referencias representan:

- estructura
- jerarquía
- espaciados
- navegación
- distribución

Seguirlas lo más fielmente posible.

No reinterpretarlas.

No agregar componentes innecesarios.

---

# ESTILO VISUAL

Mantener una interfaz:

profesional

limpia

moderna

orientada a empresas

Utilizar:

Inter

Color principal:

#2E3192

Color secundario:

#FFFFFF

Utilizar bordes suaves.

Sombras discretas.

Espaciados consistentes.

Animaciones sutiles.

---

# UX

Priorizar:

rapidez

claridad

mínima cantidad de clics

feedback inmediato

Utilizar:

loading states

toasts

confirmaciones

mensajes claros

No sobrecargar pantallas.

---

# VALIDACIONES

Validar siempre:

campos obligatorios

cantidades positivas

máximo de caracteres

productos existentes

cliente existente

No confiar únicamente en el frontend.

Validar también en backend.

---

# SEGURIDAD

Utilizar JWT.

Proteger rutas privadas.

Nunca exponer contraseñas.

Encriptar contraseñas utilizando bcrypt.

No almacenar información sensible en el frontend.

---

# ARQUITECTURA

Mantener separación clara entre:

Frontend

Backend

Base de datos

Utilizar componentes reutilizables.

Evitar duplicación de código.

Centralizar llamadas API.

Mantener estructura escalable.

---

# ESTRUCTURA GENERAL

Frontend:

- pages
- components
- layouts
- hooks
- context
- services
- assets

Backend:

- controllers
- routes
- middleware
- models
- services
- config
- seed

Mantener nombres claros.

---

# CONTEXT

Utilizar Context para:

Usuario

Carrito

Notificaciones

Evitar prop drilling.

Centralizar la lógica compartida.

---

# API

Organizar endpoints por recurso.

Ejemplos:

/auth

/clientes

/pedidos

/productos

/stock

/novedades

Mantener REST.

No mezclar responsabilidades.

---

# SEED

Crear automáticamente:

28 productos

3 clientes

2 administradores

1 novedad

No crear pedidos.

No crear stock.

No crear notificaciones.

Todo debe quedar listo para comenzar a utilizar la aplicación inmediatamente.

---

# ASISTENTE WEB

No implementar funcionalidad.

Únicamente permitir dejar preparada la estructura visual si fuera necesario.

La lógica del asistente se desarrollará en futuras versiones.

---

# FASES DE DESARROLLO

IMPORTANTE

No construir todo simultáneamente.

Desarrollar por etapas.

---

# FASE 1

Priorizar:

estructura

MongoDB

Seed

Autenticación

Login

Cliente

Nuevo Pedido

Mis Pedidos

Mi Stock

Panel básico Administración

---

# FASE 2

Implementar:

Estados de pedidos

Detalle Pedido

Notificaciones

Novedades

Validaciones

Persistencia completa

---

# FASE 3

Implementar:

Mejoras visuales

Animaciones

Loading

Optimización

Refactorización

Preparación para producción

---

# OBJETIVO FINAL

Al finalizar el proyecto debe ser posible:

Ingresar como Cliente.

Crear un pedido.

Consultar pedidos.

Cancelar pedidos permitidos.

Administrar stock.

Consultar novedades.

Ingresar como Administrador.

Gestionar clientes.

Gestionar pedidos.

Actualizar novedades.

Cambiar estados.

Entregar pedidos.

Actualizar automáticamente el stock del cliente.

El sistema debe sentirse como una plataforma real utilizada diariamente por WEB LTDA.

La prioridad absoluta es construir un proyecto claro, mantenible, escalable y consistente.

Ante cualquier decisión no especificada en este documento, elegir siempre la alternativa más simple, profesional y coherente con el resto del sistema.

No agregar funcionalidades que no hayan sido solicitadas explícitamente.