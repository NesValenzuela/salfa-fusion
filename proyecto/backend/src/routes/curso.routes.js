import { Router } from "express";

import {
  crearcursos,
  obtenerCursos,
  obtenerCurso,
  deleteCurso,
  editCurso,
  obtenerCursosUsuario,
  obtenerCursosNoUsuario,
  obtenerCursoEstructura,
  obtenerEstadisticasCursos,
  cargarImagenesCursos,
  habilitarCurso,
  obtenerUsuariosCurso,
} from "../controllers/cursoCtrl.js";

const router = Router();
//GET
router.get("/cursos", obtenerCursos);
router.get("/cursos/:id", obtenerCurso);
router.get("/api/cursosUsuario/:usuarioId", obtenerCursosUsuario);
router.get("/api/cursosNoUsuario/:usuarioId", obtenerCursosNoUsuario);
router.get("/api/cursoEstructura/:id", obtenerCursoEstructura);
router.get("/api/cursos/estadisticas", obtenerEstadisticasCursos);
router.get("/api/curso/:id/usuarios", obtenerUsuariosCurso);

//POST
router.post("/cursos", crearcursos);
router.post("/api/cursos/imagenes", cargarImagenesCursos);

//PUT
router.put("/cursos/:id", editCurso);
router.put("/api/curso/:id/habilitar", habilitarCurso);

//DELETE
router.delete("/cursos/:id", deleteCurso);

export default router;
