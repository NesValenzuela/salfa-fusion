import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const ModificarEncuesta = () => {
  const { idEncuesta } = useParams(); // Obtenemos el ID desde la URL
  const navigate = useNavigate();
  const [encuesta, setEncuesta] = useState({ titulo: '', estado_encuesta: '' });
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');

  // Cargar los datos de la encuesta a modificar
  useEffect(() => {
    const fetchEncuesta = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`http://localhost:4000/api/encuestas/${idEncuesta}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setEncuesta(response.data);
      } catch (error) {
        console.error('Error al cargar la encuesta:', error);
        setError('No se pudo cargar la encuesta. Intente nuevamente.');
      }
    };
    fetchEncuesta();
  }, [idEncuesta]);

  // Manejar el envío del formulario para guardar los cambios
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMensaje('');

    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:4000/api/encuestas/${idEncuesta}`, encuesta, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMensaje('Cambios guardados con éxito.');
      setTimeout(() => navigate('/encuestas'), 2000); // Redirigir después de un tiempo
    } catch (error) {
      console.error('Error al modificar la encuesta:', error);
      setError('Error al modificar la encuesta. Intente nuevamente.');
    }
  };

  // Manejar los cambios en los campos del formulario
  const handleChange = (e) => {
    setEncuesta({ ...encuesta, [e.target.name]: e.target.value });
  };

  return (
    <div className="container mt-5">
      <div className="card p-4 shadow-sm">
        <h2 className="text-center mb-4">Modificar Encuesta</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group mb-3">
            <label className="form-label">Título de la Encuesta</label>
            <input
              type="text"
              className="form-control"
              name="titulo"
              value={encuesta.titulo}
              onChange={handleChange}
              placeholder="Ingrese el título de la encuesta"
              required
            />
          </div>

          <div className="form-group mb-3">
            <label className="form-label">Estado de la Encuesta</label>
            <select
              className="form-select"
              name="estado_encuesta"
              value={encuesta.estado_encuesta}
              onChange={handleChange}
              required
            >
              <option value="">Seleccionar Estado</option>
              <option value="Habilitada">Habilitada</option>
              <option value="Deshabilitada">Deshabilitada</option>
            </select>
          </div>

          {mensaje && <div className="alert alert-success mt-3">{mensaje}</div>}
          {error && <div className="alert alert-danger mt-3">{error}</div>}

          <div className="d-flex justify-content-between">
            <button type="submit" className="btn btn-primary">Guardar Cambios</button>
            <button type="button" className="btn btn-secondary" onClick={() => navigate('/encuestas')}>
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModificarEncuesta;
