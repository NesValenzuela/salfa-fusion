import React, { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useParams } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const AsignarEncuestas = () => {
  const [encuestaId, setEncuestaId] = useState("");
  const [areaId, setAreaId] = useState("");
  const [usuarios, setUsuarios] = useState([]);
  const [usuariosFiltrados, setUsuariosFiltrados] = useState([]);
  const [usuariosSeleccionados, setUsuariosSeleccionados] = useState({});
  const [areas, setAreas] = useState([]);
  const [encuestas, setEncuestas] = useState([]);
  const { idEncuesta } = useParams();
  const [searchTerm, setSearchTerm] = useState("");
  const [seleccionarTodos, setSeleccionarTodos] = useState(false);

  useEffect(() => {
    const fetchUsuarios = async () => {
      try {
        const response = await axios.get("http://localhost:4000/api/usuarios");
        setUsuarios(response.data);
      } catch (error) {
        console.error("Error al obtener usuarios:", error);
      }
    };

    const fetchAreas = async () => {
      try {
        const response = await axios.get("http://localhost:4000/api/areas");
        setAreas(response.data);
      } catch (error) {
        console.error("Error al obtener áreas:", error);
      }
    };

    const fetchEncuestas = async () => {
      try {
        const response = await axios.get("http://localhost:4000/api/encuestas");
        setEncuestas(response.data);
      } catch (error) {
        console.error("Error al obtener encuestas:", error);
      }
    };

    fetchUsuarios();
    fetchAreas();
    fetchEncuestas();
  }, []);

  useEffect(() => {
    let usuariosEnArea = usuarios.filter(
      (usuario) => usuario.areaId === parseInt(areaId)
    );
    if (searchTerm) {
      usuariosEnArea = usuariosEnArea.filter((usuario) =>
        `${usuario.nombre} ${usuario.apellido_paterno}`
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      );
    }
    setUsuariosFiltrados(usuariosEnArea);

    const seleccionInicial = {};
    usuariosEnArea.forEach((usuario) => {
      seleccionInicial[usuario.rut] = seleccionarTodos;
    });
    setUsuariosSeleccionados(seleccionInicial);
  }, [areaId, searchTerm, usuarios, seleccionarTodos]);

  const handleCheckboxChange = (rut) => {
    setUsuariosSeleccionados((prevSeleccionados) => ({
      ...prevSeleccionados,
      [rut]: !prevSeleccionados[rut],
    }));
  };

  const handleSelectAll = () => {
    const nuevosSeleccionados = {};
    usuariosFiltrados.forEach((usuario) => {
      nuevosSeleccionados[usuario.rut] = !seleccionarTodos;
    });
    setUsuariosSeleccionados((prevSeleccionados) => ({
      ...prevSeleccionados,
      ...nuevosSeleccionados,
    }));
    setSeleccionarTodos((prevState) => !prevState);
  };

  const handleAsignar = async () => {
    if (!encuestaId) {
      alert("Seleccione una encuesta para asignar.");
      return;
    }

    const usuarioIdsSeleccionados = usuariosFiltrados
      .filter((usuario) => usuariosSeleccionados[usuario.rut])
      .map((usuario) => usuario.rut);

    if (usuarioIdsSeleccionados.length === 0) {
      alert("Seleccione al menos un usuario para asignar la encuesta.");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:4000/api/encuestasAsignada/asignar",
        {
          encuestaId: parseInt(encuestaId),
          usuarioIds: usuarioIdsSeleccionados,
          areaId: areaId || null,
        }
      );

      alert(response.data.message || "Encuesta asignada con éxito.");
    } catch (error) {
      console.error("Error al asignar encuesta:", error);
      alert(
        error.response?.data?.error ||
          "Error al asignar encuesta. Intente nuevamente."
      );
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-6">Asignar Encuesta</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Selección de Encuesta y Área</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="encuestaId">Seleccionar Encuesta</Label>
                <Select value={encuestaId} onValueChange={setEncuestaId}>
                  <SelectTrigger id="encuestaId">
                    <SelectValue placeholder="Seleccione una encuesta" />
                  </SelectTrigger>
                  <SelectContent>
                    {encuestas.map((encuesta) => (
                      <SelectItem
                        key={encuesta.id_encuesta}
                        value={encuesta.id_encuesta.toString()}
                      >
                        {encuesta.titulo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="areaId">Seleccionar Área</Label>
                <Select value={areaId} onValueChange={setAreaId}>
                  <SelectTrigger id="areaId">
                    <SelectValue placeholder="Seleccionar Área" />
                  </SelectTrigger>
                  <SelectContent>
                    {areas.map((area) => (
                      <SelectItem
                        key={area.id_area}
                        value={area.id_area.toString()}
                      >
                        {area.nombre_area}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button type="button" className="w-full" onClick={handleAsignar}>
                Asignar Encuesta
              </Button>
            </form>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Usuarios en el área seleccionada</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="searchUser">Buscar Usuario</Label>
                <Input
                  id="searchUser"
                  type="text"
                  placeholder="Buscar por nombre"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleSelectAll}
              >
                {seleccionarTodos ? "Desmarcar Todos" : "Seleccionar Todos"}
              </Button>
              <div className="space-y-2">
                {usuariosFiltrados.map((usuario) => (
                  <div
                    key={usuario.rut}
                    className="flex items-center space-x-2"
                  >
                    <Checkbox
                      id={usuario.rut}
                      checked={usuariosSeleccionados[usuario.rut] || false}
                      onCheckedChange={() => handleCheckboxChange(usuario.rut)}
                    />
                    <Label htmlFor={usuario.rut}>
                      {usuario.nombre} {usuario.apellido_paterno}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AsignarEncuestas;
