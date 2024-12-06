import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const obtenerLeccionesPorUsuario = async (req, res) => {
    const { id } = req.params;
    
    try {
        const cumplimientoLecciones = await prisma.cumplimiento_leccion.findMany({
            where: {
                usuarioId: id, // Filtrar por el usuario
            },
            include: {
                leccion: {
                    include: {
                        modulo: true,
                    },
                },
                usuario: true,
            },
        });

        if (cumplimientoLecciones.length === 0) {
            return res.status(404).json({ error: "No hay lecciones para este usuario" });
        }

        res.json(cumplimientoLecciones);
    } catch (error) {
        console.error("Error al obtener las lecciones del usuario:", error);
        res.status(500).json({ error: "Error al obtener las lecciones del usuario" });
    }
};
