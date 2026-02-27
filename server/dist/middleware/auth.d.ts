import { Request, Response, NextFunction } from 'express';
declare const JWT_SECRET: string;
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
export declare function authenticateToken(req: Request, res: Response, next: NextFunction): void;
export declare function requireRole(...roles: string[]): (req: Request, res: Response, next: NextFunction) => void;
export declare function getStationFilter(user: AuthUser): number | null;
export { JWT_SECRET };
//# sourceMappingURL=auth.d.ts.map