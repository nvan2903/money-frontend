import apiClient from './api';

// Admin related services
const adminService = {  // Get all users with pagination and search
  getUsers: (page = 1, perPage = 10, search = '') => {
    return apiClient.get('/admin/users/', { 
      params: { page, per_page: perPage, search } 
    });
  },
  
  // Get a specific user
  getUser: (userId) => {
    return apiClient.get(`/admin/users/${userId}/`);
  },
  
  // Toggle user active status
  toggleUserStatus: (userId) => {
    return apiClient.put(`/admin/users/${userId}/toggle-status/`);
  },
  
  // Delete a user
  deleteUser: (userId) => {
    return apiClient.delete(`/admin/users/${userId}/`);
  },
  
  // Get all transactions with filters
  getAllTransactions: (filters = {}) => {
    return apiClient.get('/admin/transactions/', { params: filters });
  },
    // Get system statistics
  getSystemStats: () => {
    return apiClient.get('/admin/stats/');
  },

  // Get user statistics (admin access to any user)
  getUserStatistics: (userId, filters = {}) => {
    return apiClient.get(`/admin/users/${userId}/statistics`, { params: filters });
  }
};

export default adminService;
