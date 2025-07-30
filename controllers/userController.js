const userModel = require("../models/userModel");
const uploadOnCloudinary = require("../utils/cloudinary");
const jwt = require("jsonwebtoken");

const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await userModel.findById(userId); // Fetch the user from the database
        const accessToken = await user.generateAccessToken(); // Generate access token using the user method
        const refreshToken = await user.generateRefreshToken(); // Generate refresh token using the user method

        user.refreshToken = refreshToken; // Set the refresh token in the user document
        await user.save({validateBeforeSave: false}); // Save the user document with the new refresh token

        return {accessToken, refreshToken};


    } catch (error) {
        throw new Error("Coult not generate tokens: " + error.message);
    }
}


const registerUser = async (req, res)=>{
    try {
        //Get the following fields from the request body
        const {fullname, email, username, password} = req.body;

        //Check if any of the fields are empty
        if(fullname | email | username | password === ""){
            return res.status(400).json({
                success: false,
                message: "All fields are reuqired"
            })
        }

        //Check if the user already exists
        const existingUser = await userModel.findOne({$or: [{email}, {username}]});
        if(existingUser){
            return res.status(400).json({
                success: false,
                message: "User already exists"
            })
        }
        
        //check if the avatar and cover image are provided
        const avatarLocalPath = req.files?.avatar[0]?.path;
        // const coverImageLocalPath = req.files?.coverImage[0]?.path;

        let coverImageLocalPath;
        if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
            coverImageLocalPath = req.files.coverImage[0].path;
        }

        if(!avatarLocalPath){
            return res.status(400).json({
                success: false,
                message: "Avatar is required"
            })
        }

        //Upload the avatar and cover image to Cloudinary
        const avatar = await uploadOnCloudinary(avatarLocalPath);
        const coverImage = await uploadOnCloudinary(coverImageLocalPath);

        if(!avatar){
            return res.status(500).json({
                success: false,
                message: "Failed to upload avatar"
            })
        }

        //Create a new user in the database
        const newUser = await userModel.create({
            fullname, 
            email,
            password,
            username: username.toLowerCase(),
            avatar: avatar.url,
            coverImage: coverImage?.url || "",
        })

        //Remove the password and refresh token from the response
        const createdUser = await userModel.findById(newUser._id).select("-password -refreshToken");

        if(!createdUser){
            return res.status(500).json({
                success: false,
                message: "Failed to create user"
            }) 
        }

        return res.status(201).json({
            success: true,
            message: "User registered successfully",
            user: createdUser
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Could not register user",
            error: error.message
        })
    }
}

const loginUser = async (req, res)=>{
    try {
        const {email, username, password} = req.body; // Get the email, username, and password from the request body

        //Check if the email or username is provided
        if(!(username || email)){
            return res.status(400).json({
                success: false,
                message: "Username or email are required"
            });
        }

        const user = await userModel.findOne({$or: [{email}, {username}]}); // Find the user by email or username

        if(!user){
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const isPasswordValid = await user.isPasswordCorrect(password); // Check if the provided password is correct

        if(!isPasswordValid){
            return res.status(400).json({
                success: false,
                message: "Invalid password"
            });
        }

        //Generate access and refresh tokens
        const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(user._id); 

        if(!accessToken || !refreshToken){
            return res.status(500).json({
                success: false,
                message: "No tokens found",
            });
        }
        

        //Fetch the user without password and refresh token
        const loggedInUser = await userModel.findById(user._id).select("-password -refreshToken");

        //Define options for the cookies
        const options = {
            httpOnly: true,
            secure: true,
        }

        //Set the cookies and return the response
        return res.status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json({
            success: true,
            message: "User logged in successfully",
            user: loggedInUser, accessToken, refreshToken
            
        })
         
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Could not login user",
            error: error.message
        });
    }
}

const logoutUser = async(req, res) => {
    try {
        //Clear the refresh token from the user document
        await userModel.findByIdAndUpdate(req.user._id, {$set: {refreshToken: undefined}}, {new: true});
        
        //Define options for the cookies
        const options = {
            httpOnly: true,
            secure: true,
        }

        //Clear the cookies and return the response
        return res.status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json({
            success: true,
            message: "User logged out successfully"
        });

    } catch (error) {
        
    }
}

const refreshAccessToken = async(req, res) => {
    try {
        //Check if the refresh token is present in cookies or request body
        const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

        if(!incomingRefreshToken){
            return res.status(401).json({
                success: false,
                message: "Refresh token is required"
            });
        }

        //Verify the refresh token
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);

        //Check if the user exists in the database
        const user = await userModel.findById(decodedToken?._id);

        if(!user){
            return res.status(404).json({
                success: false,
                message: "Invalid refresh token"
            });
        }

        //Check if the refresh token matches the one in the database
        if(incomingRefreshToken !== user?.refreshToken){
            return res.status(401).json({
                success: false,
                message: "Refresh token does not match"
            });
        }

        const options = {
            httpOnly: true,
            secure: true,
        }

        //Generate new access and refresh tokens
        const {accessToken, newRefreshToken} = await generateAccessAndRefreshTokens(user._id);

        //Store the tokens in the cookies
        return res.status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .json({
            success: true,
            message: "Access token refreshed successfully",
            accessToken,
            newRefreshToken
        })


    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Could not refresh access token",
            error: error.message
        })
    }
}

module.exports = {registerUser, loginUser, logoutUser, refreshAccessToken};