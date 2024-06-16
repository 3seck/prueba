// Importar dependencias
const connection = require('./database/connection');
const express = require('express');
const cors = require('cors');

console.log('Api node arrancada');

// Conexión a la base de datos
connection();

// Crear servidor node
const app = express();
const puerto = process.env.PORT || 3000; // Usar el puerto del entorno si está disponible

// Configurar CORS
app.use(cors({
    origin: ['http://localhost:5173', 'https://prueba-8j3p.onrender.com'], // Reemplaza con la URL de tu frontend
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true, // si necesitas enviar cookies de autenticación
}));

// Convertir los datos del body a objetos JS
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cargar conf rutas
const userRoutes = require('./routes/user');
const followRoutes = require('./routes/follow');
const publicationRoutes = require('./routes/publication');

app.use('/api/user', userRoutes);
app.use('/api/follow', followRoutes);
app.use('/api/publication', publicationRoutes);

// Ruta prueba
app.get('/ruta-prueba', (req, res) => {
    return res.status(200).json({
        "id": 1,
        "nombre": "Prueba"
    });
});

// Poner servidor a escuchar peticiones HTTP
app.listen(puerto, () => {
    console.log(`Servidor corriendo en http://localhost:${puerto}`);
});
