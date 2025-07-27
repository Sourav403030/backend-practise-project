require("dotenv").config();
const connectDB = require("./src/db/db");
const express = require("express");
const app = express();
connectDB();


app.listen(process.env.PORT, ()=>{
    console.log(`Server is running on port ${process.env.PORT}`);
})

// import express from "express";

// const app = express();

// ;(async()=>{
//    try {
//      await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
//     app.on("error", ()=>{
//         console.log("Error communicating with MongoDB");
//     });

//     app.listen(process.env.PORT, ()=>{
//         console.log(`Server is running on port ${process.env.PORT}`);
//     })

//    } catch (error) {
//     console.log("Error connecting to MongoDB:", error);
//    }
// })()