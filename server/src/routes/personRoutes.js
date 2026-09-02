const express = require('express');
const router = express.Router();
const {
  getPeople,
  getPerson,
  createPerson,
  updatePerson,
  deletePerson,
} = require('../controllers/personController');
const { validate, personSchema } = require('../middleware/validator');

router.route('/')
  .get(getPeople)
  .post(validate(personSchema), createPerson);

router.route('/:id')
  .get(getPerson)
  .put(validate(personSchema), updatePerson)
  .delete(deletePerson);

module.exports = router;
