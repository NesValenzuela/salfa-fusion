// src/components/Login.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../login.css';

const Login = () => {
    const [rut, setRut] = useState('');
    const [contrasena, setContrasena] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    // Función para validar el formato del RUT
    const validarRUT = (rut) => {
        const rutRegex = /^[0-9]{7,8}-[0-9Kk]$/;
        if (!rutRegex.test(rut)) return false;

        const [numeros, dv] = rut.split('-');
        let suma = 0;
        let multiplicador = 2;

        for (let i = numeros.length - 1; i >= 0; i--) {
            suma += parseInt(numeros[i]) * multiplicador;
            multiplicador = multiplicador === 7 ? 2 : multiplicador + 1;
        }
        const resto = suma % 11;
        const dvCalculado = resto === 0 ? '0' : resto === 1 ? 'K' : (11 - resto).toString();
        return dvCalculado.toUpperCase() === dv.toUpperCase();
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        
        // Validar RUT antes de hacer la solicitud
        if (!validarRUT(rut)) {
            setError('El RUT ingresado es inválido');
            return;
        }

        try {
            const response = await axios.post('http://localhost:4000/api/usuarios/login', { rut, contrasena });
            localStorage.setItem('token', response.data.token);
            navigate('/misEncuestas');
        } catch (error) {
            console.error('Error en el login:', error);
            const mensajeError = error.response?.data?.error || 'Credenciales incorrectas';
            setError(mensajeError);
        }
    };

    return (
        <div className="login-page">
            <div className="image-side">
                <img src="/bg_salfacorp.jpg" alt="Fondo" className="background-image" />
                <div className="wave-container">
                    <svg className="waves" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
                        <path fill="#b80000" fillOpacity="1" d="M0,224L48,197.3C96,171,192,117,288,106.7C384,96,480,128,576,154.7C672,181,768,203,864,218.7C960,235,1056,245,1152,245.3C1248,245,1344,235,1392,229.3L1440,224L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
                    </svg>
                </div>
            </div>
            <div className="login-form-side">
                <div className="login-card">
                    <img src="/logo_1.jpg" alt="Logo" className="login-logo" />
                    <h3 className="text-center mb-3">Iniciar Sesión</h3>
                    {error && <div className="error-message">{error}</div>}
                    <form onSubmit={handleLogin}>
                        <div className="form-group mb-3">
                            <label htmlFor="rut">RUT</label>
                            <input
                                type="text"
                                className="form-control"
                                id="rut"
                                value={rut}
                                onChange={(e) => setRut(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-group mb-3">
                            <label htmlFor="contrasena">Contraseña</label>
                            <input
                                type="password"
                                className="form-control"
                                id="contrasena"
                                value={contrasena}
                                onChange={(e) => setContrasena(e.target.value)}
                                required
                            />
                        </div>
                        <button type="submit" className="btn-full-width">Iniciar sesión</button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;
