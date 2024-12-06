import React from "react";
import { useState, useEffect } from "react";
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

const FormularioModArea = ({ id_area, onCreate }) => {
  const [area, setArea] = useState({ id: "", nombre_area: "" });
  const [isLoading, setIsLoading] = useState(false);

  const [areas, setAreas] = useState([]);
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
      } catch (error) {
        console.error("Error fetching area:", error);
        toast("No se pudo cargar la información del área");
      } finally {
        setIsLoading(false);
      }
    };
    if (id_area) {
      fetchArea();
    }
  }, [id_area]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch(
        `http://localhost:4000/api/area/${id_area}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(area),
        }
      );

      if (!response.ok) throw new Error("Failed to update area");

      const data = await response.json();
      setAreas((prevAreas) => [...prevAreas, data]);
    } catch (error) {
      console.error("Error updating area:", error);
      toast("No se pudo actualizar el área");
    } finally {
      setIsLoading(false);
    }
    onCreate();
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
