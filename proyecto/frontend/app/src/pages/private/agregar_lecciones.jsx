import React, { useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

const AgregarLeccion = () => {
  const [leccion, setLeccion] = useState({
    nombre_leccion: "",
    descripcion_leccion: "",
  });
  const navigate = useNavigate();
  const { cursoId, moduloId } = useParams(); // Captura el moduloId y cursoId

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLeccion((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        `http://localhost:4000/modulos/${moduloId}/lecciones`,
        leccion
      );
      // Verifica si la respuesta es exitosa
      if (response.status === 201) {
        // Redirige a la página del curso tras crear la lección
        navigate(`/vercurso/${cursoId}`);
      } else {
        console.error("Error al crear la lección:", response.statusText);
      }
    } catch (error) {
      console.error("Error al crear la lección:", error);
    }
  };

  const handleBack = () => {
    // Redirige al curso al que pertenece el módulo
    console.log("Desde Agregar lecciones => ", cursoId);

    navigate(`/vercurso/${cursoId}`);
  };

  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4 text-center">
          Crear Nueva Lección
        </h2>
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
              placeholder="Ej. Lección sobre Seguridad Minera"
              value={leccion.nombre_leccion}
              onChange={handleChange}
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
              placeholder="Descripción de la lección aquí..."
              value={leccion.descripcion_leccion}
              onChange={handleChange}
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
              Crear Lección
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AgregarLeccion;
