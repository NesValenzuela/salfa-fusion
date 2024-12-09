import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../../components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import { Button } from "../../components/ui/button";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { PieChart, Pie, Cell, Legend } from "recharts";
import {
  Users,
  BookOpen,
  CheckCircle,
  PercentIcon,
  FileDown,
} from "lucide-react";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

// Datos de ejemplo
const userData = {
  byDepartment: [
    { name: "Mantención", total: 150, active: 140 },
    { name: "Carga", total: 100, active: 95 },
    { name: "Seguridad", total: 120, active: 110 },
    { name: "Prevención", total: 50, active: 45 },
    { name: "RR.HH.", total: 80, active: 60 },
  ],
};

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

export default function DashboardRRHH() {
  const [selectedDepartment, setSelectedDepartment] = useState("Todos");
  const [courseStats, setCourseStats] = useState(null);
  const [areas, setAreas] = useState([]);
  const [areaStats, setAreaStats] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Obtener áreas
        const areasResponse = await fetch("http://localhost:4000/api/areas/");
        if (!areasResponse.ok) throw new Error("Error al obtener áreas");
        const areasData = await areasResponse.json();
        setAreas(areasData);

        // Obtener estadísticas generales
        const statsResponse = await fetch(
          "http://localhost:4000/api/cursos/estadisticas"
        );
        if (!statsResponse.ok) throw new Error("Error al obtener estadísticas");
        const statsData = await statsResponse.json();
        setCourseStats(statsData);
      } catch (error) {
        console.error("Error:", error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchAreaStats = async () => {
      if (selectedDepartment === "Todos") {
        setAreaStats(null);
        return;
      }

      const selectedArea = areas.find(
        (area) => area.nombre_area === selectedDepartment
      );
      if (!selectedArea) return;

      try {
        const response = await fetch(
          `http://localhost:4000/api/cursoArea/dashboard/${selectedArea.id_area}`
        );
        if (!response.ok)
          throw new Error("Error al obtener estadísticas del área");
        const data = await response.json();
        setAreaStats(data);
      } catch (error) {
        console.error("Error:", error);
      }
    };

    fetchAreaStats();
  }, [selectedDepartment, areas]);

  const filteredUserData =
    selectedDepartment === "Todos"
      ? userData.byDepartment
      : userData.byDepartment.filter(
          (dept) => dept.name === selectedDepartment
        );

  const filteredCourseData =
    courseStats?.byDepartment.filter((dept) =>
      selectedDepartment === "Todos" ? true : dept.name === selectedDepartment
    ) || [];

  const canExportPDF = () => {
    if (selectedDepartment === "Todos") {
      return courseStats && courseStats.total > 0;
    } else {
      return (
        areaStats &&
        areaStats.totalCursosActivos > 0 &&
        areaStats.listadoCursos.some((curso) => curso.usuariosAsignados > 0)
      );
    }
  };

  const exportToPDF = async () => {
    const pdf = new jsPDF("p", "mm", "a4");
    const elements = document.querySelectorAll(".pdf-export");
    let yOffset = 10;

    for (let i = 0; i < elements.length; i++) {
      const element = elements[i];
      const canvas = await html2canvas(element);
      const imgData = canvas.toDataURL("image/png");

      if (i > 0) {
        pdf.addPage();
        yOffset = 10;
      }

      pdf.addImage(imgData, "PNG", 10, yOffset, 190, 0);
    }

    pdf.save(`dashboard-rrhh-${selectedDepartment}.pdf`);
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Dashboard de Recursos Humanos</h1>
        {canExportPDF() && (
          <Button onClick={exportToPDF}>
            <FileDown className="mr-2 h-4 w-4" />
            Exportar PDF
          </Button>
        )}
      </div>

      <div className="mb-6">
        <Select onValueChange={setSelectedDepartment}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Seleccionar Área" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Todos">Todas las Áreas</SelectItem>
            {areas.map((area) => (
              <SelectItem key={area.id_area} value={area.nombre_area}>
                {area.nombre_area}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="courses">
        <TabsList className="mb-4">
          {/* <TabsTrigger value="users">Usuarios</TabsTrigger> */}
          <TabsTrigger value="courses">Cursos</TabsTrigger>
        </TabsList>

        {/* <TabsContent value="courses"> */}
        <div className="pdf-export">
          <div className="grid gap-4 md:grid-cols-3 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {selectedDepartment === "Todos"
                    ? "Total de Cursos"
                    : "Cursos del Área"}
                </CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {selectedDepartment === "Todos"
                    ? courseStats?.total || 0
                    : areaStats?.totalCursosActivos || 0}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Cursos Finalizados
                </CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {selectedDepartment === "Todos"
                    ? courseStats?.completed || 0
                    : areaStats?.cursosFinalizados || 0}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Tasa de Finalización
                </CardTitle>
                <PercentIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {selectedDepartment === "Todos"
                    ? courseStats?.completionRate || 0
                    : areaStats?.totalCursosActivos
                    ? Math.round(
                        (areaStats.cursosFinalizados /
                          areaStats.totalCursosActivos) *
                          100
                      )
                    : 0}
                  %
                </div>
              </CardContent>
            </Card>
          </div>

          {selectedDepartment !== "Todos" &&
          areaStats?.totalCursosActivos === 0 ? (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Sin Cursos Asignados</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-center py-8">
                  Esta área aún no tiene cursos asignados.
                </p>
              </CardContent>
            </Card>
          ) : selectedDepartment !== "Todos" &&
            areaStats?.listadoCursos?.every(
              (curso) => curso.usuariosAsignados === 0
            ) ? (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Sin Usuarios Asignados</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-center py-8">
                  Esta área aún no tiene usuarios asignados a los cursos.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Estado de Cursos por Área</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    {filteredCourseData.map((dept, index) => (
                      <div key={dept.name} className="h-[300px] my-7">
                        <h3 className="text-center font-medium mb-2">
                          {dept.name}
                        </h3>
                        {dept.total > 0 ? (
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={[
                                  {
                                    name: "Completados",
                                    value: dept.completed,
                                  },
                                  {
                                    name: "En Progreso",
                                    value: dept.total - dept.completed,
                                  },
                                ]}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                outerRadius={80}
                                fill="#1774d8"
                                dataKey="value"
                                label={({ name, value, percent }) =>
                                  `${name}: ${value} (${(percent * 100).toFixed(
                                    0
                                  )}%)`
                                }
                              >
                                <Cell fill={COLORS[index % COLORS.length]} />
                                <Cell
                                  fill={`${COLORS[index % COLORS.length]}80`}
                                />
                              </Pie>
                              <Tooltip
                                formatter={(value) => [`${value} cursos`]}
                              />
                              <Legend />
                            </PieChart>
                          </ResponsiveContainer>
                        ) : (
                          <div className="h-full flex items-center justify-center">
                            <div className="text-center text-gray-500">
                              <p className="mb-2">⚠️</p>
                              <p>Esta área no tiene cursos asociados</p>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {selectedDepartment === "Todos" && (
                <Card>
                  <CardHeader>
                    <CardTitle>Resumen General de Cursos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[400px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={[
                              {
                                name: "Completados",
                                value: courseStats?.completed || 0,
                              },
                              {
                                name: "En Progreso",
                                value:
                                  (courseStats?.total || 0) -
                                  (courseStats?.completed || 0),
                              },
                            ]}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={120}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ name, value, percent }) =>
                              `${name}: ${value} (${(percent * 100).toFixed(
                                0
                              )}%)`
                            }
                          >
                            <Cell fill="#8884d8" />
                            <Cell fill="#82ca9d" />
                          </Pie>
                          <Tooltip formatter={(value) => [`${value} cursos`]} />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          <div className="mt-6 grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>
                  {selectedDepartment === "Todos"
                    ? "Listado de Todos los Cursos"
                    : `Listado de Cursos - ${selectedDepartment}`}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedDepartment !== "Todos" &&
                areaStats?.totalCursosActivos === 0 ? (
                  <p className="text-muted-foreground text-center py-4">
                    Esta área aún no tiene cursos asignados.
                  </p>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {(selectedDepartment === "Todos"
                      ? courseStats?.cursos
                      : areaStats?.listadoCursos
                    )?.map((curso) => (
                      <Card key={curso.id}>
                        <CardHeader>
                          <CardTitle className="text-lg">
                            {curso.nombre}
                          </CardTitle>
                          <CardDescription className="line-clamp-2 h-10 overflow-hidden">
                            {curso.descripcion}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div
                            className={`rounded-md p-3 ${
                              curso.completado
                                ? "bg-green-50 text-green-700"
                                : "bg-yellow-50 text-yellow-700"
                            }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium">Estado:</span>
                              <span>
                                {curso.completado
                                  ? "✅ Completado"
                                  : "🔄 En progreso"}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="font-medium">Progreso:</span>
                              <span>
                                {curso.usuariosCompletados}/
                                {curso.usuariosAsignados} usuarios
                              </span>
                            </div>
                            <div className="mt-2 h-2 rounded-full bg-gray-200">
                              <div
                                className={`h-2 rounded-full ${
                                  curso.completado
                                    ? "bg-green-500"
                                    : "bg-yellow-500"
                                }`}
                                style={{
                                  width: `${
                                    curso.usuariosAsignados === 0
                                      ? 0
                                      : (curso.usuariosCompletados /
                                          curso.usuariosAsignados) *
                                        100
                                  }%`,
                                }}
                              />
                            </div>
                          </div>
                          <Button
                            className="w-full mt-4 bg-purple-500"
                            onClick={() =>
                              (window.location.href = `/usuarios-curso/${curso.id}`)
                            }
                          >
                            Ver Detalles de Usuarios
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
        {/* </TabsContent> */}
      </Tabs>
    </div>
  );
}
