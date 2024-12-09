import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const crearcursos = async (req, res) => {
  try {
    const newCurso = await prisma.cursoCapacitacion.create({
      data: req.body,
      include: { modulos: true },
    });
    res.status(201).json(newCurso); // Código 201 para recurso creado
  } catch (error) {
    console.error("Error al crear curso:", error);
    res.status(500).json({ error: "Error al crear el curso" });
  }
};

export const obtenerCursos = async (req, res) => {
  try {
    const cursos = await prisma.cursoCapacitacion.findMany();
    res.json(cursos);
  } catch (error) {
    console.error("Error al obtener cursos:", error);
    res.status(500).json({ error: "Error al obtener cursos" });
  }
};

export const obtenerCurso = async (req, res) => {
  try {
    const cursobuscado = await prisma.cursoCapacitacion.findUnique({
      where: {
        id_curso: parseInt(req.params.id),
      },
    });

    if (!cursobuscado)
      return res.status(404).json({ error: "No hay ningún curso con ese ID" });

    return res.json(cursobuscado);
  } catch (error) {
    console.error("Error al obtener el curso:", error);
    res.status(500).json({ error: "Error al obtener el curso" });
  }
};

export const deleteCurso = async (req, res) => {
  try {
    await prisma.cursoCapacitacion.delete({
      where: {
        id_curso: parseInt(req.params.id),
      },
    });

    return res.status(200).json({
      success: true,
      message: "Curso eliminado exitosamente",
    });
  } catch (error) {
    console.error("Error al eliminar el curso:", error);

    if (error.code === "P2025") {
      // Status 404: Not Found
      return res
        .status(404)
        .json({ error: "No hay ningún curso con ese ID para eliminar" });
    }

    // Status 500: Internal Server Error
    res.status(500).json({ error: "Error al eliminar el curso" });
  }
};

export const editCurso = async (req, res) => {
  const { nombre_curso, descripcion_curso, fecha_limite, estado_curso } =
    req.body; // Desestructurando los campos del cuerpo

  try {
    const updatedCurso = await prisma.cursoCapacitacion.update({
      where: { id_curso: parseInt(req.params.id) },
      data: {
        nombre_curso,
        descripcion_curso,
        fecha_limite,
        estado_curso,
      },
    });

    return res.json(updatedCurso);
  } catch (error) {
    console.error("Error al actualizar el curso:", error);
    if (error.code === "P2025") {
      return res
        .status(404)
        .json({ error: "No hay ningún curso con ese ID para actualizar" });
    }
    res.status(500).json({ error: "Error al actualizar el curso" });
  }
};

export const obtenerCursosUsuario = async (req, res) => {
  const { usuarioId } = req.params;

  try {
    const cursos = await prisma.cursoCapacitacion.findMany({
      where: {
        cursoAsignados: {
          some: {
            usuarioId: usuarioId,
          },
        },
        estado_curso: true,
      },
    });
    res.json(cursos);
  } catch (error) {
    console.error("Error al obtener cursos por ID:", error);
    res.status(500).json({ error: "Error al obtener cursos" });
  }
};

export const obtenerCursosNoUsuario = async (req, res) => {
  const { usuarioId } = req.params;
  try {
    const cursos = await prisma.cursoCapacitacion.findMany({
      where: {
        cursoAsignados: {
          none: {
            usuarioId: usuarioId,
          },
        },
        estado_curso: true,
      },
    });
    res.json(cursos);
  } catch (error) {
    console.error("Error al obtener cursos por no ID:", error);
    res.status(500).json({ error: "Error al obtener cursos" });
  }
};

export const obtenerCursoEstructura = async (req, res) => {
  const { id } = req.params;

  try {
    const curso = await prisma.cursoCapacitacion.findUnique({
      where: {
        id_curso: parseInt(id),
      },
      include: {
        modulos: {
          where: {},
          include: {
            lecciones: {
              where: {},
              include: {
                contenidos: true,
              },
            },
          },
        },
      },
    });
    if (!curso) {
      return res.status(404).json({ error: "Curso no encontrado" });
    }
    res.json(curso);
  } catch (error) {
    console.error("Error al obtener el curso:", error);
    res.status(500).json({ error: "Error al obtener el curso" });
  }
};

export const obtenerEstadisticasCursos = async (req, res) => {
  try {
    // Obtener todos los cursos activos con información detallada
    const cursosActivos = await prisma.cursoCapacitacion.findMany({
      where: {
        estado_curso: true,
      },
      include: {
        cursoAsignados: {
          where: {
            usuario: {
              rolId: 2,
            },
          },
          include: {
            usuario: {
              select: {
                rut: true,
                cumplimiento_lecciones: true,
              },
            },
          },
        },
        modulos: {
          include: {
            lecciones: {
              where: {
                estado_leccion: true, // Solo considerar lecciones habilitadas
              },
            },
          },
        },
      },
    });

    // Procesar información de cursos
    const cursosProcesados = await Promise.all(
      cursosActivos.map(async (curso) => {
        // Obtener total de lecciones habilitadas
        const totalLecciones = curso.modulos.reduce(
          (total, modulo) => total + modulo.lecciones.length,
          0
        );

        const usuariosAsignados = curso.cursoAsignados.length;
        let usuariosCompletados = 0;

        // Verificar cada usuario asignado
        for (const asignacion of curso.cursoAsignados) {
          const leccionesCompletadasUsuario =
            asignacion.usuario.cumplimiento_lecciones.filter((cumplimiento) =>
              curso.modulos.some((modulo) =>
                modulo.lecciones.some(
                  (leccion) =>
                    leccion.id_leccion === cumplimiento.leccionId &&
                    cumplimiento.estado === true
                )
              )
            ).length;

          if (leccionesCompletadasUsuario === totalLecciones) {
            usuariosCompletados++;
          }
        }

        const cursoCompletado =
          usuariosAsignados > 0 && usuariosAsignados === usuariosCompletados;

        return {
          id: curso.id_curso,
          nombre: curso.nombre_curso,
          descripcion: curso.descripcion_curso,
          usuariosAsignados,
          usuariosCompletados,
          completado: cursoCompletado,
        };
      })
    );

    // Calcular estadísticas generales
    const totalCursos = cursosActivos.length;
    const cursosCompletados = cursosProcesados.filter(
      (curso) => curso.completado
    ).length;
    const tasaFinalizacion =
      totalCursos > 0 ? (cursosCompletados / totalCursos) * 100 : 0;

    // Procesar estadísticas por área
    const estadisticasPorArea = await prisma.area.findMany({
      select: {
        nombre_area: true,
        usuarios: {
          select: {
            rut: true,
            cumplimiento_lecciones: true,
            cursoAsignados: {
              where: {
                curso: {
                  estado_curso: true,
                },
              },
              include: {
                curso: {
                  include: {
                    modulos: {
                      include: {
                        lecciones: {
                          where: {
                            estado_leccion: true,
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    const estadisticasProcesadas = estadisticasPorArea.map((area) => {
      const cursosDelArea = area.usuarios.flatMap((u) => u.cursoAsignados);
      const cursosUnicos = [
        ...new Set(cursosDelArea.map((ca) => ca.curso.id_curso)),
      ];

      let completados = 0;

      cursosUnicos.forEach((cursoId) => {
        const curso = cursosDelArea.find(
          (ca) => ca.curso.id_curso === cursoId
        )?.curso;
        if (!curso) return;

        const usuariosConCurso = area.usuarios.filter((u) =>
          u.cursoAsignados.some((ca) => ca.curso.id_curso === cursoId)
        );

        const totalLecciones = curso.modulos.reduce(
          (total, modulo) => total + modulo.lecciones.length,
          0
        );

        const todosCompletaron = usuariosConCurso.every((usuario) => {
          const leccionesCompletadas = usuario.cumplimiento_lecciones.filter(
            (cumplimiento) =>
              curso.modulos.some((modulo) =>
                modulo.lecciones.some(
                  (leccion) =>
                    leccion.id_leccion === cumplimiento.leccionId &&
                    cumplimiento.estado === true
                )
              )
          ).length;

          return leccionesCompletadas === totalLecciones;
        });

        if (todosCompletaron) {
          completados++;
        }
      });

      return {
        name: area.nombre_area,
        total: cursosUnicos.length,
        completed: completados,
      };
    });

    res.json({
      total: totalCursos,
      completed: cursosCompletados,
      completionRate: Math.round(tasaFinalizacion),
      byDepartment: estadisticasProcesadas,
      cursos: cursosProcesados,
    });
  } catch (error) {
    console.error("Error al obtener estadísticas:", error);
    res.status(500).json({ error: "Error al obtener estadísticas de cursos" });
  }
};

export const cargarImagenesCursos = async (req, res) => {
  try {
    const { cursos } = req.body; // Array de IDs de cursos

    const imagenesCursos = await Promise.all(
      cursos.map(async (id_curso) => {
        // Buscar áreas asignadas a este curso
        const areasDelCurso = await prisma.cursoArea.findMany({
          where: {
            id_curso: parseInt(id_curso),
          },
          include: {
            area: {
              select: {
                id_area: true,
                imagen: true,
              },
            },
          },
        });

        // Si hay áreas con imagen, usar la primera
        const areaConImagen = areasDelCurso.find((ca) => ca.area.imagen);

        if (areaConImagen) {
          console.log(
            `Usando imagen del área ${areaConImagen.area.id_area} para curso ${id_curso}`
          );
          return {
            id_curso,
            tipo: "area",
            idArea: areaConImagen.area.id_area,
          };
        } else {
          // Si no hay áreas o no tienen imagen, obtener la letra inicial del curso
          const curso = await prisma.cursoCapacitacion.findUnique({
            where: { id_curso: parseInt(id_curso) },
            select: { nombre_curso: true },
          });

          return {
            id_curso,
            tipo: "letra",
            letra: curso.nombre_curso.charAt(0).toUpperCase(),
          };
        }
      })
    );

    res.json(imagenesCursos);
  } catch (error) {
    console.error("Error al cargar imágenes de los cursos:", error);
    res
      .status(500)
      .json({ mensaje: "Error al obtener las imágenes de los cursos" });
  }
};

export const obtenerCursosNoAsignados = async (req, res) => {
  const { id } = req.params;
  try {
    // Obtener cursos no asignados al usuario
    const cursosNoAsignados = await prisma.curso.findMany({
      where: {
        NOT: {
          cursoAsignados: {
            some: {
              usuarioId: id,
            },
          },
        },
      },
      include: {
        modulos: {
          include: {
            lecciones: {
              include: {
                Cumplimiento_leccion: {
                  where: {
                    usuarioId: id,
                  },
                },
              },
            },
          },
        },
      },
    });

    res.json(cursosNoAsignados);
  } catch (error) {
    console.error("Error al obtener cursos no asignados:", error);
    res.status(500).json({ error: "Error al obtener cursos" });
  }
};

export const obtenerUsuariosCurso = async (req, res) => {
  const { id } = req.params;

  try {
    if (!id) {
      return res.status(400).json({ error: "ID de curso no proporcionado" });
    }

    console.log(`Buscando usuarios para el curso ID: ${id}`);

    // Primero verificar si el curso existe
    const cursoExiste = await prisma.cursoCapacitacion.findUnique({
      where: {
        id_curso: parseInt(id),
      },
    });

    if (!cursoExiste) {
      return res.status(404).json({ error: "Curso no encontrado" });
    }

    const usuariosCurso = await prisma.cursoAsignado.findMany({
      where: {
        cursoId: parseInt(id),
      },
      include: {
        usuario: true,
        curso: {
          include: {
            modulos: {
              include: {
                lecciones: {
                  include: {
                    Cumplimiento_leccion: {
                      where: {
                        usuarioId: {
                          not: undefined,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    console.log(
      `Encontrados ${usuariosCurso.length} usuarios asignados al curso`
    );

    // Procesar los datos para el formato requerido
    const usuariosProcesados = usuariosCurso.map((asignacion) => {
      const totalLecciones = asignacion.curso.modulos.reduce(
        (acc, modulo) => acc + modulo.lecciones.length,
        0
      );

      const leccionesCompletadas = asignacion.curso.modulos.reduce(
        (acc, modulo) =>
          acc +
          modulo.lecciones.reduce(
            (lecAcc, leccion) =>
              lecAcc + (leccion.Cumplimiento_leccion.length > 0 ? 1 : 0),
            0
          ),
        0
      );

      const progreso =
        totalLecciones > 0
          ? Math.round((leccionesCompletadas / totalLecciones) * 100)
          : 0;

      return {
        usuario: {
          rut: asignacion.usuario.rut,
          nombre: asignacion.usuario.nombre,
          apellido_paterno: asignacion.usuario.apellido_paterno,
          apellido_materno: asignacion.usuario.apellido_materno,
          correo: asignacion.usuario.correo,
        },
        progreso,
        leccionesCompletadas,
        totalLecciones,
        modulos: asignacion.curso.modulos.map((modulo) => ({
          id_modulo: modulo.id_modulo,
          nombre_modulo: modulo.nombre_modulo,
          lecciones: modulo.lecciones.map((leccion) => ({
            id_leccion: leccion.id_leccion,
            nombre_leccion: leccion.nombre_leccion,
            completada: leccion.Cumplimiento_leccion.length > 0,
          })),
        })),
      };
    });

    console.log("Datos procesados correctamente");
    res.json(usuariosProcesados);
  } catch (error) {
    console.error("Error detallado al obtener usuarios del curso:", error);
    res.status(500).json({
      error: "Error al obtener usuarios del curso",
      detalles: error.message,
    });
  }
};

export const verificarRequisitosMinimos = (curso) => {
  if (!curso.modulos || curso.modulos.length === 0) {
    return false;
  }
  // Verificar que todos los módulos tengan al menos una lección
  const todosLosModulosConLeccion = curso.modulos.every(
    (modulo) => modulo.lecciones && modulo.lecciones.length > 0
  );
  if (!todosLosModulosConLeccion) {
    return false;
  }
  // Verificar que todas las lecciones de todos los módulos tengan al menos un contenido
  const todasLasLeccionesConContenido = curso.modulos.every((modulo) =>
    modulo.lecciones?.every(
      (leccion) => leccion.contenidos && leccion.contenidos.length > 0
    )
  );
  return todasLasLeccionesConContenido;
};
export const habilitarCurso = async (req, res) => {
  const { id } = req.params;
  try {
    // Verificar si el curso existe
    const curso = await prisma.cursoCapacitacion.findUnique({
      where: { id_curso: parseInt(id) },
    });
    if (!curso) {
      return res.status(404).json({ message: "Curso no encontrado" });
    }
    // Verificar si el curso está asignado a al menos un área
    const asignaciones = await prisma.cursoArea.findMany({
      where: { id_curso: curso.id_curso },
    });
    if (asignaciones.length === 0) {
      return res.status(400).json({
        message:
          "El curso debe estar asignado a al menos un área para habilitarse.",
      });
    }
    // Aquí puedes agregar la lógica para habilitar el curso
    const cursoHabilitado = await prisma.cursoCapacitacion.update({
      where: { id_curso: curso.id_curso },
      data: { estado_curso: true },
    });
    res.json({
      message: "Curso habilitado correctamente",
      curso: cursoHabilitado,
    });
  } catch (error) {
    console.error("Error al habilitar el curso:", error);
    res.status(500).json({ message: "Error al habilitar el curso" });
  }
};
