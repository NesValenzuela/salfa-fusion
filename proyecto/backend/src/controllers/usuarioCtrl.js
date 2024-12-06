import { auth } from "../../firebase/firebaseAdminConfig.js";
import { PrismaClient } from "@prisma/client";
//import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

// export const crearUsuario = async (req, res) => {
//   const {
//     rut,
//     nombre,
//     apellido_paterno,
//     apellido_materno,
//     correo,
//     rolId,
//     areaId,
//   } = req.body;

//   try {
//     // Verificar si el usuario ya existe por RUT o correo
//     const usuarioExistente = await prisma.usuario.findFirst({
//       where: {
//         OR: [{ rut }, { correo }],
//       },
//     });

//     if (usuarioExistente) {
//       return res.status(400).json({ mensaje: "El usuario ya existe" });
//     }

//     // Crear nuevo usuario
//     const nuevoUsuario = await prisma.usuario.create({
//       data: {
//         rut,
//         nombre,
//         apellido_paterno,
//         apellido_materno,
//         correo,
//         rolId,
//         areaId: areaId || undefined, // Si no se proporciona areaId, lo dejamos como undefined
//       },
//       include: {
//         rol: true,
//         Area: true,
//       },
//     });
//     const nuevoUsuarioFirebase = await auth.createUser({
//       email: correo,
//       password: generarContraseñaAleatoria(),
//     });
//     res.status(201).json({
//       mensaje: "Usuario creado exitosamente",
//       usuario: nuevoUsuario,
//     });
//   } catch (error) {
//     console.error("Error al crear usuario:", error);
//     res.status(500).json({ mensaje: "Error al crear usuario" });
//   }
// };
export const obtenerUsuarioYCursos = async (req, res) => {
  const { id } = req.params;

  try {
    const usuario = await prisma.usuario.findUnique({
      where: {
        rut: id,
      },
      include: {
        cursoAsignados: {
          include: {
            curso: {
              include: {
                modulos: {
                  include: {
                    lecciones: true,
                  },
                },
              },
            },
          },
        },
        Area: true,
      },
    });

    if (!usuario) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    // Calcular el progreso de cada curso
    usuario.cursoAsignados = await Promise.all(
      usuario.cursoAsignados.map(async (asignacion) => {
        const curso = asignacion.curso;

        // Contar las lecciones completas
        const totalLecciones = curso.modulos.reduce(
          (acc, modulo) => acc + modulo.lecciones.length,
          0
        );
        const leccionesCompletas = curso.modulos.reduce((acc, modulo) => {
          return (
            acc +
            modulo.lecciones.filter(
              (leccion) => leccion.estado_leccion === true
            ).length
          );
        }, 0);

        // Calcular el progreso como un porcentaje
        const progreso =
          totalLecciones > 0 ? (leccionesCompletas / totalLecciones) * 100 : 0;

        // Añadir el progreso al curso
        return {
          ...asignacion,
          curso: {
            ...curso,
            progreso: progreso, // Agregar el progreso calculado
          },
        };
      })
    );

    res.json(usuario);
  } catch (error) {
    console.error("Error al obtener el usuario con cursos:", error);
    res.status(500).json({ error: "Error al obtener el usuario y sus cursos" });
  }
};

export const obtenerUsuarios = async (req, res) => {
  try {
    const { id_area } = req.query;
    let usuarios;

    if (id_area) {
      usuarios = await prisma.usuario.findMany({
        where: {
          areaId: parseInt(id_area),
        },
        include: {
          rol: true,
          Area: true,
        },
      });
    } else {
      usuarios = await prisma.usuario.findMany({
        include: {
          rol: true,
          Area: true,
        },
      });
    }

    res.json({ usuarios });
  } catch (error) {
    console.error("Error al obtener usuarios:", error);
    res.status(500).json({
      mensaje: "Error al obtener usuarios",
      error: error.message,
    });
  }
};

// export const login = async (req, res) => {
//   const { idToken } = req.body;

//   try {
//     const decodedToken = await auth.verifyIdToken(idToken);
//     const email = decodedToken.email;

//     const usuario = await prisma.usuario.findUnique({
//       where: { correo: email },
//       include: { rol: true },
//     });

//     if (!usuario) {
//       return res.status(404).json({ mensaje: "Usuario no encontrado" });
//     }

//     const token = jwt.sign(
//       { uid: usuario.id, rol: usuario.rol.nombre_rol },
//       JWT_SECRET,
//       { expiresIn: JWT_EXPIRES_IN, algorithm: "HS256" }
//     );
//     const refreshToken = jwt.sign({ uid: usuario.id }, JWT_REFRESH_SECRET, {
//       expiresIn: JWT_REFRESH_EXPIRES_IN,
//     });

//     res.json({ token, refreshToken, role: usuario.rol.nombre_rol });
//   } catch (error) {
//     console.error("Error en login:", error);
//     res.status(401).json({ mensaje: "Autenticación fallida" });
//   }
// };

// export const refreshToken = async (req, res) => {
//   const { refreshToken } = req.body;

//   if (!refreshToken) {
//     return res
//       .status(401)
//       .json({ mensaje: "No se proporcionó token de refresco" });
//   }

//   try {
//     const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
//     const usuario = await prisma.usuario.findUnique({
//       where: { id: decoded.uid },
//       include: { rol: true },
//     });

//     if (!usuario || usuario.refreshToken !== refreshToken) {
//       return res.status(403).json({ mensaje: "Token de refresco inválido" });
//     }

//     const newToken = jwt.sign(
//       { uid: usuario.id, rol: usuario.rol.nombre },
//       JWT_SECRET,
//       { expiresIn: JWT_EXPIRES_IN }
//     );

//     res.json({ token: newToken });
//   } catch (error) {
//     console.error("Error al refrescar token:", error);
//     res.status(403).json({ mensaje: "Token de refresco inválido" });
//   }
// };

export const getUserInfo = async (req, res) => {
  try {
    // Obtenemos el RUT del token verificado por authMiddleware
    const userRut = req.user.rut;

    const usuario = await prisma.usuario.findUnique({
      where: { rut: userRut },
      include: {
        rol: true,
        Area: true,
      },
    });

    if (!usuario) {
      return res.status(404).json({
        mensaje: "Usuario no encontrado",
        details: `No se encontró usuario con RUT: ${userRut}`,
      });
    }

    res.json({
      role: usuario.rol.nombre_rol,
      rut: usuario.rut,
      nombre: usuario.nombre,
      apellido_paterno: usuario.apellido_paterno,
      apellido_materno: usuario.apellido_materno,
      area: usuario.Area?.nombre_area,
      correo: usuario.correo,
    });
  } catch (error) {
    console.error("Error al obtener información del usuario:", error);
    res.status(500).json({
      mensaje: "Error interno del servidor",
      details: error.message,
    });
  }
};

export const usuarioConCursosYLecciones = async (req, res) => {
  const { id } = req.params;

  try {
    const usuario = await prisma.usuario.findUnique({
      where: {
        rut: id,
      },
      include: {
        cursoAsignados: {
          include: {
            curso: {
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
            },
          },
        },
      },
    });

    if (!usuario) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    return res.json(usuario);
  } catch (error) {
    console.error("Error en la consulta de usuario:", error);
    return res.status(500).json({ message: "Error en la consulta" });
  }
};

// export const toggleEstadoUsuario = async (req, res) => {
//   const { correo, estado } = req.body;

//   try {
//     // Obtener usuario de Firebase
//     const userRecord = await auth.getUserByEmail(correo);

//     // Actualizar estado en Firebase
//     // Si estado es true, queremos que el usuario esté habilitado (disabled: false)
//     // Si estado es false, queremos que el usuario esté deshabilitado (disabled: true)
//     await auth.updateUser(userRecord.uid, {
//       disabled: estado, // Cambiamos esto, ya no necesitamos invertir el estado
//     });

//     const usuarioActualizado = await auth.getUserByEmail(correo);

//     res.status(200).json({
//       mensaje: `Usuario ${estado ? "inhabilitado" : "habilitado"} exitosamente`,
//       estadoFirebase: !estado,
//     });
//   } catch (error) {
//     console.error("Error al actualizar estado del usuario:", error);
//     res.status(500).json({
//       mensaje: "Error al actualizar estado del usuario",
//       error: error.message,
//     });
//   }
// };

export const actualizarUsuario = async (req, res) => {
  const rut = req.params.rut; // Obtenemos el RUT de los parámetros de la URL
  const { nombre, apellido_paterno, apellido_materno, correo, rolId, areaId } =
    req.body;

  try {
    // Verificar si existe otro usuario con el mismo correo (excluyendo el usuario actual)
    const usuarioExistente = await prisma.usuario.findFirst({
      where: {
        correo,
        NOT: { rut: rut },
      },
    });

    if (usuarioExistente) {
      return res
        .status(400)
        .json({ mensaje: "El correo ya está en uso por otro usuario" });
    }
    const usuarioActual = await prisma.usuario.findUnique({
      where: { rut: rut },
    });
    const usuarioActualizado = await prisma.usuario.update({
      where: { rut: rut },
      data: {
        nombre,
        apellido_paterno,
        apellido_materno,
        correo,
        rolId,
        areaId: areaId || undefined,
      },
      include: {
        rol: true,
        Area: true,
      },
    });

    // Actualizar correo en Firebase si cambió
    try {
      const userRecord = await auth.getUserByEmail(usuarioActual.correo);
      await auth.updateUser(userRecord.uid, {
        email: correo,
      });
    } catch (firebaseError) {
      throw firebaseError;
    }

    res.json({
      mensaje: "Usuario actualizado exitosamente",
      usuario: usuarioActualizado,
    });
  } catch (error) {
    console.error("Error al actualizar usuario:", error);
    res.status(500).json({
      mensaje: "Error al actualizar usuario",
      error: error.message,
    });
  }
};

export const crearUsuariosBulk = async (req, res) => {
  const { usuarios } = req.body;
  const resultados = [];
  console.log(usuarios);
  try {
    for (const usuario of usuarios) {
      try {
        // Verificar si el usuario ya existe
        const usuarioExistente = await prisma.usuario.findFirst({
          where: {
            OR: [{ rut: usuario.rut }, { correo: usuario.correo }],
          },
        });

        if (usuarioExistente) {
          resultados.push({
            success: false,
            usuario: usuario,
            mensaje: `Usuario con RUT ${usuario.rut} o correo ${usuario.correo} ya existe`,
          });
          continue;
        }

        // Crear usuario en la base de datos
        const nuevoUsuario = await prisma.usuario.create({
          data: {
            rut: usuario.rut,
            nombre: usuario.nombre,
            apellido_paterno: usuario.apellido_paterno,
            apellido_materno: usuario.apellido_materno,
            correo: usuario.correo,
            rolId: usuario.rolId,
            areaId: usuario.areaId || undefined,
          },
          include: {
            rol: true,
            Area: true,
          },
        });

        // Crear usuario en Firebase
        const nuevoUsuarioFirebase = await auth.createUser({
          email: usuario.correo,
          password: "prueba12345", //generarContraseñaAleatoria(),
        });

        console.log(nuevoUsuarioFirebase0);
        resultados.push({
          success: true,
          usuario: nuevoUsuario,
          mensaje: "Usuario creado exitosamente",
        });
      } catch (error) {
        resultados.push({
          success: false,
          usuario: usuario,
          mensaje: `Error al crear usuario: ${error.message}`,
        });
      }
    }

    // Enviar resumen de resultados
    const exitosos = resultados.filter((r) => r.success).length;
    const fallidos = resultados.filter((r) => !r.success).length;
    console.log(exitosos);
    console.log(fallidos);
    res.status(200).json({
      mensaje: `Proceso completado. ${exitosos} usuarios creados exitosamente, ${fallidos} fallidos.`,
      resultados: resultados,
    });
  } catch (error) {
    console.error("Error en la carga masiva:", error);
    res.status(500).json({
      mensaje: "Error en el proceso de carga masiva",
      error: error.message,
    });
  }
};

export const eliminarUsuarios = async (req, res) => {
  const { usuarios } = req.body;
  const resultados = [];

  try {
    for (const rut of usuarios) {
      try {
        // Obtener el usuario para conseguir su correo
        const usuario = await prisma.usuario.findUnique({
          where: { rut },
        });

        if (!usuario) {
          resultados.push({
            success: false,
            rut,
            mensaje: "Usuario no encontrado",
          });
          continue;
        }

        // Intentar eliminar usuario de Firebase

        try {
          // Primero obtenemos el UID del usuario en Firebase
          const userRecord = await auth.getUserByEmail(usuario.correo);
          // Ahora eliminamos usando el UID
          await auth.deleteUser(userRecord.uid);
        } catch (firebaseError) {
          console.log("Error Firebase:", {
            code: firebaseError.code,
            message: firebaseError.message,
            errorCompleto: firebaseError,
          });
          // Si el usuario no existe en Firebase, continuamos con la eliminación en la BD
          if (firebaseError.code !== "auth/user-not-found") {
            throw firebaseError;
          }
        }

        // Eliminar usuario de la base de datos
        await prisma.usuario.delete({
          where: { rut },
        });
        resultados.push({
          success: true,
          rut,
          mensaje: "Usuario eliminado exitosamente",
        });
      } catch (error) {
        console.error(`Error procesando usuario ${rut}:`, error);
        resultados.push({
          success: false,
          rut,
          mensaje: `Error al eliminar usuario: ${error.message}`,
        });
      }
    }

    const exitosos = resultados.filter((r) => r.success).length;
    const fallidos = resultados.filter((r) => !r.success).length;

    res.status(200).json({
      mensaje: `Proceso completado. ${exitosos} usuarios eliminados exitosamente, ${fallidos} fallidos.`,
      resultados,
    });
  } catch (error) {
    console.error("Error general en la eliminación de usuarios:", error);
    res.status(500).json({
      mensaje: "Error en el proceso de eliminación",
      error: error.message,
    });
  }
};

// Función auxiliar para generar una contraseña aleatoria
// const generarContraseñaAleatoria = () => {
//   return Math.random().toString(36).slice(-8);
// };
