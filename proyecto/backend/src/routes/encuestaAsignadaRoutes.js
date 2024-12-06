// src/routes/encuestaAsignadaRoutes.js
import express from 'express';
import { asignarEncuesta, obtenerEncuestasAsignadas, obtenerPreguntasDeEncuestaAsignada, obtenerCompletitudEncuesta } from '../controllers/encuestaAsignadaController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/asignar', asignarEncuesta);
router.get('/misEncuestas', authMiddleware, obtenerEncuestasAsignadas);
router.get('/:encuestaId/preguntas', authMiddleware, obtenerPreguntasDeEncuestaAsignada);
router.get('/:encuestaId/completitud', authMiddleware, obtenerCompletitudEncuesta);

export default router;
