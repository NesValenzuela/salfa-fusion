-- CreateTable
CREATE TABLE "CursoCapacitacion" (
    "id_curso" SERIAL NOT NULL,
    "nombre_curso" VARCHAR(50) NOT NULL,
    "descripcion_curso" VARCHAR(500) NOT NULL,
    "fecha_creacion" TIMESTAMP(3) NOT NULL,
    "fecha_limite" TIMESTAMP(3),
    "estado_curso" BOOLEAN NOT NULL,

    CONSTRAINT "CursoCapacitacion_pkey" PRIMARY KEY ("id_curso")
);

-- CreateTable
CREATE TABLE "Modulo" (
    "id_modulo" SERIAL NOT NULL,
    "nombre_modulo" VARCHAR(50) NOT NULL,
    "descripcion_modulo" VARCHAR(500) NOT NULL,
    "cursoId" INTEGER NOT NULL,
    "estado_modulo" BOOLEAN NOT NULL,

    CONSTRAINT "Modulo_pkey" PRIMARY KEY ("id_modulo")
);

-- CreateTable
CREATE TABLE "LeccionCurso" (
    "id_leccion" SERIAL NOT NULL,
    "nombre_leccion" VARCHAR(50) NOT NULL,
    "descripcion_leccion" VARCHAR(500) NOT NULL,
    "fecha_de_creacion_leccion" TIMESTAMP(3) NOT NULL,
    "estado_leccion" BOOLEAN NOT NULL,
    "moduloId" INTEGER NOT NULL,

    CONSTRAINT "LeccionCurso_pkey" PRIMARY KEY ("id_leccion")
);

-- CreateTable
CREATE TABLE "Contenido" (
    "id_contenido" SERIAL NOT NULL,
    "nombre_archivo" VARCHAR(50) NOT NULL,
    "indice_archivo" INTEGER NOT NULL,
    "url" VARCHAR(2048) NOT NULL,
    "tipo_contenido" VARCHAR(50) NOT NULL,
    "leccionId" INTEGER NOT NULL,

    CONSTRAINT "Contenido_pkey" PRIMARY KEY ("id_contenido")
);

-- CreateTable
CREATE TABLE "Usuario" (
    "rut" VARCHAR(13) NOT NULL,
    "nombre" VARCHAR(50) NOT NULL,
    "apellido_paterno" VARCHAR(50) NOT NULL,
    "apellido_materno" VARCHAR(50),
    "correo" VARCHAR(60) NOT NULL,
    "contrasena" TEXT NOT NULL,
    "rolId" INTEGER NOT NULL,
    "areaId" INTEGER,
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("rut")
);

-- CreateTable
CREATE TABLE "CursoAsignado" (
    "fecha_asignacion" TIMESTAMP(3) NOT NULL,
    "fecha_acceso" TIMESTAMP(3),
    "cursoId" INTEGER NOT NULL,
    "usuarioId" VARCHAR(13) NOT NULL,

    CONSTRAINT "CursoAsignado_pkey" PRIMARY KEY ("cursoId","usuarioId")
);

-- CreateTable
CREATE TABLE "Cumplimiento_leccion" (
    "usuarioId" VARCHAR(13) NOT NULL,
    "fecha_modificacion_estado" TIMESTAMP(3),
    "estado" BOOLEAN NOT NULL,
    "leccionId" INTEGER NOT NULL,

    CONSTRAINT "Cumplimiento_leccion_pkey" PRIMARY KEY ("usuarioId","leccionId")
);

-- CreateTable
CREATE TABLE "Area" (
    "id_area" SERIAL NOT NULL,
    "nombre_area" VARCHAR(50) NOT NULL,
    "imagen" BYTEA,

    CONSTRAINT "Area_pkey" PRIMARY KEY ("id_area")
);

-- CreateTable
CREATE TABLE "CursoArea" (
    "id_curso" INTEGER NOT NULL,
    "id_area" INTEGER NOT NULL,

    CONSTRAINT "CursoArea_pkey" PRIMARY KEY ("id_curso","id_area")
);

-- CreateTable
CREATE TABLE "Rol" (
    "id_rol" SERIAL NOT NULL,
    "nombre_rol" VARCHAR(30) NOT NULL,

    CONSTRAINT "Rol_pkey" PRIMARY KEY ("id_rol")
);

-- CreateTable
CREATE TABLE "RegistroVisualizacionContenido" (
    "id_visualizacion" SERIAL NOT NULL,
    "usuarioId" VARCHAR(13) NOT NULL,
    "contenidoId" INTEGER NOT NULL,
    "leccionId" INTEGER NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RegistroVisualizacionContenido_pkey" PRIMARY KEY ("id_visualizacion")
);

-- CreateTable
CREATE TABLE "Encuesta" (
    "id_encuesta" SERIAL NOT NULL,
    "titulo" TEXT NOT NULL,
    "fecha_creacion" TIMESTAMP(3) NOT NULL,
    "estado_encuesta" TEXT NOT NULL,

    CONSTRAINT "Encuesta_pkey" PRIMARY KEY ("id_encuesta")
);

-- CreateTable
CREATE TABLE "EncuestaAsignada" (
    "id_asignacion" SERIAL NOT NULL,
    "estado" TEXT NOT NULL,
    "fecha_asignacion" TIMESTAMP(3) NOT NULL,
    "encuestaId" INTEGER NOT NULL,
    "usuarioId" TEXT NOT NULL,

    CONSTRAINT "EncuestaAsignada_pkey" PRIMARY KEY ("id_asignacion")
);

-- CreateTable
CREATE TABLE "Pregunta" (
    "id_pregunta" SERIAL NOT NULL,
    "texto_pregunta" TEXT NOT NULL,
    "tipo_respuesta" TEXT NOT NULL,
    "encuestaId" INTEGER NOT NULL,

    CONSTRAINT "Pregunta_pkey" PRIMARY KEY ("id_pregunta")
);

-- CreateTable
CREATE TABLE "OpcionRespuesta" (
    "id_opcion" SERIAL NOT NULL,
    "texto_opcion" TEXT NOT NULL,
    "preguntaId" INTEGER NOT NULL,

    CONSTRAINT "OpcionRespuesta_pkey" PRIMARY KEY ("id_opcion")
);

-- CreateTable
CREATE TABLE "Respuesta" (
    "id_respuesta" SERIAL NOT NULL,
    "texto_respuesta" TEXT,
    "fecha_respuesta" TIMESTAMP(3) NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "opcionId" INTEGER,
    "preguntaId_pregunta" INTEGER,

    CONSTRAINT "Respuesta_pkey" PRIMARY KEY ("id_respuesta")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_correo_key" ON "Usuario"("correo");

-- CreateIndex
CREATE UNIQUE INDEX "Respuesta_usuarioId_preguntaId_pregunta_key" ON "Respuesta"("usuarioId", "preguntaId_pregunta");

-- AddForeignKey
ALTER TABLE "Modulo" ADD CONSTRAINT "Modulo_cursoId_fkey" FOREIGN KEY ("cursoId") REFERENCES "CursoCapacitacion"("id_curso") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeccionCurso" ADD CONSTRAINT "LeccionCurso_moduloId_fkey" FOREIGN KEY ("moduloId") REFERENCES "Modulo"("id_modulo") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contenido" ADD CONSTRAINT "Contenido_leccionId_fkey" FOREIGN KEY ("leccionId") REFERENCES "LeccionCurso"("id_leccion") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Usuario" ADD CONSTRAINT "Usuario_rolId_fkey" FOREIGN KEY ("rolId") REFERENCES "Rol"("id_rol") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Usuario" ADD CONSTRAINT "Usuario_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "Area"("id_area") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CursoAsignado" ADD CONSTRAINT "CursoAsignado_cursoId_fkey" FOREIGN KEY ("cursoId") REFERENCES "CursoCapacitacion"("id_curso") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CursoAsignado" ADD CONSTRAINT "CursoAsignado_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("rut") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cumplimiento_leccion" ADD CONSTRAINT "Cumplimiento_leccion_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("rut") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cumplimiento_leccion" ADD CONSTRAINT "Cumplimiento_leccion_leccionId_fkey" FOREIGN KEY ("leccionId") REFERENCES "LeccionCurso"("id_leccion") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CursoArea" ADD CONSTRAINT "CursoArea_id_curso_fkey" FOREIGN KEY ("id_curso") REFERENCES "CursoCapacitacion"("id_curso") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CursoArea" ADD CONSTRAINT "CursoArea_id_area_fkey" FOREIGN KEY ("id_area") REFERENCES "Area"("id_area") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegistroVisualizacionContenido" ADD CONSTRAINT "RegistroVisualizacionContenido_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("rut") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegistroVisualizacionContenido" ADD CONSTRAINT "RegistroVisualizacionContenido_contenidoId_fkey" FOREIGN KEY ("contenidoId") REFERENCES "Contenido"("id_contenido") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegistroVisualizacionContenido" ADD CONSTRAINT "RegistroVisualizacionContenido_leccionId_fkey" FOREIGN KEY ("leccionId") REFERENCES "LeccionCurso"("id_leccion") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EncuestaAsignada" ADD CONSTRAINT "EncuestaAsignada_encuestaId_fkey" FOREIGN KEY ("encuestaId") REFERENCES "Encuesta"("id_encuesta") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EncuestaAsignada" ADD CONSTRAINT "EncuestaAsignada_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("rut") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pregunta" ADD CONSTRAINT "Pregunta_encuestaId_fkey" FOREIGN KEY ("encuestaId") REFERENCES "Encuesta"("id_encuesta") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OpcionRespuesta" ADD CONSTRAINT "OpcionRespuesta_preguntaId_fkey" FOREIGN KEY ("preguntaId") REFERENCES "Pregunta"("id_pregunta") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Respuesta" ADD CONSTRAINT "Respuesta_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("rut") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Respuesta" ADD CONSTRAINT "Respuesta_opcionId_fkey" FOREIGN KEY ("opcionId") REFERENCES "OpcionRespuesta"("id_opcion") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Respuesta" ADD CONSTRAINT "Respuesta_preguntaId_pregunta_fkey" FOREIGN KEY ("preguntaId_pregunta") REFERENCES "Pregunta"("id_pregunta") ON DELETE SET NULL ON UPDATE CASCADE;
