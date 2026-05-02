const express = require('express');
const router = express.Router();
const {
  getDoctors,
  getDoctor,
  createDoctor,
  updateDoctor,
  deleteDoctor
} = require('../controllers/doctorController');
const { protect, admin, doctor } = require('../middleware/auth');

router.route('/')
  .get(getDoctors)
  .post(protect, admin, createDoctor);

router.route('/:id')
  .get(getDoctor)
  .put(protect, doctor, updateDoctor)
  .delete(protect, admin, deleteDoctor);

module.exports = router;
