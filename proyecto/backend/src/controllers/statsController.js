import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();


export const getStatistics = async (req, res) => {
    const { encuestaId } = req.params;

    try {
        const preguntas = await prisma.pregunta.findMany({
            where: { encuestaId: parseInt(encuestaId) },
            include: {
                opciones: {
                    select: {
                        id_opcion: true,
                        texto_opcion: true,
                    },
                },
            },
        });

        const estadisticas = await Promise.all(preguntas.map(async (pregunta) => {
            const conteos = await prisma.respuesta.groupBy({
                by: ['opcionId'],
                where: {
                    preguntaId_pregunta: pregunta.id_pregunta,
                },
                _count: {
                    opcionId: true,
                },
            });
        
            const opcionesConConteo = pregunta.opciones.map(opcion => {
                const conteo = conteos.find(c => c.opcionId === opcion.id_opcion);
                return {
                    texto_opcion: opcion.texto_opcion,
                    respuestas: conteo ? conteo._count.opcionId : 0,
                };
            });
        
            return {
                texto_pregunta: pregunta.texto_pregunta,
                opciones: opcionesConConteo,
                tipo: pregunta.tipo || 'multiple'
            };
        }));

        res.json(estadisticas);

    } catch (error) {
        console.error('Error al obtener estadísticas:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};
