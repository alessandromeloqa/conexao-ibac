import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import historicoRoutes from './routes/historico.js';
import comparativoRoutes from './routes/comparativo.js';
import certificadoRoutes from './routes/certificado.js';
import avaliacaoRoutes from './routes/avaliacao.js';
import rankingRoutes from './routes/ranking.js';
import criterioRoutes from './routes/criterio.js';
import pregadorRoutes from './routes/pregador.js';
import eventoRoutes from './routes/evento.js';
import participacaoRoutes from './routes/participacao.js';
import dashboardRoutes from './routes/dashboard.js';
import { sanitizeInput } from './middleware/validation.js';
import { authMiddleware } from './middleware/auth.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(sanitizeInput);

app.use('/api', authRoutes);
app.use('/api', eventoRoutes);
app.use('/api', pregadorRoutes);
app.use('/api', participacaoRoutes);
app.use('/api', criterioRoutes);
app.use('/api', historicoRoutes);
app.use('/api', comparativoRoutes);
app.use('/api', certificadoRoutes);
app.use('/api', avaliacaoRoutes);
app.use('/api', rankingRoutes);
app.use('/api', dashboardRoutes);

// Rotas protegidas (requerem autenticação)
app.use('/api/admin', authMiddleware);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Erro interno do servidor' });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
