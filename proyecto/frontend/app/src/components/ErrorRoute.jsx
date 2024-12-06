import React from "react";
import { Navigate } from "react-router-dom";

const ErrorRoute = ({ children, type }) => {
  const token = localStorage.getItem("token");

  // Si es una página de error 404 (NotFound)
  if (type === "notFound") {
    if (token) {
      // Si está autenticado, muestra el error pero mantiene acceso a rutas protegidas
      return <>{children}</>;
    }
    // Si no está autenticado, muestra solo el error
    return children;
  }

  // Si es una página de unauthorized (403)
  if (type === "unauthorized") {
    if (token) {
      // Si está autenticado, muestra el error pero mantiene acceso a rutas protegidas
      return <>{children}</>;
    }
    // Si no está autenticado, redirige al login
    return <Navigate to="/login" replace />;
  }

  // Por defecto, redirige al login
  return <Navigate to="/login" replace />;
};

export default ErrorRoute;
