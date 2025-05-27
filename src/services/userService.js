import apiClient from './api';

// User profile related services
const userService = {  // Get current user profile
  getProfile: () => {
    return apiClient.get('/user/profile/');
  },
  
  // Update user profile
  updateProfile: (profileData) => {
    return apiClient.put('/user/profile/', profileData);
  },
  
  // Change password
  changePassword: (passwordData) => {
    return apiClient.put('/user/change-password/', passwordData);
  },
  
  // Delete account
  deleteAccount: (password) => {
    return apiClient.delete('/user/delete-account/', { 
      data: { password } 
    });
  },
  
  // Get user dashboard statistics
  getDashboardStats: (range = 'month') => {
    return apiClient.get(`/user/dashboard/?range=${range}`);
  }
};

export default userService;
