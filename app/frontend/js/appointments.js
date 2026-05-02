"// Appointments Management Module
import { appointmentsAPI, patientsAPI, doctorsAPI } from './api.js';

class AppointmentsManager {
  constructor() {
    this.appointments = [];
    this.patients = [];
    this.doctors = [];
  }

  async render(container) {
    container.innerHTML = `
      <div data-testid=\"appointments-page\">
        <div class=\"flex justify-between items-center mb-6\">
          <h2 class=\"text-2xl font-bold text-gray-800\">Appointments Management</h2>
          <button id=\"addAppointmentBtn\" class=\"btn btn-primary\" data-testid=\"add-appointment-btn\">
            <svg class=\"w-5 h-5\" fill=\"none\" stroke=\"currentColor\" viewBox=\"0 0 24 24\">
              <path stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M12 4v16m8-8H4\"/>
            </svg>
            Book Appointment
          </button>
        </div>

        <div class=\"card\">
          <div id=\"appointmentsTable\">
            <div class=\"spinner\"></div>
          </div>
        </div>
      </div>

      <!-- Modal -->
      <div id=\"appointmentModal\" class=\"modal hidden\">
        <div class=\"modal-content\">
          <div class=\"modal-header\">
            <h3 class=\"modal-title\">Book Appointment</h3>
            <button class=\"close-btn\" id=\"closeModal\">&times;</button>
          </div>
          <form id=\"appointmentForm\">
            <div class=\"form-group\">
              <label class=\"form-label\">Patient</label>
              <select id=\"patient\" class=\"form-select\" required data-testid=\"appointment-patient-select\">
                <option value=\"\">Select Patient</option>
              </select>
            </div>
            <div class=\"form-group\">
              <label class=\"form-label\">Doctor</label>
              <select id=\"doctor\" class=\"form-select\" required data-testid=\"appointment-doctor-select\">
                <option value=\"\">Select Doctor</option>
              </select>
            </div>
            <div class=\"grid grid-cols-2 gap-4\">
              <div class=\"form-group\">
                <label class=\"form-label\">Appointment Date</label>
                <input type=\"date\" id=\"appointmentDate\" class=\"form-input\" required data-testid=\"appointment-date-input\">
              </div>
              <div class=\"form-group\">
                <label class=\"form-label\">Time Slot</label>
                <input type=\"time\" id=\"timeSlot\" class=\"form-input\" required data-testid=\"appointment-time-input\">
              </div>
            </div>
            <div class=\"form-group\">
              <label class=\"form-label\">Reason for Visit</label>
              <textarea id=\"reason\" class=\"form-input\" rows=\"3\" placeholder=\"Describe the reason for visit\" required data-testid=\"appointment-reason-input\"></textarea>
            </div>
            <div class=\"form-group\">
              <label class=\"form-label\">Additional Notes</label>
              <textarea id=\"notes\" class=\"form-input\" rows=\"2\" placeholder=\"Any additional information\" data-testid=\"appointment-notes-input\"></textarea>
            </div>
            <div class=\"flex gap-3 mt-6\">
              <button type=\"submit\" class=\"btn btn-primary\" data-testid=\"submit-appointment-btn\">Book Appointment</button>
              <button type=\"button\" class=\"btn btn-secondary\" id=\"cancelBtn\">Cancel</button>
            </div>
          </form>
        </div>
      </div>

      <!-- Status Update Modal -->
      <div id=\"statusModal\" class=\"modal hidden\">
        <div class=\"modal-content\">
          <div class=\"modal-header\">
            <h3 class=\"modal-title\">Update Appointment Status</h3>
            <button class=\"close-btn\" id=\"closeStatusModal\">&times;</button>
          </div>
          <form id=\"statusForm\">
            <div class=\"form-group\">
              <label class=\"form-label\">Status</label>
              <select id=\"status\" class=\"form-select\" required data-testid=\"status-select\">
                <option value=\"scheduled\">Scheduled</option>
                <option value=\"confirmed\">Confirmed</option>
                <option value=\"completed\">Completed</option>
                <option value=\"cancelled\">Cancelled</option>
              </select>
            </div>
            <div class=\"flex gap-3 mt-6\">
              <button type=\"submit\" class=\"btn btn-primary\" data-testid=\"submit-status-btn\">Update Status</button>
              <button type=\"button\" class=\"btn btn-secondary\" id=\"cancelStatusBtn\">Cancel</button>
            </div>
          </form>
        </div>
      </div>
    `;

    document.getElementById('addAppointmentBtn').addEventListener('click', () => this.openModal());
    document.getElementById('closeModal').addEventListener('click', () => this.closeModal());
    document.getElementById('cancelBtn').addEventListener('click', () => this.closeModal());
    document.getElementById('appointmentForm').addEventListener('submit', (e) => this.handleSubmit(e));
    document.getElementById('closeStatusModal').addEventListener('click', () => this.closeStatusModal());
    document.getElementById('cancelStatusBtn').addEventListener('click', () => this.closeStatusModal());
    document.getElementById('statusForm').addEventListener('submit', (e) => this.handleStatusUpdate(e));

    await this.loadPatients();
    await this.loadDoctors();
    await this.loadAppointments();
  }

  async loadPatients() {
    try {
      this.patients = await patientsAPI.getAll();
    } catch (error) {
      console.error('Failed to load patients:', error);
    }
  }

  async loadDoctors() {
    try {
      this.doctors = await doctorsAPI.getAll();
    } catch (error) {
      console.error('Failed to load doctors:', error);
    }
  }

  async loadAppointments() {
    try {
      this.appointments = await appointmentsAPI.getAll();
      this.renderTable();
    } catch (error) {
      document.getElementById('appointmentsTable').innerHTML = `
        <div class=\"text-center py-8 text-red-600\">Failed to load appointments: ${error.message}</div>
      `;
    }
  }

  renderTable() {
    const tableContainer = document.getElementById('appointmentsTable');
    
    if (this.appointments.length === 0) {
      tableContainer.innerHTML = '<div class=\"text-center py-8 text-gray-500\">No appointments found</div>';
      return;
    }

    const getStatusBadge = (status) => {
      const badges = {
        scheduled: 'badge-info',
        confirmed: 'badge-success',
        completed: 'badge-success',
        cancelled: 'badge-danger'
      };
      return badges[status] || 'badge-info';
    };

    tableContainer.innerHTML = `
      <table class=\"table\" data-testid=\"appointments-table\">
        <thead>
          <tr>
            <th>Patient</th>
            <th>Doctor</th>
            <th>Department</th>
            <th>Date</th>
            <th>Time</th>
            <th>Reason</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${this.appointments.map(appointment => {
            const date = new Date(appointment.appointmentDate).toLocaleDateString();
            const patientName = appointment.patient?.userId?.fullName || 'N/A';
            const doctorName = appointment.doctor?.userId?.fullName || 'N/A';
            const department = appointment.doctor?.department?.name || 'N/A';
            
            return `
              <tr data-testid=\"appointment-row-${appointment._id}\">
                <td class=\"font-semibold\">${patientName}</td>
                <td>${doctorName}</td>
                <td>${department}</td>
                <td>${date}</td>
                <td>${appointment.timeSlot}</td>
                <td>${appointment.reason}</td>
                <td>
                  <span class=\"badge ${getStatusBadge(appointment.status)}\">
                    ${appointment.status}
                  </span>
                </td>
                <td>
                  <div class=\"flex gap-2\">
                    <button class=\"btn btn-primary btn-sm\" onclick=\"window.updateAppointmentStatus('${appointment._id}', '${appointment.status}')\" data-testid=\"update-appointment-${appointment._id}\">
                      Update
                    </button>
                    <button class=\"btn btn-danger btn-sm\" onclick=\"window.deleteAppointment('${appointment._id}')\" data-testid=\"delete-appointment-${appointment._id}\">
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    `;
  }

  openModal() {
    const modal = document.getElementById('appointmentModal');
    const form = document.getElementById('appointmentForm');
    const patientSelect = document.getElementById('patient');
    const doctorSelect = document.getElementById('doctor');
    
    form.reset();
    modal.classList.remove('hidden');
    
    // Set minimum date to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('appointmentDate').setAttribute('min', today);
    
    // Populate patients dropdown
    patientSelect.innerHTML = '<option value=\"\">Select Patient</option>' + 
      this.patients.map(p => `<option value=\"${p._id}\">${p.userId?.fullName || 'Unknown'}</option>`).join('');
    
    // Populate doctors dropdown
    doctorSelect.innerHTML = '<option value=\"\">Select Doctor</option>' + 
      this.doctors.map(d => `<option value=\"${d._id}\">${d.userId?.fullName || 'Unknown'} - ${d.specialization}</option>`).join('');
  }

  closeModal() {
    document.getElementById('appointmentModal').classList.add('hidden');
  }

  openStatusModal(id, currentStatus) {
    const modal = document.getElementById('statusModal');
    const form = document.getElementById('statusForm');
    
    form.reset();
    form.dataset.id = id;
    document.getElementById('status').value = currentStatus;
    modal.classList.remove('hidden');
  }

  closeStatusModal() {
    document.getElementById('statusModal').classList.add('hidden');
  }

  async handleSubmit(e) {
    e.preventDefault();
    
    const patient = document.getElementById('patient').value;
    const doctor = document.getElementById('doctor').value;
    const appointmentDate = document.getElementById('appointmentDate').value;
    const timeSlot = document.getElementById('timeSlot').value;
    const reason = document.getElementById('reason').value;
    const notes = document.getElementById('notes').value;

    const data = {
      patient,
      doctor,
      appointmentDate,
      timeSlot,
      reason,
      notes
    };

    try {
      await appointmentsAPI.create(data);
      this.closeModal();
      await this.loadAppointments();
    } catch (error) {
      alert('Error: ' + error.message);
    }
  }

  async handleStatusUpdate(e) {
    e.preventDefault();
    
    const form = e.target;
    const id = form.dataset.id;
    const status = document.getElementById('status').value;

    try {
      await appointmentsAPI.update(id, { status });
      this.closeStatusModal();
      await this.loadAppointments();
    } catch (error) {
      alert('Error: ' + error.message);
    }
  }

  updateAppointmentStatus(id, currentStatus) {
    this.openStatusModal(id, currentStatus);
  }

  async deleteAppointment(id) {
    if (!confirm('Are you sure you want to delete this appointment?')) return;
    
    try {
      await appointmentsAPI.delete(id);
      await this.loadAppointments();
    } catch (error) {
      alert('Error deleting appointment: ' + error.message);
    }
  }
}

const manager = new AppointmentsManager();
window.deleteAppointment = (id) => manager.deleteAppointment(id);
window.updateAppointmentStatus = (id, status) => manager.updateAppointmentStatus(id, status);

export default manager;
"
