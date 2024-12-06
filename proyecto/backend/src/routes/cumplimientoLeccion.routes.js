import { Router } from "express";

import {
    obtenerLeccionesPorUsuario
} from "../controllers/cumplimientoLeccionCtrl.js";

const router = Router();
//GET
router.get("/api/cumplimientoLeccion/:usuarioid", obtenerLeccionesPorUsuario);

//POST
// router.post("/cumplimientoLeccion", );

//PUT
// router.put("/cumplimientoLeccion/:id",);

//DELETE
// router.delete("/cumplimientoLeccion/:id",);

export default router;
