const  {instance } = require("../config/razorpay");
const Course = require("../models/Course");
const User = require("../models/user");
const mailSender = require("../utils/mailSender");
const {courseEnrollmentEmail} = require("../mail/templates/courseEnrollmentEmail");
const mongoose = require("mongoose");

// capture the payment and inititate the razorpay order
exports.capturePayments = async (req,res) =>{
    // get course id and user id
    const {course_id} = req.body;
    const userId = req.user.id;
    // validation

    // valid courseId
    if(!course_id){
        return res.json({
            success:false,
            message:"please provide valid course id",
        })
    };
    // valid course detail
    let course;
    try{
        course = await Course.findById(course_id);
        if(!course){
            return res.json({
                success:false,
                message:"could not find the course",
            });
        }
        // user already pay for the same course
        const uid = new mongoose.Types.ObjectId(userId);
        if(course.studentsEnrolled.includes(uid)){
            return res.status(200).json({
                success:false,
                message:"Student is already enrolled",
            })
        }
    } catch(error){
        console.error(error);
        return res.status(500).json({
            success:false,
            message:error.message,
        });

    }
    
    // order create
    const amount = course.price;
    const currency = "INR";

    const options = {
        amount: amount *100,
        currency,
        receipt: Math.random(Date.now()).toString(),
        notes:{
            courseId:course_id,
            userId,
        }
    };
    try{
        // initiate the paymetn using razorpay
        const paymentResponse = await instance.orders.create(options);
        console.log(paymentResponse);
        return res.status(200).json({
            success:true,
            courseName:course.courseName,
            courseDescription:course.courseDescription,
            thumbnail: course.thumbnail,
            orderId:paymentResponse.id,
            currency:paymentResponse.currency,
            amount:paymentResponse.amount,
        });

    } catch(error){
        console.log(error);
        res.json({
            success:false,
            message:"could not initiate order",
        });
    }
}

// verify signature of razorpay and server

exports.verifySignature = async(req,res) =>{
    const webhooksecret = "yashqwe58";
    const signature = req.headers("x-razorpay-signature");

    const shasum = crypto.createHmac("sha256",webhooksecret);
    shasum.update(JSON.stringify(req.body));
    const digest = shasum.digest("hex");

    if(signature === digest ){
        console.log("Payment is authorised");
        const {courseId, userId} = req.body.payload.payment.entity.notes;

        try{
            // fulfill the action
            // find the course and enroll the student in it
            const enrolledCourse = await Course.findOneAndDelete(
                {_id: CourseId},
                {$push:{studentsEnrolled:userId}},
                {new:true},
            );
            if(!enrolledCourse){
                res.status(500).json({
                    success:false,
                    message:"course not found",
                });
            }
            console.log(enrolledCourse);
            // find the student and add the course to their list enrolled courses
            const enrolledstudent = await User.findOneAndUpdate(
                {_id:userId},
                {$push:{courses:courseId}},
                {new:true},
            );
            console.log(enrolledstudent);
            // mail send to student
            const emailResponse = await mailSender(
                enrolledStudent.email,
                "Congratulations from studynotion",
                "Congratulations, you are onboarded into new codehelp course",
            );
            console.log(emailResponse);
            return res.status(200).json({
                success:true,
                messsage:"signature verified and course added",
            })
        }
        catch(error){
            console.log(error);
            return res.status(500).json({
                success:false,
                message:error.message,
            });
        }
    }
    else{
        return res.status(400).json({
            success:false,
            message:"invalid request",
        })
    }
}