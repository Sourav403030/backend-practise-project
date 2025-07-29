require("dotenv").config();
const connectDB = require("./db/db");
const express = require("express");
const app = express();
const cors = require("cors");
const cookieParser = require("cookie-parser");


connectDB(); //DB connection

//CORS configuration
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
}))

app.use(express.json({limit: "16kb",}));  //Accepts JSON requests with a limit of 16kb
app.use(express.urlencoded({extended: true, limit: "16kb"})); //Accepts URL-encoded requests with a limit of 16kb
app.use(express.static("public")); //Serves static files from the "public" directory
app.use(cookieParser()); //Parses cookies from incoming requests

//routes import
const userRouter = require("./routes/userRoutes");



//routes declaration
app.use("/api/v1/users", userRouter);

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