import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Bell, User, Menu, LogOut, ChevronDown } from "lucide-react";
import "../navbar.css";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        setUserRole(payload.rol);
      } catch (error) {
        console.error("Error al decodificar el token:", error);
      }
    }

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setActiveDropdown(null);
      }
    };

    window.addEventListener("scroll", handleScroll);
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    setActiveDropdown(null);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
    setActiveDropdown(null);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const toggleDropdown = (dropdownName) => {
    setActiveDropdown(activeDropdown === dropdownName ? null : dropdownName);
  };

  // Definir los enlaces según el rol y categoría
  const getNavLinks = () => {
    const encuestasLinks = {
      title: "Encuestas",
      links: [
        { to: "/misencuestas", text: "Mis Encuestas" },
        ...(userRole === "Administrador"
          ? [
              { to: "/crear-encuesta", text: "Crear Encuesta" },
              { to: "/asignarencuestas", text: "Asignar Encuestas" },
              { to: "/dashboard", text: "Dashboard" },
            ]
          : []),
      ],
    };

    const administracionLinks = {
      title: "Administración",
      links:
        userRole === "Administrador"
          ? [
              { to: "/usuarios", text: "Usuarios" },
              { to: "/roles", text: "Roles" },
              { to: "/areas", text: "Áreas" },
            ]
          : [],
    };

    const capacitacionLinks = {
      title: "Capacitación",
      links: [
        { to: "/cursos", text: "Cursos" },
        { to: "/listado-cursos-usuario", text: "Mis Cursos" },
        ...(userRole === "Administrador"
          ? [
              { to: "/agregar-cursos", text: "Agregar Cursos" },
              { to: "/cursos-admin", text: "Administrar Cursos" },
              { to: "/listado-cursos", text: "Listado de Cursos" },
              { to: "/dashboard-rh", text: "Dashboard RRHH" },
            ]
          : []),
      ],
    };

    return userRole === "Administrador"
      ? [encuestasLinks, administracionLinks, capacitacionLinks]
      : [encuestasLinks, capacitacionLinks];
  };

  return (
    <nav className={`navbar ${isScrolled ? "scrolled" : ""}`}>
      <div className="navbar-container">
        <div className="navbar-logo-container">
          <Link to="/home" className="navbar-logo" onClick={closeMenu}>
            <img src="/logo_salfa.jpg" alt="Logo" className="logo" />
          </Link>
        </div>
        <div
          className={`navbar-links ${isMenuOpen ? "active" : ""}`}
          ref={dropdownRef}
        >
          {getNavLinks().map((category) => (
            <div key={category.title} className="dropdown-container">
              <button
                className="dropdown-button"
                onClick={() => toggleDropdown(category.title)}
              >
                {category.title} <ChevronDown size={16} />
              </button>
              {activeDropdown === category.title && (
                <div className="dropdown-content">
                  {category.links.map((link) => (
                    <Link
                      key={link.to}
                      to={link.to}
                      className="dropdown-link"
                      onClick={closeMenu}
                    >
                      {link.text}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="navbar-right">
          <button className="icon-button" aria-label="Notificaciones">
            <Bell size={20} />
          </button>
          <Link
            to="/perfil"
            className="icon-button"
            aria-label="Perfil de usuario"
            onClick={closeMenu}
          >
            <User size={20} />
          </Link>
          <button
            className="icon-button menu-toggle"
            onClick={toggleMenu}
            aria-label="Menú"
          >
            <Menu size={20} />
          </button>
          <button
            className="icon-button"
            onClick={handleLogout}
            aria-label="Cerrar sesión"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
