// src/middleware/verificarToken.js
import jwt from 'jsonwebtoken';

const verificarToken = (allowedRoles) => (req, res, next) => {
  let token = req.headers['authorization'];

  if (!token) {
    return res.status(403).json({ message: 'No token provided.' });
  }

  if (token.startsWith("Bearer ")) {
    token = token.slice(7, token.length); // Remover "Bearer " del token
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Unauthorized!' });
    }

    req.usuarioId = decoded.id;
    req.rol = decoded.rol;
    req.areaId = decoded.areaId;

    // Verificar que el rol del usuario esté permitido
    if (allowedRoles && !allowedRoles.includes(req.rol)) {
      return res.status(403).json({ message: 'Access forbidden: insufficient permissions' });
    }

    next();
  });
};

export default verificarToken;
