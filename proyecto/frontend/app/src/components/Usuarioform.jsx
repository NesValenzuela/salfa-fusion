import React, { useState, useEffect } from 'react';
import { Check, X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function UsuarioForm({ usuarioEditado = null, onSave, onCancel, roles, areas }) {
  const [rut, setRut] = useState('');
  const [nombre, setNombre] = useState('');
  const [apellidoPaterno, setApellidoPaterno] = useState('');
  const [apellidoMaterno, setApellidoMaterno] = useState('');
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [rolId, setRolId] = useState(1);
  const [areaIdArea, setAreaIdArea] = useState(null);

  // Estados de errores individuales
  const [errorRut, setErrorRut] = useState('');
  const [errorCorreo, setErrorCorreo] = useState('');
  const [errorContrasena, setErrorContrasena] = useState('');
  
  const rutRegex = /^[0-9]{7,8}-[0-9Kk]$/;
  const regexCorreo = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;

  useEffect(() => {
    if (usuarioEditado) {
      setRut(usuarioEditado.rut);
      setNombre(usuarioEditado.nombre);
      setApellidoPaterno(usuarioEditado.apellido_paterno);
      setApellidoMaterno(usuarioEditado.apellido_materno);
      setCorreo(usuarioEditado.correo);
      setContrasena(usuarioEditado.contrasena);
      setRolId(usuarioEditado.rolId);
      setAreaIdArea(usuarioEditado.areaId_area);
    }
  }, [usuarioEditado]);

  const validarRUT = (rut) => rutRegex.test(rut);

  const handleRutChange = (e) => {
    const newRut = e.target.value;
    setRut(newRut);
    if (!validarRUT(newRut)) {
      setErrorRut('Formato inválido. Ej: 12345678-9 o 1123456-K');
    } else {
      setErrorRut('');
    }
  };

  const handleCorreoChange = (e) => {
    const newCorreo = e.target.value;
    setCorreo(newCorreo);
    if (!regexCorreo.test(newCorreo)) {
      setErrorCorreo('Correo electrónico inválido. Debe seguir el formato: ejemplo@dominio.com');
    } else {
      setErrorCorreo('');
    }
  };

  const handleContrasenaChange = (e) => {
    const newContrasena = e.target.value;
    setContrasena(newContrasena);
    if (newContrasena.length < 8) {
      setErrorContrasena('La contraseña debe tener al menos 8 caracteres.');
    } else {
      setErrorContrasena('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validaciones
    if (errorRut || errorCorreo || errorContrasena) {
      return; // Si hay errores, no enviamos el formulario
    }

    try {
      const usuario = {
        rut,
        nombre,
        apellido_paterno: apellidoPaterno,
        apellido_materno: apellidoMaterno,
        correo,
        contrasena,
        rolId,
        areaId_area: areaIdArea,
      };

      // Llamada a la API para guardar el usuario
      await onSave(usuario);
    } catch (error) {
      const errorResponse = error.response?.data?.error || 'Error desconocido';
      if (errorResponse === 'RUT inválido') {
        setErrorRut('RUT inválido, por favor ingrese un RUT válido.');
      } else if (errorResponse === 'RUT ya registrado') {
        setErrorRut('El RUT ya está registrado, por favor ingrese uno diferente.');
      } else if (errorResponse === 'Correo ya registrado') {
        setErrorCorreo('El correo electrónico ya está registrado, por favor ingrese otro.');
      } else {
        setErrorCorreo('Ocurrió un error al guardar el usuario.');
      }
    }
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <Label htmlFor="rut" className="text-sm font-medium">RUT</Label>
            <Input
              id="rut"
              value={rut}
              onChange={handleRutChange}
              placeholder="Ej: 12345678-9"
              required
            />
            {errorRut && <p className="text-sm text-red-500">{errorRut}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="correo" className="text-sm font-medium">Correo Electrónico</Label>
            <Input
              id="correo"
              value={correo}
              onChange={handleCorreoChange}
              type="email"
              placeholder="correo@ejemplo.com"
              required
            />
            {errorCorreo && <p className="text-sm text-red-500">{errorCorreo}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2.5 gap-8">
          <div className="space-y-1.5">
            <Label htmlFor="nombre" className="text-sm font-medium">Nombre</Label>
            <Input
              id="nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Nombre"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="apellido_paterno" className="text-sm font-medium">Apellido Paterno</Label>
            <Input
              id="apellido_paterno"
              value={apellidoPaterno}
              onChange={(e) => setApellidoPaterno(e.target.value)}
              placeholder="Apellido Paterno"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="apellido_materno" className="text-sm font-medium">Apellido Materno</Label>
            <Input
              id="apellido_materno"
              value={apellidoMaterno}
              onChange={(e) => setApellidoMaterno(e.target.value)}
              placeholder="Apellido Materno"
            />
          </div>
        </div>

        {!usuarioEditado && (
          <div className="space-y-1.5">
            <Label htmlFor="contrasena" className="text-sm font-medium">Contraseña</Label>
            <Input
              id="contrasena"
              value={contrasena}
              onChange={handleContrasenaChange}
              type="password"
              placeholder="Contraseña"
              required
            />
            {errorContrasena && <p className="text-sm text-red-500">{errorContrasena}</p>}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <Label htmlFor="rol" className="text-sm font-medium">Rol</Label>
            <Select value={rolId} onValueChange={(value) => setRolId(Number(value))}>
              <SelectTrigger id="rol">
                <SelectValue placeholder="Seleccione un rol" />
              </SelectTrigger>
              <SelectContent>
                {roles.map((rol) => (
                  <SelectItem key={rol.id_rol} value={rol.id_rol}>
                    {rol.nombre_rol}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="area" className="text-sm font-medium">Área</Label>
            <Select value={areaIdArea} onValueChange={(value) => setAreaIdArea(Number(value))}>
              <SelectTrigger id="area">
                <SelectValue placeholder="Seleccione un área" />
              </SelectTrigger>
              <SelectContent>
                {areas.map((area) => (
                  <SelectItem key={area.id_area} value={area.id_area}>
                    {area.nombre_area}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex justify-end space-x-2 pt-6">
          <Button type="button" variant="outline" onClick={onCancel}>
            <X className="mr-2 h-4 w-4" />
            Cancelar
          </Button>
          <Button type="submit">
            <Check className="mr-2 h-4 w-4" />
            {usuarioEditado ? 'Actualizar' : 'Crear'} Usuario
          </Button>
        </div>
      </form>
    </div>
  );
}
