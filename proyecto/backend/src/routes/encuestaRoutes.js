import { Router } from 'express';
import {
  crearEncuesta,
  obtenerEncuestas,
  actualizarEncuesta,
  deshabilitarEncuesta,
  obtenerEncuestaPorId,
  obtenerDetallesEncuesta,
} from '../controllers/encuestaController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import verificarToken from '../middleware/verificarToken.js';

const router = Router();

// Rutas protegidas con autenticación general
// router.use(authMiddleware); 
router.post('/',  crearEncuesta);
router.put('/:id', actualizarEncuesta);
router.put('/deshabilitar/:id', deshabilitarEncuesta);
router.get('/', obtenerEncuestas);
router.get('/:id', obtenerEncuestaPorId);
router.get('/:encuestaId/detalles', obtenerDetallesEncuesta);
export default router;
