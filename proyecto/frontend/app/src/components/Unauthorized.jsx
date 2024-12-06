// src/components/Unauthorized.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

const Unauthorized = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const handleRedirect = () => {
    if (token) {
      navigate("/home");
    } else {
      navigate("/login");
    }
  };

  return (
    <div className="container text-center mt-5">
      <h1 className="text-danger">403 - Acceso Denegado</h1>
      <p>No tienes permisos para acceder a esta página.</p>
      <button onClick={handleRedirect} className="btn btn-primary mt-3">
        {token ? "Volver al Dashboard" : "Ir al Login"}
      </button>
    </div>
  );
};

export default Unauthorized;
