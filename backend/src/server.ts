import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { ENV } from './config/env.js';
import apiRouter from './routes/index.js';
import { errorHandler } from './middleware/errorHandler.js';
import { apiError } from './utils/response.js';

const app = express();

// Middlewares de sécurité et parsing
app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => {
      // Autoriser requêtes locales (frontend Next.js) ou requêtes sans origine (outils CLI, Postman, etc.)
      if (!origin || origin === ENV.FRONTEND_URL || origin.startsWith('http://localhost')) {
        callback(null, true);
      } else {
        callback(new Error('Non autorisé par la politique CORS'));
      }
    },
    credentials: true,
  })
);
app.use(express.json());

// Préfixe de l'API
app.use('/api', apiRouter);

// Gestion des routes inexistantes (404)
app.use((req, res) => {
  return apiError(res, `Route introuvable : ${req.method} ${req.originalUrl}`, 404);
});

// Gestionnaire global d'erreurs (500)
app.use(errorHandler);

// Démarrage du serveur si exécuté directement
if (process.env.NODE_ENV !== 'test') {
  app.listen(ENV.PORT, () => {
    console.log(`Sokho Viandes Backend API démarré sur http://localhost:${ENV.PORT}`);
    console.log(`Base SQLite : ${ENV.DATABASE_URL}`);
  });
}

export { app };
export default app;
