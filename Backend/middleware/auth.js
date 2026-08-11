import jwt from 'jsonwebtoken';

module.exports = function(req, res, next) {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) return res.status(401).json({ msg: "No token, authorization denied" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.userl
    next();
  } catch (err) {
    console.error(err);
    res.status(401).json({ msg: "Authentication failed" });
  }
};