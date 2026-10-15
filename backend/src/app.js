import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import session from 'express-session';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

app.use(helmet());
app.use(express.json());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));


app.get('/api/v1/health', (req, res) => {
  res.json({ status: 'ok' });
});

export default app;
