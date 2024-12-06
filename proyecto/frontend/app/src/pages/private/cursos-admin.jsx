import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog";
import { Label } from "../../components/ui/label";

const VistaCursosAdmin = () => {
  const queryParams = new URLSearchParams(window.location.search);
  const area_id = queryParams.get("id_area");
  console.log(area_id);

  const [cursos, setCursos] = useState([
    {
      id: 1,
      nombre: "Equipos de Protección Personal (EPP)",
      descripcion:
        "Veremos los equipos de protección personal y su uso diario dentro de la empresa.",
      activo: true,
    },
    {
      id: 2,
      nombre: "Operador de Maquinaria Pesada Multifuncional",
      descripcion:
        "Esta capacitación está diseñada para preparar a los participantes en el manejo seguro y eficiente de diversos tipos de maquinaria pesada, como excavadoras, cargadoras y grúas. A lo largo del programa, los participantes adquirirán habilidades prácticas en la operación de equipos, mantenimiento preventivo, y normas de seguridad industrial. También se abordarán técnicas de movimientos de tierra, carga y carga...",
      activo: true,
    },
    {
      id: 3,
      nombre: "Capacitación Minera ewe",
      descripcion:
        "Esta capacitación está diseñada para preparar a los participantes en el manejo seguro y eficiente de diversos tipos de maquinaria pesada, como excavadoras, cargadoras y grúas. A lo largo del programa, los participantes adquirirán habilidades prácticas en la operación de equipos, mantenimiento preventivo, y normas de seguridad industrial. También se abordarán técnicas de movimientos de tierra, carga y carga...",
      activo: true,
    },
  ]);

  if (area_id) {
    const cursosFiltrados = area_id
      ? cursos.filter((curso) => curso.id === Number(area_id))
      : cursos;
    console.log(area_id);
  }

  const [cursoEditando, setCursoEditando] = useState(null);
  const [dialogoAbierto, setDialogoAbierto] = useState(false);

  const agregarCurso = (curso) => {
    const nuevoCurso = {
      ...curso,
      id: cursos.length + 1,
      activo: true,
    };
    setCursos([...cursos, nuevoCurso]);
    setDialogoAbierto(false);
  };

  const actualizarCurso = (cursoActualizado) => {
    setCursos(
      cursos.map((curso) =>
        curso.id === cursoActualizado.id ? cursoActualizado : curso
      )
    );
    setDialogoAbierto(false);
    setCursoEditando(null);
  };

  const toggleEstadoCurso = (id) => {
    setCursos(
      cursos.map((curso) =>
        curso.id === id ? { ...curso, activo: !curso.activo } : curso
      )
    );
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Gestión de Cursos</h1>
      <Dialog open={dialogoAbierto} onOpenChange={setDialogoAbierto}>
        <DialogTrigger asChild>
          <Button className="mb-4">Agregar Curso</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {cursoEditando ? "Editar Curso" : "Agregar Nuevo Curso"}
            </DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const nuevoCurso = {
                nombre: formData.get("nombre"),
                descripcion: formData.get("descripcion"),
              };
              if (cursoEditando) {
                actualizarCurso({ ...cursoEditando, ...nuevoCurso });
              } else {
                agregarCurso(nuevoCurso);
              }
            }}
          >
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="nombre" className="text-right">
                  Nombre
                </Label>
                <Input
                  id="nombre"
                  name="nombre"
                  defaultValue={cursoEditando?.nombre}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="descripcion" className="text-right">
                  Descripción
                </Label>
                <Input
                  id="descripcion"
                  name="descripcion"
                  defaultValue={cursoEditando?.descripcion}
                  className="col-span-3"
                />
              </div>
            </div>
            <div className="flex justify-end">
              <Button type="submit">
                {cursoEditando ? "Actualizar" : "Agregar"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Nombre</TableHead>
            <TableHead>Descripción</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {cursos.map((curso) => (
            <TableRow key={curso.id}>
              <TableCell>{curso.id}</TableCell>
              <TableCell>{curso.nombre}</TableCell>
              <TableCell>{curso.descripcion}</TableCell>
              <TableCell>{curso.activo ? "Activo" : "Deshabilitado"}</TableCell>
              <TableCell>
                <Button
                  variant="outline"
                  className="mr-2"
                  onClick={() => {
                    setCursoEditando(curso);
                    setDialogoAbierto(true);
                  }}
                >
                  Editar
                </Button>
                <Button
                  variant={curso.activo ? "destructive" : "default"}
                  onClick={() => toggleEstadoCurso(curso.id)}
                >
                  {curso.activo ? "Deshabilitar" : "Habilitar"}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default VistaCursosAdmin;
