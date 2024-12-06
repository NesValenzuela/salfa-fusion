import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PlusCircle } from 'lucide-react';

const Encuestas = () => {
  const [encuestas, setEncuestas] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const encuestasPerPage = 6;
  const navigate = useNavigate();

  const fetchEncuestas = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:4000/api/encuestas', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const sortedEncuestas = response.data.sort(
        (a, b) => new Date(b.fecha_creacion) - new Date(a.fecha_creacion)
      );
      setEncuestas(sortedEncuestas);
    } catch (error) {
      console.error('Error al obtener las encuestas:', error.message);
    }
  };

  const handleCrearEncuesta = () => navigate('/crear-encuesta');
  const handleModificarEncuesta = (idEncuesta) => navigate(`/modificar-encuesta/${idEncuesta}`);
  const handleAgregarPreguntas = (idEncuesta) => navigate(`/agregar-preguntas/${idEncuesta}`);
  const handleToggleEncuesta = async (idEncuesta) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:4000/api/encuestas/deshabilitar/${idEncuesta}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchEncuestas(); // Actualizar la lista
    } catch (error) {
      console.error('Error al cambiar el estado de la encuesta:', error.message);
    }
  };

  useEffect(() => {
    fetchEncuestas();
  }, []);

  const indexOfLastEncuesta = currentPage * encuestasPerPage;
  const indexOfFirstEncuesta = indexOfLastEncuesta - encuestasPerPage;
  const currentEncuestas = encuestas.slice(indexOfFirstEncuesta, indexOfLastEncuesta);

  const handleNextPage = () => {
    if (currentPage < Math.ceil(encuestas.length / encuestasPerPage)) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">Gestión de Encuestas</h2>
        <Button onClick={handleCrearEncuesta}>
          <PlusCircle className="mr-2 h-4 w-4" /> Crear Nueva Encuesta
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {currentEncuestas.length > 0 ? (
          currentEncuestas.map((encuesta) => (
            <Card key={encuesta.id_encuesta}>
              <CardHeader>
                <CardTitle>{encuesta.titulo}</CardTitle>
                <CardDescription>
                  Estado: <Badge>{encuesta.estado_encuesta}</Badge>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p>Fecha de Creación: {new Date(encuesta.fecha_creacion).toLocaleDateString()}</p>
                <div className="flex justify-between mt-4">
                  <Button variant="outline" onClick={() => handleModificarEncuesta(encuesta.id_encuesta)}>
                    Modificar
                  </Button>
                  <Button
                    variant={encuesta.estado_encuesta === 'Activa' ? 'destructive' : 'success'}
                    onClick={() => handleToggleEncuesta(encuesta.id_encuesta)}
                  >
                    {encuesta.estado_encuesta === 'Activa' ? 'Deshabilitar' : 'Habilitar'}
                  </Button>
                  <Button variant="primary" onClick={() => handleAgregarPreguntas(encuesta.id_encuesta)}>
                    Agregar Preguntas
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <p className="col-span-full text-center text-muted-foreground">No hay encuestas disponibles.</p>
        )}
      </div>

      <div className="flex justify-between items-center mt-6">
        <Button variant="outline" onClick={handlePreviousPage} disabled={currentPage === 1}>
          Anterior
        </Button>
        <span>Página {currentPage} de {Math.ceil(encuestas.length / encuestasPerPage)}</span>
        <Button
          variant="secondary"
          onClick={handleNextPage}
          disabled={currentPage === Math.ceil(encuestas.length / encuestasPerPage)}
        >
          Siguiente
        </Button>
      </div>
    </div>
  );
};

export default Encuestas;
