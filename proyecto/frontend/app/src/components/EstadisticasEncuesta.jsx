import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, Text, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { CircularProgress, IconButton, Tooltip as MuiTooltip, Button } from '@mui/material';
import { useParams, useLocation } from 'react-router-dom';
import { BarChart as BarChartIcon, PieChart as PieChartIcon } from '@mui/icons-material';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const EstadisticasEncuesta = () => {
    const { encuestaId } = useParams(); // Obtener ID de la encuesta desde la URL
    const { state } = useLocation(); // Obtener datos pasados al navegar
    const [tituloEncuesta, setTituloEncuesta] = useState(state?.titulo || "Encuesta"); // Estado para el título
    const [fechaCreacion, setFechaCreacion] = useState(
        state?.fechaCreacion ? new Date(state.fechaCreacion).toLocaleDateString() : "Fecha no disponible"
    ); // Estado para la fecha de creación
    const [estadisticas, setEstadisticas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isPieChart, setIsPieChart] = useState(true);

    const chartRefs = useRef([]);

    // Cargar detalles de la encuesta si no se pasaron por navegación
    useEffect(() => {
        if (!state?.titulo || !state?.fechaCreacion) {
            const fetchEncuestaDetalles = async () => {
                try {
                    const token = localStorage.getItem('token');
                    const response = await axios.get(`http://localhost:4000/api/encuestas/${encuestaId}/detalles`, {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    setTituloEncuesta(response.data.titulo);
                    setFechaCreacion(new Date(response.data.fecha_creacion).toLocaleDateString());
                } catch (error) {
                    console.error("Error al obtener detalles de la encuesta:", error);
                }
            };

            fetchEncuestaDetalles();
        }
    }, [encuestaId, state]);

    // Cargar estadísticas de la encuesta
    useEffect(() => {
        const fetchEstadisticas = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get(`http://localhost:4000/api/stats/${encuestaId}/estadisticas`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                const estadisticasFiltradas = response.data.filter(
                    pregunta => pregunta.opciones && pregunta.opciones.length > 0
                );
                setEstadisticas(estadisticasFiltradas);
                setLoading(false);
            } catch (error) {
                console.error('Error al obtener estadísticas:', error);
                setLoading(false);
                alert("No se pudieron cargar las estadísticas.");
            }
        };

        fetchEstadisticas();
    }, [encuestaId]);

    const handleToggleChart = () => {
        setIsPieChart(!isPieChart);
    };

    const generateChartImage = (chartRef) => {
        return new Promise((resolve, reject) => {
            html2canvas(chartRef, { scale: 2 })
                .then((canvas) => {
                    const imgData = canvas.toDataURL('image/png');
                    resolve(imgData);
                })
                .catch(reject);
        });
    };

    const handleDownloadPDF = async () => {
        const doc = new jsPDF();
        const pageHeight = doc.internal.pageSize.height;
        const pageWidth = doc.internal.pageSize.width;
        const logoWidth = 50;
        const logoHeight = 10;
        let yOffset = 20;
    
        const logoPath = `${window.location.origin}/logo_salfa.jpg`;
        const bgPath = `${window.location.origin}/bg_salfacorp.jpg`;
    
        try {
            const imgLogo = await fetch(logoPath)
                .then((res) => res.blob())
                .then((blob) => {
                    return new Promise((resolve) => {
                        const reader = new FileReader();
                        reader.onload = () => resolve(reader.result);
                        reader.readAsDataURL(blob);
                    });
                });
    
            const imgBg = await fetch(bgPath)
                .then((res) => res.blob())
                .then((blob) => {
                    return new Promise((resolve) => {
                        const reader = new FileReader();
                        reader.onload = () => resolve(reader.result);
                        reader.readAsDataURL(blob);
                    });
                });
    
            doc.addImage(imgBg, 'JPEG', 0, 0, pageWidth, pageHeight); // Fondo de la portada
            doc.addImage(imgLogo, 'JPEG', pageWidth / 2 - logoWidth / 2, 30, logoWidth, logoHeight); // Logo centrado
    
            const titleY = pageHeight / 2 - 20;
            doc.setFontSize(40);
            doc.setTextColor(255, 255, 255); // Texto blanco
            doc.text(tituloEncuesta, pageWidth / 2, titleY, { align: "center" }); // Texto con fondo blanco
            doc.setTextColor(0, 0, 0);
            doc.text(tituloEncuesta, pageWidth / 2, titleY + 0.5, { align: "center" }); // Sombra leve
    
            doc.setFontSize(12);
            doc.text(`Fecha de creación: ${fechaCreacion}`, pageWidth / 2, pageHeight - 30, { align: "center" });
    
            // Nueva página para gráficos
            doc.addPage();
            doc.addImage(imgBg, 'JPEG', 0, 0, pageWidth, pageHeight); // Fondo para las páginas siguientes
    
            // ** Generación de gráficos **
            for (let index = 0; index < estadisticas.length; index++) {
                const pregunta = estadisticas[index];
                const chartRef = chartRefs.current[index];
    
                try {
                    const imgData = await generateChartImage(chartRef);
    
                    doc.setFontSize(21);
                    doc.text(pregunta.texto_pregunta, 30, yOffset); // Título de la pregunta
                    const chartHeight = 100;
                    const spacing = 30;
                    doc.addImage(imgData, 'PNG', 10, yOffset + 5, 190, chartHeight);
    
                    yOffset += chartHeight + spacing;
                    if (yOffset > pageHeight - 30) {
                        doc.addPage();
                        doc.addImage(imgBg, 'JPEG', 0, 0, pageWidth, pageHeight);
                        yOffset = 20;
                    }
                } catch (error) {
                    console.error("Error al generar la imagen del gráfico:", error);
                }
            }
            doc.addPage();
            doc.addImage(imgBg, 'JPEG', 0, 0, pageWidth, pageHeight);
            doc.setFontSize(12);
            doc.text("Reporte generado automáticamente", pageWidth / 2, pageHeight - 30, { align: "center" });
    
            doc.save(`reporte_estadisticas_${tituloEncuesta}.pdf`);
        } catch (error) {
            console.error("Error al generar el PDF:", error);
        }
    };
    

    if (loading) {
        return <CircularProgress />;
    }

    if (!estadisticas || estadisticas.length === 0) {
        return <div>No hay datos para mostrar</div>;
    }

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#FF5733'];

    return (
        <div style={{ width: '90%', margin: '0 auto', padding: '20px', textAlign: 'center' }}>
            <h2>Estadísticas de la Encuesta</h2>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                <MuiTooltip title={isPieChart ? "Cambiar a gráfico de barras" : "Cambiar a gráfico circular"}>
                    <IconButton onClick={handleToggleChart} color="primary">
                        {isPieChart ? <BarChartIcon /> : <PieChartIcon />}
                    </IconButton>
                </MuiTooltip>
                <span style={{ fontSize: '0.9rem', color: '#333', marginLeft: '8px' }}>
                    {isPieChart ? "Cambiar a gráfico de barras" : "Cambiar a gráfico circular"}
                </span>
            </div>
            {estadisticas.map((pregunta, index) => (
                <div key={index} style={{ marginBottom: '1.5rem', padding: '8px', border: '1px solid #ddd', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', width: '80%', margin: '0 auto' }} ref={(el) => (chartRefs.current[index] = el)}>
                    <h3 style={{ fontSize: '1.5rem', color: '#333', marginBottom: '1rem' }}>{pregunta.texto_pregunta}</h3>
                    <ResponsiveContainer width="100%" height={505}>
                        {isPieChart ? (
                            <PieChart>
                                <Pie
                                    data={pregunta.opciones.map((opcion, idx) => ({
                                        name: opcion.texto_opcion,
                                        value: opcion.respuestas,
                                        color: COLORS[idx % COLORS.length],
                                    }))}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ x, y, name, percent }) => (
                                        <Text x={x} y={y} fontSize={12} fill="#333" textAnchor="middle" dominantBaseline="central">
                                            {`${name}: ${(percent * 100).toFixed(0)}%`}
                                        </Text>
                                    )}
                                    outerRadius={200}
                                    innerRadius={80}
                                    dataKey="value"
                                    isAnimationActive={true}
                                >
                                    {pregunta.opciones.map((_, idx) => (
                                        <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        ) : (
                            <BarChart
                                data={pregunta.opciones.map((opcion) => ({
                                    name: opcion.texto_opcion,
                                    value: opcion.respuestas,
                                }))}
                                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="value" fill="#8884d8" />
                            </BarChart>
                        )}
                    </ResponsiveContainer>
                </div>
            ))}
            <Button onClick={handleDownloadPDF} variant="contained" color="primary">
                Descargar Reporte PDF
            </Button>
        </div>
    );
};

export default EstadisticasEncuesta;
