import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
    let token = req.headers.authorization?.split(" ")[1];
    if(!token) return res.status(401).json({message: "No token"});
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select("-password");
        if(!user) return res.status(401).json({message: "User not found"});
        req.user = user; // has role
        next();
    } catch (e) {
        res.status(401).json({message: "Invalid token"});
    }
}