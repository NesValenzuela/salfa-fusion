import { Router } from "express";
import {
  obtenerAreas,
  crearArea,
  actualizarArea,
  crearArea_capacitaciones,
  upload,
  obtenerImagenArea,
  listarArea,
  listarAreas,
  modificarArea,
  eliminarArea,
  obtenerUsuariosPorArea,
} from "../controllers/areaController.js";

const router = Router();

// Rutas
router.get("/", obtenerAreas); // Obtener todas las áreas
router.post("/", crearArea); // Crear una nueva área
router.put("/:id", actualizarArea); // Actualizar un área existente

//salfa capacitaciones
// GET
router.get("/api/area/:id", listarArea);
router.get("/api/area/", listarAreas);
router.get("/api/area/imagen/:id", obtenerImagenArea);
router.get("/api/area/:id_area/usuarios", obtenerUsuariosPorArea);

// POST
router.post("/api/area/", upload, crearArea_capacitaciones);

// PUT
router.put("/api/area/:id", modificarArea);
router.put("/api/area/:id", upload, modificarArea);

// DELETE
router.delete("/api/area/:id", eliminarArea);

export default router;
