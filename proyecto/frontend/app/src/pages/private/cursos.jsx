import React from "react";
import capacitaciones from "@/assets/capacitacion.png";
import mantenimiento from "@/assets/mantenimiento.png";
import seguridad from "@/assets/seguridad.png";

const courses = [
  {
    id: 1,
    name: "Capacitación Minera",
    image: capacitaciones,
  },
  {
    id: 2,
    name: "Fundamentos de Minería",
    image: mantenimiento,
  },
  {
    id: 3,
    name: "Equipos mineros",
    image: seguridad,
  },
  {
    id: 4,
    name: "Fundamentos de Minería",
    image: mantenimiento,
  },
  {
    id: 5,
    name: "Capacitación Minera",
    image: capacitaciones,
  },
  {
    id: 6,
    name: "Equipos mineros",
    image: seguridad,
  },
];

function CourseCard({ name, image }) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <img src={image} alt={name} className="w-full h-32 object-cover" />
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-800">{name}</h3>
      </div>
    </div>
  );
}

const Cursos_home = () => {
  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-semibold text-gray-800">
          Cursos Disponibles
        </h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <CourseCard key={course.id} name={course.name} image={course.image} />
        ))}
      </div>
    </>
  );
};
export default Cursos_home;
