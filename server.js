const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const app = express();
const port = 3000;

app.use(session({
  secret: '1413003141',
  resave: false,
  saveUninitialized: true
}));

app.use(bodyParser.json());

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'gds'
});

connection.connect();

app.use(cors());

app.post('/login', (req, res) => {
  const { de_email, de_password } = req.body;
  console.log('Datos recibidos:', { de_email, de_password }); 

  console.log('Consulta a la base de datos:', 'SELECT * FROM usuariosgds WHERE usuario = ? AND clave = ?', [de_email, de_password]);

  connection.query('SELECT * FROM usuariosgds WHERE usuario = ? AND clave = ?', [de_email, de_password], (error, results) => {
      if (error) {
          console.error(error);
          return res.status(500).json({ error: 'Error al intentar iniciar sesión' });
      }
      
      console.log('Resultados de la consulta:', results);
      console.log('Longitud: ', results.length);

      if (results.length === 1) {
          const userData = results[0];
          const token = jwt.sign({ de_email, userData }, 'clave_secreta', { expiresIn: '3h' });
          req.session.username = de_email;
          req.session.userData = userData;
          const idUsuario = userData.id;
          req.session.idusuario = idUsuario;
          const rolUsuario = userData.rolUsuario;
          req.session.rolUsuario = rolUsuario;
          const fechaIngreso = new Date().toISOString().slice(0, 19).replace('T', ' ');
          
          console.log('Datos a insertar en registrousuarios:', [idUsuario, fechaIngreso]);

          connection.query('INSERT INTO registrousuarios (idUsuario, fechaIngreso) VALUES (?, ?)', [idUsuario, fechaIngreso], (error, results) => {
              if (error) {
                  console.error(error);
                  return res.status(500).json({ error: 'Error al guardar el registro de usuario' });
              }
              console.log('Registro de usuario guardado exitosamente');
          });

          req.session.idUsuario = userData.id;
          req.session.rolUsuario = userData.rolUsuario;
          req.session.nombre = userData.nombre;
          req.session.fechaIngreso = userData.fechaIngreso;

          console.log('Generated Token:', token);

          return res.json({ token, userData });
      } else {
          return res.status(401).json({ error: 'Credenciales incorrectas' });
      }
  });
});

function verificarToken(req, res, next) {
  const token = req.headers.authorization && req.headers.authorization.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'No autorizado' });
  }
  jwt.verify(token, 'clave_secreta', (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: 'Token inválido' });
    }
    req.decoded = decoded;
    req.session.timestamp = new Date().getTime();
    const newToken = jwt.sign({ username: decoded.username, userData: decoded.userData }, 'clave_secreta', { expiresIn: '3h' });
    res.set('Authorization', 'Bearer ' + newToken);
    next();
  });
}

function verificarInactividad(req, res, next) {
  const tiempoInactivo = 60 * 60 * 1000;
  const tiempoActual = new Date().getTime();
  const tiempoUltimaActividad = req.session.timestamp || 0;
  if (tiempoActual - tiempoUltimaActividad > tiempoInactivo) {
    req.session.destroy();
    return res.status(401).json({ error: 'Sesión expirada' });
  }
  next();
}

app.use((req, res, next) => {
  const path = req.path;
  const isLoginPath = path === '/login';
  if (!req.session.username && !isLoginPath) {
    return res.status(401).json({ error: 'No autorizado' });
  }
  next();
});

app.get('/usuario', verificarToken, verificarInactividad, (req, res) => {
  const username = req.decoded.username;
  connection.query('SELECT nombre, fechaIngreso FROM usuariosgds WHERE usuario = ?', [username], (error, results) => {
    if (error) {
      console.error(error);
      return res.status(500).json({ error: 'Error al obtener datos de usuario' });
    }
    if (results.length === 1) {
      return res.json(results[0]);
    } else {
      const userData = req.session.userData;
      if (!userData) {
        return res.status(404).json({ error: 'Datos de usuario no encontrados en la sesión' });
      }
      return res.json({ nombre: userData.nombre, fechaIngreso: userData.fechaIngreso });
    }
  });
});

app.post('/logout', (req, res) => {
  req.session.destroy();
  res.status(200).json({ message: 'Sesión cerrada exitosamente' });
});

app.listen(port, () => {
  console.log(`Servidor iniciado en http://localhost:${port}`);
});
