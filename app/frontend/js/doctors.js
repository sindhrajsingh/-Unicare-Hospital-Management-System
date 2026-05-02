"// Doctors Management Module
import { doctorsAPI, departmentsAPI } from './api.js';

class DoctorsManager {
  constructor() {
    this.doctors = [];
    this.departments = [];
  }

  async render(container) {
    container.innerHTML = `
      <div data-testid=\"doctors-page\">
        <div class=\"flex justify-between items-center mb-6\">
          <h2 class=\"text-2xl font-bold text-gray-800\">Doctors Management</h2>
          <button id=\"addDoctorBtn\" class=\"btn btn-primary\" data-testid=\"add-doctor-btn\">
            <svg class=\"w-5 h-5\" fill=\"none\" stroke=\"currentColor\" viewBox=\"0 0 24 24\">
              <path stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M12 4v16m8-8H4\"/>
            </svg>
            Add Doctor
          </button>
        </div>

        <div class=\"card\">
          <div id=\"doctorsTable\">
            <div class=\"spinner\"></div>
          </div>
        </div>
      </div>

      <!-- Modal -->
      <div id=\"doctorModal\" class=\"modal hidden\">
        <div class=\"modal-content\">
          <div class=\"modal-header\">
            <h3 class=\"modal-title\">Add Doctor</h3>
            <button class=\"close-btn\" id=\"closeModal\">&times;</button>
          </div>
          <form id=\"doctorForm\">
            <p class=\"text-sm text-amber-600 mb-4\">Note: Create a user account first with role 'doctor', then add doctor profile here.</p>
            <div class=\"form-group\">
              <label class=\"form-label\">User ID</label>
              <input type=\"text\" id=\"userId\" class=\"form-input\" placeholder=\"User ID from registration\" required data-testid=\"doctor-userid-input\">
            </div>
            <div class=\"grid grid-cols-2 gap-4\">
              <div class=\"form-group\">
                <label class=\"form-label\">Specialization</label>
                <input type=\"text\" id=\"specialization\" class=\"form-input\" placeholder=\"e.g., Cardiologist\" required data-testid=\"doctor-spec-input\">
              </div>
              <div class=\"form-group\">
                <label class=\"form-label\">Qualification</label>
                <input type=\"text\" id=\"qualification\" class=\"form-input\" placeholder=\"e.g., MBBS, MD\" required data-testid=\"doctor-qual-input\">
              </div>
            </div>
            <div class=\"grid grid-cols-2 gap-4\">
              <div class=\"form-group\">
                <label class=\"form-label\">Experience (years)</label>
                <input type=\"number\" id=\"experience\" class=\"form-input\" placeholder=\"5\" required data-testid=\"doctor-exp-input\">
              </div>
              <div class=\"form-group\">
                <label class=\"form-label\">Consultation Fee</label>
                <input type=\"number\" id=\"consultationFee\" class=\"form-input\" placeholder=\"100\" required data-testid=\"doctor-fee-input\">
              </div>
            </div>
            <div class=\"form-group\">
              <label class=\"form-label\">Department</label>
              <select id=\"department\" class=\"form-select\" required data-testid=\"doctor-dept-select\">
                <option value=\"\">Select Department</option>
              </select>
            </div>
            <div class=\"flex gap-3 mt-6\">
              <button type=\"submit\" class=\"btn btn-primary\" data-testid=\"submit-doctor-btn\">Save Doctor</button>
              <button type=\"button\" class=\"btn btn-secondary\" id=\"cancelBtn\">Cancel</button>
            </div>
          </form>
        </div>
      </div>
    `;

    document.getElementById('addDoctorBtn').addEventListener('click', () => this.openModal());
    document.getElementById('closeModal').addEventListener('click', () => this.closeModal());
    document.getElementById('cancelBtn').addEventListener('click', () => this.closeModal());
    document.getElementById('doctorForm').addEventListener('submit', (e) => this.handleSubmit(e));

    await this.loadDepartments();
    await this.loadDoctors();
  }

  async loadDepartments() {
    try {
      this.departments = await departmentsAPI.getAll();
    } catch (error) {
      console.error('Failed to load departments:', error);
    }
  }

  async loadDoctors() {
    try {
      this.doctors = await doctorsAPI.getAll();
      this.renderTable();
    } catch (error) {
      document.getElementById('doctorsTable').innerHTML = `
        <div class=\"text-center py-8 text-red-600\">Failed to load doctors: ${error.message}</div>
      `;
    }
  }

  renderTable() {
    const tableContainer = document.getElementById('doctorsTable');
    
    if (this.doctors.length === 0) {
      tableContainer.innerHTML = '<div class=\"text-center py-8 text-gray-500\">No doctors found</div>';
      return;
    }

    tableContainer.innerHTML = `
      <table class=\"table\" data-testid=\"doctors-table\">
        <thead>
          <tr>
            <th>Name</th>
            <th>Specialization</th>
            <th>Department</th>
            <th>Experience</th>
            <th>Consultation Fee</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${this.doctors.map(doctor => `
            <tr data-testid=\"doctor-row-${doctor._id}\">
              <td class=\"font-semibold\">${doctor.userId?.fullName || 'N/A'}</td>
              <td>${doctor.specialization}</td>
              <td>${doctor.department?.name || 'N/A'}</td>
              <td>${doctor.experience} years</td>
              <td>$${doctor.consultationFee}</td>
              <td>
                <span class=\"badge ${doctor.isAvailable ? 'badge-success' : 'badge-danger'}\">
                  ${doctor.isAvailable ? 'Available' : 'Unavailable'}
                </span>
              </td>
              <td>
                <button class=\"btn btn-danger btn-sm\" onclick=\"window.deleteDoctor('${doctor._id}')\" data-testid=\"delete-doctor-${doctor._id}\">
                  Delete
                </button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  }

  openModal() {
    const modal = document.getElementById('doctorModal');
    const form = document.getElementById('doctorForm');
    const deptSelect = document.getElementById('department');
    
    form.reset();
    modal.classList.remove('hidden');
    
    // Populate departments dropdown
    deptSelect.innerHTML = '<option value=\"\">Select Department</option>' + 
      this.departments.map(dept => `<option value=\"${dept._id}\">${dept.name}</option>`).join('');
  }

  closeModal() {
    document.getElementById('doctorModal').classList.add('hidden');
  }

  async handleSubmit(e) {
    e.preventDefault();
    
    const userId = document.getElementById('userId').value;
    const specialization = document.getElementById('specialization').value;
    const qualification = document.getElementById('qualification').value;
    const experience = parseInt(document.getElementById('experience').value);
    const consultationFee = parseFloat(document.getElementById('consultationFee').value);
    const department = document.getElementById('department').value;

    const data = {
      userId,
      specialization,
      qualification,
      experience,
      consultationFee,
      department,
      availableSlots: []
    };

    try {
      await doctorsAPI.create(data);
      this.closeModal();
      await this.loadDoctors();
    } catch (error) {
      alert('Error: ' + error.message);
    }
  }

  async deleteDoctor(id) {
    if (!confirm('Are you sure you want to delete this doctor?')) return;
    
    try {
      await doctorsAPI.delete(id);
      await this.loadDoctors();
    } catch (error) {
      alert('Error deleting doctor: ' + error.message);
    }
  }
}

const manager = new DoctorsManager();
window.deleteDoctor = (id) => manager.deleteDoctor(id);

export default manager;
"
