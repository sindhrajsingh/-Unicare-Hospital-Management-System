"// Patients Management Module
import { patientsAPI } from './api.js';

class PatientsManager {
  constructor() {
    this.patients = [];
  }

  async render(container) {
    container.innerHTML = `
      <div data-testid=\"patients-page\">
        <div class=\"flex justify-between items-center mb-6\">
          <h2 class=\"text-2xl font-bold text-gray-800\">Patients Management</h2>
          <button id=\"addPatientBtn\" class=\"btn btn-primary\" data-testid=\"add-patient-btn\">
            <svg class=\"w-5 h-5\" fill=\"none\" stroke=\"currentColor\" viewBox=\"0 0 24 24\">
              <path stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M12 4v16m8-8H4\"/>
            </svg>
            Add Patient
          </button>
        </div>

        <div class=\"card\">
          <div id=\"patientsTable\">
            <div class=\"spinner\"></div>
          </div>
        </div>
      </div>

      <!-- Modal -->
      <div id=\"patientModal\" class=\"modal hidden\">
        <div class=\"modal-content\">
          <div class=\"modal-header\">
            <h3 class=\"modal-title\">Add Patient</h3>
            <button class=\"close-btn\" id=\"closeModal\">&times;</button>
          </div>
          <form id=\"patientForm\">
            <p class=\"text-sm text-amber-600 mb-4\">Note: Create a user account first with role 'patient', then add patient profile here.</p>
            <div class=\"form-group\">
              <label class=\"form-label\">User ID</label>
              <input type=\"text\" id=\"userId\" class=\"form-input\" placeholder=\"User ID from registration\" required data-testid=\"patient-userid-input\">
            </div>
            <div class=\"grid grid-cols-2 gap-4\">
              <div class=\"form-group\">
                <label class=\"form-label\">Date of Birth</label>
                <input type=\"date\" id=\"dateOfBirth\" class=\"form-input\" required data-testid=\"patient-dob-input\">
              </div>
              <div class=\"form-group\">
                <label class=\"form-label\">Gender</label>
                <select id=\"gender\" class=\"form-select\" required data-testid=\"patient-gender-select\">
                  <option value=\"\">Select Gender</option>
                  <option value=\"male\">Male</option>
                  <option value=\"female\">Female</option>
                  <option value=\"other\">Other</option>
                </select>
              </div>
            </div>
            <div class=\"form-group\">
              <label class=\"form-label\">Blood Group</label>
              <select id=\"bloodGroup\" class=\"form-select\" data-testid=\"patient-blood-select\">
                <option value=\"\">Select Blood Group</option>
                <option value=\"A+\">A+</option>
                <option value=\"A-\">A-</option>
                <option value=\"B+\">B+</option>
                <option value=\"B-\">B-</option>
                <option value=\"AB+\">AB+</option>
                <option value=\"AB-\">AB-</option>
                <option value=\"O+\">O+</option>
                <option value=\"O-\">O-</option>
              </select>
            </div>
            <div class=\"form-group\">
              <label class=\"form-label\">Address</label>
              <input type=\"text\" id=\"address\" class=\"form-input\" placeholder=\"Street, City, State, Zip\" data-testid=\"patient-address-input\">
            </div>
            <div class=\"form-group\">
              <label class=\"form-label\">Emergency Contact Name</label>
              <input type=\"text\" id=\"emergencyName\" class=\"form-input\" placeholder=\"Contact person name\" data-testid=\"patient-emergency-name-input\">
            </div>
            <div class=\"grid grid-cols-2 gap-4\">
              <div class=\"form-group\">
                <label class=\"form-label\">Emergency Contact Relationship</label>
                <input type=\"text\" id=\"emergencyRelation\" class=\"form-input\" placeholder=\"e.g., Spouse, Parent\" data-testid=\"patient-emergency-relation-input\">
              </div>
              <div class=\"form-group\">
                <label class=\"form-label\">Emergency Contact Phone</label>
                <input type=\"tel\" id=\"emergencyPhone\" class=\"form-input\" placeholder=\"+1234567890\" data-testid=\"patient-emergency-phone-input\">
              </div>
            </div>
            <div class=\"flex gap-3 mt-6\">
              <button type=\"submit\" class=\"btn btn-primary\" data-testid=\"submit-patient-btn\">Save Patient</button>
              <button type=\"button\" class=\"btn btn-secondary\" id=\"cancelBtn\">Cancel</button>
            </div>
          </form>
        </div>
      </div>
    `;

    document.getElementById('addPatientBtn').addEventListener('click', () => this.openModal());
    document.getElementById('closeModal').addEventListener('click', () => this.closeModal());
    document.getElementById('cancelBtn').addEventListener('click', () => this.closeModal());
    document.getElementById('patientForm').addEventListener('submit', (e) => this.handleSubmit(e));

    await this.loadPatients();
  }

  async loadPatients() {
    try {
      this.patients = await patientsAPI.getAll();
      this.renderTable();
    } catch (error) {
      document.getElementById('patientsTable').innerHTML = `
        <div class=\"text-center py-8 text-red-600\">Failed to load patients: ${error.message}</div>
      `;
    }
  }

  renderTable() {
    const tableContainer = document.getElementById('patientsTable');
    
    if (this.patients.length === 0) {
      tableContainer.innerHTML = '<div class=\"text-center py-8 text-gray-500\">No patients found</div>';
      return;
    }

    tableContainer.innerHTML = `
      <table class=\"table\" data-testid=\"patients-table\">
        <thead>
          <tr>
            <th>Name</th>
            <th>Gender</th>
            <th>Blood Group</th>
            <th>Contact</th>
            <th>Emergency Contact</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${this.patients.map(patient => `
            <tr data-testid=\"patient-row-${patient._id}\">
              <td class=\"font-semibold\">${patient.userId?.fullName || 'N/A'}</td>
              <td>${patient.gender}</td>
              <td><span class=\"badge badge-info\">${patient.bloodGroup || 'N/A'}</span></td>
              <td>${patient.userId?.phone || 'N/A'}</td>
              <td>${patient.emergencyContact?.name || 'N/A'} (${patient.emergencyContact?.phone || 'N/A'})</td>
              <td>
                <button class=\"btn btn-danger btn-sm\" onclick=\"window.deletePatient('${patient._id}')\" data-testid=\"delete-patient-${patient._id}\">
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
    const modal = document.getElementById('patientModal');
    const form = document.getElementById('patientForm');
    
    form.reset();
    modal.classList.remove('hidden');
  }

  closeModal() {
    document.getElementById('patientModal').classList.add('hidden');
  }

  async handleSubmit(e) {
    e.preventDefault();
    
    const userId = document.getElementById('userId').value;
    const dateOfBirth = document.getElementById('dateOfBirth').value;
    const gender = document.getElementById('gender').value;
    const bloodGroup = document.getElementById('bloodGroup').value;
    const address = document.getElementById('address').value;
    const emergencyName = document.getElementById('emergencyName').value;
    const emergencyRelation = document.getElementById('emergencyRelation').value;
    const emergencyPhone = document.getElementById('emergencyPhone').value;

    const data = {
      userId,
      dateOfBirth,
      gender,
      bloodGroup,
      address: { street: address },
      emergencyContact: {
        name: emergencyName,
        relationship: emergencyRelation,
        phone: emergencyPhone
      },
      medicalHistory: [],
      allergies: []
    };

    try {
      await patientsAPI.create(data);
      this.closeModal();
      await this.loadPatients();
    } catch (error) {
      alert('Error: ' + error.message);
    }
  }

  async deletePatient(id) {
    if (!confirm('Are you sure you want to delete this patient?')) return;
    
    try {
      await patientsAPI.delete(id);
      await this.loadPatients();
    } catch (error) {
      alert('Error deleting patient: ' + error.message);
    }
  }
}

const manager = new PatientsManager();
window.deletePatient = (id) => manager.deletePatient(id);

export default manager;
"
