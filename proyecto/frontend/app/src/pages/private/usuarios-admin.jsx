import React, { useState } from "react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import * as XLSX from "xlsx";
import axios from "axios";

const UsuariosAdmin = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [errorMessages, setErrorMessages] = useState([]);

  const validarUsuario = (usuario) => {
    const errores = [];

    if (!usuario.rut) errores.push(`Falta RUT para usuario ${usuario.nombre}`);

    if (!usuario.correo || !usuario.correo.includes("@"))
      errores.push(`Correo inválido para usuario ${usuario.nombre}`);

    if (!usuario.nombre) errores.push("El nombre es requerido");
    if (!usuario.apellido_paterno)
      errores.push("El apellido paterno es requerido");
    if (!usuario.apellido_materno)
      errores.push("El apellido materno es requerido");
    if (!usuario.rolId) errores.push("El rol es requerido");
    if (!usuario.areaId) errores.push("El área es requerida");

    return errores;
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    console.log("hola");
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const workbook = XLSX.read(event.target?.result, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json < any > worksheet;

        const errores = [];
        data.forEach((usuario, index) => {
          const usuarioErrores = validarUsuario(usuario);
          if (usuarioErrores.length > 0) {
            errores.push(`Errores en fila ${index + 2}:`, ...usuarioErrores);
          }
        });

        if (errores.length > 0) {
          setErrorMessages(errores);
          return;
        }

        setUsuarios(data);

        const response = await axios.post(
          "http://localhost:4000/api/usuarios/bulk",
          {
            usuarios: data,
          }
        );
        alert("Usuarios cargados exitosamente");
      } catch (error) {
        console.error("Error al procesar el archivo:", error);
        setErrorMessages(["Error al procesar el archivo Excel"]);
      }
    };

    reader.readAsBinaryString(file);
  };

  const handleDownloadTemplate = () => {
    const template = XLSX.utils.book_new();
    const templateData = [
      {
        rut: "12.345.678-9",
        nombre: "Juan",
        apellido_paterno: "Pérez",
        apellido_materno: "González",
        correo: "juan.perez@ejemplo.com",
        rolId: 1,
        areaId: 1,
      },
      {
        rut: "11.111.111-1",
        nombre: "María",
        apellido_paterno: "López",
        apellido_materno: "Soto",
        correo: "maria.lopez@ejemplo.com",
        rolId: 2,
        areaId: 1,
      },
      {
        rut: "22.222.222-2",
        nombre: "Pedro",
        apellido_paterno: "Rodríguez",
        apellido_materno: "Muñoz",
        correo: "pedro.rodriguez@ejemplo.com",
        rolId: 3,
        areaId: 1,
      },
      {
        rut: "33.333.333-3",
        nombre: "Ana",
        apellido_paterno: "García",
        apellido_materno: "Martínez",
        correo: "ana.garcia@ejemplo.com",
        rolId: 1,
        areaId: 1,
      },
      {
        rut: "44.444.444-4",
        nombre: "Carlos",
        apellido_paterno: "Fernández",
        apellido_materno: "Silva",
        correo: "carlos.fernandez@ejemplo.com",
        rolId: 2,
        areaId: 1,
      },
      {
        rut: "55.555.555-5",
        nombre: "Laura",
        apellido_paterno: "Torres",
        apellido_materno: "Rojas",
        correo: "laura.torres@ejemplo.com",
        rolId: 3,
        areaId: 1,
      },
      {
        rut: "66.666.666-6",
        nombre: "Diego",
        apellido_paterno: "Vargas",
        apellido_materno: "Castro",
        correo: "diego.vargas@ejemplo.com",
        rolId: 1,
        areaId: 1,
      },
      {
        rut: "77.777.777-7",
        nombre: "Carmen",
        apellido_paterno: "Morales",
        apellido_materno: "Flores",
        correo: "carmen.morales@ejemplo.com",
        rolId: 2,
        areaId: 1,
      },
      {
        rut: "88.888.888-8",
        nombre: "Roberto",
        apellido_paterno: "Herrera",
        apellido_materno: "Díaz",
        correo: "roberto.herrera@ejemplo.com",
        rolId: 3,
        areaId: 1,
      },
      {
        rut: "99.999.999-9",
        nombre: "Patricia",
        apellido_paterno: "Navarro",
        apellido_materno: "Pinto",
        correo: "patricia.navarro@ejemplo.com",
        rolId: 1,
        areaId: 1,
      },
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    XLSX.utils.book_append_sheet(template, ws, "Template");
    XLSX.writeFile(template, "plantilla_usuarios.xlsx");
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Administración de Usuarios</h1>

      <div className="space-y-4">
        <Button onClick={handleDownloadTemplate}>
          Descargar Plantilla Excel
        </Button>

        <div className="flex items-center space-x-2">
          <Input
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileUpload}
            className="max-w-md"
          />
          <Button>Cargar Usuarios</Button>
        </div>

        {errorMessages.length > 0 && (
          <div className="mt-4 p-4 bg-red-100 rounded">
            <h3 className="font-bold text-red-700">Errores encontrados:</h3>
            <ul className="list-disc pl-4">
              {errorMessages.map((error, index) => (
                <li key={index} className="text-red-600">
                  {error}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default UsuariosAdmin;
