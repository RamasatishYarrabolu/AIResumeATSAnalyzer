import jwt from 'jsonwebtoken';

export default function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.startsWith('Bearer ')
    ? req.headers.authorization.slice(7)
    : null;
  if (!token) return res.status(401).json({ error: 'Authentication required' });
  try {
    req.userId = jwt.verify(token, process.env.JWT_SECRET).id;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}
