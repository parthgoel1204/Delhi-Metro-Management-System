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

export default router;
