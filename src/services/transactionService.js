import apiClient from './api';

// Transaction related services
const transactionService = {
  // Get all transactions with optional filters
  getTransactions: (filters = {}) => {
    return apiClient.get('/transactions/', { params: filters });
  },
  
  // Get a specific transaction
  getTransaction: (id) => {
    return apiClient.get(`/transactions/${id}/`);
  },
    // Add a new transaction
  addTransaction: (transactionData) => {
    return apiClient.post('/transactions/', transactionData);
  },
  
  // Update a transaction
  updateTransaction: (id, transactionData) => {
    return apiClient.put(`/transactions/${id}/`, transactionData);
  },
  
  // Delete a transaction
  deleteTransaction: (id) => {
    return apiClient.delete(`/transactions/${id}/`);
  },
    // Export transactions
  exportTransactions: (format, filters = {}) => {
    return apiClient.get('/transactions/export/', { 
      params: { format, ...filters },
      responseType: 'blob' // Important for file downloads
    });
  }
};

export default transactionService;
