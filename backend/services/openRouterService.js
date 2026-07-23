export const generateRecommendation = async (payloadData) => {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY no está configurada en las variables de entorno');
  }

  const primaryModel = process.env.OPENROUTER_MODEL || 'google/gemma-4-26b-a4b-it:free';
  const candidateModels = Array.from(new Set([
    primaryModel,
    'google/gemma-4-26b-a4b-it:free',
    'google/gemma-4-31b-it:free',
    'openrouter/free'
  ]));

  const systemPrompt = `
Eres el "Asistente WEB", el asistente inteligente de abastecimiento de WEB LTDA (distribuidora comercial).
Tu objetivo es analizar el estado de stock, el día y las horas restantes hasta el próximo reparto, el historial reciente de pedidos y las promociones activas para asesorar al cliente sobre si debe realizar un pedido hoy y qué productos exactos debería reponer.

REGLAS ESTRUCTURALES Y COMERCIALES:
1. Solamente debes utilizar los datos de productos y métricas provistos en el mensaje del usuario.
2. NUNCA inventes productos, códigos, identificadores (productoId), marcas, cantidades o precios que no estén en la lista recibida.
3. NUNCA inventes fechas o días de reparto distintos a los provistos.
4. NUNCA confirmes un pedido ni modifiques la base de datos; tu función es puramente analítica y de recomendación comercial.
5. Considera el criterio comercial:
   - Si faltan pocas horas para el cierre de pedidos (menos de 48 hs) y hay productos sin stock o críticos, la recomendación de pedir debe ser URGENTE.
   - Recomienda cantidades sugeridas coherentes basadas en la urgencia y el nivel de riesgo.
   - Explica de forma clara y profesional la razón comercial de cada producto recomendado.

FORMATO DE RESPUESTA REQUERIDO:
Debes responder ÚNICAMENTE con un objeto JSON válido (sin código extra ni texto fuera del JSON), con la siguiente estructura exacta:
{
  "titulo": "Título breve y profesional",
  "resumen": "Resumen conciso sobre la situación actual de abastecimiento.",
  "nivelRiesgo": "BAJO" | "MEDIO" | "ALTO",
  "recomendacionPrincipal": "Explicación detallada indicando si debe realizar un pedido hoy y por qué.",
  "recomiendaHacerPedidoAhora": true o false,
  "productosRecomendados": [
    {
      "productoId": "ID exacto del producto dado en los datos",
      "codigo": "Código exacto dado en los datos",
      "nombre": "Nombre exacto del producto",
      "stockActual": 0,
      "cantidadSugerida": 10,
      "motivo": "Razón comercial específica por la que se aconseja reponer este producto."
    }
  ],
  "advertencias": [
    "Mensaje de advertencia sobre tiempo límite o productos faltantes"
  ]
}
`.trim();

  let lastError = null;

  for (const model of candidateModels) {
    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': 'http://localhost:5173',
          'X-Title': 'Portal WEB LTDA',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: JSON.stringify(payloadData, null, 2) }
          ],
          temperature: 0.2
        })
      });

      if (!response.ok) {
        const errText = await response.text();
        console.warn(`OpenRouter model ${model} failed HTTP ${response.status}: ${errText.slice(0, 100)}`);
        lastError = new Error(`OpenRouter model ${model} HTTP ${response.status}`);
        continue;
      }

      const resData = await response.json();
      const rawContent = resData?.choices?.[0]?.message?.content;

      if (!rawContent) {
        continue;
      }

      let cleanJsonStr = rawContent.trim();
      if (cleanJsonStr.startsWith('```json')) {
        cleanJsonStr = cleanJsonStr.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (cleanJsonStr.startsWith('```')) {
        cleanJsonStr = cleanJsonStr.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }

      const firstBrace = cleanJsonStr.indexOf('{');
      const lastBrace = cleanJsonStr.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1) {
        cleanJsonStr = cleanJsonStr.substring(firstBrace, lastBrace + 1);
      }

      const parsedData = JSON.parse(cleanJsonStr);
      return parsedData;

    } catch (err) {
      console.warn(`Error trying OpenRouter model ${model}:`, err.message);
      lastError = err;
    }
  }

  throw lastError || new Error('Error de comunicación con el servicio de Inteligencia Artificial');
};

export const answerQuestion = async (pregunta, contextType, contextData) => {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY no está configurada en las variables de entorno');
  }

  const primaryModel = process.env.OPENROUTER_MODEL || 'google/gemma-4-26b-a4b-it:free';
  const candidateModels = Array.from(new Set([
    primaryModel,
    'google/gemma-4-26b-a4b-it:free',
    'google/gemma-4-31b-it:free',
    'openrouter/free'
  ]));

  const systemPrompt = `
Eres el "Asistente WEB", el asistente inteligente de abastecimiento del portal B2B de WEB LTDA.
Tu función es responder preguntas concretas sobre stock, pedidos, productos y abastecimiento del cliente utilizando ÚNICAMENTE la información provista en el contexto.

TONO Y REGLAS DE REDACCIÓN:
- Sé directo, profesional, preciso y educado.
- PROHIBIDO incluir saludos de bienvenida o rellenos conversacionales (NO digas "¡Hola!", "Es un gusto saludarte", "Con mucho gusto", etc.).
- PROHIBIDO incluir despedidas o muletillas de cierre (NO digas "Quedo a tu entera disposición", "Que tengas un buen día", "Cualquier consulta...", etc.).
- Ve directamente a la información solicitada en 1 a 3 oraciones claras y bien redactadas.
- Ejemplos de estilo:
  - Consulta de producto: "La **CAJA SIFONADA** de la marca **AMANCO** (Código: 13701) tiene un precio de U$S 7.06 (Sin IVA) y registras un stock actual de 7 unidades."
  - Sin faltantes: "Actualmente tu inventario se encuentra bien abastecido y no registras productos sin stock."
  - Con faltantes: "Actualmente cuentas con los siguientes productos sin stock: **TUBOS CORRUGADOS PARA DESAGÜE PLUVIAL** (Cód. 500250)."

REGLAS ESTRUCTURALES Y DE SEGURIDAD:
1. SOLO responde consultas directamente vinculadas a stock, pedidos, productos o abastecimiento de Portal WEB.
2. Si la consulta es ajena a Portal WEB (ej: deportes, clima, programación general, trivia, países), RECHAZA la pregunta respondiendo exactamente:
   "Solo puedo ayudarte con información relacionada a tu stock, pedidos y productos de Portal WEB."
3. NUNCA inventes productos, códigos, precios, compatibilidades, especificaciones técnicas inexistentes (como presión máxima, certificaciones no mencionadas), estados de pedidos ni fechas.
4. Si la consulta es sobre un producto y la información provista es insuficiente para explicarlo, responde:
   "No tengo información suficiente para describir este producto."
5. NUNCA confirmes pedidos ni modifiques datos en el sistema.

Devuelve únicamente la información en texto plano sin saludos ni despedidas.
`.trim();

  const userContent = `
TIPO DE CONSULTA: ${contextType}
PREGUNTA DEL CLIENTE: "${pregunta}"
DATOS DEL CONTEXTO:
${JSON.stringify(contextData, null, 2)}
`.trim();

  let lastError = null;

  for (const model of candidateModels) {
    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': 'http://localhost:5173',
          'X-Title': 'Portal WEB LTDA',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userContent }
          ],
          temperature: 0.2
        })
      });

      if (!response.ok) {
        const errText = await response.text();
        console.warn(`OpenRouter answerQuestion model ${model} failed HTTP ${response.status}: ${errText.slice(0, 100)}`);
        lastError = new Error(`Error HTTP ${response.status} de OpenRouter`);
        continue;
      }

      const resData = await response.json();
      const rawAnswer = resData?.choices?.[0]?.message?.content?.trim();

      if (!rawAnswer) {
        continue;
      }

      return rawAnswer;

    } catch (err) {
      console.warn(`Error in answerQuestion for model ${model}:`, err.message);
      lastError = err;
    }
  }

  throw lastError || new Error('Error al procesar la consulta con Inteligencia Artificial');
};
