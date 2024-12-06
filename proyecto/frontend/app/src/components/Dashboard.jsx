import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Loader2,
  BarChart2,
  User,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const Dashboard = () => {
  const [encuestas, setEncuestas] = useState([]);
  const [selectedEncuesta, setSelectedEncuesta] = useState(null);
  const [detallesEncuesta, setDetallesEncuesta] = useState(null);
  const [totalAsignadas, setTotalAsignadas] = useState(0);
  const [totalRespondidas, setTotalRespondidas] = useState(0);
  const [detallesUsuario, setDetallesUsuario] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [usuariosPorPagina] = useState(5);
  const [detallesPage, setDetallesPage] = useState(1);
  const [detallesPorPagina] = useState(5);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleVerEstadisticas = (encuestaId, titulo, fechaCreacion) => {
    navigate(`/estadisticas-encuesta/${encuestaId}`, {
      state: { titulo, fechaCreacion },
    });
  };

  useEffect(() => {
    const fetchEncuestas = async () => {
      const token = localStorage.getItem("token");
      try {
        setLoading(true);
        const response = await axios.get(
          "http://localhost:4000/api/encuestas",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setEncuestas(response.data);
        setError(null);
      } catch (error) {
        console.error("Error al obtener encuestas:", error);
        setError(
          "Error al obtener encuestas. Por favor, intente de nuevo más tarde."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchEncuestas();
  }, []);

  const handleEncuestaSelect = async (encuestaId) => {
    const token = localStorage.getItem("token");
    try {
      setLoading(true);
      const response = await axios.get(
        `http://localhost:4000/api/encuestas/${encuestaId}/detalles`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setDetallesEncuesta(response.data);
      setSelectedEncuesta(encuestaId);
      calcularPorcentajes(response.data);
      setError(null);
    } catch (error) {
      console.error("Error al obtener detalles de la encuesta:", error);
      setError(
        "Error al obtener detalles de la encuesta. Por favor, intente de nuevo más tarde."
      );
    } finally {
      setLoading(false);
    }
  };

  const calcularPorcentajes = (encuestaDetalles) => {
    if (!encuestaDetalles || !encuestaDetalles.preguntas.length) {
      setTotalAsignadas(0);
      setTotalRespondidas(0);
      return;
    }

    const usuariosAsignados = new Set(
      encuestaDetalles.preguntas.flatMap((pregunta) =>
        pregunta.respuestas.map((respuesta) => respuesta.usuario.rut)
      )
    );

    const usuariosQueRespondieron = new Set();
    usuariosAsignados.forEach((rut) => {
      const respondioTodo = encuestaDetalles.preguntas.every((pregunta) =>
        pregunta.respuestas.some(
          (respuesta) =>
            respuesta.usuario.rut === rut &&
            (respuesta.texto_respuesta || respuesta.opcion)
        )
      );
      if (respondioTodo) {
        usuariosQueRespondieron.add(rut);
      }
    });

    setTotalAsignadas(usuariosAsignados.size);
    setTotalRespondidas(usuariosQueRespondieron.size);
  };

  const handleVerDetallesUsuario = (rut) => {
    const usuarioRespuestas = detallesEncuesta.preguntas.map((pregunta) => {
      const respuesta = pregunta.respuestas.find(
        (resp) => resp.usuario.rut === rut
      );
      return {
        pregunta: pregunta.texto_pregunta,
        respuesta: respuesta
          ? respuesta.texto_respuesta || respuesta.opcion?.texto_opcion
          : "Sin respuesta",
      };
    });
    setDetallesUsuario({ rut, respuestas: usuarioRespuestas });
  };

  // Paginación para usuarios
  const indexOfLastUsuario = currentPage * usuariosPorPagina;
  const indexOfFirstUsuario = indexOfLastUsuario - usuariosPorPagina;
  const currentUsuarios = detallesEncuesta
    ? detallesEncuesta.preguntas[0]?.respuestas.slice(
        indexOfFirstUsuario,
        indexOfLastUsuario
      )
    : [];

  const paginateUsuarios = (pageNumber) => setCurrentPage(pageNumber);

  // Paginación para detalles (preguntas y respuestas)
  const indexOfLastDetalle = detallesPage * detallesPorPagina;
  const indexOfFirstDetalle = indexOfLastDetalle - detallesPorPagina;
  const currentDetalles =
    detallesUsuario?.respuestas.slice(
      indexOfFirstDetalle,
      indexOfLastDetalle
    ) || [];

  const paginateDetalles = (pageNumber) => setDetallesPage(pageNumber);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="mr-2 h-16 w-16 animate-spin" />
        <span className="text-2xl">Cargando dashboard...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold text-center mb-8">
        Dashboard de Encuestas
      </h2>
      <Card>
        <CardHeader>
          <CardTitle>Selecciona una Encuesta</CardTitle>
          <CardDescription>
            Elige una encuesta para ver sus detalles y estadísticas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Select onValueChange={handleEncuestaSelect}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Seleccione una encuesta" />
            </SelectTrigger>
            <SelectContent>
              {encuestas.map((encuesta) => (
                <SelectItem
                  key={encuesta.id_encuesta}
                  value={encuesta.id_encuesta.toString()}
                >
                  {encuesta.titulo}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {detallesEncuesta && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>{detallesEncuesta.titulo}</CardTitle>
            <CardDescription>
              Detalles y estadísticas de la encuesta seleccionada
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <h4 className="text-lg font-semibold mb-2">
                Porcentaje de encuestas respondidas
              </h4>
              <Progress
                value={(totalRespondidas / totalAsignadas) * 100}
                className="w-full"
              />
              <p className="mt-2 text-sm text-muted-foreground">
                {totalRespondidas} de {totalAsignadas} (
                {((totalRespondidas / totalAsignadas) * 100).toFixed(1)}%)
              </p>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>RUT del Usuario</TableHead>
                  <TableHead>Nombre del Usuario</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentUsuarios.map(({ usuario }) => (
                  <TableRow key={usuario.rut}>
                    <TableCell>{usuario.rut}</TableCell>
                    <TableCell>{`${usuario.nombre} ${usuario.apellido_paterno} ${usuario.apellido_materno}`}</TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleVerDetallesUsuario(usuario.rut)}
                      >
                        <User className="mr-2 h-4 w-4" /> Ver Detalles
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <div className="flex justify-center mt-4">
              <Button
                variant="outline"
                onClick={() => paginateUsuarios(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              {Array.from({
                length: Math.ceil(
                  detallesEncuesta.preguntas[0]?.respuestas.length /
                    usuariosPorPagina
                ),
              }).map((_, i) => (
                <Button
                  key={i}
                  variant={currentPage === i + 1 ? "default" : "outline"}
                  onClick={() => paginateUsuarios(i + 1)}
                >
                  {i + 1}
                </Button>
              ))}
              <Button
                variant="outline"
                onClick={() => paginateUsuarios(currentPage + 1)}
                disabled={
                  currentPage ===
                  Math.ceil(
                    detallesEncuesta.preguntas[0]?.respuestas.length /
                      usuariosPorPagina
                  )
                }
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {detallesUsuario && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Detalles de Respuestas</CardTitle>
            <CardDescription>Usuario: {detallesUsuario.rut}</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pregunta</TableHead>
                  <TableHead>Respuesta</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentDetalles.map((detalle, index) => (
                  <TableRow key={index}>
                    <TableCell>{detalle.pregunta}</TableCell>
                    <TableCell>{detalle.respuesta}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <div className="flex justify-center mt-4">
              <Button
                variant="outline"
                onClick={() => paginateDetalles(detallesPage - 1)}
                disabled={detallesPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              {Array.from({
                length: Math.ceil(
                  detallesUsuario.respuestas.length / detallesPorPagina
                ),
              }).map((_, i) => (
                <Button
                  key={i}
                  variant={detallesPage === i + 1 ? "default" : "outline"}
                  onClick={() => paginateDetalles(i + 1)}
                >
                  {i + 1}
                </Button>
              ))}
              <Button
                variant="outline"
                onClick={() => paginateDetalles(detallesPage + 1)}
                disabled={
                  detallesPage ===
                  Math.ceil(
                    detallesUsuario.respuestas.length / detallesPorPagina
                  )
                }
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" onClick={() => setDetallesUsuario(null)}>
              Cerrar
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
};

export default Dashboard;
