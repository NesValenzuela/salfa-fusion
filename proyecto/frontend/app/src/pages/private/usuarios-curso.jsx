import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { Progress } from "../../components/ui/progress";
import { toast } from "sonner";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../../components/ui/accordion";
import { CheckCircle2, XCircle } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Button } from "../../components/ui/button";
import { Download } from "lucide-react";

const UsuariosCurso = () => {
  const { id } = useParams();
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filtro, setFiltro] = useState("todos");

  useEffect(() => {
    const cargarUsuarios = async () => {
      if (!id) {
        setError("ID de curso no válido");
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(
          `http://localhost:4000/api/curso/${id}/usuarios`
        );
        setUsuarios(response.data);
        setError(null);
      } catch (error) {
        console.error("Error al cargar usuarios:", error);
        setError("Error al cargar los usuarios del curso");
        toast.error("Error al cargar los usuarios del curso");
      } finally {
        setLoading(false);
      }
    };

    cargarUsuarios();
  }, [id]);

  const usuariosFiltrados = usuarios.filter((usuario) => {
    switch (filtro) {
      case "completados":
        return usuario.progreso === 100;
      case "pendientes":
        return usuario.progreso < 100;
      default:
        return true;
    }
  });

  const generarPDF = () => {
    const doc = new jsPDF();
    const fecha = new Date().toLocaleDateString();

    // Título del documento
    doc.setFontSize(16);
    doc.text("Reporte de Usuarios del Curso", 14, 15);

    // Subtítulo con el filtro actual
    doc.setFontSize(12);
    let filtroTexto = "Todos los usuarios";
    if (filtro === "completados")
      filtroTexto = "Usuarios que completaron el curso";
    if (filtro === "pendientes") filtroTexto = "Usuarios con curso pendiente";
    doc.text(`${filtroTexto} - ${fecha}`, 14, 25);

    // Información general
    doc.setFontSize(10);
    doc.text(`Total de usuarios: ${usuarios.length}`, 14, 35);
    doc.text(`Usuarios mostrados: ${usuariosFiltrados.length}`, 14, 42);

    // Tabla de usuarios
    const tableData = usuariosFiltrados.map((usuario) => [
      `${usuario.usuario.nombre} ${usuario.usuario.apellido_paterno} ${usuario.usuario.apellido_materno} ${usuario.usuario.apellido_materno}`,
      usuario.usuario.correo,
      `${usuario.progreso}%`,
      `${usuario.leccionesCompletadas}/${usuario.totalLecciones}`,
    ]);

    autoTable(doc, {
      head: [
        ["Nombre Completo", "Correo", "Progreso", "Lecciones Completadas"],
      ],
      body: tableData,
      startY: 50,
      theme: "grid",
      styles: { fontSize: 8 },
      headStyles: { fillColor: [66, 66, 66] },
    });

    // Detalles por usuario
    let yPos = doc.lastAutoTable.finalY + 20;

    usuariosFiltrados.forEach((usuario, index) => {
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFontSize(12);
      doc.text(
        `Detalle de Usuario: ${usuario.usuario.nombre} ${usuario.usuario.apellido_paterno}`,
        14,
        yPos
      );
      yPos += 10;

      const modulosData = usuario.modulos.flatMap((modulo) =>
        modulo.lecciones.map((leccion) => [
          modulo.nombre_modulo,
          leccion.nombre_leccion,
          leccion.completada ? "Completada" : "Pendiente",
        ])
      );

      autoTable(doc, {
        head: [["Módulo", "Lección", "Estado"]],
        body: modulosData,
        startY: yPos,
        theme: "grid",
        styles: { fontSize: 8 },
        headStyles: { fillColor: [66, 66, 66] },
      });

      yPos = doc.lastAutoTable.finalY + 15;
    });

    // Guardar el PDF
    const nombreArchivo = `reporte-usuarios-${filtro}-${fecha}.pdf`;
    doc.save(nombreArchivo);
  };

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Cargando...
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <CardTitle>Usuarios del Curso</CardTitle>
              <Button
                onClick={generarPDF}
                className="flex items-center gap-2 transition-all duration-300 ease-in-out"
              >
                <Download className="h-4 w-4" />
                Generar PDF
              </Button>
            </div>
            <Select value={filtro} onValueChange={(value) => setFiltro(value)}>
              <SelectTrigger className="w-[180px] transition-all duration-300 ease-in-out">
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem
                  value="todos"
                  className="transition-colors duration-200 ease-in-out"
                >
                  Todos los usuarios
                </SelectItem>
                <SelectItem
                  value="completados"
                  className="transition-colors duration-200 ease-in-out"
                >
                  Curso completado
                </SelectItem>
                <SelectItem
                  value="pendientes"
                  className="transition-colors duration-200 ease-in-out"
                >
                  Curso pendiente
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="mt-2 text-sm text-gray-500 transition-all duration-300 ease-in-out">
            Mostrando {usuariosFiltrados.length} de {usuarios.length} usuarios
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {usuariosFiltrados.map((usuario) => (
              <Card
                key={usuario.usuario.rut}
                className="p-4 transition-all duration-500 ease-in-out hover:shadow-lg"
              >
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="transition-all duration-300 ease-in-out">
                    <h3 className="font-semibold text-lg">
                      {`${usuario.usuario.nombre} ${usuario.usuario.apellido_paterno} ${usuario.usuario.apellido_materno}`}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {usuario.usuario.correo}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center justify-end gap-2 mb-2">
                      <Progress
                        value={usuario.progreso}
                        className="w-[60%] transition-all duration-1000 ease-in-out"
                      />
                      <span className="transition-all duration-300 ease-in-out">
                        {usuario.progreso}%
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 transition-all duration-300 ease-in-out">
                      {usuario.leccionesCompletadas}/{usuario.totalLecciones}{" "}
                      lecciones completadas
                    </p>
                  </div>
                </div>

                <Accordion type="single" collapsible className="w-full">
                  {usuario.modulos.map((modulo) => (
                    <AccordionItem
                      key={modulo.id_modulo}
                      value={`modulo-${modulo.id_modulo}`}
                      className="transition-all duration-300 ease-in-out"
                    >
                      <AccordionTrigger className="hover:no-underline transition-all duration-300 ease-in-out">
                        <span className="text-sm font-medium">
                          {modulo.nombre_modulo}
                        </span>
                      </AccordionTrigger>
                      <AccordionContent className="transition-all duration-500 ease-in-out">
                        <Table>
                          <TableHeader>
                            <TableRow className="transition-colors duration-200 ease-in-out">
                              <TableHead>Lección</TableHead>
                              <TableHead className="w-[100px] text-right">
                                Estado
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {modulo.lecciones.map((leccion) => (
                              <TableRow
                                key={leccion.id_leccion}
                                className="transition-colors duration-200 ease-in-out"
                              >
                                <TableCell>{leccion.nombre_leccion}</TableCell>
                                <TableCell className="text-right">
                                  {leccion.completada ? (
                                    <CheckCircle2 className="h-5 w-5 text-green-500 inline transition-all duration-300 ease-in-out" />
                                  ) : (
                                    <XCircle className="h-5 w-5 text-red-500 inline transition-all duration-300 ease-in-out" />
                                  )}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </Card>
            ))}

            {usuariosFiltrados.length === 0 && (
              <div className="text-center py-4 text-gray-500 transition-opacity duration-300 ease-in-out">
                No hay usuarios que coincidan con el filtro seleccionado
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UsuariosCurso;
