import React, { useState, useRef } from "react";
import { Upload, CheckCircle, XCircle } from "lucide-react";
import axios from "axios";
import { Button } from "../../components/ui/button";

const SubirContenido = ({ leccionId, onClose, onSuccess }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const allowedTypes = [
    "audio/*",
    "image/*",
    "video/*",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  ];

  const validateFileName = (fileName) => {
    // Calculamos el largo del timestamp (ejemplo: "2024-11-15-17-32-32_")
    const timestampLength = "2024-11-15-17-32-32_".length; // 20 caracteres

    // Removemos la extensión del archivo
    const nameWithoutExtension = fileName.substring(
      0,
      fileName.lastIndexOf(".")
    );
    const extension = fileName.substring(fileName.lastIndexOf("."));

    // Calculamos cuántos caracteres necesita recortar
    const excesoCaracteres = nameWithoutExtension.length + timestampLength - 50;

    if (excesoCaracteres > 0) {
      const nombreSugerido = nameWithoutExtension.substring(
        0,
        nameWithoutExtension.length - excesoCaracteres
      );
      return `El nombre del archivo es demasiado largo. 
        - Longitud actual: ${nameWithoutExtension.length} caracteres
        - Longitud máxima permitida: ${50 - timestampLength} caracteres
        - Necesitas recortar: ${excesoCaracteres} caracteres
        
        Sugerencia: Renombra tu archivo a "${nombreSugerido}${extension}"`;
    }

    return null;
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const isAllowedType = allowedTypes.some((type) =>
        type.endsWith("/*")
          ? file.type.startsWith(type.replace("/*", ""))
          : file.type === type
      );

      if (!isAllowedType) {
        setError(
          "Tipo de archivo no permitido. Solo se permiten imágenes, audios, videos, PDFs y documentos de Office."
        );
        return;
      }

      const fileNameError = validateFileName(file.name);
      if (fileNameError) {
        setError(fileNameError);
        return;
      }

      setFile(file);
      setError(null);
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const droppedFile = event.dataTransfer.files[0];
    if (droppedFile) {
      const isAllowedType = allowedTypes.some((type) =>
        type.endsWith("/*")
          ? droppedFile.type.startsWith(type.replace("/*", ""))
          : droppedFile.type === type
      );

      if (!isAllowedType) {
        setError("Tipo de archivo no permitido");
        return;
      }

      const fileNameError = validateFileName(droppedFile.name);
      if (fileNameError) {
        setError(fileNameError);
        return;
      }

      setFile(droppedFile);
      setError(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!file || !leccionId) return;

      setUploading(true);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("leccionId", leccionId);

      await axios.post(`http://localhost:4000/api/contenido/upload`, formData);

      setError("success");
      onSuccess();
    } catch (error) {
      console.error("Error al subir contenido:", error);
      setError("error");
    } finally {
      setUploading(false);
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div className="w-full">
      <div className="max-w-md mx-auto space-y-6">
        <div>
          <h2 className="text-center text-2xl font-bold text-gray-900">
            Subir Archivos de Lecciones
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sube archivos de audio, imágenes, PDF y documentos de Office para
            tus lecciones
          </p>
        </div>
        <div
          className="space-y-6"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <div className="flex items-center justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
            <div className="space-y-1 text-center">
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <div className="flex text-sm text-gray-600">
                <label
                  htmlFor="file-upload"
                  className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                >
                  <span>Selecciona un archivo</span>
                  <input
                    id="file-upload"
                    name="file-upload"
                    type="file"
                    className="sr-only"
                    onChange={handleFileChange}
                    accept={allowedTypes.join(",")}
                    ref={fileInputRef}
                  />
                </label>
                <p className="pl-1">o arrastra y suelta</p>
              </div>
              <p className="text-xs text-gray-500">
                Audio, imágenes, PDF y documentos de Office hasta 10MB
              </p>
            </div>
          </div>
          {file && (
            <div className="text-sm text-gray-600">
              Archivo seleccionado: {file.name}
            </div>
          )}
          {error && error !== "success" && error !== "error" && (
            <div className="flex items-start text-sm text-red-600 whitespace-pre-line">
              <XCircle className="h-5 w-5 mr-2 mt-1 flex-shrink-0" />
              {error}
            </div>
          )}
          {error === "error" && (
            <div className="flex items-center text-sm text-red-600">
              <XCircle className="h-5 w-5 mr-2" />
              Tipo de archivo no permitido. Por favor, selecciona un archivo de
              audio, imagen, PDF o documento de Office.
            </div>
          )}
          {error === "success" && (
            <div className="flex items-center text-sm text-green-600">
              <CheckCircle className="h-5 w-5 mr-2" />
              Archivo subido con éxito.
            </div>
          )}
          <div className="flex flex-col gap-2">
            <Button
              onClick={handleSubmit}
              disabled={!file || uploading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400"
            >
              {uploading ? "Subiendo..." : "Subir archivo"}
            </Button>
            <Button onClick={onClose} variant="outline" className="w-full">
              Cerrar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubirContenido;
