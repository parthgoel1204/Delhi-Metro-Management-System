import { Router, Request, Response } from 'express';
import db from '../db';
import { AuthRequest, authenticateToken, requireRole } from '../middleware/auth';

const router = Router();

// Get all stations — public endpoint (needed for registration page, non-sensitive reference data)
router.get('/', async (req: Request, res: Response) => {
    try {
        const result = await db.query('SELECT * FROM stations ORDER BY name');
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching stations:', error);
        res.status(500).json({ error: 'Failed to fetch stations' });
    }
});

// Get single station
router.get('/:id', authenticateToken, async (req: Request, res: Response) => {
    try {
        const result = await db.query('SELECT * FROM stations WHERE id = $1', [req.params.id]);
        const station = result.rows[0];
        if (!station) {
            res.status(404).json({ error: 'Station not found' });
            return;
        }
        res.json(station);
    } catch (error) {
        console.error('Error fetching station:', error);
        res.status(500).json({ error: 'Failed to fetch station' });
    }
});

// Create station (admin only)
router.post('/', authenticateToken, requireRole('admin'), async (req: Request, res: Response) => {
    const { name, code, line } = req.body;
    if (!name || !code || !line) {
        res.status(400).json({ error: 'Name, code, and line are required' });
        return;
    }

    try {
        const result = await db.query(
            'INSERT INTO stations (name, code, line) VALUES ($1, $2, $3) RETURNING *',
            [name, code, line]
        );
        res.status(201).json(result.rows[0]);
    } catch (error: any) {
        if (error.code === '23505') { // PostgreSQL unique violation code
            res.status(409).json({ error: 'Station name or code already exists' });
        } else {
            console.error('Error creating station:', error);
            res.status(500).json({ error: 'Failed to create station' });
        }
    }
});

// Update station (admin only)
router.put('/:id', authenticateToken, requireRole('admin'), async (req: Request, res: Response) => {
    const { name, code, line } = req.body;

    try {
        const result = await db.query(
            'UPDATE stations SET name = COALESCE($1, name), code = COALESCE($2, code), line = COALESCE($3, line) WHERE id = $4 RETURNING *',
            [name, code, line, req.params.id]
        );

        if (result.rows.length === 0) {
            res.status(404).json({ error: 'Station not found' });
            return;
        }

        res.json(result.rows[0]);
    } catch (error: any) {
        if (error.code === '23505') { // PostgreSQL unique violation code
            res.status(409).json({ error: 'Station name or code already exists' });
        } else {
            console.error('Error updating station:', error);
            res.status(500).json({ error: 'Failed to update station' });
        }
    }
});

// Delete station (admin only)
router.delete('/:id', authenticateToken, requireRole('admin'), async (req: Request, res: Response) => {
    try {
        const result = await db.query('DELETE FROM stations WHERE id = $1', [req.params.id]);
        if (result.rowCount === 0) {
            res.status(404).json({ error: 'Station not found' });
            return;
        }
        res.json({ message: 'Station deleted' });
    } catch (error) {
        console.error('Error deleting station:', error);
        res.status(500).json({ error: 'Failed to delete station' });
    }
});

export default router;
