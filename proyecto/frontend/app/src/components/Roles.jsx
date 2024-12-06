import React, { useEffect, useState } from "react";
import axios from "axios";
import { Plus, Pencil, Search } from "lucide-react";

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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const Roles = () => {
  const [roles, setRoles] = useState([]);
  const [nombreRol, setNombreRol] = useState("");
  const [editingRol, setEditingRol] = useState(null);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      const response = await axios.get("http://localhost:4000/api/roles");
      setRoles(response.data);
    } catch (error) {
      console.error("Error fetching roles:", error);
      setError("Error al obtener los roles");
    }
  };

  const handleCreateOrUpdateRole = async (e) => {
    e.preventDefault();
    try {
      if (editingRol) {
        const response = await axios.put(
          `http://localhost:4000/api/roles/${editingRol.id_rol}`,
          { nombre_rol: nombreRol }
        );
        setRoles(
          roles.map((rol) =>
            rol.id_rol === editingRol.id_rol ? response.data : rol
          )
        );
      } else {
        const response = await axios.post("http://localhost:4000/api/roles", {
          nombre_rol: nombreRol,
        });
        setRoles([...roles, response.data]);
      }
      setNombreRol("");
      setEditingRol(null);
      setIsDialogOpen(false);
      setSuccessMessage(
        editingRol ? "Rol actualizado con éxito!" : "Rol creado con éxito!"
      );
    } catch (error) {
      console.error("Error creating/updating role:", error);
      setError("Error al crear/actualizar el rol");
    }
  };

  const handleEdit = (rol) => {
    setNombreRol(rol.nombre_rol);
    setEditingRol(rol);
    setIsDialogOpen(true);
  };

  const filteredRoles = roles.filter((rol) =>
    rol.nombre_rol.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Gestión de Roles</CardTitle>
          <CardDescription>Administre los roles del sistema</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {successMessage && (
            <Alert className="mb-4">
              <AlertTitle>Éxito</AlertTitle>
              <AlertDescription>{successMessage}</AlertDescription>
            </Alert>
          )}

          <div className="flex justify-between items-center mb-6">
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar roles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Agregar Rol
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingRol ? "Editar Rol" : "Agregar Nuevo Rol"}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateOrUpdateRole} className="space-y-4">
                  <div>
                    <Label htmlFor="nombre-rol">Nombre del Rol</Label>
                    <Input
                      id="nombre-rol"
                      value={nombreRol}
                      onChange={(e) => setNombreRol(e.target.value)}
                      placeholder="Ingrese el nombre del rol"
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    {editingRol ? "Actualizar" : "Crear"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">ID</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRoles.map((rol) => (
                  <TableRow key={rol.id_rol}>
                    <TableCell className="font-medium">{rol.id_rol}</TableCell>
                    <TableCell>{rol.nombre_rol}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(rol)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Roles;
