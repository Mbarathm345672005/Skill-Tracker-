const express = require('express');
const router = express.Router();
const {
  getEntries,
  getEntry,
  createEntry,
  updateEntry,
  deleteEntry,
  getSummary,
  getLeaderboard,
  getStreak,
} = require('../controllers/entryController');
const { validate, entrySchema } = require('../middleware/validator');

// Specific aggregation / utility routes first
router.get('/summary', getSummary);
router.get('/leaderboard', getLeaderboard);
router.get('/streak/:personId', getStreak);

// Base CRUD routes
router.route('/')
  .get(getEntries)
  .post(validate(entrySchema), createEntry);

router.route('/:id')
  .get(getEntry)
  .put(validate(entrySchema), updateEntry)
  .delete(deleteEntry);

module.exports = router;
