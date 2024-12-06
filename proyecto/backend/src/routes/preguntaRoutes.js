import { Router } from 'express';
import { crearPregunta, obtenerPreguntasPorEncuesta, eliminarPregunta, actualizarPregunta  } from '../controllers/preguntaController.js';

const router = Router();

router.post('/', crearPregunta); // Crear una nueva pregunta y asignarla a una encuesta
router.get('/:encuestaId', obtenerPreguntasPorEncuesta); // Obtener todas las preguntas de una encuesta

router.delete('/:id', eliminarPregunta);

router.put('/:id', actualizarPregunta);
export default router;
