import { Request, Response, NextFunction } from 'express';

let adminCode: string;

export function setAdminCode(code: string) {
  adminCode = code;
}

export function getAdminCode(): string {
  return adminCode;
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const providedCode = req.headers['x-admin-code'];

  if (!providedCode || providedCode !== adminCode) {
    return res.status(403).json({ error: 'Invalid admin code' });
  }

  next();
}
