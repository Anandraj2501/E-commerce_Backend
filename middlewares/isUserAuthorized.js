const user = require("../models/userModel");
const { Jwt_Secret } = require("../utils/keys");
const jwt = require("jsonwebtoken");

const isUserAuthorized = async (req, res, next) => {
    console.log(req.cookies);
    try {
        const token = req.cookies.token;
        
        if (!token) {
            return res.status(401).json({ error: "Unauthorized, Token Not Found" });
        }
        const decoded = jwt.verify(token, Jwt_Secret)
        const User = await user.findById(decoded.userId);
        if (!User) {
            return res.status(401).json({ error: "Unauthorized,User not found" });
        }
        req.user = User;
        next();
    } catch (error) {
        console.error(error);
        return res.status(401).json({ error: "Unauthorized, invalid token" });
    }

}
module.exports = isUserAuthorized;