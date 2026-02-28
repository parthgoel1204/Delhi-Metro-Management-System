import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../db';
import { JWT_SECRET } from '../middleware/auth';

const router = Router();

router.post('/login', async (req: Request, res: Response) => {
    const { username, password } = req.body;

    if (!username || !password) {
        res.status(400).json({ error: 'Username and password are required' });
        return;
    }

    try {
        const result = await db.query(
            'SELECT id, username, password_hash, full_name, role, station_id FROM users WHERE username = $1',
            [username]
        );
        const user = result.rows[0];

        if (!user) {
            res.status(401).json({ error: 'Invalid credentials' });
            return;
        }

        const validPassword = bcrypt.compareSync(password, user.password_hash);
        if (!validPassword) {
            res.status(401).json({ error: 'Invalid credentials' });
            return;
        }

        const tokenPayload = {
            id: user.id,
            username: user.username,
            role: user.role,
            station_id: user.station_id,
            full_name: user.full_name,
        };

        const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '24h' });

        let station_name = null;
        if (user.station_id) {
            const stationResult = await db.query('SELECT name FROM stations WHERE id = $1', [user.station_id]);
            station_name = stationResult.rows[0]?.name;
        }

        res.json({
            token,
            user: {
                id: user.id,
                username: user.username,
                full_name: user.full_name,
                role: user.role,
                station_id: user.station_id,
                station_name,
            },
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Public registration endpoint — always creates 'staff' role
// Admin accounts can only be created via database seeding or direct DB access
router.post('/register', async (req: Request, res: Response) => {
    const { username, password, full_name, station_id } = req.body;

    if (!username || !password || !full_name || !station_id) {
        res.status(400).json({ error: 'Username, password, full name, and station are required' });
        return;
    }

    if (password.length < 6) {
        res.status(400).json({ error: 'Password must be at least 6 characters' });
        return;
    }

    try {
        // Check for duplicate username
        const existing = await db.query('SELECT id FROM users WHERE username = $1', [username]);
        if (existing.rows.length > 0) {
            res.status(409).json({ error: 'Username already taken. Please choose another.' });
            return;
        }

        const password_hash = bcrypt.hashSync(password, 10);
        const result = await db.query(
            `INSERT INTO users (username, password_hash, full_name, role, station_id)
             VALUES ($1, $2, $3, 'staff', $4) RETURNING id, username, full_name, role, station_id`,
            [username, password_hash, full_name, station_id]
        );
        const newUser = result.rows[0];

        const stationResult = await db.query('SELECT name FROM stations WHERE id = $1', [station_id]);
        const station_name = stationResult.rows[0]?.name || null;

        const token = jwt.sign(
            { id: newUser.id, username: newUser.username, role: 'staff', station_id: newUser.station_id, full_name: newUser.full_name },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(201).json({
            token,
            user: { ...newUser, station_name },
        });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ error: 'Registration failed. Please try again.' });
    }
});

export default router;
