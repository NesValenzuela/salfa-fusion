import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Loader2 } from 'lucide-react'

const ResponderEncuesta = () => {
    const { encuestaId } = useParams();
    const [preguntas, setPreguntas] = useState([]);
    const [respuestas, setRespuestas] = useState({});
    const [loading, setLoading] = useState(true);
    const [enviando, setEnviando] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchPreguntas = async () => {
            const token = localStorage.getItem('token');
            try {
                const response = await axios.get(`http://localhost:4000/api/encuestasAsignada/${encuestaId}/preguntas`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setPreguntas(response.data);
            } catch (error) {
                console.error('Error al obtener preguntas:', error);
                alert('No se pudieron cargar las preguntas de la encuesta.');
            } finally {
                setLoading(false);
            }
        };

        fetchPreguntas();
    }, [encuestaId]);

    const handleChange = (preguntaId, value) => {
        setRespuestas({ ...respuestas, [preguntaId]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setEnviando(true);
        const token = localStorage.getItem('token');
        
        try {
            await axios.post(`http://localhost:4000/api/respuestas`, {
                encuestaId: parseInt(encuestaId),
                respuestas
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert('Respuestas enviadas correctamente');
            navigate('/misEncuestas');
        } catch (error) {
            if (error.response && error.response.status === 400) {
                alert(error.response.data.error || 'Error al enviar respuestas');
            } else {
                console.error('Error al enviar respuestas:', error);
                alert('Error al enviar respuestas');
            }
        } finally {
            setEnviando(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Loader2 className="mr-2 h-16 w-16 animate-spin" />
                <span className="text-2xl">Cargando preguntas...</span>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <Card className="w-full max-w-2xl mx-auto">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold">Responder Encuesta</CardTitle>
                    <CardDescription>Por favor, responda todas las preguntas de la encuesta.</CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-6">
                        {preguntas.map((pregunta) => (
                            <div key={pregunta.id_pregunta} className="space-y-2">
                                <Label htmlFor={`pregunta-${pregunta.id_pregunta}`}>{pregunta.texto_pregunta}</Label>
                                {pregunta.tipo_respuesta === 'texto' ? (
                                    <Input
                                        id={`pregunta-${pregunta.id_pregunta}`}
                                        placeholder="Escriba su respuesta aquí"
                                        onChange={(e) => handleChange(pregunta.id_pregunta, e.target.value)}
                                    />
                                ) : (
                                    <Select onValueChange={(value) => handleChange(pregunta.id_pregunta, parseInt(value))}>
                                        <SelectTrigger id={`pregunta-${pregunta.id_pregunta}`}>
                                            <SelectValue placeholder="Seleccione una opción" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {pregunta.opciones.map((opcion) => (
                                                <SelectItem key={opcion.id_opcion} value={opcion.id_opcion.toString()}>
                                                    {opcion.texto_opcion}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            </div>
                        ))}
                    </CardContent>
                    <CardFooter>
                        <Button type="submit" className="w-full" disabled={enviando}>
                            {enviando ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Enviando...
                                </>
                            ) : (
                                'Enviar Respuestas'
                            )}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
};

export default ResponderEncuesta;