import express from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import { initializeDatabase } from './db';

// Routes
import authRoutes from './routes/auth';
import stationsRoutes from './routes/stations';
import usersRoutes from './routes/users';
import manpowerRoutes from './routes/manpower';
import chemicalsRoutes from './routes/chemicals';
import machineryRoutes from './routes/machinery';
import wasteRoutes from './routes/waste';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware (Must be before routes)
app.use(cors());
app.use(express.json());

// Request logging
app.use((req, _res, next) => {
    console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
    next();
});

// Initialize database and start server
async function startServer() {
    app.listen(PORT, () => {
        console.log(`🚇 DMRC Housekeeping Server running on http://localhost:${PORT}`);
    });

    try {
        await initializeDatabase();
        console.log('✅ Database initialized successfully.');
    } catch (err) {
        console.error('Failed to initialize database (Server is still running, requests may fail):', err);
    }
}

startServer();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/stations', stationsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/manpower', manpowerRoutes);
app.use('/api/chemicals', chemicalsRoutes);
app.use('/api/machinery', machineryRoutes);
app.use('/api/waste', wasteRoutes);

// Health check
app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve frontend static files in production
const clientDistPath = path.join(__dirname, '../../client/dist');
app.use(express.static(clientDistPath));

// Catch-all route to serve React app for non-API requests
app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
        res.sendFile(path.join(clientDistPath, 'index.html'));
    } else {
        res.status(404).json({ error: 'API route not found' });
    }
});

// Error handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

export default app;
