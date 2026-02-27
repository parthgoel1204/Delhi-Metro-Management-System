import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dmrc-housekeeping-secret-key-2024';

export interface AuthUser {
    id: number;
    username: string;
    role: 'admin' | 'staff';
    station_id: number | null;
    full_name: string;
}

export interface AuthRequest extends Request {
    user?: AuthUser;
}

export function authenticateToken(req: Request, res: Response, next: NextFunction): void {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        res.status(401).json({ error: 'Authentication required' });
        return;
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as AuthUser;
        (req as AuthRequest).user = decoded;
        next();
    } catch {
        res.status(403).json({ error: 'Invalid or expired token' });
    }
}

export function requireRole(...roles: string[]) {
    return (req: Request, res: Response, next: NextFunction): void => {
        const authReq = req as AuthRequest;
        if (!authReq.user) {
            res.status(401).json({ error: 'Authentication required' });
            return;
        }
        if (!roles.includes(authReq.user.role)) {
            res.status(403).json({ error: 'Insufficient permissions' });
            return;
        }
        next();
    };
}

export function getStationFilter(user: AuthUser): number | null {
    if (user.role === 'staff') {
        return user.station_id;
    }
    return null;
}

export { JWT_SECRET };
