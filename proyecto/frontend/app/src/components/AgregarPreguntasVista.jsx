import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { PlusCircle, Pencil, Trash2 } from 'lucide-react'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const AgregarPreguntasVista = () => {
  const { id } = useParams();
  const [encuesta, setEncuesta] = useState(null);
  const [preguntas, setPreguntas] = useState([]);
  const [textoPregunta, setTextoPregunta] = useState('');
  const [tipoRespuesta, setTipoRespuesta] = useState('texto'); // 'texto' o 'multiple'
  const [opciones, setOpciones] = useState([]);
  const [editando, setEditando] = useState(null); // Estado para indicar si estamos editando una pregunta

  const fetchEncuesta = async () => {
    try {
      const response = await axios.get(`http://localhost:4000/api/encuestas/${id}`);
      setEncuesta(response.data);
      
      const preguntasResponse = await axios.get(`http://localhost:4000/api/preguntas/${id}`);
      setPreguntas(preguntasResponse.data);
    } catch (error) {
      console.error('Error al obtener la encuesta:', error);
    }
  };

  useEffect(() => {
    fetchEncuesta();
  }, [id]);

  const handleAddOption = () => {
    setOpciones([...opciones, '']);
  };

  const handleOptionChange = (index, value) => {
    const nuevasOpciones = [...opciones];
    nuevasOpciones[index] = value;
    setOpciones(nuevasOpciones);
  };

  const handleAgregarPregunta = async (e) => {
    e.preventDefault();
    const nuevaPregunta = {
      texto_pregunta: textoPregunta,
      tipo_respuesta: tipoRespuesta,
      encuestaId: id,
      opciones: tipoRespuesta === 'multiple' ? opciones : []
    };

    try {
      if (editando) {
        // Actualizar pregunta existente
        await axios.put(`http://localhost:4000/api/preguntas/${editando}`, nuevaPregunta);
        setEditando(null);
      } else {
        // Crear nueva pregunta
        await axios.post('http://localhost:4000/api/preguntas', nuevaPregunta);
      }
      
      setTextoPregunta('');
      setTipoRespuesta('texto');
      setOpciones([]);
      fetchEncuesta(); // Recargar preguntas después de agregar o editar una pregunta
    } catch (error) {
      console.error('Error al agregar o editar la pregunta:', error);
    }
  };

  const handleEliminarPregunta = async (idPregunta) => {
    try {
      await axios.delete(`http://localhost:4000/api/preguntas/${idPregunta}`);
      fetchEncuesta(); // Recargar preguntas después de eliminar
    } catch (error) {
      console.error('Error al eliminar la pregunta:', error);
    }
  };

  const handleEditarPregunta = (pregunta) => {
    setTextoPregunta(pregunta.texto_pregunta);
    setTipoRespuesta(pregunta.tipo_respuesta);
    setOpciones(pregunta.opciones.map(opcion => opcion.texto_opcion));
    setEditando(pregunta.id_pregunta);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-6 text-center">Agregar Preguntas a {encuesta?.titulo}</h2>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Agregar Nueva Pregunta</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAgregarPregunta} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="textoPregunta">Texto de la Pregunta</Label>
              <Input
                id="textoPregunta"
                value={textoPregunta}
                onChange={(e) => setTextoPregunta(e.target.value)}
                placeholder="Escribe la pregunta aquí"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tipoRespuesta">Tipo de Respuesta</Label>
              <Select value={tipoRespuesta} onValueChange={setTipoRespuesta}>
                <SelectTrigger id="tipoRespuesta">
                  <SelectValue placeholder="Selecciona el tipo de respuesta" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="texto">Texto libre</SelectItem>
                  <SelectItem value="multiple">Opción múltiple</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {tipoRespuesta === 'multiple' && (
              <div className="space-y-2">
                <Label>Opciones</Label>
                {opciones.map((opcion, index) => (
                  <Input
                    key={index}
                    value={opcion}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    placeholder={`Opción ${index + 1}`}
                    className="mb-2"
                  />
                ))}
                <Button type="button" variant="outline" className="w-full" onClick={handleAddOption}>
                  <PlusCircle className="mr-2 h-4 w-4" /> Agregar Opción
                </Button>
              </div>
            )}

            <Button type="submit" className="w-full">
              {editando ? 'Actualizar Pregunta' : 'Agregar Pregunta'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <h3 className="text-xl font-semibold mb-4">Vista Previa de las Preguntas</h3>
      <div className="space-y-4">
        {preguntas.length > 0 ? (
          preguntas.map((pregunta, index) => (
            <Card key={pregunta.id_pregunta}>
              <CardHeader>
                <CardTitle className="text-lg">
                  {index + 1}. {pregunta.texto_pregunta}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {pregunta.tipo_respuesta === 'multiple' ? (
                  <RadioGroup>
                    {pregunta.opciones.map((opcion) => (
                      <div key={opcion.id_opcion} className="flex items-center space-x-2">
                        <RadioGroupItem value={opcion.id_opcion.toString()} id={`option-${opcion.id_opcion}`} />
                        <Label htmlFor={`option-${opcion.id_opcion}`}>{opcion.texto_opcion}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                ) : (
                  <Input disabled placeholder="Respuesta de texto libre" />
                )}
                <div className="flex justify-end space-x-2 mt-4">
                  <Button variant="outline" size="sm" onClick={() => handleEditarPregunta(pregunta)}>
                    <Pencil className="mr-2 h-4 w-4" /> Editar
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleEliminarPregunta(pregunta.id_pregunta)}>
                    <Trash2 className="mr-2 h-4 w-4" /> Eliminar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <p className="text-muted-foreground">No hay preguntas agregadas todavía.</p>
        )}
      </div>
    </div>
  );
};

export default AgregarPreguntasVista;