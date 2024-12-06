import React from "react";
import Swal from "sweetalert2";

const AlertaConfirmacion = ({
  title,
  text,
  confirmText,
  cancelText,
  onConfirm,
}) => {
  const mostrarAlerta = () => {
    Swal.fire({
      title,
      text,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: confirmText,
      cancelButtonText: cancelText,
    }).then((result) => {
      if (result.isConfirmed) {
        onConfirm();
      }
    });
  };

  return (
    <button
      onClick={mostrarAlerta}
      className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 text-sm"
    >
      {confirmText}
    </button>
  );
};

export default AlertaConfirmacion;
