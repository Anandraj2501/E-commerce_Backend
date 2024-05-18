const express = require("express");
const cors = require("cors");
const app = express();
const PORT = process.env.PORT || 5000;
const {mongoURL} = require("./utils/keys");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
mongoose.connect(mongoURL);
mongoose.connection.on("connected",()=>{
    console.log("Database connected");
})

mongoose.connection.on("error",()=>{
    console.log("Database not connected");
})
require("dotenv").config();
app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(require("./routes/auth"));
app.use(require("./routes/adminAuth"));
app.use(require("./routes/addProducts"));
app.use(require("./routes/getProducts"));
app.use(require("./routes/cart"));

app.get("/",(req,res)=>{
    res.send("Server is Running");
})


app.listen(PORT,(req,res)=>{
    console.log("Server is Running on Port Number: ",PORT);
})
