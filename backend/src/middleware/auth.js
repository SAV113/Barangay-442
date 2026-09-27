const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'masid-default-secret';

/**
 * Middleware: Verify JWT token from Authorization header.
 * Attaches decoded user to req.user on success.
 */
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }
}

/**
 * Middleware factory: Restrict access to specific roles.
 * Usage: requireRole('admin', 'staff')
 */
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required.' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Access denied. Required role: ${roles.join(' or ')}. Your role: ${req.user.role}.`,
      });
    }
    next();
  };
}

module.exports = { authenticateToken, requireRole };
