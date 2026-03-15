import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000/api/v1/';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('lumiToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    // console.log("req intercept error:", error)
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: async (email, password) => {
    const response = await apiClient.post('auth/login', { email, password });
    return response.data;
  },
  register: async (userData) => {
    const response = await apiClient.post('auth/register', userData);
    return response.data;
  },
  updateProfile: async (email, updateData) => {
    const response = await apiClient.patch(`auth/profile/${email}`, updateData);
    return response.data;
  },
  uploadProfileImage: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post('auth/upload-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  }
};

export const symptomsAPI = {
  predict: async (symptomsText) => {
    // Parse the comma-separated or raw text into a list
    // TODO: move this parsing logic to the component side?
    const symptomsList = symptomsText.split(',').map(s => s.trim()).filter(s => s.length > 0);
    const response = await apiClient.post('symptoms/predict', {
      user_id: 'user_123', // hardcoded for now
      symptoms: symptomsList.length > 0 ? symptomsList : [symptomsText]
    });
    return response.data;
  }
};

export const reportsAPI = {
  uploadFile: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('user_id', 'user_123');
    const response = await apiClient.post('reports/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  }
};

export const appointmentsAPI = {
  getDoctors: async () => {
    const response = await apiClient.get('appointments/doctors');
    return response.data;
  },
  getForDoctor: async (doctorId) => {
    const response = await apiClient.get(`appointments/doctor/${doctorId}`);
    return response.data;
  },
  getForUser: async (userId) => {
    const response = await apiClient.get(`appointments/user/${userId}`);
    return response.data;
  },
  book: async (doctorId, userId, date) => {
    const response = await apiClient.post('appointments/book', {
      doctor_id: doctorId,
      user_id: userId,
      date: date
    });
    return response.data;
  },
  updateStatus: async (appointmentId, status) => {
    const response = await apiClient.patch(`appointments/${appointmentId}/status`, null, {
      params: { status }
    });
    return response.data;
  }
};

export const riskAPI = {
  getScore: async (healthData) => {
    const response = await apiClient.post('risk/score', healthData);
    return response.data;
  }
};

export const chatAPI = {
  sendMessage: async (message) => {
    const response = await apiClient.post('chat/message', {
      user_id: 'user_123',
      message: message
    });
    return response.data;
  }
};

export const adminAPI = {
  addDoctor: async (doctorData) => {
    const response = await apiClient.post('admin/add-doctor', doctorData);
    return response.data;
  },
  getUsers: async () => {
    const response = await apiClient.get('admin/users');
    return response.data;
  },
  deleteUser: async (email) => {
    const response = await apiClient.delete(`admin/user/${email}`);
    return response.data;
  },
  updateUser: async (email, updateData) => {
    const response = await apiClient.patch(`admin/user/${email}`, updateData);
    return response.data;
  }
};
