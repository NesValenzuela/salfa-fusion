import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const Modificar_lecciones = () => {
  const { cursoId, moduloId, leccionId } = useParams();

  const navigate = useNavigate();
  const [leccion, setLeccion] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const obtenerDatos = async () => {
      try {
        const response = await axios.get(
          `http://localhost:4000/modulos/${moduloId}/lecciones/${leccionId}`
        );
        setLeccion(response.data);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Error al obtener la lección."
        );
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    obtenerDatos();
  }, [cursoId, moduloId, leccionId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLeccion((prev) => (prev ? { ...prev, [name]: value } : null));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!leccion) return;

    const { id_leccion, nombre_leccion, descripcion_leccion } = leccion;

    try {
      await axios.put(
        `http://localhost:4000/modulos/${moduloId}/lecciones/${id_leccion}`,
        {
          nombre_leccion,
          descripcion_leccion,
        }
      );
      // Redirigir al curso después de guardar cambios
      navigate(`/vercurso/${cursoId}`);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Error al modificar la lección."
      );
      console.error(error);
    }
  };

  const handleBack = () => {
    if (cursoId) {
      navigate(`/vercurso/${cursoId}`);
    } else {
      console.error("cursoId no está definido");
    }
  };

  if (loading) {
    return <p>Cargando lección...</p>;
  }

  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4 text-center">
          Modificar Lección
        </h2>
        {error && <p className="text-red-500 text-center">{error}</p>}

        {leccion && (
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label
                className="block text-sm font-medium text-gray-700 mb-1"
                htmlFor="leccionNombre"
              >
                Nombre de la Lección
              </label>
              <input
                type="text"
                id="leccionNombre"
                name="nombre_leccion"
                className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={leccion.nombre_leccion}
                onChange={handleChange}
                placeholder="Ingrese el nombre de la lección"
                required
              />
            </div>

            <div>
              <label
                className="block text-sm font-medium text-gray-700 mb-1"
                htmlFor="leccionDescripcion"
              >
                Descripción de la Lección
              </label>
              <textarea
                id="leccionDescripcion"
                name="descripcion_leccion"
                rows={4}
                className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={leccion.descripcion_leccion}
                onChange={handleChange}
                placeholder="Ingrese la descripción de la lección"
                required
              />
            </div>

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
        )}
      </div>
    </div>
  );
};

export default Modificar_lecciones;
