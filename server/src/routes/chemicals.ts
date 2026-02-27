import { Router, Request, Response } from 'express';
import db from '../db';
import { AuthRequest, authenticateToken, getStationFilter } from '../middleware/auth';

const router = Router();

// Get chemical records
router.get('/', authenticateToken, async (req: Request, res: Response) => {
    const authReq = req as AuthRequest;
    const { station_id, date, start_date, end_date } = req.query;
    const stationFilter = getStationFilter(authReq.user!);

    let query = `
    SELECT c.*, s.name as station_name, u.full_name as created_by_name
    FROM chemicals c
    JOIN stations s ON c.station_id = s.id
    JOIN users u ON c.created_by = u.id
    WHERE 1=1
  `;
    const params: any[] = [];
    let paramIndex = 1;

    if (stationFilter) {
        query += ` AND c.station_id = $${paramIndex++}`;
        params.push(stationFilter);
    } else if (station_id) {
        query += ` AND c.station_id = $${paramIndex++}`;
        params.push(station_id);
    }

    if (date) {
        query += ` AND c.date = $${paramIndex++}`;
        params.push(date);
    } else if (start_date && end_date) {
        query += ` AND c.date BETWEEN $${paramIndex++} AND $${paramIndex++}`;
        params.push(start_date, end_date);
    }

    query += ' ORDER BY c.date DESC, c.chemical_name';

    try {
        const records = await db.query(query, params);
        res.json(records.rows);
    } catch (error) {
        console.error('Error fetching chemical records:', error);
        res.status(500).json({ error: 'Failed to fetch chemical records' });
    }
});

// Get chemicals summary
router.get('/summary', authenticateToken, async (req: Request, res: Response) => {
    const authReq = req as AuthRequest;
    const stationFilter = getStationFilter(authReq.user!);
    const { date } = req.query;
    const targetDate = date || new Date().toISOString().split('T')[0];

    let query = `
    SELECT COUNT(*) as total_entries,
           COUNT(DISTINCT chemical_name) as unique_chemicals
    FROM chemicals
    WHERE date = $1
  `;
    const params: any[] = [targetDate];

    if (stationFilter) {
        query += ' AND station_id = $2';
        params.push(stationFilter);
    }

    try {
        const summary = await db.query(query, params);
        res.json(summary.rows[0]);
    } catch (error) {
        console.error('Error fetching chemicals summary:', error);
        res.status(500).json({ error: 'Failed to fetch chemicals summary' });
    }
});

// Create chemical record
router.post('/', authenticateToken, async (req: Request, res: Response) => {
    const authReq = req as AuthRequest;
    const { station_id, date, chemical_name, quantity, unit, purpose } = req.body;
    const user = authReq.user!;

    const targetStation = user.role === 'staff' ? user.station_id : station_id;

    if (!targetStation || !date || !chemical_name || quantity === undefined || !unit) {
        res.status(400).json({ error: 'station_id, date, chemical_name, quantity, and unit are required' });
        return;
    }

    try {
        const insertResult = await db.query(
            'INSERT INTO chemicals (station_id, date, chemical_name, quantity, unit, purpose, created_by) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id',
            [targetStation, date, chemical_name, quantity, unit, purpose || null, user.id]
        );

        const record = await db.query(`
            SELECT c.*, s.name as station_name, u.full_name as created_by_name
            FROM chemicals c
            JOIN stations s ON c.station_id = s.id
            JOIN users u ON c.created_by = u.id
            WHERE c.id = $1
        `, [insertResult.rows[0].id]);

        res.status(201).json(record.rows[0]);
    } catch (error) {
        console.error('Error creating chemical record:', error);
        res.status(500).json({ error: 'Failed to create chemical record' });
    }
});

// Delete chemical record
router.delete('/:id', authenticateToken, async (req: Request, res: Response) => {
    try {
        const result = await db.query('DELETE FROM chemicals WHERE id = $1', [req.params.id]);
        if (result.rowCount === 0) {
            res.status(404).json({ error: 'Record not found' });
            return;
        }
        res.json({ message: 'Record deleted' });
    } catch (error) {
        console.error('Error deleting chemical record:', error);
        res.status(500).json({ error: 'Failed to delete chemical record' });
    }
});

export default router;
