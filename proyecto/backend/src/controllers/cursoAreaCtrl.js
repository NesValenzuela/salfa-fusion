import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const asignarCursoAArea = async (req, res) => {
  const { areaIds } = req.body;
  const cursoID = parseInt(req.params.cursoId);

  try {
    // Primero eliminamos todas las asignaciones existentes
    await prisma.cursoArea.deleteMany({
      where: { id_curso: cursoID },
    });

    // Luego creamos las nuevas asignaciones
    const nuevasAsignaciones = areaIds.map((areaId) => ({
      id_curso: cursoID,
      id_area: areaId,
    }));

    await prisma.cursoArea.createMany({
      data: nuevasAsignaciones,
    });

    // Actualizar asignaciones de usuarios y cumplimientos
    await actualizarAsignacionesUsuarios(cursoID, areaIds);

    res.status(200).json({ message: "Áreas actualizadas correctamente" });
  } catch (error) {
    console.error("Error al actualizar áreas:", error);
    res.status(500).json({ error: "Error al actualizar las áreas" });
  }
};

async function actualizarAsignacionesUsuarios(cursoID, areaIds) {
  try {
    // Obtener usuarios de las áreas seleccionadas
    const usuariosDeAreas = await prisma.usuario.findMany({
      where: { areaId: { in: areaIds } },
      select: { rut: true },
    });

    // Obtener todas las lecciones del curso
    const curso = await prisma.cursoCapacitacion.findUnique({
      where: { id_curso: cursoID },
      include: {
        modulos: {
          include: {
            lecciones: {
              select: { id_leccion: true },
            },
          },
        },
      },
    });

    // Obtener lista plana de IDs de lecciones
    const leccionIds = curso.modulos.flatMap((modulo) =>
      modulo.lecciones.map((leccion) => leccion.id_leccion)
    );

    // Eliminar asignaciones anteriores
    await prisma.$transaction([
      // Eliminar asignaciones de cursos
      prisma.cursoAsignado.deleteMany({
        where: { cursoId: cursoID },
      }),
      // Eliminar cumplimientos de lecciones
      prisma.cumplimiento_leccion.deleteMany({
        where: {
          AND: [
            { usuarioId: { in: usuariosDeAreas.map((u) => u.rut) } },
            { leccionId: { in: leccionIds } },
          ],
        },
      }),
    ]);

    // Crear nuevas asignaciones si hay usuarios
    if (usuariosDeAreas.length > 0) {
      // Preparar datos para las asignaciones de cursos
      const cursoAsignaciones = usuariosDeAreas.map((usuario) => ({
        usuarioId: usuario.rut,
        cursoId: cursoID,
        fecha_asignacion: new Date(),
      }));

      // Preparar datos para los cumplimientos de lecciones
      const cumplimientoLecciones = usuariosDeAreas.flatMap((usuario) =>
        leccionIds.map((leccionId) => ({
          usuarioId: usuario.rut,
          leccionId: leccionId,
          estado: false,
          fecha_modificacion_estado: null,
        }))
      );

      // Crear todas las asignaciones en una transacción
      await prisma.$transaction([
        prisma.cursoAsignado.createMany({
          data: cursoAsignaciones,
        }),
        prisma.cumplimiento_leccion.createMany({
          data: cumplimientoLecciones,
        }),
      ]);
    }
  } catch (error) {
    console.error("Error en actualizarAsignacionesUsuarios:", error);
    throw error; // Propagar el error para manejarlo en el controlador principal
  }
}

export const obtenerAreasCurso = async (req, res) => {
  const { id } = req.params;

  try {
    // Buscar las áreas asignadas al curso
    const curso = await prisma.cursoCapacitacion.findUnique({
      where: { id_curso: parseInt(id) },
      include: {
        areas: {
          include: {
            area: true,
          },
        },
      },
    });

    if (!curso) {
      return res.status(404).json({ message: "Curso no encontrado" });
    }
    const areasAsignadas = curso.areas.map((cursoArea) => cursoArea.area);
    res.json(areasAsignadas);
  } catch (error) {
    console.error("Error al obtener áreas asignadas:", error);
    res.status(500).json({ message: "Error al obtener las áreas asignadas" });
  }
};

export const deleteAsignacion = async (req, res) => {
  const { id } = req.params; // id del curso
  const { areaId } = req.body; // id del área

  try {
    // Verificar que el curso existe
    const curso = await prisma.cursoCapacitacion.findUnique({
      where: { id_curso: parseInt(id) },
      include: {
        modulos: {
          include: {
            lecciones: true,
          },
        },
      },
    });

    if (!curso) {
      return res.status(404).json({ message: "Curso no encontrado" });
    }

    // Obtener todos los IDs de lecciones del curso
    const leccionIds = curso.modulos.flatMap((modulo) =>
      modulo.lecciones.map((leccion) => leccion.id_leccion)
    );

    // Obtener usuarios del área específica
    const usuariosDelArea = await prisma.usuario.findMany({
      where: {
        areaId: parseInt(areaId),
      },
      select: {
        rut: true,
      },
    });

    const usuarioIds = usuariosDelArea.map((user) => user.rut);

    // Eliminar registros de Cumplimiento_leccion
    await prisma.cumplimiento_leccion.deleteMany({
      where: {
        AND: [
          {
            usuarioId: {
              in: usuarioIds,
            },
          },
          {
            leccionId: {
              in: leccionIds,
            },
          },
        ],
      },
    });

    // Eliminar las asignaciones de los usuarios al curso
    await prisma.cursoAsignado.deleteMany({
      where: {
        cursoId: curso.id_curso,
        usuario: {
          areaId: parseInt(areaId),
        },
      },
    });

    // Eliminar la relación entre el curso y el área
    await prisma.cursoArea.delete({
      where: {
        id_curso_id_area: {
          id_curso: curso.id_curso,
          id_area: parseInt(areaId),
        },
      },
    });

    res.json({
      message:
        "Área desasignada, usuarios y registros de cumplimiento eliminados correctamente",
    });
  } catch (error) {
    console.error("Error al desasignar área:", error);
    res.status(500).json({ message: "Error al desasignar el curso del área" });
  }
};

export const obtenerCursosPorArea = async (req, res) => {
  const { areaId } = req.params;

  try {
    const cursosArea = await prisma.cursoArea.findMany({
      where: {
        id_area: parseInt(areaId),
        curso: {
          estado_curso: true,
        },
      },
      include: {
        curso: {
          include: {
            modulos: {
              include: {
                lecciones: true,
              },
            },
            cursoAsignados: {
              include: {
                usuario: {
                  select: {
                    rut: true,
                    cumplimiento_lecciones: true,
                    areaId: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    const cursosProcesados = cursosArea.map((ca) => {
      const curso = ca.curso;
      const totalLecciones = curso.modulos.reduce(
        (total, modulo) => total + modulo.lecciones.length,
        0
      );

      const usuariosDelArea = curso.cursoAsignados.filter(
        (asig) => asig.usuario.areaId === parseInt(areaId)
      );

      const usuariosAsignados = usuariosDelArea.length;
      const usuariosCompletados = usuariosDelArea.filter((asignacion) => {
        const leccionesCompletadas =
          asignacion.usuario.cumplimiento_lecciones.filter((cumplimiento) =>
            curso.modulos.some((modulo) =>
              modulo.lecciones.some(
                (leccion) =>
                  leccion.id_leccion === cumplimiento.leccionId &&
                  cumplimiento.estado === true
              )
            )
          ).length;

        return leccionesCompletadas === totalLecciones;
      }).length;

      return {
        id: curso.id_curso,
        nombre: curso.nombre_curso,
        descripcion: curso.descripcion_curso,
        usuariosAsignados,
        usuariosCompletados,
        completado:
          usuariosAsignados > 0 && usuariosAsignados === usuariosCompletados,
      };
    });

    res.json({
      totalCursosActivos: cursosArea.length,
      cursosFinalizados: cursosProcesados.filter((c) => c.completado).length,
      listadoCursos: cursosProcesados,
    });
  } catch (error) {
    console.error("Error al obtener cursos por área:", error);
    res.status(500).json({ message: "Error al obtener los cursos del área" });
  }
};
