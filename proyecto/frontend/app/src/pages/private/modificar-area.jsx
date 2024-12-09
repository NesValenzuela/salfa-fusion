import React, { useState, useEffect, useRef } from "react";
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

const FormularioModArea = ({ id_area, onCreate }) => {
  const [area, setArea] = useState({ id: "", nombre_area: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [imagen, setImagen] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchArea = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `http://localhost:4000/api/area/${id_area}`
        );
        if (!response.ok) throw new Error("Failed to fetch area");
        const data = await response.json();
        setArea(data);
        try {
          const imageResponse = await fetch(
            `http://localhost:4000/api/area/imagen/${id_area}`
          );
          if (imageResponse.ok) {
            const blob = await imageResponse.blob();
            setPreviewUrl(URL.createObjectURL(blob));
          }
        } catch (error) {
          console.error("Error cargando imagen existente:", error);
        }
      } catch (error) {
        console.error("Error fetching area:", error);
        toast.error("No se pudo cargar la información del área");
      } finally {
        setIsLoading(false);
      }
    };
    if (id_area) {
      fetchArea();
    }
  }, [id_area]);

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
    setIsLoading(true);
    if (area.nombre_area.trim() === "") {
      toast.error("El nombre del área es requerido");
      setIsLoading(false);
      return;
    }
    const formData = new FormData();
    formData.append("nombre_area", area.nombre_area);
    if (imagen) {
      formData.append("imagen", imagen);
    }
    try {
      const response = await fetch(
        `http://localhost:4000/api/area/${id_area}`,
        {
          method: "PUT",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      toast.success("Área modificada exitosamente");
      onCreate();
    } catch (error) {
      console.error("Error updating area:", error);
      toast.error("No se pudo actualizar el área");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="text-center">Cargando...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Modificar Área</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre del Área</Label>
              <Input
                name="nombre"
                value={area.nombre_area}
                onChange={(e) =>
                  setArea({ ...area, nombre_area: e.target.value })
                }
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
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Actualizando..." : "Actualizar Área"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};
export default FormularioModArea;
