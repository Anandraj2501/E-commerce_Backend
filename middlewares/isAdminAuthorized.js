const admin = require("../models/adminModel");
const { Jwt_Secret } = require("../utils/keys");
const jwt = require("jsonwebtoken");

const isAdminAuthorized = async (req, res, next) => {
    console.log(req.cookies);
    try {
        const token = req.cookies.adminToken;
        
        if (!token) {
            return res.status(401).json({ error: "Unauthorized, Token Not Found" });
        }
        const decoded = jwt.verify(token, Jwt_Secret)
        const adminUser = await admin.findById(decoded.adminId);
        if (!adminUser) {
            return res.status(401).json({ error: "Unauthorized,admin not found" });
        }
        req.adminUser = adminUser;
        next();
    } catch (error) {
        return res.status(401).json({ error: "Unauthorized, invalid token" });
    }

}
module.exports = isAdminAuthorized;