const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const sql = require('mssql');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3000;

app.use(session({
  secret: '1413003141',
  resave: false,
  saveUninitialized: true
}));

app.use(bodyParser.json());
app.use(cors());

const config = {
  user: 'sa',
  password: '12345678',
  server: 'SERVER10\\SQL2008',
  database: 'bd_AgViajes',
  options: {
    encrypt: false,
    trustServerCertificate: true
  }
};

sql.connect(config)
  .then(pool => {
    console.log('Conexión a la base de datos exitosa.');

    app.get('/comisiones', (req, res) => {
      const SignIn = req.query.SignIn;
      const estado = req.query.estado;
      const query = `SELECT * FROM COMISIONES
                     WHERE Estado = @estado AND SignIn = @SignIn 
                     ORDER BY CheckInDate DESC`;
      pool.request()
        .input('estado', sql.VarChar, estado)
        .input('SignIn', sql.VarChar, SignIn)
        .query(query, (error, results) => {
          if (error) {
            console.error(error);
            return res.status(500).json({ error: 'Error en la base de datos. Consulte al administrador.', details: error });
          }
          return res.json(results.recordset);
        });
    });

    app.post('/buscar-documentos', (req, res) => {
      const { fechaInicio, fechaFinal, tipo } = req.body;
      let query = `SELECT * FROM DOCUMENTO WHERE fe_docu BETWEEN @fechaInicio AND @fechaFinal`;
      
      if (tipo === 'cliente') {
        query += ` AND co_tip_maestro = 'CL'`;
      } else if (tipo === 'proveedor') {
        query += ` AND co_tip_maestro = 'PR'`;
      } else if (tipo === 'ambos') {
        query += ` AND (co_tip_maestro = 'CL' OR co_tip_maestro = 'PR')`;
      }

      pool.request()
        .input('fechaInicio', sql.Date, fechaInicio)
        .input('fechaFinal', sql.Date, fechaFinal)
        .query(query, (error, results) => {
          if (error) {
            console.error(error);
            return res.status(500).json({ error: 'Error en la base de datos. Consulte al administrador.', details: error });
          }
          return res.json(results.recordset);
        });
    });

    app.post('/buscar-documentos1', (req, res) => {
      const { fechaInicio, fechaFinal, file, tipo, serie, doc } = req.body;
      let query = `SELECT * FROM DOCUMENTO WHERE fe_docu BETWEEN '${fechaInicio}' AND '${fechaFinal}' AND co_tip_doc = '${tipo}' AND nu_serie = '${serie}'`;
      
      if (file!='') {
        query += ` AND nu_file = @file`;
      }
      if (doc!='') {
        query += ` AND nu_docu = @doc`;
      }
      pool.request()
        .input('fechaInicio', sql.Date, fechaInicio)
        .input('fechaFinal', sql.Date, fechaFinal)
        .input('file', sql.VarChar, file)
        .input('tipo', sql.VarChar, tipo)
        .input('serie', sql.VarChar, serie)
        .input('doc', sql.VarChar, doc)
        .query(query, (error, results) => {
          if (error) {
            console.error(error);
            return res.status(500).json({ error: 'Error en la base de datos. Consulte al administrador.', details: error });
          }
          return res.json(results.recordset);
        });
    });

    const pdfDir = path.join(__dirname, 'src/assets/pdf');
    if (!fs.existsSync(pdfDir)) {
      fs.mkdirSync(pdfDir, { recursive: true });
    }

    const storage = multer.diskStorage({
      destination: function (req, file, cb) {
        cb(null, pdfDir); 
      },
      filename: function (req, file, cb) {
        cb(null, file.originalname); 
      }
    });

    const upload = multer({ storage: storage });

    app.post('/upload', upload.single('file'), (req, res) => {
      res.send({ message: 'File uploaded successfully', filePath: `src/assets/pdf/${req.file.filename}` });
    });

    app.get('/cadenas-hoteles', (req, res) => {
      const query = 'SELECT DISTINCT HotelChainName FROM COMISIONES ORDER BY HotelChainName ASC';
      pool.request().query(query, (error, results) => {
        if (error) {
          console.error(error);
          return res.status(500).json({ error: 'Error al obtener los hoteles' });
        }
        return res.json(results.recordset);
      });
    });

    app.post('/eliminar-pdf', (req, res) => {
      const { pdfPath } = req.body;
    
      fs.unlink(pdfPath, (err) => {
        if (err) {
          console.error('Error al eliminar el archivo PDF:', err);
          return res.status(500).json({ error: 'Error al eliminar el archivo PDF.' });
        }
        res.json({ message: 'Archivo PDF eliminado exitosamente.' });
      });
    });

    app.post('/logout', (req, res) => {
      req.session.destroy();
      res.redirect('/login');
    });

    app.listen(port, () => {
      console.log(`Servidor iniciado en http://localhost:${port}`);
    });
  })
  .catch(error => {
    console.error('Error al conectar a la base de datos:', error);
    process.exit(1);
  });

app.on('error', error => {
  if (error.syscall !== 'listen') {
    throw error;
  }

  switch (error.code) {
    case 'EACCES':
      console.error(`El puerto ${port} requiere permisos elevados`);
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(`El puerto ${port} está en uso`);
      process.exit(1);
      break;
    default:
      throw error;
  }
});