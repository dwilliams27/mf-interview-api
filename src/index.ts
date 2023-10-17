import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import paymentFilesRouter from './routes/paymentFiles';
import reportsRouter from './routes/reports';
import paymentsRouter from './routes/payments';

// Setup
const PORT = 3001;
const app = express();

// Middleware
app.use(cors());
app.use(express.json({limit: '50mb'}));
app.use((req, res, next) => {
  req.headers.authorization = `Bearer ${process.env.METHOD_API_KEY}`;
  next();
});

// Routes
app.use('/paymentFiles', paymentFilesRouter);
app.use('/reports', reportsRouter);
app.use('/payments', paymentsRouter);

// Startup
app.listen(PORT, () => {
  console.log(`Express server is listening at ${PORT}`);
});
