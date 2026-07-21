function requireLoginApi(req, res, next) {
  if (req.session && req.session.userId) {
    return next();
  }
  return res.status(401).json({ error: 'Anda harus login dulu.' });
}

module.exports = { requireLoginApi };
