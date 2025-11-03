const isAdmin = (req, res, next) => {
  const adminEmailsEnv = process.env.ADMIN_EMAILS || '';
  const adminEmails = adminEmailsEnv.split(',').map(e => e.trim().toLowerCase());

  const userEmail = req.user ? req.user.email.toLowerCase() : null;

  if (!userEmail || !adminEmails.includes(userEmail)) {
    return res.status(403).json({ error: 'Access denied. Admin only.' });
  }

  next();
};

module.exports = { isAdmin };
