import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const guardarRespuestas = async (req, res) => {
    const { encuestaId, respuestas } = req.body;
    const usuarioId = req.user.rut; // Usar el ID del usuario autenticado

    if (!encuestaId || !respuestas || Object.keys(respuestas).length === 0) {
        return res.status(400).json({ error: 'Datos de encuesta incompletos o no válidos.' });
    }
    try {
        // Verificar si el usuario ya tiene respuestas para la encuesta
        const respuestasExistentes = await prisma.respuesta.findFirst({
            where: {
                usuarioId,
                Pregunta: {
                    encuestaId: parseInt(encuestaId)
                }
            }
        });
        if (respuestasExistentes) {
            return res.status(400).json({ error: 'Ya has respondido a esta encuesta' });
        }
        // Guardar cada respuesta de manera individual
        const respuestasGuardadas = await Promise.all(
            Object.entries(respuestas).map(async ([preguntaId, respuesta]) => {
                const respuestaData = {
                    texto_respuesta: typeof respuesta === 'string' ? respuesta : null,
                    fecha_respuesta: new Date(),
                    usuarioId,
                    opcionId: typeof respuesta === 'number' ? respuesta : null,
                    preguntaId_pregunta: parseInt(preguntaId)
                };

                // Validación de datos
                if (!respuestaData.usuarioId || (!respuestaData.texto_respuesta && !respuestaData.opcionId)) {
                    console.error("Datos de respuesta incompletos:", respuestaData);
                    throw new Error("Datos de respuesta incompletos");
                }
                return prisma.respuesta.create({
                    data: respuestaData
                });
            })
        );
        await prisma.encuestaAsignada.updateMany({
            where: {
                encuestaId: parseInt(encuestaId),
                usuarioId
            },
            data: {
                estado: "completada"
            }
        });

        res.json({ message: 'Respuestas guardadas correctamente y encuesta marcada como completada' });
    } catch (error) {
        console.error('Error al guardar respuestas:', error);
        res.status(500).json({ error: 'Error al guardar respuestas', details: error.message });
    }
};

export const obtenerEstadisticasRespuestas = async (req, res) => {
  try {
    const { encuestaId } = req.params;

    // Obtener estadísticas agrupadas por opcionId para todas las preguntas de una encuesta
    const estadisticas = await prisma.respuesta.groupBy({
      by: ['opcionId'],
      where: {
        Pregunta: {
          encuestaId: parseInt(encuestaId),
        },
      },
      _count: {
        opcionId: true,
      },
    });

    res.json(estadisticas);
  } catch (error) {
    console.error("Error al obtener estadísticas de respuestas:", error);
    res.status(500).json({ error: "Error al obtener estadísticas de respuestas" });
  }
};
