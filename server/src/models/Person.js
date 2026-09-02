const mongoose = require('mongoose');

const PersonSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Person name is required'],
      unique: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Person', PersonSchema);
