// src/services/authService.js
export const login = async (correo, contrasena) => {
    const response = await fetch('http://localhost:4000/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ correo, contrasena })
    });
  
    const data = await response.json();
    if (data.token) {
      localStorage.setItem('token', data.token);
    }
  
    return data;
  };
  
  export const getToken = () => {
    return localStorage.getItem('token');
  };
  
  export const logout = () => {
    localStorage.removeItem('token');
  };
  
  export const isAuthenticated = () => {
    return !!getToken();
  };
  