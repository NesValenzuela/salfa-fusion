import React, { useState, useEffect } from "react";
import axios from "axios";
import { Plus, Pencil, ToggleLeft, Upload } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import UsuarioForm from "./Usuarioform";

const Usuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [usuarioEditado, setUsuarioEditado] = useState(null);
  const [formVisible, setFormVisible] = useState(false);
  const [roles, setRoles] = useState([]);
  const [areas, setAreas] = useState([]);
  const [archivoExcel, setArchivoExcel] = useState(null);
  const [usuarioDeshabilitar, setUsuarioDeshabilitar] = useState(null);
  const [mostrarDialogo, setMostrarDialogo] = useState(false);

  useEffect(() => {
    obtenerUsuarios();
    obtenerRoles();
    obtenerAreas();
  }, []);

  const obtenerUsuarios = async () => {
    try {
      const response = await axios.get("http://localhost:4000/api/usuarios");
      setUsuarios(response.data);
    } catch (error) {
      console.error("Error al obtener usuarios", error);
    }
  };

  const obtenerRoles = async () => {
    try {
      const response = await axios.get("http://localhost:4000/api/roles");
      setRoles(response.data);
    } catch (error) {
      console.error("Error al obtener roles", error);
    }
  };

  const obtenerAreas = async () => {
    try {
      const response = await axios.get("http://localhost:4000/api/areas");
      setAreas(response.data);
    } catch (error) {
      console.error("Error al obtener áreas", error);
    }
  };

  const handleCrearUsuario = () => {
    setUsuarioEditado(null);
    setFormVisible(true);
  };

  const handleModificarUsuario = (usuario) => {
    setUsuarioEditado(usuario);
    setFormVisible(true);
  };

  const handleGuardarUsuario = async (usuario) => {
    try {
      if (usuarioEditado) {
        await axios.put(
          `http://localhost:4000/api/usuarios/${usuarioEditado.rut}`,
          usuario
        );
      } else {
        if (
          !usuario.rut ||
          !usuario.nombre ||
          !usuario.apellido_paterno ||
          !usuario.correo ||
          !usuario.contrasena ||
          !usuario.rolId ||
          !usuario.areaId
        ) {
          alert("Todos los campos son obligatorios");
          return;
        }
        await axios.post("http://localhost:4000/api/usuarios", usuario);
      }
      setFormVisible(false);
      obtenerUsuarios();
    } catch (error) {
      console.error("Error al guardar el usuario:", error);
      alert(
        `Error al guardar el usuario: ${
          error.response?.data?.error || "Error desconocido"
        }`
      );
    }
  };

  const handleCambiarEstadoUsuario = async () => {
    if (!usuarioDeshabilitar) return;
    const nuevoEstado = !usuarioDeshabilitar.activo;

    try {
      await axios.patch(
        `http://localhost:4000/api/usuarios/${usuarioDeshabilitar.rut}/cambiar-estado`,
        { activo: nuevoEstado }
      );
      setUsuarioDeshabilitar(null);
      setMostrarDialogo(false);
      obtenerUsuarios();
    } catch (error) {
      console.error("Error al cambiar el estado del usuario", error);
    }
  };

  const handleToggleEstado = (usuario) => {
    setUsuarioDeshabilitar(usuario);
    setMostrarDialogo(true);
  };

  const handleCancelar = () => {
    setFormVisible(false);
  };

  const handleArchivoExcelChange = (e) => {
    setArchivoExcel(e.target.files[0]);
  };

  const handleCargarUsuariosDesdeExcel = async () => {
    if (!archivoExcel) {
      alert("Por favor seleccione un archivo Excel");
      return;
    }

    const formData = new FormData();
    formData.append("file", archivoExcel);

    try {
      await axios.post(
        "http://localhost:4000/api/usuarios/cargar-excel",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      alert("Usuarios cargados correctamente");
      obtenerUsuarios();
    } catch (error) {
      console.error("Error al cargar usuarios desde Excel", error);
      alert("Error al cargar usuarios desde Excel");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Gestión de Usuarios</CardTitle>
          <CardDescription>Administre los usuarios del sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-4">
            <Dialog open={formVisible} onOpenChange={setFormVisible}>
              <DialogTrigger asChild>
                <Button onClick={handleCrearUsuario}>
                  <Plus className="mr-2 h-4 w-4" /> Crear Usuario
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>
                    {usuarioEditado ? "Modificar Usuario" : "Crear Usuario"}
                  </DialogTitle>
                  <DialogDescription>
                    Complete los detalles del usuario y haga clic en guardar
                    cuando termine.
                  </DialogDescription>
                </DialogHeader>
                <UsuarioForm
                  usuarioEditado={usuarioEditado}
                  onSave={handleGuardarUsuario}
                  onCancel={() => setFormVisible(false)}
                  roles={roles}
                  areas={areas}
                />
              </DialogContent>
            </Dialog>
            <div className="flex items-center space-x-2">
              <Input
                type="file"
                accept=".xlsx, .xls"
                onChange={handleArchivoExcelChange}
              />
              <Button onClick={handleCargarUsuariosDesdeExcel}>
                <Upload className="mr-2 h-4 w-4" /> Cargar Excel
              </Button>
            </div>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>RUT</TableHead>
                <TableHead>Correo</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Área</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {usuarios.map((usuario) => {
                const rol = roles.find((r) => r.id_rol === usuario.rolId);
                const area = areas.find((a) => a.id_area === usuario.areaId);
                return (
                  <TableRow key={usuario.rut}>
                    <TableCell>{`${usuario.nombre} ${usuario.apellido_paterno} ${usuario.apellido_materno}`}</TableCell>
                    <TableCell>{usuario.rut}</TableCell>
                    <TableCell>{usuario.correo}</TableCell>
                    <TableCell>{rol ? rol.nombre_rol : "Sin rol"}</TableCell>
                    <TableCell>
                      {area ? area.nombre_area : "Sin área"}
                    </TableCell>
                    <TableCell className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Switch
                          checked={usuario.activo}
                          onCheckedChange={() => handleToggleEstado(usuario)}
                        />
                        <span className="ml-2 text-sm">
                          {usuario.activo ? "Habilitado" : "Deshabilitado"}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <Button
                          variant="outline"
                          size="icon"
                          className="mr-2"
                          onClick={() => handleModificarUsuario(usuario)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      {usuarioDeshabilitar && (
        <Dialog open={mostrarDialogo} onOpenChange={setMostrarDialogo}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirmar acción</DialogTitle>
              <DialogDescription>
                ¿Está seguro de que desea{" "}
                {usuarioDeshabilitar.activo ? "deshabilitar" : "habilitar"} al
                usuario <strong>{usuarioDeshabilitar.nombre}</strong>?{" "}
                {usuarioDeshabilitar.activo
                  ? "Si deshabilita este usuario, no tendrá acceso a la plataforma."
                  : "Si habilita este usuario, tendrá acceso a la plataforma."}
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end space-x-4">
              <Button
                variant="outline"
                onClick={() => setMostrarDialogo(false)}
              >
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={handleCambiarEstadoUsuario}
              >
                Confirmar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default Usuarios;
