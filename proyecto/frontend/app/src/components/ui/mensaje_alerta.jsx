import React from "react";
import Swal from "sweetalert2";

// Componente de alerta para publicar el curso
export const PublishAlert = ({ onConfirm }) => {
  const handlePublish = () => {
    onConfirm();
    Swal.fire({
      icon: "success",
      title: "Curso publicado",
      text: "El curso se ha publicado con éxito.",
      confirmButtonText: "Aceptar",
    });
  };

  const handleShowAlert = () => {
    Swal.fire({
      title: "¿Está seguro de que desea publicar este curso?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, publicar",
      cancelButtonText: "No, cancelar",
    }).then((result) => {
      if (result.isConfirmed) {
        handlePublish();
      }
    });
  };

  return (
    <button
      onClick={handleShowAlert}
      className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 text-sm"
    >
      Publicar
    </button>
  );
};

// Componente de alerta para deshabilitar el curso
export const DisableAlert = ({ onConfirm }) => {
  const handleDisable = () => {
    Swal.fire({
      icon: "info",
      title: "Curso deshabilitado",
      text: "El curso ha sido deshabilitado con éxito.",
      confirmButtonText: "Aceptar",
    });
    onConfirm(); // Llama a la función proporcionada después de mostrar la alerta de éxito
  };

  const handleShowAlert = () => {
    Swal.fire({
      title: "¿Está seguro de que desea deshabilitar este curso?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, deshabilitar",
      cancelButtonText: "No, cancelar",
    }).then((result) => {
      if (result.isConfirmed) {
        handleDisable();
      }
    });
  };

  return (
    <button
      onClick={handleShowAlert}
      className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-sm"
    >
      Deshabilitar
    </button>
  );
};
