import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import db from '../db';
import { AuthRequest, authenticateToken, requireRole } from '../middleware/auth';

const router = Router();

// Get all users (admin only)
router.get('/', authenticateToken, requireRole('admin'), async (req: Request, res: Response) => {
    try {
        const result = await db.query(`
            SELECT u.id, u.username, u.full_name, u.role, u.station_id, u.created_at,
                   s.name as station_name
            FROM users u
            LEFT JOIN stations s ON u.station_id = s.id
            ORDER BY u.role, u.full_name
        `);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

// Create user (admin only)
router.post('/', authenticateToken, requireRole('admin'), async (req: Request, res: Response) => {
    const { username, password, full_name, role, station_id } = req.body;

    if (!username || !password || !full_name || !role) {
        res.status(400).json({ error: 'Username, password, full_name, and role are required' });
        return;
    }

    if (role === 'staff' && !station_id) {
        res.status(400).json({ error: 'Staff users must be assigned to a station' });
        return;
    }

    try {
        const password_hash = bcrypt.hashSync(password, 10);
        const insertResult = await db.query(
            'INSERT INTO users (username, password_hash, full_name, role, station_id) VALUES ($1, $2, $3, $4, $5) RETURNING id',
            [username, password_hash, full_name, role, station_id || null]
        );

        const result = await db.query(`
            SELECT u.id, u.username, u.full_name, u.role, u.station_id, u.created_at,
                   s.name as station_name
            FROM users u
            LEFT JOIN stations s ON u.station_id = s.id
            WHERE u.id = $1
        `, [insertResult.rows[0].id]);

        res.status(201).json(result.rows[0]);
    } catch (error: any) {
        if (error.code === '23505') {
            res.status(409).json({ error: 'Username already exists' });
        } else {
            console.error('Error creating user:', error);
            res.status(500).json({ error: 'Failed to create user' });
        }
    }
});

// Update user (admin only)
router.put('/:id', authenticateToken, requireRole('admin'), async (req: Request, res: Response) => {
    const { username, password, full_name, role, station_id } = req.body;

    try {
        if (password) {
            const password_hash = bcrypt.hashSync(password, 10);
            await db.query(
                'UPDATE users SET username = COALESCE($1, username), password_hash = $2, full_name = COALESCE($3, full_name), role = COALESCE($4, role), station_id = $5 WHERE id = $6',
                [username, password_hash, full_name, role, station_id ?? null, req.params.id]
            );
        } else {
            await db.query(
                'UPDATE users SET username = COALESCE($1, username), full_name = COALESCE($2, full_name), role = COALESCE($3, role), station_id = $4 WHERE id = $5',
                [username, full_name, role, station_id ?? null, req.params.id]
            );
        }

        const result = await db.query(`
            SELECT u.id, u.username, u.full_name, u.role, u.station_id, u.created_at,
                   s.name as station_name
            FROM users u
            LEFT JOIN stations s ON u.station_id = s.id
            WHERE u.id = $1
        `, [req.params.id]);

        if (result.rows.length === 0) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        res.json(result.rows[0]);
    } catch (error: any) {
        if (error.code === '23505') {
            res.status(409).json({ error: 'Username already exists' });
        } else {
            console.error('Error updating user:', error);
            res.status(500).json({ error: 'Failed to update user' });
        }
    }
});

// Delete user (admin only)
router.delete('/:id', authenticateToken, requireRole('admin'), async (req: Request, res: Response) => {
    const authReq = req as AuthRequest;
    if (Number(req.params.id) === authReq.user!.id) {
        res.status(400).json({ error: 'Cannot delete your own account' });
        return;
    }

    try {
        const result = await db.query('DELETE FROM users WHERE id = $1', [req.params.id]);
        if (result.rowCount === 0) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        res.json({ message: 'User deleted' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ error: 'Failed to delete user' });
    }
});

export default router;
