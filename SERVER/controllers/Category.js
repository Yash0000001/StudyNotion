const Category = require("../models/Category");
const { Mongoose } = require("mongoose");

exports.createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }
    const CategorysDetails = await Category.create({
      name: name,
      description: description,
    });
    console.log(CategorysDetails);
    return res.status(200).json({
      success: true,
      message: "Category Created Successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: true,
      message: error.message,
    });
  }
};

// get all tags
exports.showAllCategory = async (req, res) => {
  try {
    const allCategory = await Category.find(
      {},
      { name: true, description: true }
    );
    res.status(200).json({
      success: true,
      message: "all tags fetched successfully",
      allCategory,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Some error occured in fetching all category",
    });
  }
};

// category page details
exports.categoryPageDetails = async (req, res) => {
  try {
    // get categoryID
    const { categoryId } = req.body;
    // get courses for specific categoryId
    const selectedCategory = await Category.findById(categoryId)
      .populate("courses")
      .exec();
    // validation
    if (!selectedCategory) {
      return res.status(404).json({
        success: false,
        message: "Data not found",
      });
    }
    // get courses for different categories
    const differentCategories = await Category.find({
      _id: { $ne: categoryId },
    })
      .populate("courses")
      .exec();
    // get top selling courses

    // return response
    return res.status(200).json({
      success: true,
      data: {
        selectedCategory,
        differentCategories,
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
