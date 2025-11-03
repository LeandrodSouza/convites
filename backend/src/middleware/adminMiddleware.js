const isAdmin = (req, res, next) => {
  const adminEmails = process.env.ADMIN_EMAILS.split(',').map(e => e.trim());

  if (!req.user || !adminEmails.includes(req.user.email)) {
    return res.status(403).json({ error: 'Access denied. Admin only.' });
  }

  next();
};

module.exports = { isAdmin };
