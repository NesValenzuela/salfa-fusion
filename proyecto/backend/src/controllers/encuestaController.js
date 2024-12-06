import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// Obtener todas las encuestas
export const obtenerEncuestas = async (req, res) => {
  try {
    const encuestas = await prisma.encuesta.findMany(); // Esto obtiene todas las encuestas
    res.status(200).json(encuestas);
  } catch (error) {
    console.error("Error al obtener las encuestas:", error);
    res.status(500).json({
      error: "Error al obtener las encuestas",
      details: error.message,
    });
  }
};

// Crear una nueva encuesta con estado predeterminado: "Deshabilitada"
export const crearEncuesta = async (req, res) => {
  const { titulo, fecha_creacion } = req.body;

  if (!titulo || !fecha_creacion) {
    return res.status(400).json({ error: "Faltan datos requeridos" });
  }

  const fechaValida = new Date(fecha_creacion + "T00:00:00Z");
  try {
    const nuevaEncuesta = await prisma.encuesta.create({
      data: {
        titulo,
        estado_encuesta: "Deshabilitada", // Estado predeterminado
        fecha_creacion: fechaValida,
      },
    });
    res.status(201).json(nuevaEncuesta);
  } catch (error) {
    console.error("Error al crear la encuesta:", error);
    res
      .status(500)
      .json({ error: "Error al crear la encuesta", details: error.message });
  }
};

// Actualizar una encuesta existente
export const actualizarEncuesta = async (req, res) => {
  const { id } = req.params;
  const { titulo, estado_encuesta } = req.body;

  try {
    const encuestaActualizada = await prisma.encuesta.update({
      where: { id_encuesta: parseInt(id) },
      data: { titulo, estado_encuesta },
    });
    res.json(encuestaActualizada);
  } catch (error) {
    res.status(500).json({
      error: "Error al actualizar la encuesta",
      details: error.message,
    });
  }
};

// Cambiar estado de una encuesta (Habilitar/Deshabilitar)
export const deshabilitarEncuesta = async (req, res) => {
  const { id } = req.params;

  try {
    const encuesta = await prisma.encuesta.findUnique({
      where: { id_encuesta: Number(id) },
    });

    if (!encuesta) {
      return res.status(404).json({ error: "Encuesta no encontrada" });
    }

    const nuevoEstado =
      encuesta.estado_encuesta === "Habilitada"
        ? "Deshabilitada"
        : "Habilitada";

    const encuestaActualizada = await prisma.encuesta.update({
      where: { id_encuesta: Number(id) },
      data: { estado_encuesta: nuevoEstado },
    });

    res.status(200).json(encuestaActualizada);
  } catch (error) {
    console.error("Error al cambiar el estado de la encuesta:", error);
    res.status(500).json({
      error: "Error al cambiar el estado de la encuesta",
      details: error.message,
    });
  }
};

// Obtener una encuesta por su ID
export const obtenerEncuestaPorId = async (req, res) => {
  const { id } = req.params;

  try {
    const encuesta = await prisma.encuesta.findUnique({
      where: { id_encuesta: parseInt(id) },
      include: { preguntas: true }, // Incluye las preguntas si deseas obtenerlas junto con la encuesta
    });

    if (!encuesta) {
      return res.status(404).json({ error: "Encuesta no encontrada" });
    }

    res.status(200).json(encuesta);
  } catch (error) {
    console.error("Error al obtener la encuesta:", error);
    res
      .status(500)
      .json({ error: "Error al obtener la encuesta", details: error.message });
  }
};

// Obtener detalles de una encuesta (incluye respuestas, preguntas y usuarios)
export const obtenerDetallesEncuesta = async (req, res) => {
  const { encuestaId } = req.params;

  try {
    const encuesta = await prisma.encuesta.findUnique({
      where: { id_encuesta: parseInt(encuestaId) },
      include: {
        preguntas: {
          include: {
            respuestas: {
              include: {
                usuario: {
                  select: {
                    rut: true,
                    nombre: true,
                    apellido_paterno: true,
                    apellido_materno: true,
                  },
                },
                opcion: {
                  select: {
                    texto_opcion: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!encuesta) {
      return res.status(404).json({ error: "Encuesta no encontrada" });
    }

    res.status(200).json(encuesta);
  } catch (error) {
    console.error("Error al obtener detalles de la encuesta:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};
