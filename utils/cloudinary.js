const cloudinary = require('cloudinary').v2;
const fs = require("fs");

          
cloudinary.config({ 
  cloud_name: process.env.CLOUD_NAME, 
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET
});

const uploadOnCloudinary = async (localFilePath) => {
    console.log(localFilePath);
    try {
        if (!localFilePath) return null
        //upload the file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })
        // file has been uploaded successfull
        console.log("file is uploaded on cloudinary ", response.url);
        fs.unlinkSync(localFilePath)
        return response.url;

    } catch (error) {
        fs.unlinkSync(localFilePath) // remove the locally saved temporary file as the upload operation got failed
        return null;
    }
}

const  deleteFromCloudinary = async(imageUrl)=> {
    try {
      // Extract public ID from the image URL
      const publicId = imageUrl.split('/').pop().split('.')[0];
      // Delete the image from Cloudinary using the public ID
      const result = await cloudinary.uploader.destroy(publicId);
      // Check if the deletion was successful
      if (result.result === 'ok') {
        console.log("Image deleted");
        return true; // Deletion successful
      } else {
        console.log("Image not deleted");
        return false; // Deletion failed
      }
    } catch (error) {
      console.error("Error deleting image from Cloudinary:", error);
      return false; // Deletion failed
    }
  }

module.exports =  {uploadOnCloudinary,deleteFromCloudinary}