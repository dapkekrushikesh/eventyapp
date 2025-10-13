// Role-based middleware for Express
module.exports = function(requiredRole) {
  return function(req, res, next) {
    if (!req.user || req.user.role !== requiredRole) {
      return res.status(403).json({ msg: 'Access denied: insufficient permissions' });
    }
    next();
  };
};
