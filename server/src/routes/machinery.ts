import { Router, Request, Response } from 'express';
import db from '../db';
import { AuthRequest, authenticateToken, getStationFilter } from '../middleware/auth';

const router = Router();

// Get machinery records
router.get('/', authenticateToken, async (req: Request, res: Response) => {
    const authReq = req as AuthRequest;
    const { station_id } = req.query;
    const stationFilter = getStationFilter(authReq.user!);

    let query = `
    SELECT m.*, s.name as station_name,
           COALESCE(u.full_name, 'System') as updated_by_name
    FROM machinery m
    JOIN stations s ON m.station_id = s.id
    LEFT JOIN users u ON m.updated_by = u.id
    WHERE 1=1
  `;
    const params: any[] = [];
    let paramIndex = 1;

    if (stationFilter) {
        query += ` AND m.station_id = $${paramIndex++}`;
        params.push(stationFilter);
    } else if (station_id) {
        query += ` AND m.station_id = $${paramIndex++}`;
        params.push(station_id);
    }

    query += ' ORDER BY s.name, m.machine_name';

    try {
        const records = await db.query(query, params);
        res.json(records.rows);
    } catch (error) {
        console.error('Error fetching machinery records:', error);
        res.status(500).json({ error: 'Failed to fetch machinery records' });
    }
});

// Get machinery summary
router.get('/summary', authenticateToken, async (req: Request, res: Response) => {
    const authReq = req as AuthRequest;
    const stationFilter = getStationFilter(authReq.user!);

    let query = `
    SELECT COUNT(*) as total_machines,
           SUM(CASE WHEN status = 'occupied' THEN 1 ELSE 0 END) as occupied,
           SUM(CASE WHEN status = 'free' THEN 1 ELSE 0 END) as free
    FROM machinery
    WHERE 1=1
  `;
    const params: any[] = [];
    let paramIndex = 1;

    if (stationFilter) {
        query += ` AND station_id = $${paramIndex++}`;
        params.push(stationFilter);
    }

    try {
        const summary = await db.query(query, params);
        res.json(summary.rows[0]);
    } catch (error) {
        console.error('Error fetching machinery summary:', error);
        res.status(500).json({ error: 'Failed to fetch machinery summary' });
    }
});

// Create machinery record
router.post('/', authenticateToken, async (req: Request, res: Response) => {
    const authReq = req as AuthRequest;
    const { station_id, machine_name, status } = req.body;
    const user = authReq.user!;

    const targetStation = user.role === 'staff' ? user.station_id : station_id;

    if (!targetStation || !machine_name) {
        res.status(400).json({ error: 'station_id and machine_name are required' });
        return;
    }

    try {
        const insertResult = await db.query(
            'INSERT INTO machinery (station_id, machine_name, status, updated_by) VALUES ($1, $2, $3, $4) RETURNING id',
            [targetStation, machine_name, status || 'free', user.id]
        );

        const record = await db.query(`
            SELECT m.*, s.name as station_name
            FROM machinery m
            JOIN stations s ON m.station_id = s.id
            WHERE m.id = $1
        `, [insertResult.rows[0].id]);

        res.status(201).json(record.rows[0]);
    } catch (error) {
        console.error('Error creating machinery record:', error);
        res.status(500).json({ error: 'Failed to create machinery record' });
    }
});

// Update machinery status
router.put('/:id', authenticateToken, async (req: Request, res: Response) => {
    const authReq = req as AuthRequest;
    const { status, machine_name } = req.body;
    const user = authReq.user!;

    try {
        await db.query(`
            UPDATE machinery SET 
                status = COALESCE($1, status),
                machine_name = COALESCE($2, machine_name),
                last_updated = CURRENT_TIMESTAMP,
                updated_by = $3
            WHERE id = $4
        `, [status, machine_name, user.id, req.params.id]);

        const record = await db.query(`
            SELECT m.*, s.name as station_name
            FROM machinery m
            JOIN stations s ON m.station_id = s.id
            WHERE m.id = $1
        `, [req.params.id]);

        if (record.rows.length === 0) {
            res.status(404).json({ error: 'Machine not found' });
            return;
        }

        res.json(record.rows[0]);
    } catch (error) {
        console.error('Error updating machinery:', error);
        res.status(500).json({ error: 'Failed to update machinery' });
    }
});

// Delete machinery
router.delete('/:id', authenticateToken, async (req: Request, res: Response) => {
    try {
        const result = await db.query('DELETE FROM machinery WHERE id = $1', [req.params.id]);
        if (result.rowCount === 0) {
            res.status(404).json({ error: 'Machine not found' });
            return;
        }
        res.json({ message: 'Machine deleted' });
    } catch (error) {
        console.error('Error deleting machinery:', error);
        res.status(500).json({ error: 'Failed to delete machinery' });
    }
});

export default router;
