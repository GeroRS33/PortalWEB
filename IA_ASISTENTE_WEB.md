# 🤖 Asistente WEB — Inteligencia Comercial de Abastecimiento

El **Asistente WEB** es un asistente inteligente de abastecimiento B2B integrado en **Portal WEB (WEB LTDA)**. A diferencia de un chatbot genérico, su propósito es asesorar activamente a los clientes sobre su estado de stock, tiempos límite para el próximo reparto y productos a reponer, así como responder consultas específicas de productos y pedidos en lenguaje natural.

---

## 🏛️ Arquitectura del Servicio

Toda la comunicación con la Inteligencia Artificial se realiza exclusivamente a través del **Backend Node.js**, protegiendo la clave de API y aplicando filtros deterministas antes de invocar los modelos de lenguaje.

```text
[ Frontend React ] 
       │ 
       ▼ (HTTP Requests con Bearer Token)
[ Backend Express ] 
       ├── assistantRoutes.js (/api/asistente)
       ├── assistantController.js
       ├── abastecimiento.js (Cálculo de riesgo + Clasificador de intenciones)
       └── openRouterService.js (Cliente OpenRouter + Prompt del Sistema)
             │
             ▼ (API Call con Fallback Automático)
      [ OpenRouter AI API ] -> google/gemma-4-26b-a4b-it:free / openrouter/free
```

---

## 🔑 Funcionalidades Principales

### 1. **Resumen de Abastecimiento Instantáneo**
* **Endpoint:** `GET /api/asistente/resumen`
* **Lógica:** Calcula de forma matemática (sin costo de IA) las horas restantes hasta el próximo día de reparto asignado al cliente, el nivel de riesgo (`BAJO`, `MEDIO`, `ALTO`), productos agotados y productos en stock crítico.

### 2. **Análisis Comercial e Inserción con 1 Clic**
* **Endpoint:** `POST /api/asistente/analizar`
* **Lógica:** Recopila el contexto completo (historial de pedidos recientes, productos en quiebre, promociones activas) y genera una recomendación estructurada en JSON.
* **Integración:** Permite al cliente agregar de forma masiva los productos recomendados a su carrito de compras con las cantidades sugeridas con un solo clic.

### 3. **Consultas en Lenguaje Natural (Q&A)**
* **Endpoint:** `POST /api/asistente/preguntar`
* **Lógica:** El backend analiza la pregunta del cliente para identificar la intención:
  * **Faltantes / Stock:** Filtra únicamente los datos de inventario del cliente.
  * **Pedidos:** Consulta los pedidos recientes del cliente.
  * **Detalle de Producto:** Realiza una búsqueda aproximada o por código en el catálogo MongoDB de `Producto`. Si el producto no existe en el catálogo, responde inmediatamente sin consumir llamadas de IA.
  * **Off-Topic / Consultas generales:** Rechaza automáticamente cualquier pregunta ajena a Portal WEB (deportes, clima, trivia, etc.).

---

## 🛡️ Reglas de Redacción y Seguridad del Prompt

1. **Sin Rellenos ni Saludos Repetitivos:** La IA va directo al grano (sin "¡Hola! Es un gusto...", ni despedidas tipo "Quedo a tu disposición...").
2. **Estricta Fidelidad a los Datos:** No inventa productos, códigos, precios, compatibilidades ni especificaciones técnicas inexistentes.
3. **No Modificación de Datos:** La IA es puramente analítica. No confirma ni cancela pedidos por sí misma.

---

## 🌐 Variables de Entorno Requeridas

En `backend/.env`:

```env
OPENROUTER_API_KEY=sk-or-v1-xxxxxxxx...
OPENROUTER_MODEL=google/gemma-4-26b-a4b-it:free
```

---

## 📱 Componente UI Frontend

* **Componente:** `frontend/src/components/AsistenteDrawer.jsx`
* **Ubicación:** Montado globalmente en `ClienteLayout.jsx`.
* **Interfaz:** Botón flotante animado en la esquina inferior derecha que despliega un panel lateral (*drawer*) adaptable a escritorio, tablet y móvil.
