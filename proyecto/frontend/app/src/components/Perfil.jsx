import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Perfil = () => {
  const [formData, setFormData] = useState({
    rut: '',
    nombre: '',
    apellido_paterno: '',
    apellido_materno: '',
    correo: '',
    rol: '',
    area: '',
    contrasena: '',
  });
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');

  // Obtener datos del perfil del usuario
  useEffect(() => {
    const obtenerPerfil = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No estás autenticado. Por favor inicia sesión.');
        return;
      }

      try {
        const response = await axios.get('http://localhost:4000/api/usuarios/perfil', {
          headers: { Authorization: `Bearer ${token}` },
        });

        setFormData({
          rut: response.data.rut,
          nombre: response.data.nombre,
          apellido_paterno: response.data.apellido_paterno,
          apellido_materno: response.data.apellido_materno,
          correo: response.data.correo,
          rol: response.data.rol.nombre_rol,
          area: response.data.Area.nombre_area,
          contrasena: '',
        });
      } catch (err) {
        setError('Error al obtener el perfil. Intenta nuevamente.');
        console.error('Error al obtener el perfil:', err.response?.data || err);
      }
    };

    obtenerPerfil();
  }, []);

  // Manejar cambios en los campos del formulario
  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Manejar la actualización del perfil
  const handleActualizarPerfil = async (e) => {
    e.preventDefault();
    setMensaje('');
    setError('');

    const token = localStorage.getItem('token');
    if (!token) {
      setError('No estás autenticado. Por favor inicia sesión.');
      return;
    }

    try {
      // Excluir los campos bloqueados
      const { rut, rol, area, ...actualizable } = formData;

      const response = await axios.put(
        `http://localhost:4000/api/usuarios/${rut}`,
        actualizable,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setMensaje('Perfil actualizado correctamente.');
      setFormData({ ...formData, contrasena: '' }); // Limpia la contraseña
    } catch (err) {
      console.error('Error al actualizar el perfil:', err.response?.data || err);
      setError(err.response?.data?.error || 'Error al actualizar el perfil.');
    }
  };

  return (
    <div className="container mt-4">
      <h2>Perfil de Usuario</h2>
      {mensaje && <div className="alert alert-success">{mensaje}</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      <form onSubmit={handleActualizarPerfil}>
        <div className="mb-3">
          <label className="form-label">RUT</label>
          <input type="text" className="form-control" value={formData.rut} disabled />
        </div>
        <div className="mb-3">
          <label className="form-label">Nombre</label>
          <input
            type="text"
            className="form-control"
            name="nombre"
            value={formData.nombre}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Apellido Paterno</label>
          <input
            type="text"
            className="form-control"
            name="apellido_paterno"
            value={formData.apellido_paterno}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Apellido Materno</label>
          <input
            type="text"
            className="form-control"
            name="apellido_materno"
            value={formData.apellido_materno}
            onChange={handleInputChange}
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Correo</label>
          <input
            type="email"
            className="form-control"
            name="correo"
            value={formData.correo}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Rol</label>
          <input type="text" className="form-control" value={formData.rol} disabled />
        </div>
        <div className="mb-3">
          <label className="form-label">Área</label>
          <input type="text" className="form-control" value={formData.area} disabled />
        </div>
        <div className="mb-3">
          <label className="form-label">Nueva Contraseña</label>
          <input
            type="password"
            className="form-control"
            name="contrasena"
            value={formData.contrasena}
            onChange={handleInputChange}
          />
        </div>
        <button type="submit" className="btn btn-primary">
          Actualizar Perfil
        </button>
      </form>
    </div>
  );
};

export default Perfil;
