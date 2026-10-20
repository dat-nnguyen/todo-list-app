import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import session from 'express-session';

import { config } from './config/index.js';
import connectPgSimple from 'connect-pg-simple';
import pool from './db/index.js';
import authRoutes from './modules/auth/auth.route.js';
import todosRoutes from './modules/todos/todos.route.js';
import { errorHandler } from './middleware/errorHandler.js';

const PgStore = connectPgSimple(session);

const app = express();

// security & parse JSON body 
app.use(helmet());

// CORS
app.use(cors({
  origin: config.clientUrl,
  credentials: true,
}));

app.use(express.json());

// session
app.use(session({
  store: new PgStore({ pool }),
  secret: config.session.secret,
  resave: false,
  saveUninitialized: false,
  rolling: true,
  cookie: {
    httpOnly: true,
    secure: config.session.secure,
    sameSite: 'lax',
    maxAge: config.session.maxAgeMs,
  },
}));

//routing
app.get('/api/v1/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/todos', todosRoutes);

// 404 JSON
app.use((req, res) => {
  res.status(404).json({
    error: {
      code: 'NOT_FOUND',
      message: `Cannot ${req.method} ${req.path}`,
    }
  })
})

//erros handler
app.use(errorHandler);

export default app;
