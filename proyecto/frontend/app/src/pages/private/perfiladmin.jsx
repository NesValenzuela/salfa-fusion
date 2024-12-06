import React from "react";
import capacitacion from "@/assets/capacitacion.png";
import mantenimiento from "@/assets/mantenimiento.png";
import seguridad from "@/assets/seguridad.png";
import {
  PublishAlert,
  DisableAlert,
} from "../../components/ui/mensaje_alerta.jsx";
import { Link } from "react-router-dom";

// Componente de la carta
const Card = ({ image, title, description, link }) => {
  return (
    <div className="max-w-md w-full bg-white border border-gray-200 rounded-lg shadow-md overflow-hidden mb-6 mx-auto flex flex-col h-full">
      <Link to={link}>
        <img className="w-full h-48 object-cover" src={image} alt={title} />
      </Link>
      <div className="p-4 flex flex-col flex-grow">
        <h5 className="text-xl font-semibold mb-2 break-words">{title}</h5>
        <p className="text-gray-700 break-words">{description}</p>
        <div className="flex flex-col items-center mt-4 space-y-1">
          <PublishAlert onConfirm={() => console.log("Curso publicado")} />
          <Link to="/modificar_cursos">
            <button className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 text-sm">
              Modificar
            </button>
          </Link>
          <DisableAlert onConfirm={() => console.log("Curso deshabilitado")} />
        </div>
      </div>
    </div>
  );
};

// Componente de Perfil
const UserProfile = () => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-lg mb-4">
      <h2 className="text-2xl font-bold mb-2 text-center">Perfil de Usuario</h2>
      <p className="text-black-700 mb-3">
        <span className="font-semibold">Nombre:</span> Juan Alberto Doe Pérez
      </p>
      <p className="text-black-700 mb-3">
        <span className="font-semibold">RUT:</span> 12.345.678-9
      </p>
      <p className="text-black-700 mb-3">
        <span className="font-semibold">Fecha de Nacimiento:</span> 15 de Abril,
        1985
      </p>
      <p className="text-black-700 mb-3">
        <span className="font-semibold">Cargo:</span> Ingeniero de Mantenimiento
      </p>
    </div>
  );
};

// Componente del Dashboard
const Dashboard = () => {
  const data = {
    totalUsers: 100,
    completedCourses: 75,
    notStartedCourses: 25,
    ongoingCourses: 50,
    courseCompletionRate: 75, // en porcentaje
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-lg mb-2">
      <h2 className="text-2xl font-bold mb-4 text-center">
        Dashboard de Cursos
      </h2>
      <div className="flex flex-col space-y-2">
        <div className="flex justify-between">
          <span className="font-semibold">Total de Usuarios:</span>
          <span>{data.totalUsers}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-semibold">Cursos Completados:</span>
          <span>{data.completedCourses}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-semibold">
            Usuarios que no han iniciado cursos:
          </span>
          <span>{data.notStartedCourses}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-semibold">Cursos en Progreso:</span>
          <span>{data.ongoingCourses}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-semibold">Tasa de Finalización de Cursos:</span>
          <span>{data.courseCompletionRate}%</span>
        </div>
      </div>
    </div>
  );
};

// Componente principal
const Perfiladm = () => {
  return (
    <div className="flex flex-col items-center min-h-screen">
      <div className="container mx-auto p-4 flex flex-col items-center">
        <div className="flex flex-col md:flex-row justify-center md:space-x-4 mb-6 w-full">
          <div className="md:w-1/4 w-full">
            <UserProfile />
          </div>
          <div className="md:w-1/4 w-full">
            <Dashboard />
          </div>
        </div>
        <div className="md:w-3/4 w-full">
          <div className="bg-gray-100 p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-4 text-center">
              Nuevos cursos
            </h2>
            <div className="flex flex-col md:flex-row md:space-x-6 md:space-y-0 space-y-4 justify-center">
              <Card
                image={capacitacion}
                title="Capacitación Minera"
                description="En este curso aprenderás sobre los conceptos básicos de la industria minera"
                link="/vercurso" // Añade el enlace correspondiente
              />
              <Card
                image={mantenimiento}
                title="Mantención de maquinaria"
                description="Curso sobre mantenimiento y reparación de maquinaria pesada en la industria minera."
                link="/vercurso" // Añade el enlace correspondiente
              />
              <Card
                image={seguridad}
                title="Seguridad Industrial"
                description="Capacitación enfocada en las normativas de seguridad industrial"
                link="/vercurso" // Añade el enlace correspondiente
              />
            </div>
            <div className="flex flex-col items-center mt-4 space-y-2">
              <Link to="/listado_cursos">
                <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                  Ver todos los cursos
                </button>
              </Link>
              <Link to="/agregar_cursos">
                <button className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
                  + Crear un curso nuevo
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Perfiladm;
