const mongoose = require('mongoose');

const SubcategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Subcategory name is required'],
      trim: true,
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Parent Category is required'],
    },
  },
  {
    timestamps: true,
  }
);

// Compound index so duplicate subcategories in the same category are avoided
SubcategorySchema.index({ name: 1, categoryId: 1 }, { unique: true });

module.exports = mongoose.model('Subcategory', SubcategorySchema);
