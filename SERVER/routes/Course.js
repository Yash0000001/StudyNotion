const express = require("express");
const router = express.Router();


// ********************************************************************************************************
//                                      Import controllers
// ********************************************************************************************************

const {createCourse, showAllCourses, getCourseDetails} = require("../controllers/Course");
const {createCategory, showAllCategory, categoryPageDetails} = require("../controllers/Category");
const {createSection, updateSection, deleteSection} = require("../controllers/Section");
const {createSubsection, updateSubsection, deleteSubsection} = require("../controllers/SubSection");
const {createRating, getAverageRating, getAllRating} = require("../controllers/RatingAndReview");
// const {updateCourseProgress} = require("../controllers/CourseProgress");

// ********************************************************************************************************
//                                      Import middlewares
// ********************************************************************************************************

const {auth, isInstructor, isAdmin, isStudent} = require("../middlewares/auth");

// ********************************************************************************************************
//                                      Course Routes
// ********************************************************************************************************

// Courses can Only be Created by Instructors
router.post("/createCourse", [auth, isInstructor], createCourse)
//Add a Section to a Course
router.post("/addSection", [auth, isInstructor], createSection)
// Update a Section
router.post("/updateSection", [auth, isInstructor], updateSection)
// Delete a Section
router.post("/deleteSection", [auth, isInstructor], deleteSection)
// Edit Sub Section
router.post("/updateSubSection", [auth, isInstructor], updateSubsection)
// Delete Sub Section
router.post("/deleteSubSection", [auth, isInstructor], deleteSubsection)
// Add a Sub Section to a Section
router.post("/addSubSection", [auth, isInstructor], createSubsection)

// Get all Registered Courses
router.get("/getAllCourses", showAllCourses)

// Get Details for a Specific Courses
router.post("/getCourseDetails", getCourseDetails)

// // Get Details for a Specific Courses
// router.post("/getFullCourseDetails", auth, getFullCourseDetails)

// // Edit Course routes
// router.post("/editCourse", auth, isInstructor, editCourse)

// // Get all Courses Under a Specific Instructor
// router.get("/getInstructorCourses", auth, isInstructor, getInstructorCourses)

// // Delete a Course
// router.delete("/deleteCourse", deleteCourse)


// ********************************************************************************************************
//                                      Category routes (Only by Admin)
// ********************************************************************************************************
// Category can Only be Created by Admin
// TODO: Put IsAdmin Middleware here
router.post("/createCategory", [auth, isAdmin], createCategory)
router.get("/showAllCategories", showAllCategory)
router.post("/getCategoryPageDetails", categoryPageDetails)



// ********************************************************************************************************
//                                      Rating and Review
// ********************************************************************************************************
router.post("/createRating", [auth, isStudent], createRating)
router.get("/getAverageRating", getAverageRating)
router.get("/getReviews", getAllRating)

module.exports = router