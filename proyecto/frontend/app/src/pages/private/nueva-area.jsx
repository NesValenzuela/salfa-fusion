import React, { useState, useRef } from "react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Button } from "../../components/ui/button";
import { ImageIcon } from "lucide-react";

const FormularioArea = ({ onCreate }) => {
  const [formData, setFormData] = useState({
    nombre_area: "",
  });
  const [imagen, setImagen] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const fileInputRef = useRef(null);

  const handleInputChange = (e) => {
    const target = e.currentTarget;
    const { name, value } = target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5000000) {
        // 5MB
        toast.error("La imagen no debe superar los 5MB");
        return;
      }
      if (!file.type.match(/image\/(jpeg|jpg|png)/)) {
        toast.error("Solo se permiten imágenes (jpeg, jpg, png)");
        return;
      }
      setImagen(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.nombre_area.trim() === "") {
      toast.error("El Área es requerida");
      return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append("nombre_area", formData.nombre_area);
    if (imagen) {
      formDataToSend.append("imagen", imagen);
    }

    try {
      const response = await fetch("http://localhost:4000/api/area", {
        method: "POST",
        body: formDataToSend, // No incluir Content-Type header, FormData lo establece automáticamente
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      toast.success("Área creada exitosamente");
      onCreate();
    } catch (error) {
      console.error("Error al Crear el Área:", error);
      toast.error("Error al crear el área");
    }
  };

  return (
    <div className="container mx-auto p-4">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Formulario de Área</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nombre_area">Nombre del área</Label>
              <Input
                type="text"
                placeholder="Ingresa el nombre del área"
                name="nombre_area"
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="imagen">Imagen del área</Label>
              <div className="flex flex-col items-center gap-4">
                {previewUrl ? (
                  <div className="relative w-full h-48">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="w-full h-full object-cover rounded-md"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => {
                        setImagen(null);
                        setPreviewUrl(null);
                        if (fileInputRef.current) {
                          fileInputRef.current.value = "";
                        }
                      }}
                    >
                      Eliminar
                    </Button>
                  </div>
                ) : (
                  <div
                    className="w-full h-48 border-2 border-dashed rounded-md flex items-center justify-center cursor-pointer hover:border-primary"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <div className="text-center">
                      <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                      <span className="mt-2 block text-sm text-gray-600">
                        Click para seleccionar imagen
                      </span>
                    </div>
                  </div>
                )}
                <Input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/jpg"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full">
              Crear
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default FormularioArea;
