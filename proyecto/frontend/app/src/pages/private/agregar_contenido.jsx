import React from "react";
import { useState } from "react";
import { Link } from "react-router-dom";

// Simulación de los módulos y lecciones disponibles (puedes reemplazar con datos reales)
const modulosDisponibles = [
  {
    id: 1,
    nombre: "Módulo 1: Introducción",
    lecciones: ["Lección 1", "Lección 2"],
  },
  {
    id: 2,
    nombre: "Módulo 2: Técnicas Avanzadas",
    lecciones: ["Lección 1", "Lección 2", "Lección 3"],
  },
  {
    id: 3,
    nombre: "Módulo 3: Seguridad",
    lecciones: ["Lección 1", "Lección 2"],
  },
];

const AgregarContenido = () => {
  const [moduloSeleccionado, setModuloSeleccionado] = useState(null);
  const [leccionSeleccionada, setLeccionSeleccionada] = useState(null);
  const [numContenidos, setNumContenidos] = useState(1);
  const [contenidos, setContenidos] = useState([
    { archivo: null, url: "", tipoArchivo: "" },
  ]);

  // Maneja la selección del módulo
  const handleModuloSeleccionado = (e) => {
    const moduloId = parseInt(e.target.value);
    setModuloSeleccionado(moduloId);
    setLeccionSeleccionada(null); // Reinicia la lección seleccionada cuando se cambia el módulo
  };

  // Maneja la selección de la lección
  const handleLeccionSeleccionada = (e) => {
    setLeccionSeleccionada(e.target.value);
  };

  // Maneja el cambio de cantidad de contenidos
  const handleChangeContenidos = (e) => {
    const cantidad = parseInt(e.target.value) || 1;
    setNumContenidos(cantidad);
    setContenidos(
      Array.from(
        { length: cantidad },
        (_, index) =>
          contenidos[index] || { archivo: null, url: "", tipoArchivo: "" }
      )
    );
  };

  // Maneja cambios en los campos de cada contenido
  const handleContenidoChange = (index, field, value) => {
    const nuevosContenidos = [...contenidos];
    nuevosContenidos[index] = { ...nuevosContenidos[index], [field]: value };
    setContenidos(nuevosContenidos);
  };

  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4 text-center">
          Agregar Contenido a una Lección
        </h2>

        {/* Selección del módulo */}
        <div className="mb-4">
          <label
            className="block text-sm font-medium text-gray-700 mb-1"
            htmlFor="moduloSeleccionado"
          >
            Selecciona el Módulo
          </label>
          <select
            id="moduloSeleccionado"
            value={moduloSeleccionado ?? ""}
            onChange={handleModuloSeleccionado}
            className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="" disabled>
              Selecciona un módulo
            </option>
            {modulosDisponibles.map((modulo) => (
              <option key={modulo.id} value={modulo.id}>
                {modulo.nombre}
              </option>
            ))}
          </select>
        </div>

        {/* Selección de la lección (aparece solo si hay un módulo seleccionado) */}
        {moduloSeleccionado && (
          <div className="mb-4">
            <label
              className="block text-sm font-medium text-gray-700 mb-1"
              htmlFor="leccionSeleccionada"
            >
              Selecciona la Lección
            </label>
            <select
              id="leccionSeleccionada"
              value={leccionSeleccionada ?? ""}
              onChange={handleLeccionSeleccionada}
              className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="" disabled>
                Selecciona una lección
              </option>
              {modulosDisponibles
                .find((modulo) => modulo.id === moduloSeleccionado)
                ?.lecciones.map((leccion, index) => (
                  <option key={index} value={leccion}>
                    {leccion}
                  </option>
                ))}
            </select>
          </div>
        )}

        {/* Campo para seleccionar la cantidad de contenidos (aparece solo si hay una lección seleccionada) */}
        {leccionSeleccionada && (
          <div className="mb-4">
            <label
              className="block text-sm font-medium text-gray-700 mb-1"
              htmlFor="cantidadContenidos"
            >
              ¿Cuántos contenidos deseas agregar?
            </label>
            <input
              type="number"
              id="cantidadContenidos"
              min={1}
              value={numContenidos}
              onChange={handleChangeContenidos}
              className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}

        {/* Generar campos dinámicos según la cantidad de contenidos */}
        {leccionSeleccionada &&
          contenidos.map((contenido, index) => (
            <div key={index} className="border p-4 rounded-lg shadow-sm mb-4">
              <h3 className="font-semibold mb-2">Contenido {index + 1}</h3>

              {/* Campo de archivo */}
              <div className="mb-2">
                <label
                  className="block text-sm font-medium text-gray-700 mb-1"
                  htmlFor={`archivo-${index}`}
                >
                  Subir Archivo
                </label>
                <input
                  type="file"
                  id={`archivo-${index}`}
                  onChange={(e) =>
                    handleContenidoChange(
                      index,
                      "archivo",
                      e.target.files?.[0] || null
                    )
                  }
                  className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Campo de URL */}
              <div className="mb-2">
                <label
                  className="block text-sm font-medium text-gray-700 mb-1"
                  htmlFor={`url-${index}`}
                >
                  URL del Contenido (opcional)
                </label>
                <input
                  type="text"
                  id={`url-${index}`}
                  value={contenido.url}
                  onChange={(e) =>
                    handleContenidoChange(index, "url", e.target.value)
                  }
                  className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={`URL del contenido ${index + 1}`}
                />
              </div>

              {/* Selección del tipo de archivo */}
              <div className="mb-2">
                <label
                  className="block text-sm font-medium text-gray-700 mb-1"
                  htmlFor={`tipoArchivo-${index}`}
                >
                  Tipo de Archivo
                </label>
                <select
                  id={`tipoArchivo-${index}`}
                  value={contenido.tipoArchivo}
                  onChange={(e) =>
                    handleContenidoChange(index, "tipoArchivo", e.target.value)
                  }
                  className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="" disabled>
                    Selecciona el tipo de archivo
                  </option>
                  <option value="video">Video</option>
                  <option value="documento">Documento</option>
                  <option value="imagen">Imagen</option>
                  <option value="otros">Otros</option>
                </select>
              </div>
            </div>
          ))}

        {/* Botones de volver y crear */}
        {leccionSeleccionada && (
          <div className="flex justify-center space-x-2">
            <Link to="/listado_cursos">
              <button
                type="button"
                className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800"
              >
                Volver a cursos
              </button>
            </Link>
            <Link to="/listado_cursos">
              <button
                type="button"
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Cargar y crear curso
              </button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default AgregarContenido;
