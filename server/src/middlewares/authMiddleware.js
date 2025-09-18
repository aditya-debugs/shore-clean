// server/src/middlewares/authMiddleware.js
const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer '))
    return res.status(401).json({ message: 'Not authorized' });

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    req.user = { id: decoded.userId, role: decoded.role };
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token invalid or expired' });
  }
};

// Example role guard
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: 'Not authorized' });
    if (!allowedRoles.includes(req.user.role)) return res.status(403).json({ message: 'Forbidden' });
    next();
  };
};

module.exports = { protect, authorize };
