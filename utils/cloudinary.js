const cloudinary = require("cloudinary").v2;
const fs = require("fs");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET, // Click 'View API Keys' above to copy your API secret
});

const uploadOnCloudinary = async (localFilePath)=>{
    try {
        if(!localFilePath) return null; // Check if the file path is provided
        const result = await cloudinary.uploader.upload(localFilePath,{ // Upload the file to Cloudinary
            resource_type: "auto",
        })
        fs.unlinkSync(localFilePath); // Remove the file from local storage after upload
        return result;

    } catch (error) {
        fs.unlinkSync(localFilePath); //Remove the file from local storage
    }
}

module.exports = uploadOnCloudinary; // Export the function for use in other files
