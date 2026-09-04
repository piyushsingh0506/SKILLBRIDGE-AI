import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token to all requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token if invalid
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    return Promise.reject(error);
  }
);

// Auth Endpoints
export const authService = {
  login: (credentials) => api.post('/api/auth/login', credentials),
  registerStudent: (data) => api.post('/api/auth/register/student', data),
  registerIndustry: (data) => api.post('/api/auth/register/industry', data),
  registerAcademician: (data) => api.post('/api/auth/register/academician', data),
  registerInstitution: (data) => api.post('/api/auth/register/institution', data),
  getMe: () => api.get('/api/auth/me'),
  getDemoUsers: () => api.get('/api/auth/demo-users'),
};

// Student Endpoints
export const studentService = {
  getProfile: () => api.get('/api/students/profile'),
  updateProfile: (data) => api.put('/api/students/profile', data),
  getSkills: () => api.get('/api/students/skills'),
  addSkill: (data) => api.post('/api/students/skills', data),
  deleteSkill: (id) => api.delete(`/api/students/skills/${id}`),
  getProjects: () => api.get('/api/students/projects'),
  addProject: (data) => api.post('/api/students/projects', data),
  deleteProject: (id) => api.delete(`/api/students/projects/${id}`),
  getCertifications: () => api.get('/api/students/certifications'),
  addCertification: (data) => api.post('/api/students/certifications', data),
  deleteCertification: (id) => api.delete(`/api/students/certifications/${id}`),
  getPublicPortfolio: (userId) => api.get(`/api/students/public-portfolio/${userId}`),
};

// Assessment Endpoints
export const assessmentService = {
  listAssessments: () => api.get('/api/assessments'),
  getQuestions: (id) => api.get(`/api/assessments/${id}/questions`),
  submitAssessment: (data) => api.post('/api/assessments/submit', data),
  getHistory: () => api.get('/api/assessments/results/history'),
};

// AI Services
export const aiService = {
  getSkillGap: (targetRole) => api.get(`/api/ai/skill-gap${targetRole ? `?target_role=${encodeURIComponent(targetRole)}` : ''}`),
  getCareerRecommendations: () => api.get('/api/ai/career-recommendations'),
  analyzeResume: (formData) => api.post('/api/ai/resume-analysis', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  chatWithMentor: (message, chatHistory) => api.post('/api/ai/mentor-chat', { message, chat_history: chatHistory }),
};

// Opportunities Endpoints
export const opportunityService = {
  getInternships: (params) => api.get('/api/internships', { params }),
  createInternship: (data) => api.post('/api/internships', data),
  getJobs: (params) => api.get('/api/jobs', { params }),
  createJob: (data) => api.post('/api/jobs', data),
  getCourses: (skill) => api.get(`/api/courses${skill ? `?skill=${encodeURIComponent(skill)}` : ''}`),
};

// Applications Endpoints
export const applicationService = {
  apply: (data) => api.post('/api/applications', data),
  getMyApplications: () => api.get('/api/applications/my-applications'),
  getIndustryApplications: () => api.get('/api/applications/industry/all'),
  updateStatus: (id, data) => api.put(`/api/applications/${id}/status`, data),
};

// Industry Endpoints
export const industryService = {
  getRankedCandidates: (params) => api.get('/api/industry/candidates', { params }),
  getDashboardStats: () => api.get('/api/industry/dashboard-stats'),
};

// Collaboration & Mentorship Endpoints
export const collabService = {
  getResearchProjects: () => api.get('/api/collaborations/research'),
  createResearchProject: (data) => api.post('/api/collaborations/research', data),
  getMentorships: () => api.get('/api/collaborations/mentorships'),
  requestMentorship: (data) => api.post('/api/collaborations/mentorships', data),
  updateMentorshipStatus: (id, status) => api.put(`/api/collaborations/mentorships/${id}/status?status_val=${status}`),
};

// Institution Endpoints
export const institutionService = {
  getAnalytics: () => api.get('/api/institution/analytics'),
  getStudents: (params) => api.get('/api/institution/students', { params }),
};

// Notification Endpoints
export const notificationService = {
  getNotifications: () => api.get('/api/notifications'),
  markAsRead: (id) => api.put(`/api/notifications/${id}/read`),
  markAllAsRead: () => api.put('/api/notifications/read-all'),
};

// Admin Endpoints
export const adminService = {
  getOverview: () => api.get('/api/admin/overview'),
  getUsers: () => api.get('/api/admin/users'),
  toggleUserActive: (id) => api.put(`/api/admin/users/${id}/toggle-active`),
  getSkills: () => api.get('/api/admin/skills'),
  addSkill: (data) => api.post('/api/admin/skills', null, { params: data }),
};

export default api;
