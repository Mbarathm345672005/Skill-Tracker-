const Person = require('../models/Person');
const Entry = require('../models/Entry');

// @desc    Get all people
// @route   GET /api/people
exports.getPeople = async (req, res, next) => {
  try {
    const people = await Person.find().sort({ name: 1 });
    res.status(200).json({
      success: true,
      count: people.length,
      data: people,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single person
// @route   GET /api/people/:id
exports.getPerson = async (req, res, next) => {
  try {
    const person = await Person.findById(req.params.id);
    if (!person) {
      return res.status(404).json({ success: false, error: 'Person not found' });
    }
    res.status(200).json({ success: true, data: person });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new person
// @route   POST /api/people
exports.createPerson = async (req, res, next) => {
  try {
    const { name } = req.body;
    const person = await Person.create({ name });
    res.status(201).json({ success: true, data: person });
  } catch (error) {
    next(error);
  }
};

// @desc    Update person
// @route   PUT /api/people/:id
exports.updatePerson = async (req, res, next) => {
  try {
    const { name } = req.body;
    const person = await Person.findByIdAndUpdate(
      req.params.id,
      { name },
      { new: true, runValidators: true }
    );
    if (!person) {
      return res.status(404).json({ success: false, error: 'Person not found' });
    }
    res.status(200).json({ success: true, data: person });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete person
// @route   DELETE /api/people/:id
exports.deletePerson = async (req, res, next) => {
  try {
    const person = await Person.findById(req.params.id);
    if (!person) {
      return res.status(404).json({ success: false, error: 'Person not found' });
    }

    // Check if person has associated entries
    const entriesCount = await Entry.countDocuments({ personId: req.params.id });
    if (entriesCount > 0) {
      return res.status(400).json({
        success: false,
        error: `Cannot delete person. There are ${entriesCount} entries logged by this person. Please reassign or delete their entries first.`,
      });
    }

    await person.deleteOne();
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};
