import Novedad from '../models/Novedad.js';

// @desc    Get the active novelty
// @route   GET /api/novedades
// @access  Private (Authenticated users)
export const getNovedad = async (req, res) => {
  try {
    const novedad = await Novedad.findOne().sort({ fechaActualizacion: -1 });
    if (!novedad) {
      return res.status(404).json({ message: 'No hay novedades registradas' });
    }
    res.json(novedad);
  } catch (error) {
    console.error('Error fetching novelty:', error);
    res.status(500).json({ message: 'Error del servidor al obtener la novedad' });
  }
};

// @desc    Update/replace active novelty URL
// @route   POST /api/novedades
// @access  Private (Admin only)
export const updateNovedad = async (req, res) => {
  const { archivoUrl } = req.body;

  try {
    if (!archivoUrl) {
      return res.status(400).json({ message: 'La URL del archivo es requerida' });
    }

    // Replace the previous one by deleting existing ones or updating the single one
    await Novedad.deleteMany({});
    
    const newNovedad = new Novedad({
      archivoUrl: archivoUrl.trim(),
      fechaActualizacion: new Date()
    });

    await newNovedad.save();
    res.json(newNovedad);
  } catch (error) {
    console.error('Error updating novelty:', error);
    res.status(500).json({ message: 'Error del servidor al actualizar la novedad' });
  }
};
