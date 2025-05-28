import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import adminService from '../../services/adminService';

// Fetch all users
export const fetchUsers = createAsyncThunk(
  'admin/fetchUsers',
  async ({ page = 1, perPage = 10, search = '' }, { rejectWithValue }) => {
    try {
      const response = await adminService.getUsers(page, perPage, search);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch users');
    }
  }
);

// Fetch a single user
export const fetchUser = createAsyncThunk(
  'admin/fetchUser',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await adminService.getUser(userId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch user');
    }
  }
);

// Toggle user status
export const toggleUserStatus = createAsyncThunk(
  'admin/toggleUserStatus',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await adminService.toggleUserStatus(userId);
      return { userId, is_active: response.data.is_active };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to toggle user status');
    }
  }
);

// Delete a user
export const deleteUser = createAsyncThunk(
  'admin/deleteUser',
  async (userId, { rejectWithValue }) => {
    try {
      await adminService.deleteUser(userId);
      return userId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete user');
    }
  }
);

// Fetch all transactions (admin view)
export const fetchAllTransactions = createAsyncThunk(
  'admin/fetchTransactions',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const response = await adminService.getAllTransactions(filters);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch transactions');
    }
  }
);

// Fetch system stats
export const fetchSystemStats = createAsyncThunk(
  'admin/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await adminService.getSystemStats();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch system statistics');
    }
  }
);

// Fetch user statistics (admin access to any user)
export const fetchUserStatistics = createAsyncThunk(
  'admin/fetchUserStatistics',
  async ({ userId, filters = {} }, { rejectWithValue }) => {
    try {
      const response = await adminService.getUserStatistics(userId, filters);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch user statistics');
    }
  }
);

// Initial state
const initialState = {
  users: [],
  user: null,
  userStatistics: null,
  transactions: [],
  systemStats: {
    user_count: 0,
    transaction_count: 0,
    total_income: 0,
    total_expense: 0,
    balance: 0,
    high_spenders: []
  },
  total: 0,
  page: 1,
  pages: 1,
  perPage: 10,
  loading: false,
  error: null,
  success: false,
  message: null
};

// Admin slice
const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    clearAdminError: (state) => {
      state.error = null;
    },
    clearAdminMessage: (state) => {
      state.message = null;
      state.success = false;
    },
    setPage: (state, action) => {
      state.page = action.payload;
    },
    setPerPage: (state, action) => {
      state.perPage = action.payload;
    },
    resetAdminState: (state) => {
      return initialState;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch users cases
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload.users;
        state.total = action.payload.total;
        state.page = action.payload.page;
        state.pages = action.payload.pages;
        state.perPage = action.payload.per_page;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch single user cases
      .addCase(fetchUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(fetchUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Toggle user status cases
      .addCase(toggleUserStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(toggleUserStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        
        // Update user status in list
        const { userId, is_active } = action.payload;
        const userIndex = state.users.findIndex(user => user._id === userId);
        if (userIndex !== -1) {
          state.users[userIndex].is_active = is_active;
        }
        
        // Update selected user if it's the same
        if (state.user && state.user._id === userId) {
          state.user.is_active = is_active;
        }
        
        state.message = `User ${is_active ? 'activated' : 'deactivated'} successfully!`;
      })
      .addCase(toggleUserStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Delete user cases
      .addCase(deleteUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.loading = false;
        state.users = state.users.filter(user => user._id !== action.payload);
        state.message = 'User deleted successfully!';
        
        if (state.user && state.user._id === action.payload) {
          state.user = null;
        }
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch all transactions cases (admin view)
      .addCase(fetchAllTransactions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllTransactions.fulfilled, (state, action) => {
        state.loading = false;
        state.transactions = action.payload.transactions;
        state.total = action.payload.total;
        state.page = action.payload.page;
        state.pages = action.payload.pages;
        state.perPage = action.payload.per_page;
      })
      .addCase(fetchAllTransactions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
        // Fetch system stats cases
      .addCase(fetchSystemStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSystemStats.fulfilled, (state, action) => {
        state.loading = false;
        state.systemStats = action.payload;
      })
      .addCase(fetchSystemStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch user statistics cases
      .addCase(fetchUserStatistics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserStatistics.fulfilled, (state, action) => {
        state.loading = false;
        state.userStatistics = action.payload;
      })
      .addCase(fetchUserStatistics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const {
  clearAdminError,
  clearAdminMessage,
  setPage,
  setPerPage,
  resetAdminState
} = adminSlice.actions;

export default adminSlice.reducer;