import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import transactionService from '../../services/transactionService';

// Fetch all transactions with optional filters
export const fetchTransactions = createAsyncThunk(
  'transactions/fetchAll',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const response = await transactionService.getTransactions(filters);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch transactions');
    }
  }
);

// Fetch a single transaction
export const fetchTransaction = createAsyncThunk(
  'transactions/fetchOne',
  async (id, { rejectWithValue }) => {
    try {
      const response = await transactionService.getTransaction(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch transaction');
    }
  }
);

// Add a new transaction
export const addTransaction = createAsyncThunk(
  'transactions/add',
  async (transactionData, { rejectWithValue }) => {
    try {
      const response = await transactionService.addTransaction(transactionData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add transaction');
    }
  }
);

// Update a transaction
export const updateTransaction = createAsyncThunk(
  'transactions/update',
  async ({ id, transactionData }, { rejectWithValue }) => {
    try {
      const response = await transactionService.updateTransaction(id, transactionData);
      return { ...response.data, id };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update transaction');
    }
  }
);

// Delete a transaction
export const deleteTransaction = createAsyncThunk(
  'transactions/delete',
  async (id, { rejectWithValue }) => {
    try {
      await transactionService.deleteTransaction(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete transaction');
    }
  }
);

// Export transactions
export const exportTransactions = createAsyncThunk(
  'transactions/export',
  async ({ format, filters = {} }, { rejectWithValue }) => {
    try {
      const response = await transactionService.exportTransactions(format, filters);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to export transactions');
    }
  }
);

// Fetch recent transactions for dashboard
export const fetchRecentTransactions = createAsyncThunk(
  'transactions/fetchRecent',
  async (limit = 5, { rejectWithValue }) => {
    try {
      const response = await transactionService.getTransactions({ per_page: limit, page: 1 });
      return response.data.transactions;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch recent transactions');
    }
  }
);

// Initial state
const initialState = {
  transactions: [],
  transaction: null,
  recentTransactions: [],
  total: 0,
  page: 1,
  pages: 1,
  perPage: 10,
  loading: false,
  error: null,
  success: false,
  message: null
};

// Transaction slice
const transactionSlice = createSlice({
  name: 'transactions',
  initialState,
  reducers: {
    clearTransactionError: (state) => {
      state.error = null;
    },
    clearTransactionMessage: (state) => {
      state.message = null;
      state.success = false;
    },
    setPage: (state, action) => {
      state.page = action.payload;
    },
    setPerPage: (state, action) => {
      state.perPage = action.payload;
    },
    resetTransactionState: (state) => {
      return initialState;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch all transactions cases
      .addCase(fetchTransactions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTransactions.fulfilled, (state, action) => {
        state.loading = false;
        state.transactions = action.payload.transactions;
        state.total = action.payload.total;
        state.page = action.payload.page;
        state.pages = action.payload.pages;
        state.perPage = action.payload.per_page;
      })
      .addCase(fetchTransactions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch single transaction cases
      .addCase(fetchTransaction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTransaction.fulfilled, (state, action) => {
        state.loading = false;
        state.transaction = action.payload;
      })
      .addCase(fetchTransaction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Add transaction cases
      .addCase(addTransaction.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(addTransaction.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.message = 'Transaction added successfully!';
      })
      .addCase(addTransaction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update transaction cases
      .addCase(updateTransaction.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateTransaction.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.message = 'Transaction updated successfully!';
        state.transaction = null;
      })
      .addCase(updateTransaction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Delete transaction cases
      .addCase(deleteTransaction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteTransaction.fulfilled, (state, action) => {
        state.loading = false;
        state.transactions = state.transactions.filter(
          (transaction) => transaction._id !== action.payload
        );
        state.message = 'Transaction deleted successfully!';
      })
      .addCase(deleteTransaction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch recent transactions cases
      .addCase(fetchRecentTransactions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRecentTransactions.fulfilled, (state, action) => {
        state.loading = false;
        state.recentTransactions = action.payload;
      })
      .addCase(fetchRecentTransactions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Export transactions cases
      .addCase(exportTransactions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(exportTransactions.fulfilled, (state, action) => {
        state.loading = false;
        state.message = 'Transactions exported successfully!';
      })
      .addCase(exportTransactions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const {
  clearTransactionError,
  clearTransactionMessage,
  setPage,
  setPerPage,
  resetTransactionState
} = transactionSlice.actions;

export default transactionSlice.reducer;