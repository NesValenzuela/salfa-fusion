import React, { useEffect, useState, useMemo } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { toast } from "sonner";
import AsignarAreaACurso from "../private/asignarArea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";

export default function ListadoCursos() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const id_area = searchParams.get("id_area");

  const [cursos, setCursos] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("todos");
  const [imagenesCursos, setImagenesCursos] = useState({});
  const [openAsignar, setOpenAsignar] = useState(null);

  const handleSearch = (query) => {
    console.log("Buscando:", query);
  };

  const handleToggleCurso = async (curso) => {
    try {
      const result = await Swal.fire({
        title: `¿Estás seguro de ${
          curso.estado_curso ? "deshabilitar" : "habilitar"
        } este curso?`,
        text: "Este cambio afectará la disponibilidad del curso para los usuarios.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: curso.estado_curso
          ? "Sí, deshabilitar"
          : "Sí, habilitar",
        cancelButtonText: "Cancelar",
      });

      if (result.isConfirmed) {
        const response = await axios.put(
          `http://localhost:4000/cursos/${curso.id_curso}`,
          {
            estado_curso: !curso.estado_curso,
          }
        );
        setCursos((prevCursos) =>
          prevCursos.map((c) =>
            c.id_curso === curso.id_curso ? response.data : c
          )
        );
        toast.success(
          `El curso ha sido ${
            curso.estado_curso ? "deshabilitado" : "habilitado"
          } correctamente.`
        );
      }
    } catch (error) {
      console.error("Error al cambiar el estado del curso:", error);
      toast.error("Hubo un problema al intentar cambiar el estado del curso.");
    }
  };

  const handleAsignarAreaComplete = () => {
    // toast.success("Áreas asignadas correctamente");
    fetchCursos(); // Recargar los cursos para reflejar los cambios
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-center mb-6">
          Gestión de Cursos
        </h2>

        {/* Barra de búsqueda y filtros */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <Input
              placeholder="Buscar curso por nombre..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full"
            />
          </div>
          <Select
            value={statusFilter}
            onValueChange={(value) => setStatusFilter(value)}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filtrar por estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="activos">Activos</SelectItem>
              <SelectItem value="inactivos">Inactivos</SelectItem>
            </SelectContent>
          </Select>
          <Link to="/agregar_cursos">
            <Button className="w-full md:w-auto">+ Agregar Nuevo Curso</Button>
          </Link>
        </div>

        {/* Grid de cursos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cursos.map((curso) => (
            <Card key={curso.id_curso} className="flex flex-col h-full">
              <CardHeader>
                <div className="relative">
                  <Link to={`/vercurso/${curso.id_curso}`}>
                    {!imagenesCursos[curso.id_curso] ? (
                      <div className="w-full h-48 bg-gray-200 rounded-t-lg animate-pulse" />
                    ) : imagenesCursos[curso.id_curso].tipo === "area" ? (
                      <img
                        className="w-full h-48 object-cover rounded-t-lg cursor-pointer"
                        src={`http://localhost:4000/api/area/imagen/${
                          imagenesCursos[curso.id_curso].idArea
                        }`}
                        alt={curso.nombre_curso}
                      />
                    ) : (
                      <div className="w-full h-48 flex items-center justify-center bg-gray-200 rounded-t-lg">
                        <span className="text-6xl font-bold text-gray-500">
                          {imagenesCursos[curso.id_curso].letra}
                        </span>
                      </div>
                    )}
                  </Link>
                  <Badge
                    className={`absolute top-2 right-2 ${
                      curso.estado_curso
                        ? "bg-green-500 hover:bg-green-600"
                        : "bg-red-500 hover:bg-red-600"
                    }`}
                  >
                    {curso.estado_curso ? "Habilitado" : "Deshabilitado"}
                  </Badge>
                </div>
                <CardTitle className="mt-4">{curso.nombre_curso}</CardTitle>
                <CardDescription className="line-clamp-2">
                  {curso.descripcion_curso}
                </CardDescription>
              </CardHeader>

              <CardContent className="flex-grow">
                {curso.fecha_limite ? (
                  <div className="text-sm font-medium text-amber-600 bg-amber-50 border border-amber-200 p-3 rounded-md">
                    <span className="block font-semibold">Fecha límite:</span>
                    {new Date(curso.fecha_limite).toLocaleDateString("es-ES", {
                      timeZone: "UTC",
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </div>
                ) : (
                  <div className="text-sm font-medium text-green-600 bg-green-50 border border-green-200 p-3 rounded-md">
                    Sin fecha de vencimiento
                  </div>
                )}
              </CardContent>

              <CardFooter className="flex flex-col gap-2 pt-4">
                <div className="flex gap-2 w-full">
                  <Link
                    to={`/modificar_curso/${curso.id_curso}`}
                    className="flex-1"
                  >
                    <Button variant="outline" className="w-full">
                      Modificar
                    </Button>
                  </Link>
                  <Button
                    variant={curso.estado_curso ? "destructive" : "default"}
                    onClick={() => handleToggleCurso(curso)}
                    className="flex-1"
                  >
                    {curso.estado_curso ? "Deshabilitar" : "Habilitar"}
                  </Button>
                </div>

                <Dialog
                  open={openAsignar === curso.id_curso}
                  onOpenChange={(open) => !open && setOpenAsignar(null)}
                >
                  <DialogTrigger asChild>
                    <Button
                      onClick={() => setOpenAsignar(curso.id_curso)}
                      className="w-full"
                      variant="secondary"
                    >
                      Asignar áreas
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Asignar Áreas al Curso</DialogTitle>
                    </DialogHeader>
                    <AsignarAreaACurso
                      cursoId={curso.id_curso}
                      onCreate={handleAsignarAreaComplete}
                    />
                  </DialogContent>
                </Dialog>
              </CardFooter>
            </Card>
          ))}
        </div>

        {cursos.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No se encontraron cursos que coincidan con los criterios de
            búsqueda.
          </div>
        )}
      </div>
    </div>
  );
}
