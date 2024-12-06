//import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// import { Badge } from "@/components/ui/badge";
//import { Briefcase, GraduationCap, Mail, MapPin, Phone } from "lucide-react";
//import { Mail, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
// import { PublishAlert, DisableAlert } from "../../components/ui/mensaje_alerta";
import React, { useState } from "react";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
// import { Progress } from "@/components/ui/progress";
import { LayoutList, LayoutGrid } from "lucide-react";

// IMÁGENES
import capacitacion from "../../assets/capacitacion.png";
import mantenimiento from "../../assets/mantenimiento.png";
import seguridad from "../../assets/seguridad.png";

/* interface CardProps {
  image: string;
  title: string;
  description: string;
  link: string;
} */

/* const worker = {
  name: "José Barra",
  position: "Ingeniero de Mantenimiento",
  email: "jo.barra@salfamantenciones.com",
  // phone: "+569",
  location: "Talca, Chile",
  avatar: "/placeholder.svg?height=100&width=100",
}; */

const coursesData = [
  {
    id: 1,
    title: "Capacitación Minera",
    description:
      "Este curso está diseñado para proporcionar una comprensión integral de la minería, abordando desde sus fundamentos históricos hasta las tecnologías modernas utilizadas en la industria. Los participantes aprenderán sobre los diferentes tipos de minerales, los procesos ...",
    image: capacitacion,
    modules: [
      {
        id: 1,
        title: "Fundamentos de Minería",
        lessons: [
          { id: 1, title: "Tipos de minerales", completed: true },
          { id: 2, title: "Procesos de extracción", completed: true },
        ],
      },
      {
        id: 2,
        title: "Equipos mineros",
        lessons: [
          {
            id: 3,
            title: "Mauinaria y Herramientas utilizadas",
            completed: true,
          },
          { id: 4, title: "Mantenimiento básico en equipos", completed: true },
        ],
      },
    ],
  },
  {
    id: 2,
    title: "Mantención de maquinaria",
    description:
      "El curso de mantención de maquinaria está orientado a equipar a los participantes con los conocimientos y habilidades necesarios para llevar a cabo un mantenimiento efectivo. Se cubrirán los fundamentos del mantenimiento, incluidas las técnicas preventivas y correctivas...",
    image: seguridad,
    modules: [
      {
        id: 3,
        title: "Mantenimiento preventivo",
        lessons: [
          { id: 5, title: "Inspecciones y revisiones", completed: false },
          { id: 6, title: "Registro de mantenimiento", completed: false },
        ],
      },
      {
        id: 4,
        title: "Diagnóstico de fallas",
        lessons: [
          {
            id: 7,
            title: "Identificación de problemas comunes",
            completed: false,
          },
          { id: 8, title: "Técnicas de diagnóstico", completed: false },
          { id: 9, title: "Soluciones y reemplazos", completed: false },
        ],
      },
    ],
  },
  {
    id: 3,
    title: "Seguridad Industrial",
    description:
      "Este curso se enfoca en la seguridad en el entorno laboral, enseñando a los participantes sobre la importancia de las normativas de seguridad y la evaluación de riesgos. Se examinarán los equipos de protección personal y su correcto uso, así como la prevención de accidentes...",
    image: mantenimiento,
    modules: [
      {
        id: 5,
        title: "Principios de seguridad",
        lessons: [
          { id: 10, title: "Legislación y normativas", completed: true },
          { id: 11, title: "Evaluación de riesgos", completed: true },
        ],
      },
      {
        id: 6,
        title: "Equipos de protección personal (EPP)",
        lessons: [
          { id: 12, title: "Tipos de EPP y su uso", completed: true },
          {
            id: 13,
            title: "Concientización y capacitación en EPP",
            completed: true,
          },
        ],
      },
    ],
  },
  {
    id: 4,
    title: "Capacitación Avanzada",
    description:
      "El curso de capacitación avanzada está diseñado para aquellos que buscan profundizar en temas tecnológicos y de liderazgo en el sector minero. Los participantes explorarán las tecnologías emergentes, como la inteligencia artificial y el análisis de datos, y aprenderán a...",
    image: seguridad,
    modules: [
      {
        id: 5,
        title: "Tecnologías emergentes",
        lessons: [
          { id: 14, title: "IA y minería", completed: false },
          {
            id: 15,
            title: "Automatización de procesos mineros",
            completed: false,
          },
        ],
      },
      {
        id: 6,
        title: "Liderazgo y gestión de equipos",
        lessons: [
          { id: 16, title: "Habilidades de Liderazgo", completed: true },
          { id: 17, title: "Dinámicas de grupo", completed: false },
        ],
      },
    ],
  },
  {
    id: 5,
    title: "Mantenimiento Preventivo",
    description:
      "Este curso proporciona a los participantes un entendimiento completo del mantenimiento preventivo, su importancia y su aplicación práctica. Se enseñarán conceptos básicos, ejecución de procedimientos y técnicas para llevar un registro efectivo del mantenimiento. Los...",
    image: mantenimiento,
    modules: [
      {
        id: 5,
        title: "Ejecución del Mantenimiento",
        lessons: [
          {
            id: 18,
            title: "Registro y monitoreo de actividades",
            completed: true,
          },
          {
            id: 19,
            title: "Análisis de resultados",
            completed: true,
          },
        ],
      },
      {
        id: 6,
        title: "Mejora continua",
        lessons: [
          {
            id: 20,
            title: "Evaluación del proceso de mantenimiento",
            completed: true,
          },
          {
            id: 21,
            title: "Implementación de Mejores Prácticas",
            completed: false,
          },
        ],
      },
    ],
  },
  {
    id: 6,
    title: "Seguridad y Prevención",
    description:
      "El curso de seguridad y prevención se centra en la creación de un entorno laboral seguro. Los participantes aprenderán sobre la importancia de la seguridad en el trabajo, las normativas aplicables y cómo evaluar riesgos laborales. Se cubrirán técnicas para el manejo de emergencias...",
    image: capacitacion,
    modules: [
      {
        id: 5,
        title: "Manejo de emergencias",
        lessons: [
          { id: 22, title: "Planes de Emergencia", completed: true },
          { id: 23, title: "Simulacros y Prácticas", completed: true },
        ],
      },
      {
        id: 6,
        title: "Promoción de una cultura de seguridad",
        lessons: [
          { id: 12, title: "Capacitación y Conciencia", completed: true },
          { id: 13, title: "Comunicación en Deguridad", completed: false },
        ],
      },
    ],
  },
];

export default function ListadoCursosUsuario() {
  const [filter, setFilter] = useState("all");
  const [view, setView] = useState("grid");

  const isCourseCompleted = (course) => {
    return course.modules.every((module) =>
      module.lessons.every((lesson) => lesson.completed)
    );
  };

  const filteredCourses = coursesData.filter((course) => {
    if (filter === "all") return true;
    if (filter === "completed") return isCourseCompleted(course);
    if (filter === "incomplete") return !isCourseCompleted(course);
    return true;
  });

  return (
    <>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Todos los Cursos</h1>

        <div className="flex justify-between items-center mb-4">
          <div className="space-x-2">
            <Button
              variant={view === "list" ? "default" : "outline"}
              onClick={() => setView("list")}
            >
              <LayoutList className="h-4 w-4 mr-2" />
              Lista
            </Button>
            <Button
              variant={view === "grid" ? "default" : "outline"}
              onClick={() => setView("grid")}
            >
              <LayoutGrid className="h-4 w-4 mr-2" />
              Cuadrícula
            </Button>
          </div>
        </div>

        <div
          className={`grid gap-4 ${
            view === "grid" ? "sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
          }`}
        >
          {filteredCourses.map((course) => (
            <Card key={course.id}>
              <CardHeader>
                <img
                  src={course.image}
                  alt={course.title}
                  className="w-full h-40 object-cover mb-4 rounded-md"
                />
                <CardTitle>{course.title}</CardTitle>
                <CardDescription>{course.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm mt-2">
                  Módulos: {course.modules.length} | Lecciones:{" "}
                  {course.modules.reduce(
                    (acc, module) => acc + module.lessons.length,
                    0
                  )}
                </p>
              </CardContent>
              <CardFooter>
                <Link to="/vercurso">
                  <Button variant="outline">Ver detalles</Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </>
  );
}
