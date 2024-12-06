import React from "react";
import { Navigate } from "react-router-dom";

const PublicRoute = ({ children }) => {
  const token = localStorage.getItem("token");

  if (token) {
    // Si hay un token activo, redirigir al home
    return <Navigate to="/home" replace />;
  }

  return children;
};

export default PublicRoute;
