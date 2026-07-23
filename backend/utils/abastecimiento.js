import Cliente from '../models/Cliente.js';
import StockCliente from '../models/StockCliente.js';
import Pedido from '../models/Pedido.js';
import DetallePedido from '../models/DetallePedido.js';
import Producto from '../models/Producto.js';
import Novedad from '../models/Novedad.js';

export const calculateDeliveryInfo = (diaNombre) => {
  if (!diaNombre) {
    return {
      diaNombre: 'No asignado',
      fechaFormatted: 'Por confirmar',
      diasRestantes: 7,
      horasRestantes: 168
    };
  }

  const mapDias = {
    'domingo': 0, 'lunes': 1, 'martes': 2, 'miercoles': 3, 'miércoles': 3,
    'jueves': 4, 'viernes': 5, 'sabado': 6, 'sábado': 6
  };

  const targetDay = mapDias[diaNombre.toLowerCase()] ?? 5;
  const now = new Date();
  const currentDay = now.getDay();

  let daysUntil = targetDay - currentDay;
  if (daysUntil <= 0) {
    daysUntil += 7;
  }

  const nextDeliveryDate = new Date(now);
  nextDeliveryDate.setDate(now.getDate() + daysUntil);
  nextDeliveryDate.setHours(9, 0, 0, 0);

  const diffMs = nextDeliveryDate.getTime() - now.getTime();
  const hoursUntil = Math.max(1, Math.round(diffMs / (1000 * 60 * 60)));

  const dayCapitalized = diaNombre.charAt(0).toUpperCase() + diaNombre.slice(1);
  const dateFormatted = `${dayCapitalized} ${nextDeliveryDate.getDate().toString().padStart(2, '0')}/${(nextDeliveryDate.getMonth() + 1).toString().padStart(2, '0')}`;

  return {
    diaNombre: dayCapitalized,
    fechaFormatted: dateFormatted,
    diasRestantes: daysUntil,
    horasRestantes: hoursUntil
  };
};

export const getSupplyMetrics = async (clienteId) => {
  const cliente = await Cliente.findById(clienteId);
  if (!cliente) {
    throw new Error('Cliente no encontrado');
  }

  const deliveryInfo = calculateDeliveryInfo(cliente.diaReparto);

  const stockRecords = await StockCliente.find({ clienteId })
    .populate('productoId', 'codigo nombre marca precioSinIVA imagen');

  const validStock = stockRecords.filter(s => s.productoId != null);

  const sinStock = validStock.filter(s => s.cantidad === 0);
  const critico = validStock.filter(s => s.cantidad > 0 && s.cantidad <= 5);
  const normal = validStock.filter(s => s.cantidad > 5);

  let nivelRiesgo = 'BAJO';
  if (sinStock.length > 0 || critico.length >= 3 || (deliveryInfo.horasRestantes <= 48 && critico.length > 0)) {
    nivelRiesgo = 'ALTO';
  } else if (critico.length > 0) {
    nivelRiesgo = 'MEDIO';
  }

  return {
    clienteInfo: {
      nombre: cliente.nombre,
      codigoCliente: cliente.codigoCliente,
      direccion: cliente.direccion,
      diaReparto: cliente.diaReparto
    },
    deliveryInfo,
    nivelRiesgo,
    totalProductosStock: validStock.length,
    sinStockCount: sinStock.length,
    criticoCount: critico.length,
    normalCount: normal.length,
    sinStockItems: sinStock.map(s => ({
      productoId: s.productoId._id,
      codigo: s.productoId.codigo,
      nombre: s.productoId.nombre,
      marca: s.productoId.marca,
      cantidad: s.cantidad,
      precioSinIVA: s.productoId.precioSinIVA
    })),
    criticoItems: critico.map(s => ({
      productoId: s.productoId._id,
      codigo: s.productoId.codigo,
      nombre: s.productoId.nombre,
      marca: s.productoId.marca,
      cantidad: s.cantidad,
      precioSinIVA: s.productoId.precioSinIVA
    })),
    normalItems: normal.map(s => ({
      productoId: s.productoId._id,
      codigo: s.productoId.codigo,
      nombre: s.productoId.nombre,
      marca: s.productoId.marca,
      cantidad: s.cantidad,
      precioSinIVA: s.productoId.precioSinIVA
    }))
  };
};

export const getFullAIPayload = async (clienteId) => {
  const metrics = await getSupplyMetrics(clienteId);

  const recentOrders = await Pedido.find({ clienteId })
    .sort({ createdAt: -1 })
    .limit(3);

  const orderHistory = [];
  for (const order of recentOrders) {
    const details = await DetallePedido.find({ pedidoId: order._id })
      .populate('productoId', 'codigo nombre marca');
    
    orderHistory.push({
      pedidoId: order._id.toString().slice(-6).toUpperCase(),
      fecha: order.createdAt,
      estado: order.estado,
      productos: details.map(d => ({
        codigo: d.productoId?.codigo || 'N/A',
        nombre: d.productoId?.nombre || 'Producto',
        cantidad: d.cantidad,
        precioUnitario: d.precioUnitario
      }))
    });
  }

  const activeNews = await Novedad.find({ activa: true })
    .sort({ createdAt: -1 })
    .limit(3)
    .select('titulo descripcion productoDestacado');

  return {
    cliente: metrics.clienteInfo,
    proximoReparto: metrics.deliveryInfo,
    nivelRiesgoCalculado: metrics.nivelRiesgo,
    resumenStock: {
      totalItems: metrics.totalProductosStock,
      sinStockCount: metrics.sinStockCount,
      criticoCount: metrics.criticoCount,
      normalCount: metrics.normalCount
    },
    productosSinStock: metrics.sinStockItems,
    productosStockCritico: metrics.criticoItems,
    productosNormales: metrics.normalItems,
    historialRecientePedidos: orderHistory,
    promocionesNovedadesActivas: activeNews.map(n => ({
      titulo: n.titulo,
      descripcion: n.descripcion
    }))
  };
};

export const classifyIntentAndGetContext = async (clienteId, pregunta) => {
  const queryLower = (pregunta || '').toLowerCase().trim();

  // 1. Off-topic check
  const offTopicKeywords = [
    'mundial', 'clima', 'tiempo', 'futbol', 'fútbol', 'quien gano', 'quién ganó',
    'react', 'francia', 'capital', 'presidente', 'musica', 'música', 'pelicula', 'película',
    'chiste', 'dolar', 'dólar', 'receta', 'cocina', 'cancion', 'canción'
  ];

  for (const kw of offTopicKeywords) {
    if (queryLower.includes(kw)) {
      return {
        isOffTopic: true,
        message: 'Solo puedo ayudarte con información relacionada a tu stock, pedidos y productos de Portal WEB.'
      };
    }
  }

  // 2. Check if product query (by code or search terms)
  const productCodeMatch = queryLower.match(/\b\d{3,8}\b/);
  let productsFound = [];

  if (productCodeMatch) {
    const code = productCodeMatch[0];
    const prod = await Producto.findOne({ 
      $or: [{ codigo: code }, { codigo: { $regex: code, $options: 'i' } }] 
    });
    if (prod) productsFound.push(prod);
  }

  if (productsFound.length === 0) {
    // Strip common conversational filler words to isolate product terms
    const cleanSearchStr = queryLower
      .replace(/\b(contame|cuéntame|cuentame|hablame|háblame|decime|dime|explicame|explícame|información|informacion|detalle|detalles|descripción|descripcion|qué|que|es|para|sirve|el|la|los|las|un|una|unos|unas|poco|de|del|sobre|saber|ver|código|codigo|producto|artículo|articulo|marca)\b/gi, ' ')
      .replace(/[^\w\sáéíóúñ]/gi, ' ')
      .trim();

    if (cleanSearchStr.length >= 2) {
      const words = cleanSearchStr.split(/\s+/).filter(w => w.length >= 2);
      if (words.length > 0) {
        const regexConditions = words.map(w => ({
          $or: [
            { nombre: { $regex: w, $options: 'i' } },
            { marca: { $regex: w, $options: 'i' } },
            { codigo: { $regex: w, $options: 'i' } }
          ]
        }));
        
        productsFound = await Producto.find({ $and: regexConditions }).limit(5);
        if (productsFound.length === 0 && words.length > 1) {
          productsFound = await Producto.find({ $or: regexConditions }).limit(5);
        }
      }
    }
  }

  const isExplicitProductQuery = queryLower.includes('qué es') || queryLower.includes('que es') ||
    queryLower.includes('para qué sirve') || queryLower.includes('para que sirve') ||
    queryLower.includes('contame') || queryLower.includes('cuentame') || queryLower.includes('cuéntame') ||
    queryLower.includes('hablame') || queryLower.includes('háblame') || queryLower.includes('detalle') ||
    queryLower.includes('descripción') || queryLower.includes('descripcion') ||
    queryLower.includes('similares') || queryLower.includes('junto con este') ||
    productCodeMatch !== null;

  if (productsFound.length > 0) {
    const stockRecords = await StockCliente.find({
      clienteId,
      productoId: { $in: productsFound.map(p => p._id) }
    });

    return {
      type: 'PRODUCTO',
      contextData: productsFound.map(p => {
        const stockRec = stockRecords.find(s => s.productoId.toString() === p._id.toString());
        return {
          codigo: p.codigo,
          nombre: p.nombre,
          marca: p.marca,
          precioSinIVA: p.precioSinIVA,
          stockClienteRegistrado: stockRec ? stockRec.cantidad : 0
        };
      })
    };
  }

  if (isExplicitProductQuery && productsFound.length === 0) {
    return {
      isNotFound: true,
      message: 'No encontré ese producto dentro del catálogo.'
    };
  }

  // 3. Stock query check
  const isStockQuestion = queryLower.includes('stock') || queryLower.includes('reponer') ||
    queryLower.includes('critico') || queryLower.includes('crítico') ||
    queryLower.includes('mínimo') || queryLower.includes('minimo') ||
    queryLower.includes('faltan') || queryLower.includes('reparto') ||
    queryLower.includes('pedido hoy');

  if (isStockQuestion) {
    const metrics = await getSupplyMetrics(clienteId);
    return {
      type: 'STOCK',
      contextData: {
        proximoReparto: metrics.deliveryInfo,
        nivelRiesgo: metrics.nivelRiesgo,
        sinStock: metrics.sinStockItems,
        stockCritico: metrics.criticoItems,
        totalProductosStock: metrics.totalProductosStock
      }
    };
  }

  // 4. Order query check
  const isOrderQuestion = queryLower.includes('pedido') || queryLower.includes('último') ||
    queryLower.includes('ultimo') || queryLower.includes('compré') ||
    queryLower.includes('compre') || queryLower.includes('compro') ||
    queryLower.includes('frecuencia') || queryLower.includes('frecuente') ||
    queryLower.includes('pendiente') || queryLower.includes('estado');

  if (isOrderQuestion) {
    const recentOrders = await Pedido.find({ clienteId })
      .sort({ createdAt: -1 })
      .limit(5);

    const orderList = [];
    for (const order of recentOrders) {
      const details = await DetallePedido.find({ pedidoId: order._id })
        .populate('productoId', 'codigo nombre marca');
      orderList.push({
        pedidoId: order._id.toString().slice(-6).toUpperCase(),
        fecha: order.createdAt,
        estado: order.estado,
        productos: details.map(d => ({
          codigo: d.productoId?.codigo || 'N/A',
          nombre: d.productoId?.nombre || 'Producto',
          cantidad: d.cantidad,
          precioUnitario: d.precioUnitario
        }))
      });
    }

    return {
      type: 'PEDIDOS',
      contextData: orderList
    };
  }

  // 5. Default General Context
  const generalMetrics = await getSupplyMetrics(clienteId);
  return {
    type: 'GENERAL',
    contextData: {
      proximoReparto: generalMetrics.deliveryInfo,
      nivelRiesgo: generalMetrics.nivelRiesgo,
      totalProductosStock: generalMetrics.totalProductosStock,
      sinStockCount: generalMetrics.sinStockCount,
      criticoCount: generalMetrics.criticoCount
    }
  };
};
