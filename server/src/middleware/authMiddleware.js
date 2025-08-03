const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'changeme';

function requireAuth(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ error: 'No token.' });
  try {
    const decoded = jwt.verify(auth.split(' ')[1], JWT_SECRET);
    // DEBUG: Log the decoded JWT and Authorization header
    // console.log('AUTH HEADER:', auth);
    // console.log('DECODED JWT:', decoded);
    req.user = decoded;
    next();
  } catch (err) {
    console.log('JWT VERIFY ERROR:', err);
    res.status(401).json({ error: 'Invalid token.' });
  }
}

function requireRole(roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden: insufficient role.' });
    }
    next();
  };
}

module.exports = {
  requireAuth,
  requireRole
};
