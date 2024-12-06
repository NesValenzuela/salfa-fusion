import React from "react";

import { useState } from "react";
import { Toaster, toast } from "sonner";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../../components/ui/card";
import { PlusCircle, Search } from "lucide-react";

import { useEffect } from "react";
import {
  DialogHeader,
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
} from "../../components/ui/dialog";
import FormularioArea from "./nueva-area";

import FormularioModArea from "./modificar-area";

export default function ListadoAreas() {
  const [openCreate, setOpenCreate] = useState(false);
  const [openModify, setOpenModify] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [areas, setAreas] = useState([]);

  const handleFormModificar = async () => {
    setOpenModify(true);
    await cargarAreas();
    toast("Área Modificada con Éxito");
  };
  const cargarAreas = async () => {
    try {
      const response = await fetch("http://localhost:4000/api/area/");

      if (!response.ok) {
        throw new Error("HHTP error! status:");
      }
      let data = await response.json();
      data.sort((a, b) => a.nombre_area.localeCompare(b.nombre_area));
      setAreas(data);
    } catch (error) {
      console.error("Error al cargar áreas:", error);
    }
  };

  const handleCreateArea = () => {
    setOpenCreate(false);
    cargarAreas();
  };

  const areasFiltradas = areas.filter((area) =>
    area.nombre_area.toLowerCase().includes(busqueda.toLowerCase())
  );

  useEffect(() => {
    cargarAreas();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <Toaster />
      <h1 className="text-2xl font-bold mb-6">Listado de Áreas</h1>

      <div className="flex items-center space-x-2 mb-6">
        <Input
          type="text"
          placeholder="Buscar áreas..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="flex-grow"
        />
        <Button variant="outline" size="icon">
          <Search className="h-4 w-4" />
          <span className="sr-only">Buscar</span>
        </Button>
      </div>

      <Dialog open={openCreate} onOpenChange={setOpenCreate}>
        <DialogTrigger asChild>
          <Button className="mb-4" onClick={() => setOpenCreate(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Crear área
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle></DialogTitle>
          </DialogHeader>
          <FormularioArea onCreate={handleCreateArea} />
        </DialogContent>
      </Dialog>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {areasFiltradas.map((area) => (
          <Card key={area.id_area}>
            <CardHeader>
              <CardTitle>{area.nombre_area}</CardTitle>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => setOpenModify(area.id_area)}
                variant="outline"
                className="w-full  mb-3"
              >
                Modificar Área
              </Button>

              <Dialog
                open={openModify === area.id_area}
                onOpenChange={(open) =>
                  setOpenModify(open ? area.id_area : null)
                }
              >
                <DialogTrigger asChild></DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Modificar Área</DialogTitle>
                  </DialogHeader>
                  <FormularioModArea
                    onCreate={() => handleFormModificar()}
                    id_area={area.id_area}
                  />
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        ))}
      </div>

      {areasFiltradas.length === 0 && (
        <p className="text-center text-gray-500 mt-6">
          No se encontraron áreas que coincidan con la búsqueda.
        </p>
      )}
    </div>
  );
}
