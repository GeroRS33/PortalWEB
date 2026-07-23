import { getSupplyMetrics, getFullAIPayload, classifyIntentAndGetContext } from '../utils/abastecimiento.js';
import { generateRecommendation, answerQuestion } from '../services/openRouterService.js';

// @desc    Get instant supply summary metrics for initial drawer view
// @route   GET /api/asistente/resumen
// @access  Private (Cliente only)
export const getResumenAbastecimiento = async (req, res) => {
  try {
    const metrics = await getSupplyMetrics(req.user._id);

    res.json({
      nivelRiesgo: metrics.nivelRiesgo,
      proximoReparto: {
        dia: metrics.deliveryInfo.diaNombre,
        fecha: metrics.deliveryInfo.fechaFormatted,
        horasRestantes: metrics.deliveryInfo.horasRestantes
      },
      productosSinStockCount: metrics.sinStockCount,
      productosCriticosCount: metrics.criticoCount,
      totalProductosStock: metrics.totalProductosStock
    });
  } catch (error) {
    console.error('Error fetching supply summary metrics:', error);
    res.status(500).json({ message: 'Error al obtener el resumen de abastecimiento' });
  }
};

// @desc    Generate AI recommendation via OpenRouter (Gemini Flash)
// @route   POST /api/asistente/analizar
// @access  Private (Cliente only)
export const analizarConIA = async (req, res) => {
  try {
    const fullPayload = await getFullAIPayload(req.user._id);
    const recommendation = await generateRecommendation(fullPayload);

    res.json({
      success: true,
      data: recommendation
    });
  } catch (error) {
    console.error('Error generating AI recommendation:', error);
    res.status(500).json({ 
      message: error.message || 'Error al procesar el análisis con Inteligencia Artificial' 
    });
  }
};

// @desc    Answer specific client question via AI with scoped context
// @route   POST /api/asistente/preguntar
// @access  Private (Cliente only)
export const preguntarAlAsistente = async (req, res) => {
  const { pregunta } = req.body;

  try {
    if (!pregunta || pregunta.trim() === '') {
      return res.status(400).json({ message: 'Debe ingresar una pregunta' });
    }

    const classification = await classifyIntentAndGetContext(req.user._id, pregunta.trim());

    if (classification.isOffTopic || classification.isNotFound) {
      return res.json({
        success: true,
        respuesta: classification.message
      });
    }

    const respuesta = await answerQuestion(
      pregunta.trim(),
      classification.type,
      classification.contextData
    );

    res.json({
      success: true,
      respuesta
    });

  } catch (error) {
    console.error('Error answering assistant question:', error);
    res.status(500).json({
      message: error.message || 'Error al procesar la consulta con el Asistente WEB'
    });
  }
};
