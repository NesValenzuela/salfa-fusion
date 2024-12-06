import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Crear una nueva pregunta
export const crearPregunta = async (req, res) => {
  const { texto_pregunta, tipo_respuesta, encuestaId, opciones } = req.body;

  if (!texto_pregunta || !tipo_respuesta || !encuestaId) {
    return res.status(400).json({ error: 'Faltan datos requeridos' });
  }

  try {
    const data = {
      texto_pregunta,
      tipo_respuesta,
      encuesta: { connect: { id_encuesta: parseInt(encuestaId) } },
    };

    if (opciones && opciones.length > 0 && tipo_respuesta === 'multiple') {
      data.opciones = {
        create: opciones.map(opcion => ({ texto_opcion: opcion }))
      };
    }

    const nuevaPregunta = await prisma.pregunta.create({ data });
    res.status(201).json(nuevaPregunta);
  } catch (error) {
    console.error('Error al crear la pregunta:', error);
    res.status(500).json({ error: 'Error al crear la pregunta', details: error.message });
  }
};

export const obtenerPreguntasPorEncuesta = async (req, res) => {
  const { encuestaId } = req.params;

  try {
    const preguntas = await prisma.pregunta.findMany({
      where: { encuestaId: parseInt(encuestaId) },
      include: { opciones: true }
    });
    res.status(200).json(preguntas);
  } catch (error) {
    console.error('Error al obtener las preguntas:', error);
    res.status(500).json({ error: 'Error al obtener las preguntas', details: error.message });
  }
};

export const eliminarPregunta = async (req, res) => {
    const { id } = req.params;
  
    try {
      // Eliminar todas las respuestas asociadas a esta pregunta
      await prisma.respuesta.deleteMany({
        where: { preguntaId_pregunta: parseInt(id) }
      });
  
      // Eliminar todas las opciones de respuesta asociadas a esta pregunta
      await prisma.opcionRespuesta.deleteMany({
        where: { preguntaId: parseInt(id) }
      });
  
      // Finalmente, eliminar la pregunta
      await prisma.pregunta.delete({
        where: { id_pregunta: parseInt(id) }
      });
  
      res.status(204).json({ message: 'Pregunta eliminada correctamente' });
    } catch (error) {
      console.error('Error al eliminar la pregunta:', error);
      res.status(500).json({ error: 'Error al eliminar la pregunta', details: error.message });
    }
  };
  // Actualizar una pregunta
  export const actualizarPregunta = async (req, res) => {
    const { id } = req.params;
    const { texto_pregunta, tipo_respuesta, opciones } = req.body;
  
    try {
      // Primero, actualizamos el texto y el tipo de respuesta
      const preguntaActualizada = await prisma.pregunta.update({
        where: { id_pregunta: parseInt(id) },
        data: { texto_pregunta, tipo_respuesta }
      });
      if (tipo_respuesta === 'multiple' && opciones && opciones.length > 0) {
        await prisma.opcionRespuesta.deleteMany({
          where: { preguntaId: parseInt(id) }
        });
  
        // Crear nuevas opciones
        await prisma.opcionRespuesta.createMany({
          data: opciones.map(opcion => ({
            texto_opcion: opcion,
            preguntaId: parseInt(id)
          }))
        });
      }
  
      res.status(200).json(preguntaActualizada);
    } catch (error) {
      console.error('Error al actualizar la pregunta:', error);
      res.status(500).json({ error: 'Error al actualizar la pregunta', details: error.message });
    }
  };