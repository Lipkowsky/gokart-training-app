import jwt from 'jsonwebtoken';

export function ensureAuth(req, res, next) {
  
  const token = req.cookies['access_token'];
  if (!token) return res.status(401).json({ error: 'No access token' });
  try {
    const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
  
    req.user = payload;
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Invalid access token' });
  }
}
