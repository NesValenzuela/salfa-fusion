import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate, useParams } from "react-router-dom";

const Modificar_curso = () => {
  const { id } = useParams();
  const [nombreCurso, setNombreCurso] = useState("");
  const [descripcionCurso, setDescripcionCurso] = useState("");
  const [fechaLimite, setFechaLimite] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCurso = async () => {
      try {
        const response = await axios.get(`http://localhost:4000/cursos/${id}`);
        const curso = response.data;

        setNombreCurso(curso.nombre_curso);
        setDescripcionCurso(curso.descripcion_curso);
        setFechaLimite(
          curso.fecha_limite ? curso.fecha_limite.split("T")[0] : ""
        );
      } catch (error) {
        setError("Error al obtener el curso. Por favor, intenta nuevamente.");
        console.error("Error al obtener el curso:", error);
      }
    };

    fetchCurso();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const cursoModificado = {
      nombre_curso: nombreCurso,
      descripcion_curso: descripcionCurso,
      fecha_limite: fechaLimite ? new Date(fechaLimite).toISOString() : null,
    };

    try {
      setLoading(true);
      const response = await axios.put(
        `http://localhost:4000/cursos/${id}`,
        cursoModificado
      );

      if (response.status === 200) {
        console.log("Curso modificado:", response.data);
        navigate("/listado_cursos");
      } else {
        setError("No se pudo modificar el curso. Intenta nuevamente.");
      }
    } catch (error) {
      console.error("Error al modificar el curso:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4 text-center">Modificar Curso</h2>
        {error && <p className="text-red-500 text-center">{error}</p>}{" "}
        <form className="space-y-4" onSubmit={handleSubmit}>
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
              onChange={(e) => setNombreCurso(e.target.value)}
              required
            />
          </div>

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
              onChange={(e) => setDescripcionCurso(e.target.value)}
              required
            />
          </div>

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
            />
          </div>

          <div className="flex justify-center space-x-2">
            <Link to="/listado_cursos">
              <button
                type="button"
                className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800"
              >
                Volver
              </button>
            </Link>
            <button
              type="submit"
              className={`bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 ${
                loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
              disabled={loading}
            >
              {loading ? "Modificando..." : "Modificar Curso"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Modificar_curso;
