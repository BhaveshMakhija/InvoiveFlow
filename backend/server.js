import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { clerkMiddleware } from '@clerk/express';
import { connectDB } from './config/db.js';
import path from 'path';
import invoiceRouter from './routes/invoiceRouter.js';
import businessProfileRouter from './routes/bussinessProfileRouter.js';
import aiInvoiceRouter from './routes/aiinvoiceRouter.js';

dotenv.config({ path: './.env' }); // Explicit load of .env


const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));
app.use(express.json({ limit: "20mb" }));
app.use(clerkMiddleware());
app.use(express.urlencoded({ limit: "20mb", extended: true }));


// Database
connectDB();

// Routes
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));
app.use('/api/invoices', invoiceRouter);

app.use('/api/businessProfile', businessProfileRouter);

app.use('/api/ai', aiInvoiceRouter);

app.get('/', (req, res) => {
  res.send('API is running');
});



// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});