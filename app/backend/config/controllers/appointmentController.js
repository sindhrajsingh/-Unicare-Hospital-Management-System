const Appointment = require('../models/Appointment');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');

// @desc    Get all appointments
// @route   GET /api/appointments
// @access  Private
const getAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .populate({
        path: 'patient',
        populate: { path: 'userId', select: '-password' }
      })
      .populate({
        path: 'doctor',
        populate: [{ path: 'userId', select: '-password' }, { path: 'department' }]
      })
      .sort({ appointmentDate: -1 });
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single appointment
// @route   GET /api/appointments/:id
// @access  Private
const getAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate({
        path: 'patient',
        populate: { path: 'userId', select: '-password' }
      })
      .populate({
        path: 'doctor',
        populate: [{ path: 'userId', select: '-password' }, { path: 'department' }]
      });
    
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    
    res.json(appointment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create appointment
// @route   POST /api/appointments
// @access  Private
const createAppointment = async (req, res) => {
  try {
    const { patient, doctor, appointmentDate, timeSlot, reason, notes } = req.body;

    // Check if patient exists
    const patientExists = await Patient.findById(patient);
    if (!patientExists) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    // Check if doctor exists
    const doctorExists = await Doctor.findById(doctor);
    if (!doctorExists) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    // Check if appointment already exists for same time slot
    const appointmentExists = await Appointment.findOne({
      doctor,
      appointmentDate,
      timeSlot,
      status: { $ne: 'cancelled' }
    });

    if (appointmentExists) {
      return res.status(400).json({ message: 'Time slot already booked' });
    }

    const appointment = await Appointment.create({
      patient,
      doctor,
      appointmentDate,
      timeSlot,
      reason,
      notes
    });

    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate({
        path: 'patient',
        populate: { path: 'userId', select: '-password' }
      })
      .populate({
        path: 'doctor',
        populate: [{ path: 'userId', select: '-password' }, { path: 'department' }]
      });

    res.status(201).json(populatedAppointment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update appointment
// @route   PUT /api/appointments/:id
// @access  Private
const updateAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    const updatedAppointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    )
    .populate({
      path: 'patient',
      populate: { path: 'userId', select: '-password' }
    })
    .populate({
      path: 'doctor',
      populate: [{ path: 'userId', select: '-password' }, { path: 'department' }]
    });

    res.json(updatedAppointment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete appointment
// @route   DELETE /api/appointments/:id
// @access  Private
const deleteAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    await Appointment.findByIdAndDelete(req.params.id);

    res.json({ message: 'Appointment cancelled' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAppointments,
  getAppointment,
  createAppointment,
  updateAppointment,
  deleteAppointment
};
