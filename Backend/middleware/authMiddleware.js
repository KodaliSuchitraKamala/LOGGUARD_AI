import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req,res,next) => {
  let token = req.headers.authorization?.split(" ")[1];
  if(!token) return res.status(401).json({message: "No token"});
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");
    if(!user) return res.status(401).json({message: "User not found"});
    req.user = user;
    next();
  } catch(e) {
    return res.status(401).json({message: "Invalid token"});
  }
}

export const admin = (req,res,next) => {
  if(req.user && req.user.role === 'admin') next();
  else return res.status(403).json({message: "Admin only"});
}

export const authorize = (...roles) => {
  return (req,res,next) => {
    if(!roles.includes(req.user.role)) {
      return res.status(403).json({message: `Access denied: ${req.user.role}`});
    }
    next();
  }
}