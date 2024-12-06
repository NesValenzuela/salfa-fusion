import { Router } from "express";
import {
  crearModulo,
  obtenerMobulos,
  obtenerMobulo,
  editMobulo,
  deleteMobulo,
  actualizarModulo,
} from "../controllers/moduloCtrl.js";

const router = Router();

// GET
// Endpoint para obtener todos los módulos de un curso existente
router.get("/cursos/:id/modulos", obtenerMobulos);
// Endpoint para obtener un módulo específico de un curso
router.get("/cursos/:cursoId/modulos/:moduloId", obtenerMobulo);

//POST
router.post("/cursos/:id/modulos", crearModulo);

//PUT
// Endpoint para modificar un módulo existente
router.put("/cursos/:cursoId/modulos/:moduloId", editMobulo);

//PUT
router.put("/modulos/:moduloId", actualizarModulo);

//DELETE
// Endpoint para eliminar un módulo específico de un curso
router.delete("/cursos/:cursoId/modulos/:moduloId", deleteMobulo);

export default router;
