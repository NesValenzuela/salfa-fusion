import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Progress } from "../../components/ui/progress";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { FileText } from "lucide-react";
import jsPDF from "jspdf";
import "jspdf-autotable";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";

export default function DetalleUsuarioLecciones() {
  const { id } = useParams();
  const [usuario, setUsuario] = useState(null);
  const [activeTab, setActiveTab] = useState("todos");

  const fetchUsuarioCursos = async () => {
    try {
      const response = await fetch(
        `http://localhost:4000/api/usuarioLecciones/${id}`
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setUsuario(data);
    } catch (error) {
      console.error("Error al cargar los cursos del usuario:", error);
    }
  };

  useEffect(() => {
    fetchUsuarioCursos();
  }, [id]);
  console.log(usuario);

  const generatePDF = () => {
    if (!usuario) return;

    const doc = new jsPDF();
    let yPos = 22;

    // Título del documento
    doc.setFontSize(18);
    doc.text("Informe de Cursos", 14, yPos);
    yPos += 13;

    // Información del usuario
    doc.setFontSize(12);
    doc.text(
      `Usuario: ${usuario.nombre} ${usuario.apellido_paterno} ${usuario.apellido_materno}`,
      14,
      yPos
    );
    yPos += 10;
    doc.text(`RUT: ${usuario.rut}`, 14, yPos);
    yPos += 15;

    // Iterar sobre cada curso
    usuario.cursoAsignados.forEach((cursoAsignado, index) => {
      const curso = cursoAsignado.curso;

      // Calcular progreso del curso
      const todasLasLecciones = curso.modulos.flatMap(
        (modulo) => modulo.lecciones
      );
      const totalLecciones = todasLasLecciones.length;
      const leccionesCompletadas = todasLasLecciones.filter(
        (leccion) =>
          leccion.Cumplimiento_leccion &&
          leccion.Cumplimiento_leccion.length > 0 &&
          leccion.Cumplimiento_leccion[0].estado
      ).length;
      const progreso =
        totalLecciones > 0
          ? Math.round((leccionesCompletadas / totalLecciones) * 100)
          : 0;

      // Estado basado en el progreso
      const estado =
        progreso === 100
          ? "Completado"
          : progreso > 0
          ? "En Progreso"
          : "No Iniciado";

      // Si no hay espacio suficiente, agregar nueva página
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }

      // Información del curso
      doc.setFontSize(14);
      doc.setFont(undefined, "bold");
      doc.text(`${index + 1}. ${curso.nombre_curso}`, 14, yPos);
      yPos += 7;

      doc.setFontSize(10);
      doc.setFont(undefined, "normal");
      doc.text(
        `Fecha de Asignación: ${new Date(
          cursoAsignado.fecha_asignacion
        ).toLocaleDateString()}`,
        20,
        yPos
      );
      yPos += 5;
      doc.text(`Estado: ${estado}`, 20, yPos);
      yPos += 5;
      doc.text(`Progreso: ${progreso}%`, 20, yPos);
      yPos += 10;

      // Tabla de lecciones
      const leccionesData = curso.modulos.flatMap((modulo) =>
        modulo.lecciones.map((leccion) => {
          const completada =
            leccion.Cumplimiento_leccion &&
            leccion.Cumplimiento_leccion.length > 0 &&
            leccion.Cumplimiento_leccion[0].estado;

          return [
            modulo.nombre_modulo,
            leccion.nombre_leccion,
            completada ? "Completada" : "Pendiente",
          ];
        })
      );

      if (leccionesData.length > 0) {
        doc.autoTable({
          startY: yPos,
          head: [["Módulo", "Lección", "Estado"]],
          body: leccionesData,
          theme: "grid",
          headStyles: { fillColor: [66, 66, 66], fontSize: 8 },
          styles: { fontSize: 8 },
          margin: { left: 20 },
        });

        yPos = doc.lastAutoTable.finalY + 15;
      }
    });

    // Guardar el PDF
    doc.save(
      `informe_cursos_${usuario.nombre}_${usuario.apellido_paterno}.pdf`
    );
  };

  return (
    <div className="container mx-auto p-4">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>
            Cursos Asignados a {usuario?.nombre} {usuario?.apellido_paterno}{" "}
            {usuario?.apellido_materno}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold">
                {usuario?.cursoAsignados.length}
              </p>
              <p className="text-sm text-muted-foreground">Total de Cursos</p>
            </div>
          </div>
          <div className="mt-4 flex justify-center">
            <Button onClick={generatePDF} className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Generar Informe PDF
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Tabs defaultValue="todos">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="todos">Todos</TabsTrigger>
              <TabsTrigger value="completadas">Completados</TabsTrigger>
              <TabsTrigger value="en_progreso">En Progreso</TabsTrigger>
              <TabsTrigger value="no_iniciadas">No Iniciados</TabsTrigger>
            </TabsList>

            <TabsContent value="todos">
              <ListaCursosFiltrados
                cursos={usuario?.cursoAsignados.map((ca) => ca.curso) || []}
                filtro="todos"
              />
            </TabsContent>
            <TabsContent value="completadas">
              <ListaCursosFiltrados
                cursos={usuario?.cursoAsignados.map((ca) => ca.curso) || []}
                filtro="completadas"
              />
            </TabsContent>
            <TabsContent value="en_progreso">
              <ListaCursosFiltrados
                cursos={usuario?.cursoAsignados.map((ca) => ca.curso) || []}
                filtro="en_progreso"
              />
            </TabsContent>
            <TabsContent value="no_iniciadas">
              <ListaCursosFiltrados
                cursos={usuario?.cursoAsignados.map((ca) => ca.curso) || []}
                filtro="no_iniciadas"
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

function ListaCursosFiltrados({ cursos, filtro }) {
  // Cálculo del progreso del curso
  const calcularProgresoCurso = (curso) => {
    const todasLasLecciones = curso.modulos.flatMap(
      (modulo) => modulo.lecciones
    );
    const totalLecciones = todasLasLecciones.length;
    const leccionesCompletadas = todasLasLecciones.filter(
      (leccion) =>
        leccion.Cumplimiento_leccion &&
        leccion.Cumplimiento_leccion.length > 0 &&
        leccion.Cumplimiento_leccion[0].estado
    ).length;

    return totalLecciones > 0
      ? Math.round((leccionesCompletadas / totalLecciones) * 100)
      : 0;
  };

  // Filtrar cursos según su progreso
  const cursosFiltrados = cursos.filter((curso) => {
    const progreso = calcularProgresoCurso(curso);

    switch (filtro) {
      case "completadas":
        return progreso === 100;
      case "en_progreso":
        return progreso > 0 && progreso < 100;
      case "no_iniciadas":
        return progreso === 0;
      default:
        return true; // "todos"
    }
  });

  return (
    <div className="space-y-4">
      {cursosFiltrados.map((curso) => {
        const progresoCurso = calcularProgresoCurso(curso);
        let estadoCurso =
          progresoCurso === 100
            ? "completado"
            : progresoCurso > 0
            ? "en_progreso"
            : "no_iniciado";

        return (
          <Card key={curso.id_curso}>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>{curso.nombre_curso}</CardTitle>
                <EstadoCursoBadge estado={estadoCurso} />
              </div>
            </CardHeader>
            <CardContent>
              <Progress value={progresoCurso} max={100} />
              <p className="mt-2 text-sm text-gray-600">
                {progresoCurso}% Progreso
              </p>
            </CardContent>
          </Card>
        );
      })}
      {cursosFiltrados.length === 0 && (
        <p className="text-center text-gray-500 py-4">
          No hay cursos{" "}
          {filtro === "completadas"
            ? "completados"
            : filtro === "en_progreso"
            ? "en progreso"
            : filtro === "no_iniciadas"
            ? "sin iniciar"
            : ""}
        </p>
      )}
    </div>
  );
}

function EstadoCursoBadge({ estado }) {
  const badgeVariants = {
    completado: "bg-green-500",
    en_progreso: "bg-yellow-500",
    no_iniciado: "bg-gray-500",
  };

  const badgeTexts = {
    completado: "Completado",
    en_progreso: "En Progreso",
    no_iniciado: "No Iniciado",
  };

  return (
    <Badge className={`${badgeVariants[estado]} text-white`}>
      {badgeTexts[estado]}
    </Badge>
  );
}
