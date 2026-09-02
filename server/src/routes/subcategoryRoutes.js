const express = require('express');
const router = express.Router();
const {
  getSubcategories,
  getSubcategory,
  createSubcategory,
  updateSubcategory,
  deleteSubcategory,
} = require('../controllers/subcategoryController');
const { validate, subcategorySchema } = require('../middleware/validator');

router.route('/')
  .get(getSubcategories)
  .post(validate(subcategorySchema), createSubcategory);

router.route('/:id')
  .get(getSubcategory)
  .put(updateSubcategory)
  .delete(deleteSubcategory);

module.exports = router;
