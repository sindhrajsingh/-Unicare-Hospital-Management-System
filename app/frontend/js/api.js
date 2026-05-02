"// API Configuration and Helper Functions
const API_BASE_URL = 'https://unicare-hms.preview.emergentagent.com/api';

// Get token from localStorage
const getToken = () => localStorage.getItem('token');

// Set token to localStorage
const setToken = (token) => localStorage.setItem('token', token);

// Remove token from localStorage
const removeToken = () => localStorage.removeItem('token');

// Get user from localStorage
const getUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

// Set user to localStorage
const setUser = (user) => localStorage.setItem('user', JSON.stringify(user));

// Remove user from localStorage
const removeUser = () => localStorage.removeItem('user');

// API Helper Function
const apiCall = async (endpoint, options = {}) => {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Something went wrong');
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// Auth API
const authAPI = {
  register: (userData) => apiCall('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData)
  }),

  login: (credentials) => apiCall('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials)
  }),

  getProfile: () => apiCall('/auth/profile'),

  logout: () => {
    removeToken();
    removeUser();
    window.location.href = '/';
  }
};

// Departments API
const departmentsAPI = {
  getAll: () => apiCall('/departments'),
  getOne: (id) => apiCall(`/departments/${id}`),
  create: (data) => apiCall('/departments', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  update: (id, data) => apiCall(`/departments/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  delete: (id) => apiCall(`/departments/${id}`, {
    method: 'DELETE'
  })
};

// Doctors API
const doctorsAPI = {
  getAll: () => apiCall('/doctors'),
  getOne: (id) => apiCall(`/doctors/${id}`),
  create: (data) => apiCall('/doctors', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  update: (id, data) => apiCall(`/doctors/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  delete: (id) => apiCall(`/doctors/${id}`, {
    method: 'DELETE'
  })
};

// Patients API
const patientsAPI = {
  getAll: () => apiCall('/patients'),
  getOne: (id) => apiCall(`/patients/${id}`),
  create: (data) => apiCall('/patients', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  update: (id, data) => apiCall(`/patients/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  delete: (id) => apiCall(`/patients/${id}`, {
    method: 'DELETE'
  })
};

// Appointments API
const appointmentsAPI = {
  getAll: () => apiCall('/appointments'),
  getOne: (id) => apiCall(`/appointments/${id}`),
  create: (data) => apiCall('/appointments', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  update: (id, data) => apiCall(`/appointments/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  delete: (id) => apiCall(`/appointments/${id}`, {
    method: 'DELETE'
  })
};

// Export API functions
export {
  authAPI,
  departmentsAPI,
  doctorsAPI,
  patientsAPI,
  appointmentsAPI,
  getToken,
  setToken,
  removeToken,
  getUser,
  setUser,
  removeUser
};
"
