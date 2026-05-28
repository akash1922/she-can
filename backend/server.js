import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import submissionsRouter from './routes/submissions.js';
import adminRouter from './routes/admin.js';
import { initWebSocket } from './services/websocket.js';

dotenv.config();

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = parseInt(process.env.PORT || 5000, 10);

// Enable CORS for localhost frontend (React on port 5173 by default)
app.use(cors({
  origin: '*', // Allow all origins for local pairing development ease
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Global logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// APIs Registration
app.use('/api/submissions', submissionsRouter);
app.use('/api/admin', adminRouter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    aiService: process.env.GROQ_API_KEY ? 'Groq AI Active' : 'Fallback Classifier Active',
    databaseService: process.env.SUPABASE_URL ? 'Supabase Active' : 'Memory Database Active'
  });
});

// Serve static assets from frontend build folder in production
if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(__dirname, '../frontend/dist');
  app.use(express.static(distPath));
  
  // Wildcard route to serve React app for SPA client-side routing
  app.get('*', (req, res, next) => {
    // Skip API routes so they fall through to their respective handlers
    if (req.path.startsWith('/api/') || req.path.startsWith('/health')) {
      return next();
    }
    res.sendFile(path.join(distPath, 'index.html'));
  });
} else {
  // Root route handler for development
  app.get('/', (req, res) => {
    res.send('Welcome to the She Can Foundation API Service! Online and ready.');
  });
}

// 404 Route handler
app.use((req, res, next) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({ error: 'Internal Server Error' });
});

const startServer = (port) => {
  const server = app.listen(port, () => {
    console.log(`===============================================`);
    console.log(` She Can Foundation API Server running on port ${port}`);
    console.log(` Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(` AI Service: ${process.env.GROQ_API_KEY ? 'Groq Llama-3 Active' : 'NLP Fallback Active'}`);
    console.log(` DB Service: ${process.env.SUPABASE_URL ? 'Supabase Client Active' : 'Memory DB Fallback Active'}`);
    console.log(`===============================================`);
  });

  // Attach WebSocket server for real-time synchronization
  initWebSocket(server);

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      const nextPort = parseInt(port, 10) + 1;
      console.warn(`[Port Collision] Port ${port} is occupied. Retrying automatically on port ${nextPort}...`);
      startServer(nextPort);
    } else {
      console.error('Server execution error:', err);
    }
  });
};

if (!process.env.VERCEL) {
  startServer(PORT);
}

export default app;

