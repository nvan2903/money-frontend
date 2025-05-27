import apiClient from './api';

// Authentication related services
const authService = {  // Register a new user
  register: (userData) => {
    return apiClient.post('/auth/register/', userData);
  },
  
  // Login a user
  login: (credentials) => {
    return apiClient.post('/auth/login/', credentials);
  },
  
  // Request password reset
  forgotPassword: (email) => {
    return apiClient.post('/auth/forgot-password/', { email });
  },
    // Reset password with token
  resetPassword: (token, password) => {
    return apiClient.post('/auth/reset-password/', { token, password });
  },

  // Verify email with token
  verifyEmail: (token) => {
    return apiClient.get(`/auth/verify-email?token=${token}`);
  },

  // Resend verification email
  resendVerification: (email) => {
    return apiClient.post('/auth/resend-verification/', { email });
  },
  
  // Store user data in local storage
  setUserData: (token, user) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  },
  
  // Get current user from local storage
  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      return JSON.parse(userStr);
    }
    return null;
  },
  
  // Check if user is logged in
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },
  
  // Check if user is admin
  isAdmin: () => {
    const user = authService.getCurrentUser();
    return user && user.role === 'admin';
  },
  
  // Logout user
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
};

export default authService;
export { authService };
