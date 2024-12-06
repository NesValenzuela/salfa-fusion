// src/routes/usuarioRoutes.js
import express from "express";
import {
  obtenerUsuarios,
  crearUsuario,
  modificarUsuario,
  login,
  cargarUsuariosDesdeExcel,
  upload,
  cambiarEstadoUsuario,
  obtenerPerfil,
  actualizarPerfil,
  refreshToken,
} from "../controllers/usuarioController.js";
import verificarToken from "../middleware/verificarToken.js";
import authMiddleware from "../middleware/authMiddleware.js";
const router = express.Router();

// Obtener todos los usuarios
router.get("/", obtenerUsuarios);
// Crear un nuevo usuario
router.post("/", crearUsuario);
// Modificar un usuario existente
router.put("/:rut", modificarUsuario);
router.post("/login", login);
router.post("/cargar-excel", upload.single("file"), cargarUsuariosDesdeExcel);
router.get("/perfil", authMiddleware, obtenerPerfil);
router.patch("/:rut/cambiar-estado", cambiarEstadoUsuario);
router.put("/actualizar-perfil", authMiddleware, actualizarPerfil);
router.post("/refresh-token", refreshToken);

export default router;
