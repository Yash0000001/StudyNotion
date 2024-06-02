const Section = require("../models/Section");
const Course = require("../models/Course");

exports.createSection = async (req,res) =>{
    try{
        // data fetch
        const {sectionName, courseId} = req.body;
        // data validation
        if(!sectionName || !courseId){
            return res.status(400).json({
                success:false,
                message:"Missing properties",
            })
        }
        // create section
        const newSection = await Section.create({sectionName});
        // update course with section objectid
        const updatedCourseDetails = await Course.findByIdAndUpdate(
            courseId,
            {
                $push:{
                    courseContent:newSection._id,
                }
            },
            {new:true},
        )
        // hw : use populate to replace section, subsectoin both in the updatedCOurseDetails
        // return response
        return res.status(200).json({
            success:true,
            message:"section created successfully",
            updatedCourseDetails,
        })
    } catch(error){
        return res.status(500).json({
            success:false,
            message:"unable to create section , please try again",
            error:error.message,
        });
    }
}

exports.updateSection = async (req,res) =>{
    try{
        // data input
        const {sectionName, sectionId} = req.body;
        // data validation
        if(!sectionName || !sectionId){
            return res.status(400).json({
                success:false,
                message:"Missing properties",
            })
        }
        // update data
        const section = await Section.findByIdAndUpdate(sectionId, {sectionName}, {new:true});
        // return response
        return res.status(200).json({
            success:true,
            message:"section updated successfully",
            section,
        })
    } catch(error){
        return res.status(500).json({
            success:false,
            message:"unable to update section , please try again",
            error:error.message,
        });
    }
}

exports.deleteSection = async (req,res) =>{
    try{
        // get id - assuming that we are sending id to the params
        const {sectionId} = req.params;
        // find by id and delete
        await Section.findByIdAndDelete(sectionId);
        // return response
        return res.status(200).json({
            success:true,
            message:"section deleted successfully",
        })
    } catch(error){
        return res.status(500).json({
            success:false,
            message:"unable to delete section , please try again",
            error:error.message,
        });
    }
}