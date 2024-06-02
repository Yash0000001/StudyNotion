const Profile = require("../models/Profile");
const user = require("../models/user");
const User = require("../models/user");
const {uploadImageToCloudinary} = require("../utils/imageUploader");

exports.updateProfile = async (req,res) =>{
    try{
        // fetch data
        const {dateOfBirth="", about="", contactNumber, gender } = req.body;
        // get user id
        const id = req.user.id;
        // validate data
        if(!contactNumber || !gender){
            return res.status(400).json({
                success:false,
                message:'some details are missing',
            });
        }
        // find profile
        const userDetails = await user.findById(id);
        const profileId = userDetails.additionalDetails;
        const profileDetails = await Profile.findById(profileId);
        // update profile
        profileDetails.dateOfBirth = dateOfBirth;
        profileDetails.about = about;
        profileDetails.contactNumber = contactNumber;
        profileDetails.gender = gender;
        await profileDetails.save();
        // send response
        return res.status(200).json({
            success:true,
            message:"profile updated successfully",
            profileDetails,
        });
    } catch(error){
        return res.status(500).json({
            success:false,
            error:error.message,
        })
    }
};

// account deletion

exports.deleteAccount = async (req,res) =>{
    try{
        // get id
        const id =req.user.id;
        // validation
        const userDetails = await User.findById(id);
        if(!userDetails){
            return res.status(404).json({
                success:false,
                message:"user not found,"
            });
        }
        // delete profile
        await Profile.findByIdAndDelete({_id:userDetails.additionalDetails});
        // todo: unenroll user from all unenrolled courses
        // delete user 
        await user.findByIdAndDelete({_id:id});
        // return response
        return res.status(200).json({
            success:true,
            message:"user account deleted successfully",
        })
    } catch(error){
        return res.status(500).json({
            success:false,
            message:"error in deleting user account",
        });
    }
};

exports.getAllUserDetails = async (req,res) => {
    try{
        const id = req.user.id;
        const userDetails = await User.findById(id).populate("additionalDetails").exec();
        return res.status(200).json({
            success:true,
            message:"user data fetched successfully",
            userDetails,
        })
    } catch(error){
        return res.status(500).json({
            success:false,
            message:error.message,
        });
    }
}

exports.updateDisplayPicture = async (req, res) => {
    try {
      const displayPicture = req.files.displayPicture
      const userId = req.user.id
      const image = await uploadImageToCloudinary(
        displayPicture,
        process.env.FOLDER_NAME,
        1000,
        1000
      )
      console.log(image)
      const updatedProfile = await User.findByIdAndUpdate(
        { _id: userId },
        { image: image.secure_url },
        { new: true }
      )
      res.send({
        success: true,
        message: `Image Updated successfully`,
        data: updatedProfile,
      })
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      })
    }
  }