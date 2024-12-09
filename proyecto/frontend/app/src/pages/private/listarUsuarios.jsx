import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Search, UserCheck, UserPen, UserX, Plus } from "lucide-react";
import { Toaster, toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import N_usuario from "./nuevo-usuario";
import { useUser } from "../../contexts/UserContext";
import EditarUsuario from "./editarUsuario";
import { BarChart2 } from "lucide-react";
import axios from "axios";

export default function ListadoUsuarios() {
  const { user } = useUser();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const id_area = searchParams.get("id_area");

  const [usuarios, setUsuarios] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDept, setSelectedDept] = useState("Todos");
  const [areas, setAreas] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [errorMessages, setErrorMessages] = useState([]);

  useEffect(() => {
    cargarAreas();
  }, []);

  useEffect(() => {
    if (id_area) {
      setSelectedDept(id_area);
    }
    cargarUsuarios(selectedDept);
  }, [id_area]);

  useEffect(() => {
    cargarUsuarios(selectedDept);
    if (selectedDept === "Todos") {
      navigate("/listar-usuarios");
    } else {
      navigate(`?id_area=${selectedDept}`);
    }
  }, [selectedDept, navigate]);

  function formatRut(rut) {
    const numero = rut.toString();
    if (numero.length === 9) {
      return `${numero.slice(0, 8)}-${numero.slice(8)}`;
    } else if (numero.length === 8) {
      return `${numero.slice(0, 7)}-${7}`;
    } else {
      return numero;
    }
  }

  const cargarAreas = async () => {
    try {
      const response = await fetch("http://localhost:4000/api/area");
      if (!response.ok) {
        throw new Error(`HTTP Error! status: ${response.status}`);
      }
      const data = await response.json();
      setAreas(data);
    } catch (error) {
      console.error("Error al cargar Áreas", error);
      toast("Error al cargar los Áreas");
    }
  };

  const cargarUsuarios = async (area) => {
    setIsLoading(true);
    try {
      let url = "http://localhost:4000/api/usuarios/all";
      if (area && area !== "Todos") {
        url += `?id_area=${area}`;
      }
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (!data.usuarios) {
        console.error("No se encontró la propiedad usuarios en la respuesta");
        setUsuarios([]);
        return;
      }
      const usuarios = data.usuarios.map((usr) => ({
        ...usr,
        rut: formatRut(usr.rut),
        estadoFirebase: usr.estadoFirebase ?? true,
      }));
      setUsuarios(usuarios);
    } catch (error) {
      console.error("Error al cargar usuarios:", error);
      toast.error("Error al cargar los usuarios");
    } finally {
      setIsLoading(false);
    }
  };

  const filtrarUsuariosPorRol = (usuarios, rolActual) => {
    switch (rolActual.toLowerCase()) {
      case "administrador":
        // Mostrar solo administradores y trabajadores
        return usuarios.filter((usuario) =>
          ["administrador", "usuario"].includes(
            usuario.rol.nombre_rol.toLowerCase()
          )
        );
      case "usuario":
        // Mostrar solo usuarios
        return usuarios.filter(
          (usuario) => usuario.rol.nombre_rol.toLowerCase() === "usuario"
        );
      default:
        // window.location.href = "/acceso-denegado";
        return usuarios;
    }
  };

  const usuariosFiltrados = useMemo(() => {
    // Primero filtramos por rol
    const usuariosPorRol = filtrarUsuariosPorRol(usuarios, user?.role || "");

    // Luego aplicamos los filtros de búsqueda y área
    return usuariosPorRol.filter((usuario) => {
      const coincideBuscar = Object.values(usuario).some(
        (value) =>
          value !== null &&
          value !== undefined &&
          value.toString().toLowerCase().includes(busqueda.toLowerCase())
      );

      const coincideArea =
        selectedDept === "Todos" ||
        (usuario.areaId && usuario.areaId.toString() === selectedDept);

      return coincideBuscar && coincideArea;
    });
  }, [usuarios, user?.role, busqueda, selectedDept]);

  const handleDeleteUsers = async () => {
    if (!selectedUsers.length) {
      toast.error("Selecciona al menos un usuario para eliminar");
      return;
    }

    if (
      !confirm(`¿Estás seguro de eliminar ${selectedUsers.length} usuario(s)?`)
    ) {
      return;
    }

    try {
      const response = await axios.delete(
        "http://localhost:4000/api/usuarios/eliminar",
        {
          data: { usuarios: selectedUsers },
        }
      );

      // Filtrar usuarios que no se pudieron eliminar
      const usuariosNoEliminados = response.data.resultados
        .filter((result) => !result.success)
        .map((result) => {
          const usuario = usuarios.find((u) => u.rut === result.rut);
          return `${usuario.nombre} ${usuario.apellido_paterno} ${
            usuario.apellido_materno || ""
          }`;
        });

      if (usuariosNoEliminados.length > 0) {
        setErrorMessages(usuariosNoEliminados);
        setShowErrorDialog(true);
      } else {
        toast.success(response.data.mensaje);
      }

      await cargarUsuarios(selectedDept);
      setSelectedUsers([]);
    } catch (error) {
      toast.error("Error al eliminar usuarios");
      console.error(error);
    }
  };

  const toggleUsuarioEstado = async (correo, estadoActual) => {
    try {
      const response = await axios.patch(
        `http://localhost:4000/api/usuarios/${correo}/cambiar-estado`,
        {
          estado: estadoActual,
        }
      );

      if (response.status === 200) {
        // Actualizar estado local
        setUsuarios(
          usuarios.map((user) =>
            user.correo === correo
              ? { ...user, estadoFirebase: !estadoActual }
              : user
          )
        );

        toast.success(
          `Usuario ${estadoActual ? "inhabilitado" : "habilitado"} exitosamente`
        );
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al actualizar el estado del usuario");
    }
  };

  const handleSelectUser = (rut) => {
    setSelectedUsers((prev) =>
      prev.includes(rut) ? prev.filter((r) => r !== rut) : [...prev, rut]
    );
  };

  // Si el usuario no está autenticado o está cargando, mostrar loading
  if (!user) {
    return <div>Cargando...</div>;
  }

  // Si el usuario no tiene un rol válido, redirigir
  if (!["administrador", "usuario"].includes(user.role.toLowerCase())) {
    window.location.href = "/acceso-denegado";
    return null;
  }

  return (
    <div className="container mx-auto p-4">
      <Toaster />
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">
            Listado de Usuarios
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-6">
            <Input
              type="text"
              placeholder="Buscar usuarios..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="flex-grow"
            />
            <Button variant="outline" size="icon">
              <Search className="h-4 w-4" />
              <span className="sr-only">Buscar</span>
            </Button>
          </div>
          <div className="mb-6 flex items-center gap-4">
            <Select
              onValueChange={(value) => setSelectedDept(value)}
              value={selectedDept}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Seleccionar Área" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Todos">Todas las Áreas</SelectItem>
                {areas.map((area) => (
                  <SelectItem
                    key={area.id_area.toString()}
                    value={area.id_area.toString()}
                  >
                    {area.nombre_area}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {(user.role.toLowerCase() === "administrador" ||
              user.role.toLowerCase() === "trabajador") && (
              <Button
                onClick={() => setShowModal(true)}
                variant="default"
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Nuevo Usuario
              </Button>
            )}

            <Dialog open={showModal} onOpenChange={setShowModal}>
              <DialogContent className="max-w-4xl">
                <DialogHeader>
                  <DialogTitle>Crear Nuevo Usuario</DialogTitle>
                </DialogHeader>
                <N_usuario
                  isModal={true}
                  onClose={() => setShowModal(false)}
                  userRole={user?.role || ""}
                />
              </DialogContent>
            </Dialog>
          </div>

          {isLoading ? (
            <div className="text-center py-4">Cargando usuarios...</div>
          ) : (
            <Table>
              <TableCaption>
                Listado de usuarios registrados en el sistema
              </TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <input
                      type="checkbox"
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedUsers(usuariosFiltrados.map((u) => u.rut));
                        } else {
                          setSelectedUsers([]);
                        }
                      }}
                      checked={
                        usuariosFiltrados.length > 0 &&
                        usuariosFiltrados.every((u) =>
                          selectedUsers.includes(u.rut)
                        )
                      }
                    />
                  </TableHead>
                  <TableHead>RUT</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Apellido Paterno</TableHead>
                  <TableHead>Apellido Materno</TableHead>
                  <TableHead>Correo</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Área</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {usuariosFiltrados.map((usuario) => (
                  <TableRow key={usuario.rut}>
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(usuario.rut)}
                        onChange={() => handleSelectUser(usuario.rut)}
                      />
                    </TableCell>
                    <TableCell>{usuario.rut}</TableCell>
                    <TableCell>{usuario.nombre}</TableCell>
                    <TableCell>{usuario.apellido_paterno}</TableCell>
                    <TableCell>{usuario.apellido_materno}</TableCell>
                    <TableCell>{usuario.correo}</TableCell>
                    <TableCell>{usuario.rol.nombre_rol}</TableCell>
                    <TableCell>
                      {usuario.Area ? usuario.Area.nombre_area : "N/A"}
                    </TableCell>
                    <TableCell>
                      {user.role.toLowerCase() === "administrador" ? (
                        <>
                          <EditarUsuario
                            usuario={usuario}
                            onUsuarioActualizado={() =>
                              cargarUsuarios(selectedDept)
                            }
                          />
                          <Button
                            variant="outline"
                            size="icon"
                            className={
                              usuario.estadoFirebase
                                ? "text-red-500"
                                : "text-green-500"
                            }
                            onClick={() =>
                              toggleUsuarioEstado(
                                usuario.correo,
                                usuario.estadoFirebase
                              )
                            }
                          >
                            {usuario.estadoFirebase ? (
                              <UserX className="h-4 w-4" />
                            ) : (
                              <UserCheck className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="text-blue-500 ml-2"
                            onClick={() =>
                              navigate(`/vista-perfil-rh/${usuario.rut}`)
                            }
                          >
                            <BarChart2 className="h-4 w-4" />
                          </Button>
                        </>
                      ) : (
                        <span className="text-gray-400">No disponible</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {!isLoading && usuariosFiltrados.length === 0 && (
            <p className="text-center text-gray-500 mt-6">
              No se encontraron usuarios que coincidan con la búsqueda.
            </p>
          )}

          {selectedUsers.length > 0 && (
            <Button
              variant="destructive"
              onClick={handleDeleteUsers}
              className="mb-4"
            >
              Eliminar ({selectedUsers.length}) usuarios
            </Button>
          )}
        </CardContent>
      </Card>

      <Dialog open={showErrorDialog} onOpenChange={setShowErrorDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>No se pudieron eliminar algunos usuarios</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <p className="text-red-500 mb-4">
              Los siguientes usuarios tienen registros activos en la plataforma
              y no pueden ser eliminados:
            </p>
            <ul className="list-disc pl-6">
              {errorMessages.map((nombre, index) => (
                <li key={index} className="mb-2">
                  {nombre}
                </li>
              ))}
            </ul>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
