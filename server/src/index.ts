import express from 'express';
import cors from 'cors';
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

// Initialize database and start server
async function startServer() {
    try {
        await initializeDatabase();
        app.listen(PORT, () => {
            console.log(`🚇 DMRC Housekeeping Server running on http://localhost:${PORT}`);
        });
    } catch (err) {
        console.error('Failed to start server:', err);
        process.exit(1);
    }
}

startServer();

// Middleware
app.use(cors());
app.use(express.json());

// Request logging
app.use((req, _res, next) => {
    console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
    next();
});

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

// Error handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

export default app;
