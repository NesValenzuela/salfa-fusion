import express from "express";
import {
  uploadFile,
  getContenidoByLeccion,
  viewFile,
  renameFile,
  deleteFile,
  reorderContenido,
  registrarVisualizacion,
  getRegistrosVisualizacion,
} from "../controllers/contenidoCtrl.js";
import fileUpload from "express-fileupload";

const router = express.Router();

router.post(
  "/api/contenido/upload",
  fileUpload({
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB límite
    abortOnLimit: true,
  }),
  uploadFile
);

router.get("/api/contenido/leccion/:leccionId", getContenidoByLeccion);

// Ruta para ver archivos
router.get("/api/contenido/view/:fileName", viewFile);

router.put("/api/contenido/:id_contenido/rename", renameFile);

router.delete("/api/contenido/:id_contenido", deleteFile);

router.put("/api/contenido/reorder", reorderContenido);

router.post("/api/contenido/registrar-visualizacion", registrarVisualizacion);

router.get(
  "/api/contenido/registros-visualizacion/:cursoId/:userId",
  getRegistrosVisualizacion
);

export default router;
