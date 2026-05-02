"// Dashboard Main Controller
import { authAPI, getUser, getToken } from './api.js';

class Dashboard {
  constructor() {
    this.currentView = 'dashboard';
    this.user = getUser();
    this.init();
  }

  init() {
    // Check if user is logged in
    if (!getToken()) {
      this.renderLoginPage();
    } else {
      this.renderDashboard();
    }
  }

  renderLoginPage() {
    const app = document.getElementById('app');
    app.innerHTML = `
      <div class=\"min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100\">
        <div class=\"bg-white p-8 rounded-xl shadow-2xl w-full max-w-md\">
          <div class=\"text-center mb-8\">
            <h1 class=\"text-3xl font-bold text-gray-800 mb-2\">🏥 Unicare HMS</h1>
            <p class=\"text-gray-600\">Hospital Management System</p>
          </div>
          
          <form id=\"loginForm\" class=\"space-y-4\">
            <div class=\"form-group\">
              <label class=\"form-label\">Email</label>
              <input type=\"email\" id=\"email\" class=\"form-input\" placeholder=\"Enter your email\" required>
            </div>
            
            <div class=\"form-group\">
              <label class=\"form-label\">Password</label>
              <input type=\"password\" id=\"password\" class=\"form-input\" placeholder=\"Enter your password\" required>
            </div>
            
            <button type=\"submit\" class=\"btn btn-primary w-full\" data-testid=\"login-btn\">
              Login
            </button>
          </form>
          
          <div class=\"mt-6 text-center\">
            <p class=\"text-sm text-gray-600\">Don't have an account? 
              <a href=\"#\" id=\"showRegister\" class=\"text-blue-600 hover:underline\">Register</a>
            </p>
          </div>
          
          <div id=\"loginError\" class=\"hidden mt-4 p-3 bg-red-100 text-red-700 rounded\"></div>
        </div>
      </div>
    `;

    document.getElementById('loginForm').addEventListener('submit', this.handleLogin.bind(this));
    document.getElementById('showRegister').addEventListener('click', (e) => {
      e.preventDefault();
      this.renderRegisterPage();
    });
  }

  renderRegisterPage() {
    const app = document.getElementById('app');
    app.innerHTML = `
      <div class=\"min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12\">
        <div class=\"bg-white p-8 rounded-xl shadow-2xl w-full max-w-2xl\">
          <div class=\"text-center mb-8\">
            <h1 class=\"text-3xl font-bold text-gray-800 mb-2\">🏥 Register</h1>
            <p class=\"text-gray-600\">Create your Unicare account</p>
          </div>
          
          <form id=\"registerForm\" class=\"space-y-4\">
            <div class=\"grid grid-cols-2 gap-4\">
              <div class=\"form-group\">
                <label class=\"form-label\">Full Name</label>
                <input type=\"text\" id=\"fullName\" class=\"form-input\" placeholder=\"John Doe\" required>
              </div>
              
              <div class=\"form-group\">
                <label class=\"form-label\">Username</label>
                <input type=\"text\" id=\"username\" class=\"form-input\" placeholder=\"johndoe\" required>
              </div>
            </div>
            
            <div class=\"grid grid-cols-2 gap-4\">
              <div class=\"form-group\">
                <label class=\"form-label\">Email</label>
                <input type=\"email\" id=\"email\" class=\"form-input\" placeholder=\"john@example.com\" required>
              </div>
              
              <div class=\"form-group\">
                <label class=\"form-label\">Phone</label>
                <input type=\"tel\" id=\"phone\" class=\"form-input\" placeholder=\"+1234567890\" required>
              </div>
            </div>
            
            <div class=\"grid grid-cols-2 gap-4\">
              <div class=\"form-group\">
                <label class=\"form-label\">Password</label>
                <input type=\"password\" id=\"password\" class=\"form-input\" placeholder=\"Min 6 characters\" required>
              </div>
              
              <div class=\"form-group\">
                <label class=\"form-label\">Role</label>
                <select id=\"role\" class=\"form-select\" required>
                  <option value=\"patient\">Patient</option>
                  <option value=\"doctor\">Doctor</option>
                  <option value=\"receptionist\">Receptionist</option>
                  <option value=\"admin\">Admin</option>
                </select>
              </div>
            </div>
            
            <button type=\"submit\" class=\"btn btn-primary w-full\" data-testid=\"register-btn\">
              Register
            </button>
          </form>
          
          <div class=\"mt-6 text-center\">
            <p class=\"text-sm text-gray-600\">Already have an account? 
              <a href=\"#\" id=\"showLogin\" class=\"text-blue-600 hover:underline\">Login</a>
            </p>
          </div>
          
          <div id=\"registerError\" class=\"hidden mt-4 p-3 bg-red-100 text-red-700 rounded\"></div>
        </div>
      </div>
    `;

    document.getElementById('registerForm').addEventListener('submit', this.handleRegister.bind(this));
    document.getElementById('showLogin').addEventListener('click', (e) => {
      e.preventDefault();
      this.renderLoginPage();
    });
  }

  async handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorDiv = document.getElementById('loginError');

    try {
      const response = await authAPI.login({ email, password });
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response));
      this.user = response;
      this.renderDashboard();
    } catch (error) {
      errorDiv.textContent = error.message;
      errorDiv.classList.remove('hidden');
    }
  }

  async handleRegister(e) {
    e.preventDefault();
    const fullName = document.getElementById('fullName').value;
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const password = document.getElementById('password').value;
    const role = document.getElementById('role').value;
    const errorDiv = document.getElementById('registerError');

    try {
      const response = await authAPI.register({
        fullName,
        username,
        email,
        phone,
        password,
        role
      });
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response));
      this.user = response;
      this.renderDashboard();
    } catch (error) {
      errorDiv.textContent = error.message;
      errorDiv.classList.remove('hidden');
    }
  }

  renderDashboard() {
    const app = document.getElementById('app');
    app.innerHTML = `
      <!-- Navbar -->
      <nav class=\"navbar\">
        <div class=\"px-6 py-4 flex items-center justify-between\">
          <div class=\"flex items-center gap-4\">
            <button id=\"menuToggle\" class=\"lg:hidden\">
              <svg class=\"w-6 h-6\" fill=\"none\" stroke=\"currentColor\" viewBox=\"0 0 24 24\">
                <path stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M4 6h16M4 12h16M4 18h16\"/>
              </svg>
            </button>
            <h1 class=\"text-xl font-bold text-gray-800\">🏥 Unicare HMS</h1>
          </div>
          <div class=\"flex items-center gap-4\">
            <span class=\"text-sm text-gray-600\">Welcome, <strong>${this.user.fullName}</strong></span>
            <span class=\"badge badge-info\">${this.user.role}</span>
            <button id=\"logoutBtn\" class=\"btn btn-secondary btn-sm\" data-testid=\"logout-btn\">Logout</button>
          </div>
        </div>
      </nav>

      <!-- Sidebar -->
      <aside class=\"sidebar\" id=\"sidebar\">
        <div class=\"sidebar-item active\" data-view=\"dashboard\" data-testid=\"dashboard-nav\">
          <svg class=\"w-5 h-5\" fill=\"none\" stroke=\"currentColor\" viewBox=\"0 0 24 24\">
            <path stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6\"/>
          </svg>
          <span>Dashboard</span>
        </div>
        <div class=\"sidebar-item\" data-view=\"departments\" data-testid=\"departments-nav\">
          <svg class=\"w-5 h-5\" fill=\"none\" stroke=\"currentColor\" viewBox=\"0 0 24 24\">
            <path stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4\"/>
          </svg>
          <span>Departments</span>
        </div>
        <div class=\"sidebar-item\" data-view=\"doctors\" data-testid=\"doctors-nav\">
          <svg class=\"w-5 h-5\" fill=\"none\" stroke=\"currentColor\" viewBox=\"0 0 24 24\">
            <path stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z\"/>
          </svg>
          <span>Doctors</span>
        </div>
        <div class=\"sidebar-item\" data-view=\"patients\" data-testid=\"patients-nav\">
          <svg class=\"w-5 h-5\" fill=\"none\" stroke=\"currentColor\" viewBox=\"0 0 24 24\">
            <path stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z\"/>
          </svg>
          <span>Patients</span>
        </div>
        <div class=\"sidebar-item\" data-view=\"appointments\" data-testid=\"appointments-nav\">
          <svg class=\"w-5 h-5\" fill=\"none\" stroke=\"currentColor\" viewBox=\"0 0 24 24\">
            <path stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z\"/>
          </svg>
          <span>Appointments</span>
        </div>
      </aside>

      <!-- Main Content -->
      <main class=\"main-content\" id=\"mainContent\" data-testid=\"main-content\">
        <div class=\"spinner\"></div>
      </main>
    `;

    // Add event listeners
    document.getElementById('logoutBtn').addEventListener('click', () => authAPI.logout());
    
    // Sidebar navigation
    document.querySelectorAll('.sidebar-item').forEach(item => {
      item.addEventListener('click', (e) => {
        const view = e.currentTarget.getAttribute('data-view');
        this.switchView(view);
      });
    });

    // Load default dashboard view
    this.loadDashboardHome();
  }

  switchView(view) {
    // Update active sidebar item
    document.querySelectorAll('.sidebar-item').forEach(item => {
      item.classList.remove('active');
    });
    document.querySelector(`[data-view=\"${view}\"]`).classList.add('active');

    // Load corresponding view
    this.currentView = view;
    const mainContent = document.getElementById('mainContent');
    mainContent.innerHTML = '<div class=\"spinner\"></div>';

    // Dynamically import and load modules
    switch(view) {
      case 'dashboard':
        this.loadDashboardHome();
        break;
      case 'departments':
        import('./departments.js').then(module => module.default.render(mainContent));
        break;
      case 'doctors':
        import('./doctors.js').then(module => module.default.render(mainContent));
        break;
      case 'patients':
        import('./patients.js').then(module => module.default.render(mainContent));
        break;
      case 'appointments':
        import('./appointments.js').then(module => module.default.render(mainContent));
        break;
    }
  }

  loadDashboardHome() {
    const mainContent = document.getElementById('mainContent');
    mainContent.innerHTML = `
      <div data-testid=\"dashboard-home\">
        <h2 class=\"text-2xl font-bold text-gray-800 mb-6\">Dashboard Overview</h2>
        
        <div class=\"grid grid-cols-4 gap-6 mb-8\">
          <div class=\"stat-card\" style=\"background: linear-gradient(135deg, #3b82f6, #1e40af);\">
            <div class=\"stat-value\" data-testid=\"total-departments\">0</div>
            <div class=\"stat-label\">Total Departments</div>
          </div>
          <div class=\"stat-card\" style=\"background: linear-gradient(135deg, #10b981, #059669);\">
            <div class=\"stat-value\" data-testid=\"total-doctors\">0</div>
            <div class=\"stat-label\">Total Doctors</div>
          </div>
          <div class=\"stat-card\" style=\"background: linear-gradient(135deg, #f59e0b, #d97706);\">
            <div class=\"stat-value\" data-testid=\"total-patients\">0</div>
            <div class=\"stat-label\">Total Patients</div>
          </div>
          <div class=\"stat-card\" style=\"background: linear-gradient(135deg, #ef4444, #dc2626);\">
            <div class=\"stat-value\" data-testid=\"total-appointments\">0</div>
            <div class=\"stat-label\">Today's Appointments</div>
          </div>
        </div>
        
        <div class=\"card\">
          <h3 class=\"text-xl font-semibold mb-4\">Welcome to Unicare Hospital Management System</h3>
          <p class=\"text-gray-600 mb-4\">
            Manage your hospital operations efficiently with our comprehensive system.
          </p>
          <div class=\"space-y-2\">
            <p class=\"text-sm text-gray-700\">✅ Manage Departments and Doctors</p>
            <p class=\"text-sm text-gray-700\">✅ Register and Track Patients</p>
            <p class=\"text-sm text-gray-700\">✅ Schedule and Manage Appointments</p>
            <p class=\"text-sm text-gray-700\">✅ View Real-time Statistics</p>
          </div>
        </div>
      </div>
    `;

    // Load dashboard stats
    this.loadDashboardStats();
  }

  async loadDashboardStats() {
    try {
      const [departments, doctors, patients, appointments] = await Promise.all([
        import('./api.js').then(m => m.departmentsAPI.getAll()),
        import('./api.js').then(m => m.doctorsAPI.getAll()),
        import('./api.js').then(m => m.patientsAPI.getAll()),
        import('./api.js').then(m => m.appointmentsAPI.getAll())
      ]);

      document.querySelector('[data-testid=\"total-departments\"]').textContent = departments.length;
      document.querySelector('[data-testid=\"total-doctors\"]').textContent = doctors.length;
      document.querySelector('[data-testid=\"total-patients\"]').textContent = patients.length;
      document.querySelector('[data-testid=\"total-appointments\"]').textContent = appointments.length;
    } catch (error) {
      console.error('Failed to load dashboard stats:', error);
    }
  }
}

// Initialize Dashboard when DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new Dashboard());
} else {
  new Dashboard();
}

export default Dashboard;
"
