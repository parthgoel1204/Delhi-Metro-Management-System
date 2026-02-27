import { Router, Request, Response } from 'express';
import db from '../db';
import { AuthRequest, authenticateToken, getStationFilter } from '../middleware/auth';

const router = Router();

// Get waste records
router.get('/', authenticateToken, async (req: Request, res: Response) => {
    const authReq = req as AuthRequest;
    const { station_id, date, start_date, end_date } = req.query;
    const stationFilter = getStationFilter(authReq.user!);

    let query = `
    SELECT w.*, s.name as station_name, u.full_name as created_by_name
    FROM waste w
    JOIN stations s ON w.station_id = s.id
    JOIN users u ON w.created_by = u.id
    WHERE 1=1
  `;
    const params: any[] = [];
    let paramIndex = 1;

    if (stationFilter) {
        query += ` AND w.station_id = $${paramIndex++}`;
        params.push(stationFilter);
    } else if (station_id) {
        query += ` AND w.station_id = $${paramIndex++}`;
        params.push(station_id);
    }

    if (date) {
        query += ` AND w.date = $${paramIndex++}`;
        params.push(date);
    } else if (start_date && end_date) {
        query += ` AND w.date BETWEEN $${paramIndex++} AND $${paramIndex++}`;
        params.push(start_date, end_date);
    }

    query += ' ORDER BY w.date DESC, w.waste_type';

    try {
        const records = await db.query(query, params);
        res.json(records.rows);
    } catch (error) {
        console.error('Error fetching waste records:', error);
        res.status(500).json({ error: 'Failed to fetch waste records' });
    }
});

// Get waste summary
router.get('/summary', authenticateToken, async (req: Request, res: Response) => {
    const authReq = req as AuthRequest;
    const stationFilter = getStationFilter(authReq.user!);
    const { date } = req.query;
    const targetDate = date || new Date().toISOString().split('T')[0];

    let query = `
    SELECT COALESCE(SUM(quantity_kg), 0) as total_waste_kg,
           COALESCE(SUM(CASE WHEN waste_type = 'wet' THEN quantity_kg ELSE 0 END), 0) as wet_kg,
           COALESCE(SUM(CASE WHEN waste_type = 'dry' THEN quantity_kg ELSE 0 END), 0) as dry_kg,
           COALESCE(SUM(CASE WHEN waste_type = 'hazardous' THEN quantity_kg ELSE 0 END), 0) as hazardous_kg
    FROM waste
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
        console.error('Error fetching waste summary:', error);
        res.status(500).json({ error: 'Failed to fetch waste summary' });
    }
});

// Create waste record
router.post('/', authenticateToken, async (req: Request, res: Response) => {
    const authReq = req as AuthRequest;
    const { station_id, date, waste_type, quantity_kg, treatment_method } = req.body;
    const user = authReq.user!;

    const targetStation = user.role === 'staff' ? user.station_id : station_id;

    if (!targetStation || !date || !waste_type || quantity_kg === undefined || !treatment_method) {
        res.status(400).json({ error: 'station_id, date, waste_type, quantity_kg, and treatment_method are required' });
        return;
    }

    try {
        const insertResult = await db.query(
            'INSERT INTO waste (station_id, date, waste_type, quantity_kg, treatment_method, created_by) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
            [targetStation, date, waste_type, quantity_kg, treatment_method, user.id]
        );

        const record = await db.query(`
            SELECT w.*, s.name as station_name, u.full_name as created_by_name
            FROM waste w
            JOIN stations s ON w.station_id = s.id
            JOIN users u ON w.created_by = u.id
            WHERE w.id = $1
        `, [insertResult.rows[0].id]);

        res.status(201).json(record.rows[0]);
    } catch (error) {
        console.error('Error creating waste record:', error);
        res.status(500).json({ error: 'Failed to create waste record' });
    }
});

// Delete waste record
router.delete('/:id', authenticateToken, async (req: Request, res: Response) => {
    try {
        const result = await db.query('DELETE FROM waste WHERE id = $1', [req.params.id]);
        if (result.rowCount === 0) {
            res.status(404).json({ error: 'Record not found' });
            return;
        }
        res.json({ message: 'Record deleted' });
    } catch (error) {
        console.error('Error deleting waste record:', error);
        res.status(500).json({ error: 'Failed to delete waste record' });
    }
});

export default router;
