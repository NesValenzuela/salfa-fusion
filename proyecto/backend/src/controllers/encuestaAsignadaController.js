import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// Asignar encuestas a usuarios
export const asignarEncuesta = async (req, res) => {
  const {
    encuestaId,
    usuarioIds,
    areaId,
    estado = "pendiente",
    fecha_asignacion = new Date(),
  } = req.body;

  try {
    let usuariosAsignar = [];

    // Obtener usuarios desde usuarioIds o desde un área específica
    if (usuarioIds && usuarioIds.length > 0) {
      usuariosAsignar = usuarioIds;
    } else if (areaId) {
      const usuariosEnArea = await prisma.usuario.findMany({
        where: { areaId: parseInt(areaId) },
        select: { rut: true },
      });
      usuariosAsignar = usuariosEnArea.map((usuario) => usuario.rut);
    }

    if (usuariosAsignar.length === 0) {
      return res
        .status(400)
        .json({ error: "No se seleccionaron usuarios ni área." });
    }

    // Validar usuarios para evitar duplicados
    const usuariosValidos = [];
    for (const usuarioId of usuariosAsignar) {
      const existeAsignacion = await prisma.encuestaAsignada.findFirst({
        where: {
          encuestaId: parseInt(encuestaId),
          usuarioId,
        },
      });

      if (!existeAsignacion) {
        usuariosValidos.push(usuarioId);
      }
    }

    if (usuariosValidos.length === 0) {
      return res.status(400).json({
        error:
          "La encuesta ya está asignada a todos los usuarios seleccionados.",
      });
    }

    // Crear asignaciones solo para usuarios válidos
    const asignaciones = await Promise.all(
      usuariosValidos.map((usuarioId) =>
        prisma.encuestaAsignada.create({
          data: {
            encuestaId: parseInt(encuestaId),
            usuarioId,
            estado,
            fecha_asignacion,
          },
        })
      )
    );

    res
      .status(201)
      .json({ message: "Encuestas asignadas con éxito.", asignaciones });
  } catch (error) {
    console.error("Error al asignar la encuesta:", error);
    res
      .status(500)
      .json({ error: "Error al asignar la encuesta.", details: error.message });
  }
};

export const obtenerEncuestasAsignadas = async (req, res) => {
  const usuarioId = req.user.rut;

  try {
    const encuestasPendientes = await prisma.encuestaAsignada.findMany({
      where: {
        usuarioId,
        estado: "pendiente",
        encuesta: {
          estado_encuesta: "Habilitada",
        },
      },
      include: {
        encuesta: true,
      },
    });

    res.json(encuestasPendientes);
  } catch (error) {
    console.error("Error al obtener encuestas asignadas:", error);
    res
      .status(500)
      .json({
        error: "Error al obtener encuestas asignadas",
        details: error.message,
      });
  }
};

export const obtenerPreguntasDeEncuestaAsignada = async (req, res) => {
  const { encuestaId } = req.params;
  const usuarioId = req.user.rut;
  try {
    // Verificar si la encuesta está asignada al usuario y tiene estado pendiente
    const encuestaAsignada = await prisma.encuestaAsignada.findFirst({
      where: {
        usuarioId,
        encuestaId: parseInt(encuestaId),
        estado: "pendiente",
      },
      include: {
        encuesta: {
          include: {
            preguntas: {
              include: {
                opciones: true, // Incluye las opciones si son necesarias para preguntas de selección múltiple
              },
            },
          },
        },
      },
    });
    if (!encuestaAsignada) {
      return res
        .status(404)
        .json({
          error: "Encuesta no asignada o no pendiente para este usuario",
        });
    }
    // Devolver las preguntas de la encuesta asignada
    res.status(200).json(encuestaAsignada.encuesta.preguntas);
  } catch (error) {
    console.error("Error al obtener preguntas de la encuesta asignada:", error);
    res
      .status(500)
      .json({
        error: "Error al obtener preguntas de la encuesta asignada",
        details: error.message,
      });
  }
};

// Obtener datos de completitud de encuesta
export const obtenerCompletitudEncuesta = async (req, res) => {
  const { encuestaId } = req.params;

  try {
    // Total de usuarios asignados a la encuesta
    const totalUsuariosAsignados = await prisma.encuestaAsignada.count({
      where: { encuestaId: parseInt(encuestaId) },
    });

    // Total de usuarios que han completado la encuesta
    const totalUsuariosQueRespondieron = await prisma.encuestaAsignada.count({
      where: {
        encuestaId: parseInt(encuestaId),
        estado: "completada", // Estado de encuesta completada
      },
    });

    res.status(200).json({
      totalUsuariosAsignados,
      totalUsuariosQueRespondieron,
    });
  } catch (error) {
    console.error(
      "Error al obtener datos de completitud de la encuesta:",
      error
    );
    res.status(500).json({
      error: "Error al obtener datos de completitud de la encuesta",
      details: error.message,
    });
  }
};
