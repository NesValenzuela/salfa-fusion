import { Router } from "express";

import {
  //login,
  //refreshToken,
  obtenerUsuarios,
  getUserInfo,
  //crearUsuario,
  obtenerUsuarioYCursos,
  usuarioConCursosYLecciones,
  //toggleEstadoUsuario,
  actualizarUsuario,
  crearUsuariosBulk,
  eliminarUsuarios,
} from "../controllers/usuarioCtrl.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = Router();
// GET //usamos verifyToken para proteger los endpoint
router.get("/user-info", authMiddleware, getUserInfo); //en uso
router.get("/api/usuarios/all", obtenerUsuarios);
router.get("/api/usuario/:id", obtenerUsuarioYCursos);
router.get("/api/usuarioLecciones/:id", usuarioConCursosYLecciones);

// POST
//router.post("/newuser", verifyToken, crearUsuario);

//router.post("/api/login", login); //en uso
//router.post("/api/refresh-token", refreshToken); //en uso

// PUT
//router.put("/api/usuarios/toggle-estado", authMiddleware, toggleEstadoUsuario); //en uso
router.put("/api/usuarios/:rut", authMiddleware, actualizarUsuario); //?
// POST
router.post("/api/usuarios/bulk", authMiddleware, crearUsuariosBulk);

// DELETE
router.delete("/api/usuarios/eliminar", authMiddleware, eliminarUsuarios);

export default router;
