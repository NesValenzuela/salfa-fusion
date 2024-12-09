// ModificarModulo.tsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const Modificar_modulo = () => {
  const { cursoId, moduloId } = useParams();
  const navigate = useNavigate();
  const [modulo, setModulo] = useState({
    nombre_modulo: "",
    descripcion_modulo: "",
  });
  const [curso, setCurso] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const obtenerDatos = async () => {
      try {
        const [moduloResponse, cursoResponse] = await Promise.all([
          axios.get(
            `http://localhost:4000/cursos/${cursoId}/modulos/${moduloId}`
          ),
          axios.get(`http://localhost:4000/cursos/${cursoId}`),
        ]);

        setModulo(moduloResponse.data);
        setCurso(cursoResponse.data);
        setLoading(false);
      } catch (error) {
        console.error(error);
        setError(
          "Error al obtener el módulo o el curso. Por favor, verifica que existan."
        );
        setLoading(false);
      }
    };

    if (cursoId && moduloId) {
      obtenerDatos();
    }
  }, [cursoId, moduloId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setModulo((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(
        `http://localhost:4000/cursos/${cursoId}/modulos/${moduloId}`,
        modulo
      );
      navigate(`/vercurso/${cursoId}`);
    } catch (error) {
      console.error(error);
      setError(
        "Error al modificar el módulo. Asegúrate de que todos los campos sean válidos."
      );
    }
  };

  const handleBack = () => {
    navigate(`/vercurso/${cursoId}`); // Redirige a la vista del curso
  };

  if (loading) {
    return <p>Cargando módulo...</p>; // Mensaje de carga
  }

  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4 text-center">
          Modificar Módulo
        </h2>
        {curso && (
          <p className="text-lg text-center mb-4">
            Curso: {curso.nombre_curso}
          </p>
        )}{" "}
        {/* Mostrar el nombre del curso */}
        {error && <p className="text-red-500 text-center">{error}</p>}{" "}
        {/* Estilo de error */}
        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* Nombre del módulo */}
          <div>
            <label
              className="block text-sm font-medium text-gray-700 mb-1"
              htmlFor="moduloNombre"
            >
              Nombre del Módulo
            </label>
            <input
              type="text"
              id="moduloNombre"
              name="nombre_modulo"
              className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={modulo.nombre_modulo}
              onChange={handleChange}
              required
            />
          </div>

          {/* Descripción del módulo */}
          <div>
            <label
              className="block text-sm font-medium text-gray-700 mb-1"
              htmlFor="moduloDescripcion"
            >
              Descripción del Módulo
            </label>
            <textarea
              id="moduloDescripcion"
              name="descripcion_modulo"
              rows={4}
              className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={modulo.descripcion_modulo}
              onChange={handleChange}
              required
            />
          </div>

          {/* Botones de volver y guardar */}
          <div className="flex justify-center space-x-2">
            <button
              type="button"
              onClick={handleBack}
              className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800"
            >
              Volver
            </button>
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Guardar Cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Modificar_modulo;
