// Departments Management Module
import { departmentsAPI } from './api.js';

class DepartmentsManager {
  constructor() {
    this.departments = [];
  }

  async render(container) {
    container.innerHTML = `
      <div data-testid="departments-page">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-2xl font-bold text-gray-800">Departments Management</h2>
          <button id="addDepartmentBtn" class="btn btn-primary" data-testid="add-department-btn">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
            </svg>
            Add Department
          </button>
        </div>

        <div class="card">
          <div id="departmentsTable">
            <div class="spinner"></div>
          </div>
        </div>
      </div>

      <!-- Modal -->
      <div id="departmentModal" class="modal hidden">
        <div class="modal-content">
          <div class="modal-header">
            <h3 class="modal-title" id="modalTitle">Add Department</h3>
            <button class="close-btn" id="closeModal">&times;</button>
          </div>
          <form id="departmentForm">
            <div class="form-group">
              <label class="form-label">Department Name</label>
              <input type="text" id="deptName" class="form-input" placeholder="e.g., Cardiology" required data-testid="dept-name-input">
            </div>
            <div class="form-group">
              <label class="form-label">Description</label>
              <textarea id="deptDescription" class="form-input" rows="3" placeholder="Department description" required data-testid="dept-desc-input"></textarea>
            </div>
            <div class="form-group">
              <label class="form-label">Facilities</label>
              <input type="text" id="deptFacilities" class="form-input" placeholder="e.g., ECG, X-Ray (comma separated)" data-testid="dept-facilities-input">
              <small class="text-gray-500">Separate facilities with commas</small>
            </div>
            <div class="flex gap-3 mt-6">
              <button type="submit" class="btn btn-primary" data-testid="submit-dept-btn">Save Department</button>
              <button type="button" class="btn btn-secondary" id="cancelBtn">Cancel</button>
            </div>
          </form>
        </div>
      </div>
    `;

    document.getElementById('addDepartmentBtn').addEventListener('click', () => this.openModal());
    document.getElementById('closeModal').addEventListener('click', () => this.closeModal());
    document.getElementById('cancelBtn').addEventListener('click', () => this.closeModal());
    document.getElementById('departmentForm').addEventListener('submit', (e) => this.handleSubmit(e));

    await this.loadDepartments();
  }

  async loadDepartments() {
    try {
      this.departments = await departmentsAPI.getAll();
      this.renderTable();
    } catch (error) {
      document.getElementById('departmentsTable').innerHTML = `
        <div class="text-center py-8 text-red-600">Failed to load departments: ${error.message}</div>
      `;
    }
  }

  renderTable() {
    const tableContainer = document.getElementById('departmentsTable');
    
    if (this.departments.length === 0) {
      tableContainer.innerHTML = '<div class="text-center py-8 text-gray-500">No departments found</div>';
      return;
    }

    tableContainer.innerHTML = `
      <table class="table" data-testid="departments-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Description</th>
            <th>Facilities</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${this.departments.map(dept => `
            <tr data-testid="dept-row-${dept._id}">
              <td class="font-semibold">${dept.name}</td>
              <td>${dept.description}</td>
              <td>${dept.facilities && dept.facilities.length > 0 ? dept.facilities.join(', ') : 'N/A'}</td>
              <td>
                <span class="badge ${dept.isActive ? 'badge-success' : 'badge-danger'}">
                  ${dept.isActive ? 'Active' : 'Inactive'}
                </span>
              </td>
              <td>
                <button class="btn btn-danger btn-sm" onclick="window.deleteDepartment('${dept._id}')" data-testid="delete-dept-${dept._id}">
                  Delete
                </button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  }

  openModal(department = null) {
    const modal = document.getElementById('departmentModal');
    const form = document.getElementById('departmentForm');
    
    form.reset();
    modal.classList.remove('hidden');
    
    if (department) {
      document.getElementById('modalTitle').textContent = 'Edit Department';
      document.getElementById('deptName').value = department.name;
      document.getElementById('deptDescription').value = department.description;
      document.getElementById('deptFacilities').value = department.facilities?.join(', ') || '';
      form.dataset.id = department._id;
    } else {
      document.getElementById('modalTitle').textContent = 'Add Department';
      delete form.dataset.id;
    }
  }

  closeModal() {
    document.getElementById('departmentModal').classList.add('hidden');
  }

  async handleSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const name = document.getElementById('deptName').value;
    const description = document.getElementById('deptDescription').value;
    const facilitiesStr = document.getElementById('deptFacilities').value;
    const facilities = facilitiesStr ? facilitiesStr.split(',').map(f => f.trim()) : [];

    const data = { name, description, facilities };

    try {
      if (form.dataset.id) {
        await departmentsAPI.update(form.dataset.id, data);
      } else {
        await departmentsAPI.create(data);
      }
      
      this.closeModal();
      await this.loadDepartments();
    } catch (error) {
      alert('Error: ' + error.message);
    }
  }

  async deleteDepartment(id) {
    if (!confirm('Are you sure you want to delete this department?')) return;
    
    try {
      await departmentsAPI.delete(id);
      await this.loadDepartments();
    } catch (error) {
      alert('Error deleting department: ' + error.message);
    }
  }
}

const manager = new DepartmentsManager();
window.deleteDepartment = (id) => manager.deleteDepartment(id);

export default manager;
