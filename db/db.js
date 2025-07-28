const mongoose = require("mongoose");
const DB_NAME = require("../constants");

// Function to connect to the MongoDB database
const connectDB = async ()=>{
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}`).then(()=>{
            console.log("Connected to the database successfully");
        });
    } catch (error) {
        console.log("Error connecting to the database:", error);
        process.exit(1);
    }
}

module.exports = connectDB;