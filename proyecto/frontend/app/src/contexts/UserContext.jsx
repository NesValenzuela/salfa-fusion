import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const UserContext = createContext();

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser debe estar dentro de un UserProvider");
  }
  return context;
};

export const UserProvider = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

          const response = await axios.get("http://localhost:4000/user-info");

          setUser(response.data);
        } catch (error) {
          console.error("Error al verificar autenticación:", error);
          setUser(null);
          localStorage.removeItem("token");
          delete axios.defaults.headers.common["Authorization"];
          navigate("/login");
        }
      } else {
        setLoading(false);
      }
      setLoading(false);
    };

    checkAuth();
  }, [navigate]);

  const login = async (credentials) => {
    try {
      const response = await axios.post(
        "http://localhost:4000/api/usuarios/login",
        credentials
      );
      localStorage.setItem("token", response.data.token);
      setUser(response.data.user);
      return response.data.user;
    } catch (error) {
      console.error("Error en login:", error);
      throw error;
    }
  };

  const logout = () => {
    // Eliminar token
    localStorage.removeItem("token");
    // Limpiar estado del usuario
    setUser(null);
    // Eliminar el token de los headers de axios
    delete axios.defaults.headers.common["Authorization"];
    // Redirigir al login
    navigate("/login");
  };

  const resetPassword = async (email) => {
    try {
      await axios.post("http://localhost:4000/api/reset-password", { email });
      return true;
    } catch (error) {
      throw error;
    }
  };

  const value = {
    user,
    login,
    logout,
    loading,
    resetPassword,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};
