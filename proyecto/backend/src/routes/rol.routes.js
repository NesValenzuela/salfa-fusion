import { Router } from "express";
import { listarRoles } from "../controllers/rolCtrl.js";

const router = Router();

router.get("/api/rol/", listarRoles);

export default router;
