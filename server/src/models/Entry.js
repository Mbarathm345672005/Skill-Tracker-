const mongoose = require('mongoose');

const EntrySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    notes: {
      type: String,
      default: '',
      trim: true,
    },
    date: {
      type: Date,
      default: Date.now,
      required: true,
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category is required'],
    },
    subcategoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subcategory',
      default: null,
    },
    personId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Person',
      required: [true, 'Person is required'],
    },
    status: {
      type: String,
      enum: ['To Do', 'In Progress', 'Done'],
      default: 'Done',
    },
    timeSpentMinutes: {
      type: Number,
      default: 0,
      min: [0, 'Time spent cannot be negative'],
    },
    difficulty: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard', null, ''],
      default: null,
    },
    problemLink: {
      type: String,
      default: '',
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for fast filtering and streak calculation
EntrySchema.index({ personId: 1, date: -1 });
EntrySchema.index({ categoryId: 1, date: -1 });
EntrySchema.index({ date: -1 });

module.exports = mongoose.model('Entry', EntrySchema);
