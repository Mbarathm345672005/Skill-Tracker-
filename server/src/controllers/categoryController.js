const Category = require('../models/Category');
const Subcategory = require('../models/Subcategory');
const Entry = require('../models/Entry');

// @desc    Get all categories
// @route   GET /api/categories
exports.getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find().sort({ createdAt: 1 });
    res.status(200).json({
      success: true,
      count: categories.length,
      data: categories,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single category
// @route   GET /api/categories/:id
exports.getCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, error: 'Category not found' });
    }
    res.status(200).json({ success: true, data: category });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new category
// @route   POST /api/categories
exports.createCategory = async (req, res, next) => {
  try {
    const { name, color, icon, isDefault } = req.body;
    const category = await Category.create({ name, color, icon, isDefault });
    res.status(201).json({ success: true, data: category });
  } catch (error) {
    next(error);
  }
};

// @desc    Update category
// @route   PUT /api/categories/:id
exports.updateCategory = async (req, res, next) => {
  try {
    const { name, color, icon } = req.body;
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { name, color, icon },
      { new: true, runValidators: true }
    );
    if (!category) {
      return res.status(404).json({ success: false, error: 'Category not found' });
    }
    res.status(200).json({ success: true, data: category });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete category
// @route   DELETE /api/categories/:id
exports.deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, error: 'Category not found' });
    }
    
    // Check if category has associated entries
    const entriesCount = await Entry.countDocuments({ categoryId: req.params.id });
    if (entriesCount > 0) {
      return res.status(400).json({
        success: false,
        error: `Cannot delete category. There are ${entriesCount} entries linked to this category.`,
      });
    }

    // Delete associated subcategories
    await Subcategory.deleteMany({ categoryId: req.params.id });
    await category.deleteOne();

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};
