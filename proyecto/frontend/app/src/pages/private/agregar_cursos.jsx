import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

const agregar_cursos = () => {
  const [nombreCurso, setNombreCurso] = useState("");
  const [descripcionCurso, setDescripcionCurso] = useState("");
  const [fechaLimite, setFechaLimite] = useState("");
  const navigate = useNavigate(); // Para redirigir después de crear el curso

  // Función para manejar el envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();

    const fechaActual = new Date();
    fechaActual.setHours(fechaActual.getHours() - 3);

    const nuevoCurso = {
      nombre_curso: nombreCurso,
      descripcion_curso: descripcionCurso,
      fecha_creacion: fechaActual.toISOString(), // Usar la fecha ajustada
      fecha_limite: fechaLimite ? new Date(fechaLimite).toISOString() : null,
      estado_curso: false, // Por defecto
    };

    try {
      // Realizar solicitud POST a la API
      const response = await axios.post(
        "http://localhost:4000/cursos",
        nuevoCurso
      );
      console.log("Curso creado:", response.data);

      // Redirigir al listado de cursos
      navigate("/listado-cursos");
    } catch (error) {
      console.error("Error al crear el curso:", error);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4 text-center">
          Crear Nuevo Curso
        </h2>
        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* Nombre del curso */}
          <div>
            <label
              className="block text-sm font-medium text-gray-700 mb-1"
              htmlFor="cursoNombre"
            >
              Nombre del Curso
            </label>
            <input
              type="text"
              id="cursoNombre"
              className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ej. Capacitación Minera"
              value={nombreCurso}
              onChange={(e) => setNombreCurso(e.target.value)} // Actualiza el estado
              required
            />
          </div>

          {/* Descripción del curso */}
          <div>
            <label
              className="block text-sm font-medium text-gray-700 mb-1"
              htmlFor="cursoDescripcion"
            >
              Descripción del Curso
            </label>
            <textarea
              id="cursoDescripcion"
              rows={4}
              className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Descripción del curso aquí..."
              value={descripcionCurso}
              onChange={(e) => setDescripcionCurso(e.target.value)} // Actualiza el estado
              required
            />
          </div>

          {/* Fecha límite */}
          <div>
            <label
              className="block text-sm font-medium text-gray-700 mb-1"
              htmlFor="fechaLimite"
            >
              Fecha Límite (opcional)
            </label>
            <input
              type="date"
              id="fechaLimite"
              className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={fechaLimite}
              onChange={(e) => setFechaLimite(e.target.value)}
              min={new Date().toISOString().split("T")[0]} // Evitar fechas pasadas
            />
          </div>

          {/* Botones de volver y crear */}
          <div className="flex justify-center space-x-2">
            <Link to="/admin-cursos">
              <button
                type="button"
                className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800"
              >
                Volver
              </button>
            </Link>
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Crear Curso
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default agregar_cursos;
