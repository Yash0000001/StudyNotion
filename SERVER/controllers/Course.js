const Course = require("../models/Course");
const RatingAndReview = require("../models/RatingAndReview");
const Category = require("../models/Category");
const User = require("../models/user");
const {uploadImageToCloudinary} = require("../utils/imageUploader");
const courseProgress = require("../models/CourseProgress");
const tag = require("../models/tags")
// create course handler function
exports.createCourse = async (req, res) => {
  try {
    // fetch data
    const {
      courseName,
      courseDescription,
      price,
      tag: _tag,
      whatYouWillLearn,
      category,
    } = req.body;
    // get thumbnail
    const thumbnail = req.files.thumbnailImage;

    // const tag = JSON.parse(_tag)                                    //Convert the tag and instructions from stringified Array to Array
    // validation
    if (
      !courseName ||
      !courseDescription ||
      !whatYouWillLearn ||
      !price ||
      !tag.length
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }
    // check for instructor
    const userId = req.user.id;
    const instructorDetails = await User.findById(userId);
    console.log("Instructor details", instructorDetails);

    if (!instructorDetails) {
      return res.status(404).json({
        success: false,
        message: "Instructor details not found",
      });
    }

    // check given tag is valid or not
    const categoryDetails = await Category.findById(category);
    if (!categoryDetails) {
      return res.status(404).json({
        success: fasle,
        message: "category details not found",
      });
    }

    // upload image to cludinary
    const thumbnailImage = await uploadImageToCloudinary(
      thumbnail,
      process.env.FOLDER_NAME
    );


    // create an entry for new course
    const newCourse = await Course.create({
      courseName,
      courseDescription,
      instructor: instructorDetails._id,
      whatYouWillLearn: whatYouWillLearn,
      price,
      tag,
      category: categoryDetails._id,
      thumbnail: thumbnailImage.secure_url,
    });
    // add the new course to the user schema of instructor
    await User.findByIdAndUpdate(
      { _id: instructorDetails._id },
      {
        $push: {
          courses: newCourse._id,
        },
      },
      { new: true }
    );

    // update the tag to schema
    // TODO: hw
    const categoryDetails2 = await Category.findByIdAndUpdate(
      { _id: category },
      { $push: { courses: newCourse._id } },
      { new: true }
    );

    // return response
    return res.status(200).json({
      success: true,
      message: "Course created successfully",
      data: newCourse,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to create course",
      roor: error.message,
    });
  }
};

// get all courses handler function
exports.showAllCourses = async (req, res) => {
  try {
    const allCourses = await Course.find(
      {},
      {
        courseName: true,
        price: true,
        thumbnail: true,
        instructor: true,
        RatingAndReview: true,
        studentsEnrolled: true,
      }
    )
      .populate("Instructor")
      .exec();
    return res.status(200).json({
      success: true,
      message: "data of alll course fetched successfully",
      data: allCourses,
    });
  } catch {
    error;
  }
  {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to create course",
      roor: error.message,
    });
  }
};


// getCourseDetails
exports.getCourseDetails = async (req,res) =>{
    try{
        // get data
        const {courseId} = req.body;
        // find course details
        const courseDetails = await Course.find(
            {_id:courseId})
            .populate(
                {
                    path:"instructor",
                    populate:{
                        path:"additionalDetails",
                    },
                    populate:{
                        path:"courseProgress",
                    }
                }
            )
            .populate("category")
            // .populate("rating and reviews")
            .populate({
                path:"courseContent",
                populate:{
                    path:"subSection",
                },
            })
            .exec();

        if(!courseDetails){
            res.status(400).json({
                success:false,
                message:`Could not find the course with ${courseId}`,
            });
        }

        return res.status(200).json({
            success:true,
            message:"Course details fetched successfully",
            data: {courseDetails},
        });


    } catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:error.message,
        })
    }
}