export function ensureAdmin(req, res, next) {
    console.log(req.user)
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden: Admins only' });
  }

  next();
}
