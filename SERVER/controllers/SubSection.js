const SubSection = require("../models/SubSection");
const Section = require("../models/Section");
const { uploadImageCloudinary } = require("../utils/imageUploader");
const { findByIdAndUpdate } = require("../models/user");
require("dotenv").config();
exports.createSubsection = async (req, res) => {
  try {
    // fetch data
    const { title, timeDuration, description, sectionId } = req.body;
    // extract file/video
    const { video } = req.files.videoFile;
    // validation
    if (!title || !timeDuration || !description || !video || !sectionId) {
      return res.status(400).json({
        success: false,
        message: "Missing some details in sebsection",
      });
    }
    // upload video to cloudinary
    const uploadDetails = await uploadImageCloudinary(
      video,
      process.env.FOLDER_NAME
    );
    // create a subsection in db
    const subSectionDetails = await SubSection.create({
      title: title,
      timeDuration: timeDuration,
      description: description,
      videoUrl: uploadDetails.secure_url,
    });
    // update section with subsection
    const updatedSection = await Section.findByIdAndUpdate(
      { _id: sectionId },
      {
        $push: {
          subSection: subSectionDetails._id,
        },
      },
      { new: true }
    );
    // Todo: log updated section here, after adding populate query
    // return response
    return res.status(200).json({
      success: true,
      message: "subsection created succesfully",
      updatedSection,
    });
  } catch (err) {
    return res.status(500).josn({
      success: false,
      message: "internal server error",
      error: error.message,
    });
  }
};

// hw : update subsection
exports.updateSubsection = async (req, res) => {
  try {
    // fetch subsection id
    // fetch updatation values
    // fetch video
    const { sectionId, subSectionId, title, timeDuration, description } =
      req.body;
    const { updatedVideo } = req.files.videoFile;
    // validatee if subsection id is right
    if (!subSectionId) {
      return res.status(404).json({
        success: false,
        message: "subsection not found",
      });
    }
    // validate values
    if (!title || !timeDuration || !description || !video || !sectionId) {
      return res.status(400).json({
        success: false,
        message: "Missing some details in sebsection",
      });
    }

    // upload video to cloudinary
    const updatedUploadDetails = await uploadImageCloudinary(
      updatedVideo,
      process.env.FOLDER_NAME
    );
    // find by id and update
    const updateSubsection = await findByIdAndUpdate(
      { _id: subSectionId },
      {
        $push: {
          title: title,
          timeDuration: timeDuration,
          description: description,
          video: updatedUploadDetails.secure_url,
        },
      },
      { new: true }
    );
    const updatedSection = await Section.findById(sectionId).populate(
      "subSection"
    );

    console.log("updated section", updatedSection);
    // send a response
    return res.json({
      success: true,
      message: "Section updated successfully",
      data: updatedSection,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while updating the subsection",
    });
  }
};

// hw : delete subsection
exports.deleteSubsection = async (req, res) => {
  try {
    const { subSectionId, sectionId } = req.body;
    await Section.findByIdAndUpdate(
      { _id: sectionId },
      {
        $pull: {
          subSection: subSectionId,
        },
      }
    );
    const subSection = await SubSection.findByIdAndDelete({
      _id: subSectionId,
    });

    if (!subSection) {
      return res.status(404).json({
        success: false, 
        message: "SubSection not found" 
      });
    }

    // find updated section and return it
    const updatedSection = await Section.findById(sectionId).populate("subSection");

    return res.json({
      success: true,
      message: "SubSection deleted successfully",
      data: updatedSection,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while deleting the subsection",
    });
  }
};
