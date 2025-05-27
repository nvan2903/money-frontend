import apiClient from './api';

// Category related services
const categoryService = {
  // Get all categories with optional type filter
  getCategories: (type = null) => {
    const params = type ? { type } : {};
    return apiClient.get('/categories/', { params });
  },
  
  // Get a specific category
  getCategory: (id) => {
    return apiClient.get(`/categories/${id}/`);
  },
    // Add a new category
  addCategory: (categoryData) => {
    return apiClient.post('/categories/', categoryData);
  },
  
  // Update a category
  updateCategory: (id, categoryData) => {
    return apiClient.put(`/categories/${id}/`, categoryData);
  },
  
  // Delete a category
  deleteCategory: (id) => {
    return apiClient.delete(`/categories/${id}/`);
  }
};

export default categoryService;
