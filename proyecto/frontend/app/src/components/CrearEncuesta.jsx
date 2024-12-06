import React, { useState } from 'react';
import axios from 'axios';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const CrearEncuesta = () => {
  const [titulo, setTitulo] = useState('');
  const [estadoEncuesta, setEstadoEncuesta] = useState('Deshabilitada');
  const [fechaCreacion, setFechaCreacion] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje('');
    setError('');

    // Validar que el título no esté vacío
    if (!titulo) {
      setError('El título es obligatorio.');
      return;
    }

    try {
      const response = await axios.post('http://localhost:4000/api/encuestas', {
        titulo,
        estado_encuesta: estadoEncuesta,
        fecha_creacion: fechaCreacion || new Date().toISOString(),
      });
      setMensaje('Encuesta creada con éxito.');
      setTitulo('');
      setFechaCreacion('');
    } catch (error) {
      console.error('Error al crear la encuesta:', error);
      setError('Error al crear la encuesta. Intente nuevamente.');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Crear Encuesta</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="titulo">Título</Label>
              <Input
                id="titulo"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="estado">Estado</Label>
              <Select value={estadoEncuesta} onValueChange={setEstadoEncuesta}>
                <SelectTrigger id="estado">
                  <SelectValue placeholder="Seleccione el estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Habilitada">Habilitada</SelectItem>
                  <SelectItem value="Deshabilitada">Deshabilitada</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="fechaCreacion">Fecha de Creación</Label>
              <Input
                id="fechaCreacion"
                type="date"
                value={fechaCreacion}
                onChange={(e) => setFechaCreacion(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full">Crear</Button>
          </form>
          {mensaje && (
            <Alert className="mt-4">
              <AlertTitle>Éxito</AlertTitle>
              <AlertDescription>{mensaje}</AlertDescription>
            </Alert>
          )}
          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CrearEncuesta;
