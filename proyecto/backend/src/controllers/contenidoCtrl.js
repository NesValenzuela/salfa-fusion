import { PrismaClient } from "@prisma/client";
import admin from "firebase-admin";

const prisma = new PrismaClient();
const bucket = admin.storage().bucket();

export const uploadFile = async (req, res) => {
  try {
    const { file } = req.files;
    const { leccionId } = req.body;

    if (!file || !leccionId) {
      return res
        .status(400)
        .json({ message: "Archivo y leccionId son requeridos" });
    }

    // Determinar tipo de contenido
    let tipoContenido;
    if (file.mimetype.startsWith("image/")) tipoContenido = "imagen";
    else if (file.mimetype.startsWith("audio/")) tipoContenido = "audio";
    else if (file.mimetype.startsWith("video/")) tipoContenido = "video";
    else if (file.mimetype === "application/pdf") tipoContenido = "pdf";
    else if (
      file.mimetype === "application/msword" ||
      file.mimetype ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    )
      tipoContenido = "word";
    else if (
      file.mimetype === "application/vnd.ms-excel" ||
      file.mimetype ===
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    )
      tipoContenido = "excel";
    else if (
      file.mimetype === "application/vnd.ms-powerpoint" ||
      file.mimetype ===
        "application/vnd.openxmlformats-officedocument.presentationml.presentation"
    )
      tipoContenido = "powerpoint";
    else
      return res.status(400).json({ message: "Tipo de archivo no permitido" });

    // Función auxiliar para obtener la extensión del archivo
    const getFileExtension = (filename) => {
      const parts = filename.split(".");
      return parts.length > 1 ? `.${parts[parts.length - 1]}` : "";
    };

    // Función auxiliar para obtener el nombre sin la extensión final
    const getNameWithoutExtension = (filename) => {
      const extension = getFileExtension(filename);
      return filename.slice(0, -extension.length);
    };

    // Crear nombre del archivo sin extensión
    const fecha = new Date();
    const fechaFormateada = fecha
      .toISOString()
      .replace("T", "-")
      .replace(/:/g, "-")
      .slice(0, 19);

    // Obtener nombre sin extensión manteniendo puntos intermedios
    const originalNameWithoutExt = getNameWithoutExtension(file.name);
    // Crear nuevo nombre sin extensión
    const fileName = `${fechaFormateada}_${originalNameWithoutExt}`;
    // Validar longitud total
    if (fileName.length > 50) {
      return res.status(400).json({
        message: "El nombre del archivo excede el límite de 50 caracteres",
      });
    }

    // Obtener el último índice usado en esta lección
    const ultimoContenido = await prisma.contenido.findFirst({
      where: { leccionId: parseInt(leccionId) },
      orderBy: { indice_archivo: "desc" },
    });

    const nuevoIndice = ultimoContenido
      ? ultimoContenido.indice_archivo + 1
      : 1;

    // Subir archivo usando Admin SDK
    const fileBuffer = Buffer.from(file.data);
    const fileUpload = bucket.file(`contenido/${fileName}`);

    await fileUpload.save(fileBuffer, {
      metadata: {
        contentType: file.mimetype,
      },
    });

    // Hacer el archivo público y obtener URL
    await fileUpload.makePublic();
    const downloadURL = `https://storage.googleapis.com/${bucket.name}/contenido/${fileName}`;

    // Crear registro en la base de datos usando Prisma
    const nuevoContenido = await prisma.contenido.create({
      data: {
        nombre_archivo: fileName,
        indice_archivo: nuevoIndice,
        url: downloadURL,
        tipo_contenido: tipoContenido,
        leccionId: parseInt(leccionId),
      },
    });

    // Resetear el estado de cumplimiento para todos los usuarios que tenían la lección completada
    await prisma.cumplimiento_leccion.updateMany({
      where: {
        leccionId: parseInt(leccionId),
        estado: true, // Solo actualizar los que estaban marcados como completados
      },
      data: {
        estado: false,
        fecha_modificacion_estado: null,
      },
    });

    res.status(200).json({
      success: true,
      data: nuevoContenido,
    });
  } catch (error) {
    console.error("Error detallado:", error);
    res.status(500).json({
      message: "Error al subir archivo",
      error: error.message,
    });
  } finally {
    await prisma.$disconnect();
  }
};

export const getContenidoByLeccion = async (req, res) => {
  try {
    const { leccionId } = req.params;

    const contenidos = await prisma.contenido.findMany({
      where: {
        leccionId: parseInt(leccionId),
      },
      orderBy: {
        indice_archivo: "asc",
      },
    });

    const contenidosVerificados = await Promise.all(
      contenidos.map(async (contenido) => {
        const fileName = `contenido/${contenido.nombre_archivo}`;
        const file = bucket.file(fileName);
        const [exists] = await file.exists();

        return {
          ...contenido,
          fileExists: exists,
        };
      })
    );

    res.status(200).json(contenidosVerificados);
  } catch (error) {
    console.error("Error al obtener contenido:", error);
    res.status(500).json({
      message: "Error al obtener contenido",
      error: error.message,
    });
  } finally {
    await prisma.$disconnect();
  }
};

export const viewFile = async (req, res) => {
  try {
    const { fileName } = req.params;
    const file = bucket.file(`contenido/${fileName}`);

    // Verificar si el archivo existe
    const [exists] = await file.exists();
    if (!exists) {
      return res.status(404).json({ message: "Archivo no encontrado" });
    }

    // Obtener el tipo de contenido del archivo
    const [metadata] = await file.getMetadata();
    const contentType = metadata.contentType;

    // Para archivos de Office, redirigir a Google Docs Viewer
    const officeTypes = [
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-powerpoint",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    ];

    if (officeTypes.includes(contentType)) {
      const fileUrl = `https://storage.googleapis.com/${bucket.name}/contenido/${fileName}`;
      const viewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(
        fileUrl
      )}&embedded=true`;
      res.redirect(viewerUrl);
      return;
    }

    // Para otros tipos de archivos, mantener el comportamiento actual
    const fileStream = file.createReadStream();
    res.setHeader("Content-Type", contentType);
    res.setHeader("Content-Disposition", `inline; filename="${fileName}"`);
    fileStream.pipe(res);
  } catch (error) {
    console.error("Error al obtener archivo:", error);
    res.status(500).json({
      message: "Error al obtener archivo",
      error: error.message,
    });
  }
};

export const renameFile = async (req, res) => {
  try {
    const { id_contenido } = req.params;
    const { newFileName } = req.body;

    const contenido = await prisma.contenido.findUnique({
      where: {
        id_contenido: parseInt(id_contenido),
      },
    });

    if (!contenido) {
      return res.status(404).json({ message: "Contenido no encontrado" });
    }

    // Obtener el archivo actual en Firebase
    const oldFileName = `contenido/${contenido.nombre_archivo}`;
    const oldFile = bucket.file(oldFileName);

    // Verificar si el archivo existe
    const [exists] = await oldFile.exists();
    if (!exists) {
      return res
        .status(404)
        .json({ message: "Archivo no encontrado en Storage" });
    }

    // Extraer la fecha del nombre original
    const fechaParte = contenido.nombre_archivo.split("_")[0];
    const newFullFileName = `${fechaParte}_${newFileName}`;
    const newFilePath = `contenido/${newFullFileName}`;

    try {
      // Copiar el archivo a la nueva ubicación
      await oldFile.copy(bucket.file(newFilePath));
      // Eliminar el archivo original
      await oldFile.delete();

      // Hacer público el nuevo archivo
      await bucket.file(newFilePath).makePublic();

      // Actualizar la URL y nombre en la base de datos
      const newUrl = `https://storage.googleapis.com/${bucket.name}/${newFilePath}`;
      const updatedContenido = await prisma.contenido.update({
        where: { id_contenido: parseInt(id_contenido) },
        data: {
          nombre_archivo: newFullFileName,
          url: newUrl,
        },
      });

      res.status(200).json(updatedContenido);
    } catch (storageError) {
      console.error("Error en Storage:", storageError);
      res.status(500).json({
        message: "Error al manipular el archivo en Storage",
        error: storageError.message,
      });
    }
  } catch (error) {
    console.error("Error al renombrar archivo:", error);
    res.status(500).json({
      message: "Error al renombrar archivo",
      error: error.message,
    });
  }
};

export const deleteFile = async (req, res) => {
  try {
    const { id_contenido } = req.params;

    // Obtener información del contenido antes de eliminarlo
    const contenido = await prisma.contenido.findUnique({
      where: { id_contenido: parseInt(id_contenido) },
      select: {
        nombre_archivo: true,
        leccionId: true,
      },
    });

    if (!contenido) {
      return res.status(404).json({ message: "Contenido no encontrado" });
    }

    // Eliminar el archivo de Firebase
    const file = bucket.file(`contenido/${contenido.nombre_archivo}`);
    try {
      await file.delete();
    } catch (error) {
      console.log("Error al eliminar archivo de Firebase:", error);
      // Continuamos con la eliminación del registro en BD aunque falle en Firebase
    }

    // Eliminar el registro de la base de datos
    await prisma.contenido.delete({
      where: { id_contenido: parseInt(id_contenido) },
    });

    // Obtener todos los usuarios que tienen registros de cumplimiento para esta lección
    const usuariosConCumplimiento = await prisma.cumplimiento_leccion.findMany({
      where: { leccionId: contenido.leccionId },
      select: { usuarioId: true },
    });

    // Verificar el cumplimiento para cada usuario
    for (const { usuarioId } of usuariosConCumplimiento) {
      await verificarCumplimientoLeccion(contenido.leccionId, usuarioId);
    }

    res.status(200).json({
      success: true,
      message: "Contenido eliminado correctamente",
    });
  } catch (error) {
    console.error("Error al eliminar contenido:", error);
    res.status(500).json({
      message: "Error al eliminar contenido",
      error: error.message,
    });
  } finally {
    await prisma.$disconnect();
  }
};

export const reorderContenido = async (req, res) => {
  try {
    const { updates } = req.body;

    // Actualizar los índices en una transacción
    await prisma.$transaction(
      updates.map(({ id_contenido, indice_archivo }) =>
        prisma.contenido.update({
          where: { id_contenido: parseInt(id_contenido) },
          data: { indice_archivo },
        })
      )
    );

    res.status(200).json({ message: "Orden actualizado exitosamente" });
  } catch (error) {
    console.error("Error al reordenar contenido:", error);
    res.status(500).json({
      message: "Error al reordenar contenido",
      error: error.message,
    });
  } finally {
    await prisma.$disconnect();
  }
};

const verificarCumplimientoLeccion = async (leccionId, userId) => {
  try {
    // Primero verificar si ya existe un cumplimiento completado
    const cumplimientoExistente = await prisma.cumplimiento_leccion.findUnique({
      where: {
        usuarioId_leccionId: {
          usuarioId: userId,
          leccionId: parseInt(leccionId),
        },
      },
    });

    // Si ya existe y está completado, no hacer nada
    if (cumplimientoExistente?.estado === true) {
      return;
    }

    // Obtener todos los contenidos activos de la lección
    const contenidosLeccion = await prisma.contenido.findMany({
      where: { leccionId: parseInt(leccionId) },
    });

    // Verificar existencia en Firebase para cada contenido
    const contenidosActivos = await Promise.all(
      contenidosLeccion.map(async (contenido) => {
        const fileName = `contenido/${contenido.nombre_archivo}`;
        const file = bucket.file(fileName);
        const [exists] = await file.exists();
        return exists ? contenido : null;
      })
    );

    // Filtrar solo los contenidos que existen en Firebase
    const contenidosValidos = contenidosActivos.filter((c) => c !== null);

    // Obtener registros de visualización del usuario
    const registrosVisualizacion =
      await prisma.registroVisualizacionContenido.findMany({
        where: {
          leccionId: parseInt(leccionId),
          usuarioId: userId,
        },
      });

    // Verificar si todos los contenidos válidos han sido visualizados
    const todosVisualizados = contenidosValidos.every((contenido) => {
      const visualizado = registrosVisualizacion.some(
        (registro) => registro.contenidoId === contenido.id_contenido
      );
      return visualizado;
    });

    if (todosVisualizados && contenidosValidos.length > 0) {
      // Usar upsert solo si no existe o si existe pero no está completado
      const cumplimientoActualizado = await prisma.cumplimiento_leccion.upsert({
        where: {
          usuarioId_leccionId: {
            usuarioId: userId,
            leccionId: parseInt(leccionId),
          },
        },
        update: {
          estado: true,
          fecha_modificacion_estado: new Date(),
        },
        create: {
          usuarioId: userId,
          leccionId: parseInt(leccionId),
          estado: true,
          fecha_modificacion_estado: new Date(),
        },
      });
    }
  } catch (error) {
    console.error("Error detallado al verificar cumplimiento:", error);
    throw error;
  }
};

export const registrarVisualizacion = async (req, res) => {
  try {
    const { contenidoId, leccionId, userId } = req.body;

    // Verificar si ya existe el registro
    const registroExistente =
      await prisma.registroVisualizacionContenido.findFirst({
        where: {
          contenidoId: parseInt(contenidoId),
          leccionId: parseInt(leccionId),
          usuarioId: userId,
        },
      });

    if (!registroExistente) {
      // Crear nuevo registro de visualización
      const visualizacion = await prisma.registroVisualizacionContenido.create({
        data: {
          usuarioId: userId,
          contenidoId: parseInt(contenidoId),
          leccionId: parseInt(leccionId),
          timestamp: new Date(),
        },
      });

      // Verificar cumplimiento de la lección
      await verificarCumplimientoLeccion(leccionId, userId);

      res.status(200).json({
        success: true,
        data: visualizacion,
      });
    } else {
      // Aún verificamos el cumplimiento aunque el registro ya exista
      await verificarCumplimientoLeccion(leccionId, userId);

      res.status(200).json({
        success: true,
        message: "Visualización ya registrada",
      });
    }
  } catch (error) {
    console.error("Error detallado al registrar visualización:", error);
    res.status(500).json({
      message: "Error al registrar visualización",
      error: error.message,
    });
  } finally {
    await prisma.$disconnect();
  }
};

export const getRegistrosVisualizacion = async (req, res) => {
  try {
    const { cursoId, userId } = req.params;

    const registros = await prisma.$queryRaw`
      SELECT rvc.* 
      FROM "RegistroVisualizacionContenido" rvc
      JOIN "Contenido" c ON c.id_contenido = rvc."contenidoId"
      JOIN "LeccionCurso" l ON l.id_leccion = c."leccionId"
      JOIN "Modulo" m ON m.id_modulo = l."moduloId"
      WHERE m."cursoId" = ${parseInt(cursoId)}
      AND rvc."usuarioId" = ${userId}
    `;

    res.status(200).json(registros);
  } catch (error) {
    console.error("Error al obtener registros de visualización:", error);
    res.status(500).json({
      message: "Error al obtener registros de visualización",
      error: error.message,
    });
  } finally {
    await prisma.$disconnect();
  }
};
