import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Plus, Pencil, Search } from 'lucide-react'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"

const Areas = () => {
  const [areas, setAreas] = useState([]);
  const [nombreArea, setNombreArea] = useState('');
  const [editingArea, setEditingArea] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    fetchAreas();
  }, []);

  const fetchAreas = async () => {
    try {
      const response = await axios.get('http://localhost:4000/api/areas');
      setAreas(response.data);
    } catch (error) {
      console.error('Error fetching areas:', error);
    }
  };

  const handleCreateOrUpdateArea = async (e) => {
    e.preventDefault();
    try {
      if (editingArea) {
        const response = await axios.put(`http://localhost:4000/api/areas/${editingArea.id_area}`, {
          nombre_area: nombreArea,
        });
        setAreas(areas.map((area) => (area.id_area === editingArea.id_area ? response.data : area)));
      } else {
        const response = await axios.post('http://localhost:4000/api/areas', { nombre_area: nombreArea });
        setAreas([...areas, response.data]);
      }
      setNombreArea('');
      setEditingArea(null);
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error creating/updating area:', error);
    }
  };

  const handleEdit = (area) => {
    setNombreArea(area.nombre_area);
    setEditingArea(area);
    setIsDialogOpen(true);
  };

  const filteredAreas = areas.filter(area => 
    area.nombre_area.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Gestión de Áreas</CardTitle>
          <CardDescription>Administre las áreas de la organización</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-6">
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar áreas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Agregar Área
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingArea ? 'Editar Área' : 'Agregar Nueva Área'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateOrUpdateArea} className="space-y-4">
                  <div>
                    <Label htmlFor="nombre-area">Nombre del Área</Label>
                    <Input
                      id="nombre-area"
                      value={nombreArea}
                      onChange={(e) => setNombreArea(e.target.value)}
                      placeholder="Ingrese el nombre del área"
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    {editingArea ? 'Actualizar' : 'Crear'}
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
                {filteredAreas.map((area) => (
                  <TableRow key={area.id_area}>
                    <TableCell className="font-medium">{area.id_area}</TableCell>
                    <TableCell>{area.nombre_area}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(area)}>
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

export default Areas;