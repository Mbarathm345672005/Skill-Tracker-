const Subcategory = require('../models/Subcategory');
const Entry = require('../models/Entry');

// @desc    Get all subcategories (filterable by categoryId)
// @route   GET /api/subcategories
exports.getSubcategories = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.categoryId) {
      filter.categoryId = req.query.categoryId;
    }

    const subcategories = await Subcategory.find(filter)
      .populate('categoryId', 'name color icon')
      .sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: subcategories.length,
      data: subcategories,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single subcategory
// @route   GET /api/subcategories/:id
exports.getSubcategory = async (req, res, next) => {
  try {
    const subcategory = await Subcategory.findById(req.params.id).populate('categoryId', 'name color icon');
    if (!subcategory) {
      return res.status(404).json({ success: false, error: 'Subcategory not found' });
    }
    res.status(200).json({ success: true, data: subcategory });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new subcategory
// @route   POST /api/subcategories
exports.createSubcategory = async (req, res, next) => {
  try {
    const { name, categoryId } = req.body;
    const subcategory = await Subcategory.create({ name, categoryId });
    const populated = await subcategory.populate('categoryId', 'name color icon');
    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    next(error);
  }
};

// @desc    Update subcategory
// @route   PUT /api/subcategories/:id
exports.updateSubcategory = async (req, res, next) => {
  try {
    const { name, categoryId } = req.body;
    const updateData = { name };
    if (categoryId) updateData.categoryId = categoryId;

    const subcategory = await Subcategory.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('categoryId', 'name color icon');

    if (!subcategory) {
      return res.status(404).json({ success: false, error: 'Subcategory not found' });
    }
    res.status(200).json({ success: true, data: subcategory });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete subcategory
// @route   DELETE /api/subcategories/:id
exports.deleteSubcategory = async (req, res, next) => {
  try {
    const subcategory = await Subcategory.findById(req.params.id);
    if (!subcategory) {
      return res.status(404).json({ success: false, error: 'Subcategory not found' });
    }

    // Check if subcategory has associated entries
    const entriesCount = await Entry.countDocuments({ subcategoryId: req.params.id });
    if (entriesCount > 0) {
      return res.status(400).json({
        success: false,
        error: `Cannot delete subcategory. There are ${entriesCount} entries linked to this subcategory.`,
      });
    }

    await subcategory.deleteOne();
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};
