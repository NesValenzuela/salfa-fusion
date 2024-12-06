import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const crearModulo = async (req, res) => {
  const { nombre_modulo, descripcion_modulo } = req.body;

  try {
    const cursoId = parseInt(req.params.id); // Obtenemos el ID del curso desde la URL

    // Verificamos si el curso existe
    const curso = await prisma.cursoCapacitacion.findUnique({
      where: { id_curso: cursoId },
    });

    if (!curso) {
      return res.status(404).json({ error: "No hay ningún curso con ese ID" });
    }

    // Crear el módulo asociado al curso
    const newModulo = await prisma.modulo.create({
      data: {
        nombre_modulo,
        descripcion_modulo,
        cursoId, // Asociamos el módulo al curso usando el cursoId
        estado_modulo: true,
      },
    });

    return res.json(newModulo);
  } catch (error) {
    console.error("Error al crear el módulo:", error);
    res.status(500).json({ error: "Error al crear el módulo" });
  }
};

export const obtenerMobulos = async (req, res) => {
  const cursoId = parseInt(req.params.id); // Obtenemos el ID del curso desde la URL

  try {
    // Verificamos si el curso existe
    const curso = await prisma.cursoCapacitacion.findUnique({
      where: { id_curso: cursoId },
    });

    if (!curso) {
      return res.status(404).json({ error: "No hay ningún curso con ese ID" });
    }

    // Obtener los módulos asociados al curso
    const modulos = await prisma.modulo.findMany({
      where: { cursoId }, // Filtrar por el ID del curso
    });

    return res.json(modulos); // Devolver la lista de módulos
  } catch (error) {
    console.error("Error al obtener los módulos:", error);
    res.status(500).json({ error: "Error al obtener los módulos" });
  }
};

export const obtenerMobulo = async (req, res) => {
  const { cursoId, moduloId } = req.params; // Obtenemos los IDs del curso y del módulo desde la URL

  try {
    // Verificamos si el curso existe
    const curso = await prisma.cursoCapacitacion.findUnique({
      where: { id_curso: parseInt(cursoId) },
    });

    if (!curso) {
      return res.status(404).json({ error: "No hay ningún curso con ese ID" });
    }

    // Obtener el módulo específico asociado al curso
    const modulo = await prisma.modulo.findUnique({
      where: {
        id_modulo: parseInt(moduloId),
      },
    });

    // Verificar si el módulo existe y pertenece al curso
    if (!modulo || modulo.cursoId !== parseInt(cursoId)) {
      return res.status(404).json({
        error: "No hay ningún módulo con ese ID para el curso especificado",
      });
    }

    return res.json(modulo); // Devolver el módulo específico
  } catch (error) {
    console.error("Error al obtener el módulo:", error);
    res.status(500).json({ error: "Error al obtener el módulo" });
  }
};

export const editMobulo = async (req, res) => {
  const { cursoId, moduloId } = req.params; // Obtenemos los IDs del curso y del módulo desde la URL
  const { nombre_modulo, descripcion_modulo } = req.body; // Obtenemos los datos del cuerpo de la solicitud

  try {
    // Verificamos si el curso existe
    const curso = await prisma.cursoCapacitacion.findUnique({
      where: { id_curso: parseInt(cursoId) },
    });

    if (!curso) {
      return res.status(404).json({ error: "No hay ningún curso con ese ID" });
    }

    // Verificamos si el módulo existe
    const modulo = await prisma.modulo.findUnique({
      where: { id_modulo: parseInt(moduloId) },
    });

    if (!modulo) {
      return res.status(404).json({ error: "No hay ningún módulo con ese ID" });
    }

    // Actualizamos el módulo
    const updatedModulo = await prisma.modulo.update({
      where: { id_modulo: parseInt(moduloId) },
      data: {
        nombre_modulo:
          nombre_modulo !== undefined ? nombre_modulo : modulo.nombre_modulo,
        descripcion_modulo:
          descripcion_modulo !== undefined
            ? descripcion_modulo
            : modulo.descripcion_modulo,
        cursoId: parseInt(cursoId), // Asociamos el módulo al curso usando el cursoId
      },
    });

    return res.json(updatedModulo); // Devolver el módulo actualizado
  } catch (error) {
    console.error("Error al modificar el módulo:", error);
    res.status(500).json({ error: "Error al modificar el módulo" });
  }
};

export const deleteMobulo = async (req, res) => {
  const { cursoId, moduloId } = req.params; // Obtenemos los IDs del curso y del módulo desde la URL

  try {
    // Verificamos si el curso existe
    const curso = await prisma.cursoCapacitacion.findUnique({
      where: { id_curso: parseInt(cursoId) },
    });

    if (!curso) {
      return res.status(404).json({ error: "No hay ningún curso con ese ID" });
    }

    // Verificamos si el módulo existe
    const modulo = await prisma.modulo.findUnique({
      where: { id_modulo: parseInt(moduloId) },
    });

    if (!modulo) {
      return res.status(404).json({ error: "No hay ningún módulo con ese ID" });
    }

    // Eliminamos el módulo
    await prisma.modulo.delete({
      where: { id_modulo: parseInt(moduloId) },
    });

    return res.status(204).send(); // Devolver un estado 204 No Content al eliminar con éxito
  } catch (error) {
    console.error("Error al eliminar el módulo:", error);
    res.status(500).json({ error: "Error al eliminar el módulo" });
  }
};

export const actualizarModulo = async (req, res) => {
  try {
    const { moduloId } = req.params;
    const { estado_modulo } = req.body;

    // Primero buscamos el módulo actual
    const moduloExistente = await prisma.modulo.findUnique({
      where: { id_modulo: parseInt(moduloId) },
    });

    if (!moduloExistente) {
      return res.status(404).json({ error: "Módulo no encontrado" });
    }

    // Actualizamos solo si el estado es diferente
    if (moduloExistente.estado_modulo !== estado_modulo) {
      const moduloActualizado = await prisma.modulo.update({
        where: { id_modulo: parseInt(moduloId) },
        data: { estado_modulo },
      });
      return res.json(moduloActualizado);
    }

    return res.json(moduloExistente);
  } catch (error) {
    console.error("Error al actualizar módulo:", error);
    res.status(500).json({ mensaje: "Error al actualizar el módulo" });
  }
};
