import React, { useEffect, useState } from "react";
import capacitaciones from "@/assets/capacitacion.png";
import { Link } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Toaster, toast } from "sonner";
import { useUser } from "../../contexts/UserContext";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
  CardFooter,
} from "../../components/ui/card";
import { Search, LayoutGrid, LayoutList } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const HomeUsuarios = () => {
  const { user } = useUser();
  const [cursos, setCursos] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("todos");
  const [view, setView] = useState("grid");
  const [imagenesCursos, setImagenesCursos] = useState({});

  const filteredCursos = cursos.filter((curso) => {
    const matchesSearch = curso.nombre_curso
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    const matchesStatus =
      filterStatus === "todos"
        ? true
        : filterStatus === "completados"
        ? curso.completado
        : !curso.completado;

    return matchesSearch && matchesStatus;
  });

  const fetchCursos = async (userRut) => {
    try {
      const responseAsignados = await fetch(
        `http://localhost:4000/api/usuarioLecciones/${userRut}`
      );
      if (!responseAsignados.ok) {
        throw new Error(`HTTP error! status: ${responseAsignados.status}`);
      }
      const usuarioData = await responseAsignados.json();

      const cursosAsignados =
        usuarioData.cursoAsignados?.map((ca) => ({
          ...ca.curso,
          completado: calcularCompletado(ca.curso),
        })) || [];

      setCursos(cursosAsignados);
    } catch (error) {
      console.error("Error al obtener los cursos:", error);
      toast.error("Error al cargar los cursos");
    }
  };

  const calcularCompletado = (curso) => {
    if (!curso.modulos) return false;

    const todasLasLecciones = curso.modulos.flatMap(
      (modulo) => modulo.lecciones
    );
    if (todasLasLecciones.length === 0) return false;

    const leccionesCompletadas = todasLasLecciones.filter(
      (leccion) =>
        leccion.Cumplimiento_leccion &&
        leccion.Cumplimiento_leccion.length > 0 &&
        leccion.Cumplimiento_leccion[0].estado
    ).length;

    return leccionesCompletadas === todasLasLecciones.length;
  };

  useEffect(() => {
    if (user?.rut) {
      fetchCursos(user.rut);
    }
  }, [user?.rut]);

  useEffect(() => {
    const cargarImagenesCursos = async () => {
      try {
        const cursosIds = filteredCursos.map((curso) => curso.id_curso);

        const response = await fetch(
          "http://localhost:4000/api/cursos/imagenes",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ cursos: cursosIds }),
          }
        );

        const data = await response.json();
        const imagenesMap = data.reduce((acc, img) => {
          acc[img.id_curso] = img;
          return acc;
        }, {});

        setImagenesCursos(imagenesMap);
      } catch (error) {
        console.error("Error al cargar imágenes de los cursos:", error);
      }
    };

    if (filteredCursos.length > 0) {
      cargarImagenesCursos();
    }
  }, [filteredCursos]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-6">
            Cursos Disponibles
          </h2>

          <div className="max-w-2xl mx-auto mb-8">
            <div className="flex gap-4 items-center">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Buscar cursos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm transition-all duration-200"
                />
              </div>

              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filtrar por estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los cursos</SelectItem>
                  <SelectItem value="completados">Completados</SelectItem>
                  <SelectItem value="pendientes">No completados</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end mb-4">
            <div className="space-x-2">
              <Button
                variant={view === "list" ? "default" : "outline"}
                onClick={() => setView("list")}
                size="sm"
              >
                <LayoutList className="h-4 w-4 mr-2" />
                Lista
              </Button>
              <Button
                variant={view === "grid" ? "default" : "outline"}
                onClick={() => setView("grid")}
                size="sm"
              >
                <LayoutGrid className="h-4 w-4 mr-2" />
                Cuadrícula
              </Button>
            </div>
          </div>

          <div
            className={`
                        ${
                          view === "grid"
                            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                            : "space-y-4"
                        }
                    `}
          >
            {filteredCursos.length > 0 ? (
              filteredCursos.map((curso) => (
                <Card
                  key={curso.id_curso}
                  className={`
                                        transition-all duration-200 hover:shadow-lg
                                        ${
                                          view === "list"
                                            ? "flex flex-row items-start"
                                            : "flex flex-col hover:scale-[1.02]"
                                        }
                                    `}
                >
                  <CardHeader
                    className={`
                                        ${view === "list" ? "w-1/4" : "p-0"}
                                    `}
                  >
                    {!imagenesCursos[curso.id_curso] ? (
                      <div className="w-full h-48 bg-gray-200 rounded-t-lg animate-pulse" />
                    ) : imagenesCursos[curso.id_curso].tipo === "area" ? (
                      <img
                        className={`
                          object-cover rounded-t-lg
                          ${
                            view === "grid"
                              ? "w-full h-48"
                              : "h-full w-full rounded-l-lg rounded-t-none"
                          }
                        `}
                        src={`http://localhost:4000/api/area/imagen/${
                          imagenesCursos[curso.id_curso].idArea
                        }`}
                        alt={curso.nombre_curso}
                      />
                    ) : (
                      <div
                        className={`
                        flex items-center justify-center bg-gray-200 rounded-t-lg
                        ${
                          view === "grid"
                            ? "w-full h-48"
                            : "h-full w-full rounded-l-lg rounded-t-none"
                        }
                      `}
                      >
                        <span className="text-6xl font-bold text-gray-500">
                          {imagenesCursos[curso.id_curso].letra}
                        </span>
                      </div>
                    )}
                  </CardHeader>
                  <div
                    className={`
                                        flex flex-col flex-1
                                        ${view === "list" ? "p-6" : "p-4"}
                                    `}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <CardTitle className="text-xl font-bold">
                        {curso.nombre_curso}
                      </CardTitle>
                      {curso.completado && (
                        <span className="px-2 py-1 bg-green-100 text-green-600 text-xs font-medium rounded-full">
                          Completado
                        </span>
                      )}
                    </div>
                    <CardDescription className="text-gray-600 mb-4">
                      {curso.descripcion_curso}
                    </CardDescription>
                    <div className="mt-auto">
                      <p className="text-sm text-gray-500 mb-4">
                        Fecha límite:{" "}
                        {new Date(curso.fecha_limite).toLocaleDateString()}
                      </p>
                      <Link
                        to={`/vercurso-usuario/${curso.id_curso}`}
                        className="w-full"
                      >
                        <Button
                          variant="outline"
                          className="w-full hover:bg-primary hover:text-white transition-colors"
                        >
                          Ver Detalles
                        </Button>
                      </Link>
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center text-gray-500 py-8">
                No se encontraron cursos que coincidan con los criterios de
                búsqueda
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeUsuarios;
