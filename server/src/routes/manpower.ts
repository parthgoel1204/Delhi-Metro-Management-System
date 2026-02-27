import { Router, Request, Response } from 'express';
import db from '../db';
import { AuthRequest, authenticateToken, getStationFilter } from '../middleware/auth';

const router = Router();

// Get manpower records
router.get('/', authenticateToken, async (req: Request, res: Response) => {
    const authReq = req as AuthRequest;
    const { station_id, date, start_date, end_date } = req.query;
    const stationFilter = getStationFilter(authReq.user!);

    let query = `
    SELECT m.*, s.name as station_name, u.full_name as created_by_name
    FROM manpower m
    JOIN stations s ON m.station_id = s.id
    JOIN users u ON m.created_by = u.id
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

    if (date) {
        query += ` AND m.date = $${paramIndex++}`;
        params.push(date);
    } else if (start_date && end_date) {
        query += ` AND m.date BETWEEN $${paramIndex++} AND $${paramIndex++}`;
        params.push(start_date, end_date);
    }

    query += ' ORDER BY m.date DESC, m.shift';

    try {
        const records = await db.query(query, params);
        res.json(records.rows);
    } catch (error) {
        console.error('Error fetching manpower records:', error);
        res.status(500).json({ error: 'Failed to fetch manpower records' });
    }
});

// Get manpower summary (for dashboard)
router.get('/summary', authenticateToken, async (req: Request, res: Response) => {
    const authReq = req as AuthRequest;
    const stationFilter = getStationFilter(authReq.user!);
    const { date } = req.query;
    const targetDate = date || new Date().toISOString().split('T')[0];

    let query = `
    SELECT COALESCE(SUM(staff_count), 0) as total_staff,
           COUNT(DISTINCT station_id) as stations_reporting
    FROM manpower
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
        console.error('Error fetching manpower summary:', error);
        res.status(500).json({ error: 'Failed to fetch manpower summary' });
    }
});

// Create manpower record
router.post('/', authenticateToken, async (req: Request, res: Response) => {
    const authReq = req as AuthRequest;
    const { station_id, date, shift, staff_count, remarks } = req.body;
    const user = authReq.user!;

    const targetStation = user.role === 'staff' ? user.station_id : station_id;

    if (!targetStation || !date || !shift || staff_count === undefined) {
        res.status(400).json({ error: 'station_id, date, shift, and staff_count are required' });
        return;
    }

    try {
        const insertResult = await db.query(
            'INSERT INTO manpower (station_id, date, shift, staff_count, remarks, created_by) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
            [targetStation, date, shift, staff_count, remarks || null, user.id]
        );

        const record = await db.query(`
            SELECT m.*, s.name as station_name, u.full_name as created_by_name
            FROM manpower m
            JOIN stations s ON m.station_id = s.id
            JOIN users u ON m.created_by = u.id
            WHERE m.id = $1
        `, [insertResult.rows[0].id]);

        res.status(201).json(record.rows[0]);
    } catch (error) {
        console.error('Error creating manpower record:', error);
        res.status(500).json({ error: 'Failed to create manpower record' });
    }
});

// Delete manpower record
router.delete('/:id', authenticateToken, async (req: Request, res: Response) => {
    try {
        const result = await db.query('DELETE FROM manpower WHERE id = $1', [req.params.id]);
        if (result.rowCount === 0) {
            res.status(404).json({ error: 'Record not found' });
            return;
        }
        res.json({ message: 'Record deleted' });
    } catch (error) {
        console.error('Error deleting manpower record:', error);
        res.status(500).json({ error: 'Failed to delete manpower record' });
    }
});

export default router;
