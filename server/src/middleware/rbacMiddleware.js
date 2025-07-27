// Role-based access control middleware
module.exports.requireRole = (roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ error: 'Forbidden: insufficient role' });
  }
  next();
};

module.exports.requirePermission = (permission) => (req, res, next) => {
  if (!req.user || !req.user.permissions || !req.user.permissions.includes(permission)) {
    return res.status(403).json({ error: 'Forbidden: insufficient permission' });
  }
  next();
};
