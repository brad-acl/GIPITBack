const express = require('express');
const { generateToken } = require('./config/tokenGenerator'); // Ajusta la ruta según sea necesario
const router = express.Router();

// Ruta para obtener el token
router.get('/get-token', (req, res) => {
  const token = generateToken();
  res.json({ token });
});

// Middleware para verificar el token (opcional, pero útil para rutas protegidas)
const verifyToken = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) {
    return res.status(403).send('Token no proporcionado.');
  }

  jwt.verify(token, jwtSecret, (err, decoded) => {
    if (err) {
      return res.status(500).send('Fallo en la autenticación del token.');
    }
    req.data = decoded.data; // Guardar información del token si es necesario
    next();
  });
};

// Ejemplo de ruta protegida
router.get('/protected', verifyToken, (req, res) => {
  res.send('Acceso a la ruta protegida.');
});

module.exports = router;
