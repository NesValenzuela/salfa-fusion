import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useUser } from "../contexts/UserContext";
import axios from "axios";

const decodeToken = (token) => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const decoded = JSON.parse(atob(base64));
    return { decoded, isExpired: decoded.exp * 1000 < Date.now() };
  } catch (error) {
    console.error("Error al decodificar el token:", error);
    return { decoded: null, isExpired: true };
  }
};

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { logout } = useUser();
  const [shouldRedirect, setShouldRedirect] = useState(false);
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      setShouldRedirect(true);
      return;
    }

    const { decoded, isExpired } = decodeToken(token);
    if (isExpired || !decoded) {
      logout();
      setShouldRedirect(true);
      return;
    }

    const refreshTokenInterval = setInterval(async () => {
      const currentToken = localStorage.getItem("token");
      if (!currentToken) return;

      const { decoded: currentDecoded, isExpired: currentIsExpired } =
        decodeToken(currentToken);

      console.log("Comprobando token:", new Date().toLocaleTimeString(), {
        tiempoRestante:
          Math.round((currentDecoded.exp * 1000 - Date.now()) / 1000) +
          " segundos",
        necesitaRefresh: currentDecoded.exp * 1000 - Date.now() < 120000,
      });

      // Si el token está a punto de expirar (menos de 2 minutos)
      if (currentDecoded && currentDecoded.exp * 1000 - Date.now() < 120000) {
        try {
          console.log("Refrescando token...");
          const response = await axios.post(
            "http://localhost:4000/api/usuarios/refresh-token",
            {},
            {
              headers: { Authorization: `Bearer ${currentToken}` },
            }
          );

          const newToken = response.data.token;
          localStorage.setItem("token", newToken);
          axios.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
          console.log("Token refrescado exitosamente");
        } catch (error) {
          console.error("Error refreshing token:", error);
          logout();
          setShouldRedirect(true);
        }
      }
    }, 59000);

    return () => clearInterval(refreshTokenInterval);
  }, [token, logout]);

  if (shouldRedirect || !token) {
    return <Navigate to="/login" replace />;
  }

  const { decoded } = decodeToken(token);
  const userRole = decoded?.rol;

  if (!allowedRoles) {
    return children;
  }

  if (!allowedRoles.includes(userRole)) {
    return <Navigate to="/unauthorized" />;
  }

  return children;
};

export default ProtectedRoute;
