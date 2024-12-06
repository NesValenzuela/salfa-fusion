import { Router } from "express";
import {
  asignarCursoAArea,
  deleteAsignacion,
  obtenerAreasCurso,
  obtenerCursosPorArea,
} from "../controllers/cursoAreaCtrl.js";

const router = Router();

// GET
router.get("/api/cursoArea/:id", obtenerAreasCurso);
// router.get('/api/area/', listarAreas)

// POST para asignar áreas a un curso
router.post("/api/cursoArea/:cursoId", asignarCursoAArea);

// PUT
// router.put('/api/area/:id', modificarArea)

// DELETE
router.delete("/api/cursoArea/:id", deleteAsignacion);

// Agregar nueva ruta
router.get("/api/cursoArea/dashboard/:areaId", obtenerCursosPorArea);

export default router;
