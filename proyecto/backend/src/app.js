import express from "express";
import cors from "cors";
import encuestaRoutes from "./routes/encuestaRoutes.js";
import usuarioRoutes from "./routes/usuarioRoutes.js"; // Asegúrate de tener estas rutas
import rolRoutes from "./routes/rolRoutes.js";
import rolRouter from "./routes/rol.routes.js";
import areaRoutes from "./routes/areaRoutes.js";
import preguntaRoutes from "./routes/preguntaRoutes.js";
import encuestaAsignadaRoutes from "./routes/encuestaAsignadaRoutes.js";
import respuestaRoutes from "./routes/respuestaRoutes.js";
import statsRoutes from "./routes/statsRoutes.js";
import cursoRouter from "./routes/curso.routes.js";
import usuarioRouter from "./routes/usuario.routes.js";
import moduloRouter from "./routes/modulo.routes.js";
import leccionRouter from "./routes/leccionCurso.routes.js";
import areaRouter from "./routes/areaRoutes.js";
import cursoAreaRouter from "./routes/cursoArea.routes.js";
import cumplimientoLeccionRouter from "./routes/cumplimientoLeccion.routes.js";
import contenidoRouter from "./routes/contenido.routes.js";
import path from "path";
import { fileURLToPath } from "url";
//import rolRouter from "./routes/rol.routes.js";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Configurar middleware para servir archivos estáticos
app.use("/uploads", express.static(path.join(__dirname, "../public/uploads")));

// Configurar CORS
app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
    preflightContinue: true,
    optionsSuccessStatus: 200,
  })
);
app.options("*", cors());

app.use(express.json());

// Rutas para encuestas
app.use("/api/encuestas", encuestaRoutes); // Prefijo específico para encuestas
// Rutas para usuarios
app.use("/api/usuarios", usuarioRoutes); // Prefijo específico para usuarios
// Rutas para roles
app.use("/api/roles", rolRoutes);
app.use("/api/areas", areaRoutes);
app.use("/api/preguntas", preguntaRoutes);
app.use("/api/auth", usuarioRoutes);
app.use("/api/encuestasAsignada", encuestaAsignadaRoutes);
app.use("/api/respuestas", respuestaRoutes);
app.use("/api/stats", statsRoutes); // Nueva ruta para estadísticas

// Rutas para capacitaciones
app.use(usuarioRouter);
app.use(cursoRouter);
app.use(moduloRouter);
app.use(leccionRouter);
app.use(areaRouter);
app.use(cursoAreaRouter);
app.use(cumplimientoLeccionRouter);
app.use(contenidoRouter);
app.use(rolRouter);

const PORT = process.env.PORT || 4000; // Cambia esto a 4000

app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});
