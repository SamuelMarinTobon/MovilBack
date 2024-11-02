import express from 'express';
import morgan from 'morgan';
import routes from './routes/routes.js';
import cors from 'cors';

//instancia
const app = express();

// Configura CORS globalmente
app.use(
  cors({
    methods: ['GET', 'POST', 'PUT', 'DELETE'], 
  })
);

// Middleware para manejar las solicitudes JSON
app.use(express.json()); 

//config puerto
app.set('port', process.env.PORT || 3000);

//MIDDLEWARE (maneja las solicitudes y respuestas)
app.use(morgan('dev'));

//routes
app.use(routes);



export default app;
