const userModel = require("../models/userModel");
const uploadOnCloudinary = require("../utils/cloudinary");

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
module.exports = registerUser;