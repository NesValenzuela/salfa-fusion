import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const listarRoles = async (req, res) => {
  try {
    const roles = await prisma.rol.findMany();
    res.json(roles);
  } catch (error) {
    console.log("Error al Listar los Roles");
    res.status(500).json({ error: error.message });
  }
};
