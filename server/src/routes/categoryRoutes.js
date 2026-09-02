const express = require('express');
const router = express.Router();
const {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
} = require('../controllers/categoryController');
const { validate, categorySchema } = require('../middleware/validator');

router.route('/')
  .get(getCategories)
  .post(validate(categorySchema), createCategory);

router.route('/:id')
  .get(getCategory)
  .put(validate(categorySchema), updateCategory)
  .delete(deleteCategory);

module.exports = router;
