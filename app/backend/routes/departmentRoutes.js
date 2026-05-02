const express = require('express');
const router = express.Router();
const {
  getDepartments,
  getDepartment,
  createDepartment,
  updateDepartment,
  deleteDepartment
} = require('../controllers/departmentController');
const { protect, admin } = require('../middleware/auth');

router.route('/')
  .get(getDepartments)
  .post(protect, admin, createDepartment);

router.route('/:id')
  .get(getDepartment)
  .put(protect, admin, updateDepartment)
  .delete(protect, admin, deleteDepartment);

module.exports = router;
