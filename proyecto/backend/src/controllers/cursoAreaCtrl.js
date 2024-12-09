import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const asignarCursoAArea = async (req, res) => {
  const { areaIds } = req.body;
  const cursoID = parseInt(req.params.cursoId);

  try {
    // Obtener las asignaciones existentes
    const asignacionesExistentes = await prisma.cursoArea.findMany({
      where: { id_curso: cursoID },
      select: { id_area: true },
    });

    const idsExistentes = new Set(asignacionesExistentes.map((a) => a.id_area));

    // Filtrar las nuevas asignaciones para incluir solo las que no existen
    const nuevasAsignaciones = areaIds
      .filter((areaId) => !idsExistentes.has(areaId))
      .map((areaId) => ({
        id_curso: cursoID,
        id_area: areaId,
      }));

    // Crear solo las nuevas asignaciones
    if (nuevasAsignaciones.length > 0) {
      await prisma.cursoArea.createMany({
        data: nuevasAsignaciones,
      });
    }

    await actualizarAsignacionesUsuarios(cursoID, areaIds);

    res.status(200).json({ message: "Áreas actualizadas correctamente" });
  } catch (error) {
    console.error("Error al actualizar áreas:", error);
    res.status(500).json({ error: "Error al actualizar las áreas" });
  }
};

async function actualizarAsignacionesUsuarios(cursoID, areaIds) {
  try {
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

    // Crear nuevas asignaciones si hay usuarios
    if (usuariosDeAreas.length > 0) {
      // Preparar datos para las asignaciones de cursos
      const cursoAsignaciones = usuariosDeAreas.map((usuario) => ({
        usuarioId: usuario.rut,
        cursoId: cursoID,
        fecha_asignacion: new Date(), // Mantener la fecha de asignación
      }));

      // Filtrar asignaciones existentes
      const asignacionesExistentes = await prisma.cursoAsignado.findMany({
        where: {
          cursoId: cursoID,
          usuarioId: { in: usuariosDeAreas.map((u) => u.rut) },
        },
      });

      const idsExistentes = new Set(
        asignacionesExistentes.map((a) => a.usuarioId)
      );

      // Filtrar solo las nuevas asignaciones
      const nuevasAsignaciones = cursoAsignaciones.filter(
        (asignacion) => !idsExistentes.has(asignacion.usuarioId)
      );

      // Crear todas las nuevas asignaciones en una transacción
      if (nuevasAsignaciones.length > 0) {
        await prisma.cursoAsignado.createMany({
          data: nuevasAsignaciones,
        });
      }

      // Preparar datos para los cumplimientos de lecciones
      const cumplimientoLecciones = usuariosDeAreas.flatMap((usuario) =>
        leccionIds.map((leccionId) => ({
          usuarioId: usuario.rut,
          leccionId: leccionId,
          estado: false,
          fecha_modificacion_estado: null,
        }))
      );

      // Filtrar cumplimientos existentes
      const cumplimientosExistentes =
        await prisma.cumplimiento_leccion.findMany({
          where: {
            usuarioId: { in: usuariosDeAreas.map((u) => u.rut) },
            leccionId: { in: leccionIds },
          },
        });

      const idsCumplimientosExistentes = new Set(
        cumplimientosExistentes.map((c) => `${c.usuarioId}-${c.leccionId}`)
      );

      // Filtrar solo los nuevos cumplimientos
      const nuevosCumplimientos = cumplimientoLecciones.filter(
        (cumplimiento) =>
          !idsCumplimientosExistentes.has(
            `${cumplimiento.usuarioId}-${cumplimiento.leccionId}`
          )
      );

      // Crear todos los nuevos cumplimientos en una transacción
      if (nuevosCumplimientos.length > 0) {
        await prisma.cumplimiento_leccion.createMany({
          data: nuevosCumplimientos,
        });
      }
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
  const { areaId } = req.body; // Asegúrate de que se envíen los areaIds

  try {
    // Verificar que el curso existe
    const curso = await prisma.cursoCapacitacion.findUnique({
      where: { id_curso: parseInt(id) },
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

    if (!curso) {
      return res.status(404).json({ message: "Curso no encontrado" });
    }

    // Verificar que modulos y lecciones están definidos
    if (!curso.modulos || curso.modulos.length === 0) {
      return res
        .status(400)
        .json({ message: "No hay módulos disponibles para este curso." });
    }

    // Obtener lista plana de IDs de lecciones
    const leccionIds = curso.modulos.flatMap((modulo) =>
      modulo.lecciones.map((leccion) => leccion.id_leccion)
    );

    // Verificar si hay cumplimientos de lecciones completadas para los usuarios de esta área
    const cumplimientos = await prisma.cumplimiento_leccion.findFirst({
      where: {
        leccionId: { in: leccionIds },
        estado: true, // Solo buscamos cumplimientos donde el estado es true
      },
    });

    if (cumplimientos) {
      return res
        .status(400)
        .json({
          message:
            "No se puede desasignar el área porque hay usuarios que han completado al menos una lección del curso.",
        });
    }
    const usuariosDeArea = await prisma.usuario.findMany({
      where: {
        areaId: parseInt(areaId),
        rolId: 3,
      },
      select: { rut: true },
    });

    await prisma.cursoArea.delete({
      where: {
        id_curso_id_area: {
          id_curso: curso.id_curso,
          id_area: parseInt(areaId),
        },
      },
    });
    await prisma.cursoAsignado.deleteMany({
      where: {
        cursoId: curso.id_curso,
        usuarioId: { in: usuariosDeArea.map((u) => u.rut) },
      },
    });
    await prisma.cumplimiento_leccion.deleteMany({
      where: {
        leccionId: { in: leccionIds },
        usuarioId: { in: usuariosDeArea.map((u) => u.rut) },
      },
    });

    res.json({ message: "Área desasignada correctamente" });
  } catch (error) {
    console.error("Error al desasignar áreas:", error);
    res.status(500).json({ message: "Error al desasignar áreas" });
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
