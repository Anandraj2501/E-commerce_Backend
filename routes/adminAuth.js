const express = require("express");
const router = express.Router();
const admin = require("../models/adminModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { Jwt_Secret } = require("../utils/keys");
const isAdminAuthorized = require("../middlewares/isAdminAuthorized");
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


router.post("/adminsignup",async(req,res)=>{
    const {name,email,password} = req.body;

    if(!name || !email || !password){
        return res.status(422).json({error:"Please Provide all details"});
    }
    try{
        if(!emailPattern.test(email)){
            return res.status(400).json({error:"Email Format is Incorrect"})
        }

        const existingAdmin = await admin.findOne({email});
        if(existingAdmin){
            return res.status(422).json({error:"Admin already exists"});
        }
        const newAdmin = new admin({
            name,
            email,
            password: await bcrypt.hash(password,12)
        })
        const savedAdmin = await newAdmin.save();
        res.status(200).json({message:"Admin Created Successfully"});

    }catch(error){
        res.status(500).json({error:"Internal server Error"});
    }
})

router.post("/adminsignin",async (req,res)=>{
    const {email,password} = req.body;
    if(!email||!password){
        return res.status(422).json({error:"Please Provide all details"});
    }

    try{
        const adminUser = await admin.findOne({email}); 
        if(!adminUser){
            return res.status(422).json({error:"Invalid Email"});
        }
        const matchedAdmin = await bcrypt.compare(password,adminUser.password);

        if(!matchedAdmin){
            return res.status(422).json({error:"Invalid password"});
        }
        const token = jwt.sign({adminId:adminUser._id},Jwt_Secret,{expiresIn:"7d"});
        res.cookie("adminToken",token,{ httpOnly: true, expiresIn: 604800000 });
        res.status(200).json({message:"Sign In Successfully",user: { _id: adminUser._id,profilepic:adminUser.profilepic, name: adminUser.name } });

    }catch(error){
        console.error(error);
        res.status(500).json({error:"Internal Server Error"});
    }
})

router.get("/admin/:id",async(req,res)=>{
    try{
        const adminId = req.params.id;
        if(adminId!=req.adminUser._id){
            return res.status(404).json({error:"Access Denied"})
        }
        const Admin = await admin.findById(adminId);
        if(!admin){
            return res.status(404).json({error:"Admin Not Found"});
        }
        res.status(200).json({message:"Admin Found",user: { _id: Admin._id,profilepic:Admin.profilepic, name: Admin.name }});
    }catch(error){
        console.error(error);
        res.status(500).json({error:"Internal server error"});
    }
})

module.exports=router;