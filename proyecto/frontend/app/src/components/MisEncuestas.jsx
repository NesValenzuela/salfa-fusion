import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Search, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

const MisEncuestas = () => {
    const [encuestas, setEncuestas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [encuestasPorPagina] = useState(6);

    useEffect(() => {
        const fetchEncuestasPendientes = async () => {
            const token = localStorage.getItem('token');
            try {
                setLoading(true);
                const response = await axios.get('http://localhost:4000/api/encuestasAsignada/misEncuestas', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setEncuestas(response.data);
                setError(null);
            } catch (error) {
                console.error('Error al obtener encuestas:', error);
                setError('Error al obtener encuestas asignadas. Por favor, intente de nuevo más tarde.');
            } finally {
                setLoading(false);
            }
        };

        fetchEncuestasPendientes();
    }, []);

    const filteredEncuestas = encuestas.filter(encuesta => 
        encuesta.encuesta.titulo.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Obtener encuestas actuales
    const indexOfLastEncuesta = currentPage * encuestasPorPagina;
    const indexOfFirstEncuesta = indexOfLastEncuesta - encuestasPorPagina;
    const currentEncuestas = filteredEncuestas.slice(indexOfFirstEncuesta, indexOfLastEncuesta);

    // Cambiar página
    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Loader2 className="mr-2 h-16 w-16 animate-spin" />
                <span className="text-2xl">Cargando encuestas...</span>
            </div>
        );
    }

    if (error) {
        return (
            <Alert variant="destructive">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h2 className="text-3xl font-bold text-center mb-8">Mis Encuestas Pendientes</h2>
            
            <div className="flex justify-between items-center mb-6">
                <div className="relative w-full md:w-64">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar encuestas..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-8"
                    />
                </div>
            </div>

            {currentEncuestas.length === 0 ? (
                <Card>
                    <CardContent className="pt-6">
                        <p className="text-center text-muted-foreground">No tienes encuestas pendientes para responder.</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {currentEncuestas.map((encuestaAsignada) => (
                        <Card key={encuestaAsignada.id_asignacion}>
                            <CardHeader>
                                <CardTitle>{encuestaAsignada.encuesta.titulo}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">
                                    {encuestaAsignada.encuesta.descripcion || 'Sin descripción'}
                                </p>
                            </CardContent>
                            <CardFooter className="flex justify-between">
                                <p className="text-sm text-muted-foreground">
                                    Fecha límite: {new Date(encuestaAsignada.fecha_limite).toLocaleDateString()}
                                </p>
                                <Button asChild>
                                    <Link to={`/responderEncuesta/${encuestaAsignada.encuestaId}`}>
                                        Responder
                                    </Link>
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}

            {filteredEncuestas.length > encuestasPorPagina && (
                <div className="flex justify-center mt-8">
                    <Button
                        variant="outline"
                        onClick={() => paginate(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="mr-2"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    {Array.from({ length: Math.ceil(filteredEncuestas.length / encuestasPorPagina) }, (_, i) => (
                        <Button
                            key={i}
                            variant={currentPage === i + 1 ? "default" : "outline"}
                            onClick={() => paginate(i + 1)}
                            className="mx-1"
                        >
                            {i + 1}
                        </Button>
                    ))}
                    <Button
                        variant="outline"
                        onClick={() => paginate(currentPage + 1)}
                        disabled={currentPage === Math.ceil(filteredEncuestas.length / encuestasPorPagina)}
                        className="ml-2"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            )}
        </div>
    );
};

export default MisEncuestas;