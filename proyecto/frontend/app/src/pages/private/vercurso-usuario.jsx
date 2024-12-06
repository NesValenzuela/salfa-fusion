import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ChevronRight, ChevronDown, FileText, Search } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import axios from "axios";
import { useUser } from "../../contexts/UserContext";

const DetalleCurso = () => {
  const { id } = useParams();
  const [curso, setCurso] = useState();
  const [expandedModulos, setExpandedModulos] = useState({});
  const [expandedLecciones, setExpandedLecciones] = useState({});
  const [expandedContent, setExpandedContent] = useState(null);
  const [contenidosPorLeccion, setContenidosPorLeccion] = useState({});
  const [contenidosVistos, setContenidosVistos] = useState({});
  const [registrosVisualizacion, setRegistrosVisualizacion] = useState({});
  const { user } = useUser();

  const fetchCursos = async (id_curso) => {
    try {
      const response = await fetch(
        `http://localhost:4000/api/cursoEstructura/${id_curso}`
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setCurso(data);

      // Cargar contenidos para cada lección
      data.modulos.forEach((modulo) => {
        modulo.lecciones.forEach((leccion) => {
          fetchContenidosLeccion(leccion.id_leccion);
        });
      });
    } catch (error) {
      console.log("ERROR =>", error);
    }
  };

  const fetchContenidosLeccion = async (leccionId) => {
    try {
      const response = await axios.get(
        `http://localhost:4000/api/contenido/leccion/${leccionId}`
      );
      const contenidosExistentes = response.data.filter(
        (contenido) => contenido.fileExists
      );

      setContenidosPorLeccion((prev) => ({
        ...prev,
        [leccionId]: contenidosExistentes,
      }));
    } catch (error) {
      console.error("Error al obtener contenidos de la lección:", error);
    }
  };

  const fetchRegistrosVisualizacion = async (cursoId) => {
    try {
      const response = await axios.get(
        `http://localhost:4000/api/contenido/registros-visualizacion/${cursoId}/${user?.rut}`
      );

      const registros = response.data.reduce((acc, registro) => {
        const key = `${registro.contenidoId}-${registro.leccionId}`;
        acc[key] = true;
        return acc;
      }, {});

      setRegistrosVisualizacion(registros);
    } catch (error) {
      console.error("Error al obtener registros de visualización:", error);
    }
  };

  useEffect(() => {
    if (id && user?.rut) {
      fetchCursos(id);
      fetchRegistrosVisualizacion(id);
    }
  }, [id, user?.rut]);

  const toggleModulo = (moduloId) => {
    setExpandedModulos((prev) => ({
      ...prev,
      [moduloId]: !prev[moduloId],
    }));
  };

  const toggleLeccion = (leccionId) => {
    setExpandedLecciones((prev) => ({
      ...prev,
      [leccionId]: !prev[leccionId],
    }));
  };

  const formatFileName = (fileName) => {
    const parts = fileName.split("_");
    if (parts.length <= 1) return fileName;

    return parts.slice(1).join("_");
  };

  const renderContenido = (contenido) => {
    switch (contenido.tipo_contenido) {
      case "imagen":
        return (
          <img
            src={contenido.url}
            alt={contenido.nombre_archivo}
            className="w-full h-auto rounded-lg"
          />
        );
      case "audio":
        return (
          <audio controls className="w-full">
            <source src={contenido.url} type="audio/mpeg" />
            Tu navegador no soporta el elemento de audio.
          </audio>
        );
      case "video":
        return (
          <div className="flex flex-col gap-2">
            <video controls className="w-full rounded-lg">
              <source src={contenido.url} type="video/mp4" />
              Tu navegador no soporta el elemento de video.
            </video>
            <Button
              onClick={() => {
                window.open(contenido.url, "_blank");
                handleAccionSecundaria(
                  contenido.id_contenido,
                  contenido.leccionId
                );
              }}
              className="bg-blue-500 hover:bg-blue-600 text-white w-full"
            >
              Ver en pantalla completa
            </Button>
          </div>
        );
      case "pdf":
        return (
          <div className="flex flex-col gap-2">
            <div className="w-[600px] md:w-full h-[400px]">
              <iframe
                src={contenido.url}
                title={contenido.nombre_archivo}
                className="w-full h-full rounded-lg"
              />
            </div>
            <Button
              onClick={() => {
                window.open(contenido.url, "_blank");
                handleAccionSecundaria(
                  contenido.id_contenido,
                  contenido.leccionId
                );
              }}
              className="bg-blue-500 hover:bg-blue-600 text-white w-full"
            >
              Ver PDF en pantalla completa
            </Button>
          </div>
        );
      case "word":
      case "excel":
      case "powerpoint":
        return (
          <div className="flex flex-col gap-2">
            <div className="w-full h-[400px]">
              <iframe
                src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(
                  contenido.url
                )}`}
                title={contenido.nombre_archivo}
                className="w-full h-full rounded-lg"
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => {
                  window.open(contenido.url, "_blank");
                  handleAccionSecundaria(
                    contenido.id_contenido,
                    contenido.leccionId
                  );
                }}
                className="bg-blue-500 hover:bg-blue-600 text-white flex-1"
              >
                Descargar documento
              </Button>
              <Button
                onClick={() => {
                  window.open(
                    `https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(
                      contenido.url
                    )}`,
                    "_blank"
                  );
                  handleAccionSecundaria(
                    contenido.id_contenido,
                    contenido.leccionId
                  );
                }}
                className="bg-green-500 hover:bg-green-600 text-white flex-1"
              >
                Ver en pantalla completa
              </Button>
            </div>
          </div>
        );
      default:
        return <p>Tipo de contenido no soportado</p>;
    }
  };

  const registrarVisualizacion = async (
    contenidoId,
    leccionId,
    requiereAccionSecundaria
  ) => {
    try {
      await axios.post(
        "http://localhost:4000/api/contenido/registrar-visualizacion",
        {
          contenidoId,
          leccionId,
          userId: user?.rut,
        }
      );
    } catch (error) {
      console.error("Error al registrar visualización:", error);
    }
  };

  const handleVerContenido = (contenido) => {
    setExpandedContent(
      expandedContent === contenido.id_contenido ? null : contenido.id_contenido
    );

    const requiereAccionSecundaria = [
      "video",
      "pdf",
      "word",
      "excel",
      "powerpoint",
    ].includes(contenido.tipo_contenido);

    const registroKey = `${contenido.id_contenido}-${contenido.leccionId}`;
    const yaVisto = registrosVisualizacion[registroKey];

    if (!requiereAccionSecundaria && !yaVisto) {
      registrarVisualizacion(
        contenido.id_contenido,
        contenido.leccionId.toString(),
        false
      );
      setRegistrosVisualizacion((prev) => ({
        ...prev,
        [registroKey]: true,
      }));
    } else if (requiereAccionSecundaria) {
      setContenidosVistos((prev) => ({
        ...prev,
        [contenido.id_contenido]: {
          visto: true,
          accionSecundaria: false,
        },
      }));
    }
  };

  const handleAccionSecundaria = (contenidoId, leccionId) => {
    const contenidoVisto = contenidosVistos[contenidoId];
    if (contenidoVisto?.visto && !contenidoVisto.accionSecundaria) {
      registrarVisualizacion(contenidoId, leccionId.toString(), true);
      setContenidosVistos((prev) => ({
        ...prev,
        [contenidoId]: { ...prev[contenidoId], accionSecundaria: true },
      }));
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">
          {curso?.nombre_curso || "Contenido del curso"}
        </h1>
        <Button variant="ghost" size="icon">
          <Search className="h-5 w-5" />
        </Button>
      </div>

      <div className="space-y-4">
        {/* Información General */}
        <Card className="p-4">
          <div className="flex items-start gap-3">
            <FileText className="h-6 w-6 mt-1" />
            <div>
              <h2 className="text-lg font-semibold">
                Información General del Curso
              </h2>
              <p className="text-gray-600">{curso?.descripcion_curso}</p>
            </div>
          </div>
        </Card>

        {/* Módulos */}
        {curso?.modulos.map(
          (modulo) =>
            modulo.estado_modulo && (
              <Card key={modulo.id_modulo} className="p-4">
                {/* Título del Módulo */}
                <div
                  className="flex items-center gap-3 cursor-pointer"
                  onClick={() => toggleModulo(modulo.id_modulo)}
                >
                  {expandedModulos[modulo.id_modulo] ? (
                    <ChevronDown className="h-5 w-5" />
                  ) : (
                    <ChevronRight className="h-5 w-5" />
                  )}
                  <FileText className="h-6 w-6" />
                  <h2 className="text-lg font-semibold">
                    {modulo.nombre_modulo}
                  </h2>
                </div>

                {/* Lecciones dentro del mismo Card */}
                {expandedModulos[modulo.id_modulo] &&
                  modulo.lecciones.map((leccion) => {
                    // Convertir el estado_leccion a booleano
                    return (
                      leccion.estado_leccion && (
                        <div key={leccion.id_leccion} className="mt-4 ml-6">
                          <div
                            className="flex items-center gap-3 cursor-pointer"
                            onClick={() => toggleLeccion(leccion.id_leccion)}
                          >
                            {expandedLecciones[leccion.id_leccion] ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                            <FileText className="h-5 w-5" />
                            <h3 className="text-md font-medium">
                              {leccion.nombre_leccion}
                            </h3>
                          </div>

                          {/* Contenido de la lección */}
                          {expandedLecciones[leccion.id_leccion] &&
                            contenidosPorLeccion[leccion.id_leccion]?.map(
                              (contenido) => (
                                <div
                                  key={contenido.id_contenido}
                                  className="ml-12 mt-4"
                                >
                                  <div className="flex items-center gap-2 mb-2">
                                    <FileText className="h-4 w-4" />
                                    <span className="font-medium">
                                      {formatFileName(contenido.nombre_archivo)}
                                    </span>
                                    <Button
                                      onClick={() =>
                                        handleVerContenido(contenido)
                                      }
                                      className="ml-2 bg-gray-100 hover:bg-gray-200 text-gray-700"
                                      size="sm"
                                    >
                                      {expandedContent ===
                                      contenido.id_contenido
                                        ? "Ocultar"
                                        : "Ver"}
                                    </Button>
                                  </div>

                                  {expandedContent ===
                                    contenido.id_contenido && (
                                    <div className="mt-2 border-t pt-4">
                                      {renderContenido(contenido)}
                                    </div>
                                  )}
                                </div>
                              )
                            )}
                        </div>
                      )
                    );
                  })}
              </Card>
            )
        )}
      </div>
    </div>
  );
};

export default DetalleCurso;
