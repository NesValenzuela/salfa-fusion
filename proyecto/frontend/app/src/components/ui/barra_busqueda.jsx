import React, { useState } from "react";

const SearchBar = ({ onSearch, setFilter }) => {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [filterText, setFilterText] = useState("Filtrar por estado");

  const handleChange = (event) => {
    setQuery(event.target.value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSearch(query);
  };

  const handleFilterChange = (filter) => {
    setFilter(filter);
    setFilterText(
      filter === "habilitados" ? "Cursos Habilitados" : "Cursos Deshabilitados"
    );
    setIsOpen(false);
  };

  return (
    <div className="w-full max-w-3xl mx-auto mb-4 relative">
      <form onSubmit={handleSubmit} className="flex items-center w-full">
        <input
          type="text"
          value={query}
          onChange={handleChange}
          placeholder="Buscar cursos..."
          className="border border-black rounded-lg px-4 py-2 w-full"
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded-lg ml-2"
        >
          Buscar
        </button>
        {/* Botón Filtrar */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="bg-gray-300 text-black rounded-lg ml-2 hover:bg-gray-400 focus:outline-none min-w-[200px] text-center" // Establecido a un ancho mínimo más grande
          style={{ height: "42px", padding: "0 8px", whiteSpace: "nowrap" }} // Asegura que el texto no se divida
        >
          {filterText}
        </button>
      </form>

      {/* Menú desplegable */}
      {isOpen && (
        <div className="absolute right-0 mt-2 bg-white border border-gray-300 rounded-md shadow-lg z-20 w-48">
          <div
            className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
            onClick={() => handleFilterChange("habilitados")}
          >
            Habilitados
          </div>
          <div
            className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
            onClick={() => handleFilterChange("deshabilitados")}
          >
            Deshabilitados
          </div>
        </div>
      )}
    </div>
  );
};

export { SearchBar };
