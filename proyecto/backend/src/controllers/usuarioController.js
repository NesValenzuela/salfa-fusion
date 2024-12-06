import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import multer from "multer";
import xlsx from "xlsx";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const prisma = new PrismaClient();
const validarCorreo = (correo) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo);
const validarContrasena = (contrasena) => contrasena.length >= 8;

const validarRUT = (rut) => {
  const rutLimpio = rut.replace(/\./g, "");

  const rutRegex = /^[0-9]+-[0-9Kk]$/;
  if (!rutRegex.test(rutLimpio)) return false;

  const [numeros, digitoVerificador] = rutLimpio.split("-");
  let suma = 0;
  let multiplicador = 2;

  for (let i = numeros.length - 1; i >= 0; i--) {
    suma += parseInt(numeros[i]) * multiplicador;
    multiplicador = multiplicador === 7 ? 2 : multiplicador + 1;
  }

  const dvCalculado = 11 - (suma % 11);
  const dv =
    dvCalculado === 11
      ? "0"
      : dvCalculado === 10
      ? "K"
      : dvCalculado.toString();

  return dv.toUpperCase() === digitoVerificador.toUpperCase();
};

export const login = async (req, res) => {
  const { rut, contrasena } = req.body;

  try {
    const usuario = await prisma.usuario.findUnique({
      where: { rut },
      include: { rol: true },
    });
    if (!usuario || !usuario.activo) {
      return res
        .status(401)
        .json({ error: "Usuario no habilitado o no encontrado" });
    }

    const contrasenaValida = await bcrypt.compare(
      contrasena,
      usuario.contrasena
    );
    if (!contrasenaValida) {
      return res.status(401).json({ error: "Contraseña incorrecta" });
    }

    const token = jwt.sign(
      { rut: usuario.rut, rol: usuario.rol.nombre_rol },
      process.env.JWT_SECRET,
      { expiresIn: "10m" }
    );

    res.json({ token });
  } catch (error) {
    console.error("Error en el login:", error);
    res.status(500).json({ error: "Error en el login" });
  }
};

export const cambiarEstadoUsuario = async (req, res) => {
  const { rut } = req.params;
  const { activo } = req.body;

  try {
    const usuarioModificado = await prisma.usuario.update({
      where: { rut },
      data: { activo },
    });
    res.status(200).json({
      message: `Usuario ${
        activo ? "habilitado" : "deshabilitado"
      } correctamente.`,
    });
  } catch (error) {
    console.error("Error al cambiar el estado del usuario:", error);
    res.status(500).json({ error: "Error al cambiar el estado del usuario" });
  }
};

export const obtenerUsuarios = async (req, res) => {
  try {
    const usuarios = await prisma.usuario.findMany({
      include: {
        rol: true,
        Area: true,
      },
    });
    res.status(200).json(usuarios);
  } catch (error) {
    console.error("Error al obtener usuarios:", error);
    res
      .status(500)
      .json({ error: "Error al obtener usuarios", details: error.message });
  }
};

export const crearUsuario = async (req, res) => {
  const {
    rut,
    nombre,
    apellido_paterno,
    apellido_materno,
    correo,
    contrasena,
    rolId,
    areaId,
  } = req.body;
  // Validación de RUT
  if (!validarRUT(rut)) {
    return res.status(400).json({ error: "RUT inválido" });
  }
  // Validación de correo
  if (!validarCorreo(correo)) {
    return res.status(400).json({
      error:
        "Correo electrónico inválido. Debe seguir el formato: ejemplo@dominio.com",
    });
  }
  // Validación de contraseña
  if (!validarContrasena(contrasena)) {
    return res
      .status(400)
      .json({ error: "La contraseña debe tener al menos 8 caracteres" });
  }
  try {
    // Verificar si el RUT ya está registrado
    const usuarioExistente = await prisma.usuario.findUnique({
      where: { rut },
    });
    if (usuarioExistente) {
      return res.status(400).json({ error: "RUT ya registrado" });
    }
    // Verificar si el correo ya está registrado
    const correoExistente = await prisma.usuario.findUnique({
      where: { correo },
    });
    if (correoExistente) {
      return res.status(400).json({ error: "Correo ya registrado" });
    }
    // Encriptar la contraseña
    const contrasenaEncriptada = await bcrypt.hash(contrasena, 10);
    // Crear el nuevo usuario en la base de datos
    const nuevoUsuario = await prisma.usuario.create({
      data: {
        rut,
        nombre,
        apellido_paterno,
        apellido_materno,
        correo,
        contrasena: contrasenaEncriptada,
        rolId,
        areaId,
      },
    });
    // Responder con el nuevo usuario
    res.status(201).json(nuevoUsuario);
  } catch (error) {
    console.error("Error al crear el usuario:", error);
    res
      .status(500)
      .json({ error: "Error al crear el usuario", details: error.message });
  }
};
// Modificar usuario
export const modificarUsuario = async (req, res) => {
  const { rut } = req.params; // El RUT proviene de los parámetros de la ruta
  const { nombre, apellido_paterno, apellido_materno, correo, contrasena } =
    req.body;
  // Validar que los campos requeridos estén presentes
  if (!nombre || !apellido_paterno || !correo) {
    return res.status(400).json({ error: "Faltan datos requeridos" });
  }
  try {
    const data = {
      nombre,
      apellido_paterno,
      apellido_materno,
      correo,
    };
    if (contrasena) {
      const nuevaContrasenaEncriptada = await bcrypt.hash(contrasena, 10);
      data.contrasena = nuevaContrasenaEncriptada;
    }
    const usuarioModificado = await prisma.usuario.update({
      where: { rut },
      data,
    });
    res.status(200).json(usuarioModificado);
  } catch (error) {
    console.error("Error al modificar el usuario:", error);
    res
      .status(500)
      .json({ error: "Error al modificar el usuario", details: error.message });
  }
};
export const obtenerPerfil = async (req, res) => {
  const { rut } = req.user;
  try {
    const usuario = await prisma.usuario.findUnique({
      where: { rut },
      select: {
        rut: true,
        nombre: true,
        apellido_paterno: true,
        apellido_materno: true,
        correo: true,
        rol: {
          select: {
            nombre_rol: true,
          },
        },
        Area: {
          select: {
            nombre_area: true,
          },
        },
      },
    });

    if (!usuario) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    res.status(200).json(usuario);
  } catch (error) {
    console.error("Error al obtener el perfil:", error);
    res
      .status(500)
      .json({ error: "Error al obtener el perfil", details: error.message });
  }
};
// Actualizar perfil del usuario
export const actualizarPerfil = async (req, res) => {
  const {
    nombre,
    apellido_paterno,
    apellido_materno,
    correo,
    contrasenaNueva,
  } = req.body;
  // Validar que los campos requeridos estén presentes
  if (!nombre || !apellido_paterno || !correo) {
    return res.status(400).json({ error: "Faltan datos requeridos" });
  }
  try {
    // Crea el objeto de datos que será actualizado
    const data = {
      nombre,
      apellido_paterno,
      apellido_materno,
      correo,
    };
    // Si se envía una nueva contraseña, encriptarla y añadirla
    if (contrasenaNueva) {
      const nuevaContrasenaEncriptada = await bcrypt.hash(contrasenaNueva, 10);
      data.contrasena = nuevaContrasenaEncriptada;
    }
    // Actualiza el usuario en la base de datos usando el RUT del token
    const usuarioModificado = await prisma.usuario.update({
      where: { rut: req.user.rut },
      data,
    });
    res.status(200).json(usuarioModificado);
  } catch (error) {
    console.error("Error al actualizar el perfil:", error);
    res
      .status(500)
      .json({ error: "Error al actualizar el perfil", details: error.message });
  }
};
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.resolve(__dirname, "../../uploads"));
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
export const upload = multer({ storage });
export const cargarUsuariosDesdeExcel = async (req, res) => {
  const filePath = req.file.path;
  try {
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(worksheet);
    const usuarios = data.map((row) => {
      if (
        !validarRUT(row.rut) ||
        !validarCorreo(row.correo) ||
        !validarContrasena(row.contrasena)
      ) {
        throw new Error(`Datos inválidos para el usuario: ${row.nombre}`);
      }
      return {
        rut: row.rut,
        nombre: row.nombre,
        apellido_paterno: row.apellido_paterno,
        apellido_materno: row.apellido_materno,
        correo: row.correo,
        contrasena: bcrypt.hashSync(row.contrasena, 10),
        rolId: parseInt(row.rolId),
        areaId: row.areaId ? parseInt(row.areaId) : null,
      };
    });
    const nuevosUsuarios = await prisma.usuario.createMany({
      data: usuarios,
      skipDuplicates: true,
    });
    res
      .status(201)
      .json({ message: "Usuarios creados correctamente", nuevosUsuarios });
  } catch (error) {
    console.error("Error al cargar usuarios desde Excel:", error);
    res.status(500).json({
      error: "Error al cargar usuarios desde Excel",
      details: error.message,
    });
  } finally {
    fs.unlink(filePath, (err) => {
      if (err) console.error("Error al eliminar el archivo:", err);
    });
  }
};

export const refreshToken = async (req, res) => {
  try {
    // El token actual viene en el header de Authorization
    const currentToken = req.headers.authorization?.split(" ")[1];

    if (!currentToken) {
      return res.status(401).json({ message: "No token provided" });
    }

    // Verificar el token actual
    const decoded = jwt.verify(currentToken, process.env.JWT_SECRET);

    // Generar nuevo token con los mismos datos
    const newToken = jwt.sign(
      {
        rut: decoded.rut,
        rol: decoded.rol,
      },
      process.env.JWT_SECRET,
      { expiresIn: "10m" }
    );

    res.json({ token: newToken });
  } catch (error) {
    console.error("Error refreshing token:", error);
    res.status(401).json({ message: "Invalid token" });
  }
};
