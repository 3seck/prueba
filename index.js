// Importar dependencias
const connection = require('./database/connection');
const express = require('express');
const cors = require('cors');

console.log('Api node arrancada');


// conexion a la base de datos
    connection();

// Crear servidor node
const app = express();
const puerto = 3000;

// configurar cors
app.use(cors());

//convertir los datos del body a objetos js
    app.use(express.json());
    app.use(express.urlencoded({extended: true}));

// cargar conf rutas
    const userRoutes = require('./routes/user');
    const followRoutes = require('./routes/follow');
    const publicationRoutes = require('./routes/publication');


    app.use('/api/user', userRoutes);
    app.use('/api/follow', followRoutes);
    app.use('/api/publication', publicationRoutes);

// Ruta prueba
app.get('/ruta-prueba', (req, res) => {
   return res.status(200).json
   (
    {
        "id": 1,
        "nombre": "Prueba"

    }
    );
});


// poner servidor a escuchar peticiones http

app.listen(puerto, () => {
    console.log(`Servidor corriendo en http://localhost:${puerto}`);
});