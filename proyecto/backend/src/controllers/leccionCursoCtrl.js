import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const crearLeccion = async (req, res) => {
  const { nombre_leccion, descripcion_leccion } = req.body;

  try {
    const moduloId = parseInt(req.params.moduloId);
    console.log("moduloId recibido:", moduloId); // Debug: mostrar el moduloId recibido

    // Verificar si el módulo existe
    const modulo = await prisma.modulo.findUnique({
      where: { id_modulo: moduloId },
    });

    if (!modulo) {
      return res
        .status(404)
        .json({ error: "No se encontró ningún módulo con ese ID" });
    }

    // Crear la lección asociada al módulo
    const fechaCreacion = new Date();
    fechaCreacion.setDate(fechaCreacion.getDate()); // Usar la fecha actual

    const nuevaLeccion = await prisma.leccionCurso.create({
      data: {
        nombre_leccion,
        descripcion_leccion,
        fecha_de_creacion_leccion: fechaCreacion,
        moduloId,
        estado_leccion: true,
      },
    });

    return res.status(201).json(nuevaLeccion);
  } catch (error) {
    console.error("Error al crear la lección:", error);
    res.status(500).json({ error: "Error al crear la lección" });
  }
};

export const obtenerLecciones = async (req, res) => {
  const moduloId = parseInt(req.params.moduloId);

  try {
    const modulo = await prisma.modulo.findUnique({
      where: { id_modulo: moduloId },
    });

    if (!modulo) {
      return res
        .status(404)
        .json({ error: "No se encontró ningún módulo con ese ID" });
    }

    const lecciones = await prisma.leccionCurso.findMany({
      where: { moduloId },
    });

    return res.json(lecciones);
  } catch (error) {
    console.error("Error al obtener las lecciones:", error);
    res.status(500).json({ error: "Error al obtener las lecciones" });
  }
};

export const obtenerLeccion = async (req, res) => {
  const { moduloId, leccionId } = req.params;

  try {
    await prisma.$connect(); // Verifica la conexión
    console.log("Modulo ID:", moduloId, "Leccion ID:", leccionId);

    // Asegúrate de que los parámetros son enteros
    const leccion = await prisma.leccionCurso.findUnique({
      where: {
        // Cambia esto si 'id_leccion_moduloId' no es una clave única en tu modelo
        id_leccion: parseInt(leccionId),
      },
      include: {
        modulo: true, // Si necesitas los detalles del módulo también
      },
    });

    // Verifica que la lección se encontró y que pertenece al módulo especificado
    if (!leccion || leccion.moduloId !== parseInt(moduloId)) {
      return res.status(404).json({
        error:
          "No se encontró ninguna lección con ese ID para el módulo especificado",
      });
    }

    return res.json(leccion);
  } catch (error) {
    console.error("Error al obtener la lección:", error.message);
    return res
      .status(500)
      .json({ error: "Error al obtener la lección", details: error.message });
  } finally {
    await prisma.$disconnect(); // Desconecta después de la consulta
  }
};

export const editLeccion = async (req, res) => {
  const { moduloId, leccionId } = req.params;
  const { nombre_leccion, descripcion_leccion } = req.body;

  try {
    // Verificar si se envían datos para actualizar
    if (!nombre_leccion && !descripcion_leccion) {
      return res.status(400).json({
        error: "Debes proporcionar al menos un campo para actualizar",
      });
    }

    // Convertir leccionId a número
    const leccionIdNumber = parseInt(leccionId);
    const moduloIdNumber = parseInt(moduloId);

    // Verificar si leccionId y moduloId son números válidos
    if (isNaN(leccionIdNumber) || isNaN(moduloIdNumber)) {
      return res.status(400).json({
        error:
          "El ID de la lección y el ID del módulo deben ser números válidos",
      });
    }

    // Verificar si la lección existe y pertenece al módulo
    const leccion = await prisma.leccionCurso.findUnique({
      where: {
        id_leccion: leccionIdNumber,
      },
      include: {
        modulo: true, // Incluye el módulo para verificar
      },
    });

    if (!leccion || leccion.moduloId !== moduloIdNumber) {
      return res.status(404).json({
        error:
          "No se encontró ninguna lección con ese ID para el módulo especificado",
      });
    }

    // Crear un objeto para los datos a actualizar
    const updatedData = {};
    if (nombre_leccion) updatedData.nombre_leccion = nombre_leccion;
    if (descripcion_leccion)
      updatedData.descripcion_leccion = descripcion_leccion;

    // Actualizar la lección
    const leccionActualizada = await prisma.leccionCurso.update({
      where: { id_leccion: leccionIdNumber },
      data: updatedData,
    });

    return res.json(leccionActualizada);
  } catch (error) {
    console.error("Error al modificar la lección:", error);
    res
      .status(500)
      .json({ error: "Error al modificar la lección", details: error.message });
  }
};

export const deleteLeccion = async (req, res) => {
  const { moduloId, leccionId } = req.params;

  try {
    const leccion = await prisma.leccionCurso.findFirst({
      where: {
        id_leccion: parseInt(leccionId),
        moduloId: parseInt(moduloId),
      },
    });

    if (!leccion) {
      return res.status(404).json({
        error:
          "No se encontró ninguna lección con ese ID para el módulo especificado",
      });
    }

    await prisma.leccionCurso.delete({
      where: {
        id_leccion: parseInt(leccionId),
        moduloId: parseInt(moduloId),
      },
    });

    return res.status(204).send();
  } catch (error) {
    console.error("Error al eliminar la lección:", error);
    res.status(500).json({ error: "Error al eliminar la lección" });
  }
};

export const toggleEstadoLeccion = async (req, res) => {
  try {
    const { leccionId } = req.params;
    const { estado_leccion } = req.body;

    // Verificar si la lección existe
    const leccion = await prisma.leccionCurso.findUnique({
      where: {
        id_leccion: parseInt(leccionId),
      },
    });

    if (!leccion) {
      return res.status(404).json({
        error: "No se encontró ninguna lección con ese ID",
      });
    }

    // Actualizar el estado de la lección
    const leccionActualizada = await prisma.leccionCurso.update({
      where: {
        id_leccion: parseInt(leccionId),
      },
      data: {
        estado_leccion: estado_leccion,
      },
    });

    // Resetear el estado de cumplimiento para todos los usuarios que tenían la lección completada
    if (!estado_leccion) {
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
    }

    return res.json({
      success: true,
      data: leccionActualizada,
      message: `Lección ${
        estado_leccion ? "habilitada" : "deshabilitada"
      } correctamente`,
    });
  } catch (error) {
    console.error("Error al cambiar el estado de la lección:", error);
    res.status(500).json({
      error: "Error al cambiar el estado de la lección",
      details: error.message,
    });
  }
};
