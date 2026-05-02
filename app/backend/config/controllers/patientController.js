const Patient = require('../models/Patient');
const User = require('../models/User');

// @desc    Get all patients
// @route   GET /api/patients
// @access  Private/Doctor/Admin
const getPatients = async (req, res) => {
  try {
    const patients = await Patient.find()
      .populate('userId', '-password');
    res.json(patients);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single patient
// @route   GET /api/patients/:id
// @access  Private
const getPatient = async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id)
      .populate('userId', '-password');
    
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    
    res.json(patient);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create patient profile
// @route   POST /api/patients
// @access  Private
const createPatient = async (req, res) => {
  try {
    const { userId, dateOfBirth, gender, bloodGroup, address, emergencyContact, medicalHistory, allergies } = req.body;

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    // Check if patient profile already exists
    const patientExists = await Patient.findOne({ userId });
    if (patientExists) {
      return res.status(400).json({ message: 'Patient profile already exists' });
    }

    const patient = await Patient.create({
      userId,
      dateOfBirth,
      gender,
      bloodGroup,
      address,
      emergencyContact,
      medicalHistory,
      allergies
    });

    const populatedPatient = await Patient.findById(patient._id)
      .populate('userId', '-password');

    res.status(201).json(populatedPatient);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update patient profile
// @route   PUT /api/patients/:id
// @access  Private
const updatePatient = async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);

    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    const updatedPatient = await Patient.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).populate('userId', '-password');

    res.json(updatedPatient);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete patient profile
// @route   DELETE /api/patients/:id
// @access  Private/Admin
const deletePatient = async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);

    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    await Patient.findByIdAndDelete(req.params.id);

    res.json({ message: 'Patient profile removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getPatients,
  getPatient,
  createPatient,
  updatePatient,
  deletePatient
};
