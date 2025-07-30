const jwt = require("jsonwebtoken");
const userModel = require("../models/userModel");


const verifyJWT = async (req, res, next) => {
    try {
        //Check if the token is present in cookies or headers
        console.log(req.cookies);
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
    
        if(!token){
            return res.status(401).json({
                success: false,
                message: "Unauthorized request"
            });
        }
        
        //Verify the token
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        
        //Check if the user exists in the database
        const user = await userModel.findById(decodedToken?._id).select("-password -refreshToken");
    
        if(!user){
            return res.status(404).json({
                success: false,
                message: "Invalid Access Token"
            });
        }
    
        //Attach the user to the request object for further use
        req.user = user;
        next();

    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized request",
            error: error.message
        });
        
    }

}

module.exports = verifyJWT; // Export the middleware for use in other files