import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ClipboardList,
  BookOpen,
  Users,
  BarChart,
  Settings,
  Award,
  FileText,
  Layout,
  UserCog,
} from "lucide-react";
import { Card } from "../components/ui/card";

const Home = () => {
  const [userRole, setUserRole] = useState(null);

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
  }, []);

  const getFunctionalityCards = () => {
    const commonCards = [
      {
        title: "Encuestas",
        description: "Accede y completa tus encuestas asignadas",
        icon: <ClipboardList className="h-8 w-8" />,
        link: "/misencuestas",
        color: "bg-blue-500",
      },
      {
        title: "Mi Perfil",
        description: "Gestiona tu información personal y preferencias",
        icon: <UserCog className="h-8 w-8" />,
        link: "/perfil",
        color: "bg-teal-500",
      },
    ];

    const userCards = [
      {
        title: "Mis Cursos",
        description: "Visualiza y completa tus cursos asignados",
        icon: <BookOpen className="h-8 w-8" />,
        link: "/listado-cursos-usuario",
        color: "bg-green-500",
      },
      {
        title: "Mi Progreso",
        description: "Revisa tu avance en los cursos",
        icon: <Award className="h-8 w-8" />,
        link: "/miprogreso",
        color: "bg-purple-500",
      },
    ];

    const adminCards = [
      {
        title: "Gestión de Cursos",
        description: "Administra los cursos de la plataforma",
        icon: <BookOpen className="h-8 w-8" />,
        link: "/admin-cursos",
        color: "bg-green-500",
      },
      {
        title: "Gestión de Usuarios",
        description: "Administra los usuarios del sistema",
        icon: <Users className="h-8 w-8" />,
        link: "/listar-usuarios",
        color: "bg-yellow-500",
      },
      {
        title: "Gestión de Áreas",
        description: "Administra las áreas de la empresa",
        icon: <Layout className="h-8 w-8" />,
        link: "/listar-areas",
        color: "bg-indigo-500",
      },
      {
        title: "Dashboard RRHH",
        description: "Visualiza estadísticas y reportes",
        icon: <BarChart className="h-8 w-8" />,
        link: "/dashboard-rh",
        color: "bg-red-500",
      },
      {
        title: "Gestión de Encuestas",
        description: "Crea y asigna encuestas",
        icon: <FileText className="h-8 w-8" />,
        link: "/crear-encuesta",
        color: "bg-purple-500",
      },
      {
        title: "Configuración",
        description: "Administra roles y permisos",
        icon: <Settings className="h-8 w-8" />,
        link: "/roles",
        color: "bg-gray-500",
      },
    ];

    return userRole === "Administrador"
      ? [...commonCards, ...adminCards]
      : [...commonCards, ...userCards];
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">
          Bienvenido a la Plataforma de Capacitación
        </h1>
        <p className="text-gray-600 text-lg">
          Accede a todas las funcionalidades desde un solo lugar
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {getFunctionalityCards().map((card, index) => (
          <Link to={card.link} key={index}>
            <Card className="p-6 hover:shadow-lg transition-all duration-200 hover:scale-105 cursor-pointer h-full">
              <div className="flex items-center gap-4">
                <div className={`${card.color} p-3 rounded-lg text-white`}>
                  {card.icon}
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">{card.title}</h3>
                  <p className="text-gray-600">{card.description}</p>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {userRole === "Administrador" && (
        <div className="mt-12 text-center">
          <h2 className="text-2xl font-semibold mb-4">
            Panel de Administración
          </h2>
          <p className="text-gray-600">
            Tienes acceso completo a todas las funcionalidades de administración
          </p>
        </div>
      )}
    </div>
  );
};

export default Home;
