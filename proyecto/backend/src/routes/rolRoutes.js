// src/routes/rolRoutes.js
import express from "express";
import {
  obtenerRoles,
  crearRol,
  actualizarRol,
} from "../controllers/rolController.js";

const router = express.Router();

// Obtener todos los roles
router.get("/", obtenerRoles);

// Crear un nuevo rol
router.post("/", crearRol);

// Actualizar un rol existente
router.put("/:id", actualizarRol);

export default router;
