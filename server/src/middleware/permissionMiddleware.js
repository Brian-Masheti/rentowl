// Permission-based access control middleware

module.exports = function requirePermission(permission) {
  return (req, res, next) => {
        if (req.user && req.user.role === 'super_admin') {
      return next();
    }
    if (!req.user || !Array.isArray(req.user.permissions) || !req.user.permissions.includes(permission)) {
      return res.status(403).json({ error: 'Permission denied.' });
    }
    next();
  };
};
