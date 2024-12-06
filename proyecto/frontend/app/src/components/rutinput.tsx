import React, { useState } from "react";
import { Input } from "./ui/input";

interface RutInputProps {
  value: string;
  onChange: (rut: string, isValid: boolean) => void;
}

const RutInput: React.FC<RutInputProps> = ({ value, onChange }) => {
  const [rut, setRut] = useState(value);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let inputRut = e.target.value.replace(/[^\dkK]/g, "").toUpperCase();
    setRut(inputRut);

    // Aplicar validación y formato
    const formattedRut = formatRut(inputRut);
    const isValid = validateRut(inputRut);

    onChange(formattedRut, isValid); // Pasamos el RUT formateado al formulario principal
  };

  // Función para formatear el RUT con puntos y guion
  const formatRut = (rut: string) => {
    // Eliminar puntos y guion anteriores
    let cleaned = rut.replace(/\./g, "").replace(/-/g, "");

    if (cleaned.length > 1) {
      const cuerpo = cleaned.slice(0, -1);
      const dv = cleaned.slice(-1);

      // Aplicar puntos a cada tres dígitos del cuerpo
      let formattedCuerpo = "";
      for (let i = cuerpo.length; i > 0; i -= 3) {
        const start = Math.max(i - 3, 0);
        formattedCuerpo = `${cuerpo.slice(start, i)}.${formattedCuerpo}`;
      }

      // Eliminar punto al principio, si existe
      formattedCuerpo = formattedCuerpo.slice(0, -1);

      return `${formattedCuerpo}-${dv}`; // Retornar cuerpo formateado con guion
    }

    return rut; // Retornar el rut sin formatear si es muy corto
  };

  // Función para validar el RUT usando módulo 11
  const validateRut = (rut: string) => {
    // Eliminar puntos y guion para validar
    let cleaned = rut.replace(/\./g, "").replace(/-/g, "");

    const cuerpo = cleaned.slice(0, -1);
    const dv = cleaned.slice(-1).toUpperCase();

    if (!/^\d+$/.test(cuerpo)) return false;

    let suma = 0;
    let factor = 2;

    for (let i = cuerpo.length - 1; i >= 0; i--) {
      suma += parseInt(cuerpo[i], 10) * factor;
      factor = factor === 7 ? 2 : factor + 1;
    }

    const dvCalculado = 11 - (suma % 11);
    let dvFinal = "";

    if (dvCalculado === 11) dvFinal = "0";
    else if (dvCalculado === 10) dvFinal = "K";
    else dvFinal = dvCalculado.toString();

    return dvFinal === dv;
  };

  return (
    <div className="space-y-2">
      <Input
        id="rut"
        name="rut"
        value={rut}
        onChange={handleChange}
        required
        className="border p-2"
      />
    </div>
  );
};

export default RutInput;
