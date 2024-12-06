// src/controllers/rolController.js
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// Obtener todos los roles
export const obtenerRoles = async (req, res) => {
  try {
    const roles = await prisma.rol.findMany(); // Obtener todos los roles
    res.status(200).json(roles);
  } catch (error) {
    console.error("Error al obtener los roles:", error);
    res
      .status(500)
      .json({ error: "Error al obtener los roles", details: error.message });
  }
};

// Crear un nuevo rol
export const crearRol = async (req, res) => {
  const { nombre_rol } = req.body;

  // Validar que el campo esté presente
  if (!nombre_rol) {
    return res.status(400).json({ error: "Faltan datos requeridos" });
  }

  try {
    const nuevoRol = await prisma.rol.create({
      data: {
        nombre_rol, // Solo se incluye nombre_rol
      },
    });
    res.status(201).json(nuevoRol);
  } catch (error) {
    console.error("Error al crear el rol:", error);
    res
      .status(500)
      .json({ error: "Error al crear el rol", details: error.message });
  }
};

// Actualizar un rol existente
export const actualizarRol = async (req, res) => {
  const { id } = req.params;
  const { nombre_rol } = req.body;

  // Validar que el campo esté presente
  if (!nombre_rol) {
    return res.status(400).json({ error: "Faltan datos requeridos" });
  }

  try {
    const rolActualizado = await prisma.rol.update({
      where: { id_rol: parseInt(id) },
      data: { nombre_rol },
    });
    res.json(rolActualizado);
  } catch (error) {
    console.error("Error al actualizar el rol:", error);
    res.status(500).json({ error: "Error al actualizar el rol" });
  }
};
