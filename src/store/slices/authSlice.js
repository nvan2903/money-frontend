import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import authService from '../../services/authService';

// Async thunk for user registration
export const register = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await authService.register(userData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Registration failed');
    }
  }
);

// Async thunk for user login
export const login = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await authService.login(credentials);
      
      // Store token and user data in local storage
      authService.setUserData(response.data.token, response.data.user);
      
      return response.data;
    } catch (error) {
      const errorData = error.response?.data;
      
      // If error is about email verification, include additional info
      if (errorData?.email_verification_required) {
        return rejectWithValue({
          message: errorData.message || 'Email verification required',
          emailVerificationRequired: true,
          email: errorData.email || credentials.username
        });
      }
      
      return rejectWithValue(errorData?.message || 'Login failed');
    }
  }
);

// Async thunk for password reset request
export const forgotPassword = createAsyncThunk(
  'auth/forgotPassword',
  async (email, { rejectWithValue }) => {
    try {
      const response = await authService.forgotPassword(email);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Password reset request failed');
    }
  }
);

// Async thunk for resending verification email
export const resendVerification = createAsyncThunk(
  'auth/resendVerification',
  async (email, { rejectWithValue }) => {
    try {
      const response = await authService.resendVerification(email);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to resend verification email');
    }
  }
);

// Async thunk for password reset
export const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async ({ token, password }, { rejectWithValue }) => {
    try {
      const response = await authService.resetPassword(token, password);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Password reset failed');
    }
  }
);

// Initial state
const initialState = {
  user: authService.getCurrentUser(),
  token: localStorage.getItem('token'),
  isAuthenticated: authService.isAuthenticated(),
  isAdmin: authService.isAdmin(),
  loading: false,
  error: null,
  message: null,
  emailVerificationRequired: false,
  unverifiedEmail: null
};

// Auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      authService.logout();
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.isAdmin = false;
    },    clearError: (state) => {
      state.error = null;
      state.emailVerificationRequired = false;
    },
    clearMessage: (state) => {
      state.message = null;
    },
    setEmailVerificationRequired: (state, action) => {
      state.emailVerificationRequired = true;
      state.unverifiedEmail = action.payload;
    },
    clearEmailVerificationRequired: (state) => {
      state.emailVerificationRequired = false;
      state.unverifiedEmail = null;
    }
  },  extraReducers: (builder) => {
    builder
      // Register cases
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.message = 'Registration successful! Please login.';
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Login cases
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.isAdmin = action.payload.user.role === 'admin';
        state.message = 'Login successful!';
      })      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        
        // Handle email verification required case
        if (typeof action.payload === 'object' && action.payload.emailVerificationRequired) {
          state.error = action.payload.message;
          state.emailVerificationRequired = true;
          state.unverifiedEmail = action.payload.email;
        } else {
          state.error = action.payload;
        }
      })
      
      // Forgot password cases
      .addCase(forgotPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(forgotPassword.fulfilled, (state, action) => {
        state.loading = false;
        state.message = 'Password reset link sent to your email!';
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Resend verification cases
      .addCase(resendVerification.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resendVerification.fulfilled, (state, action) => {
        state.loading = false;
        state.message = 'Verification email sent successfully!';
        state.emailVerificationRequired = false;
      })
      .addCase(resendVerification.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Reset password cases
      .addCase(resetPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resetPassword.fulfilled, (state, action) => {
        state.loading = false;
        state.message = 'Password reset successful! Please login.';
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { 
  logout, 
  clearError, 
  clearMessage, 
  setEmailVerificationRequired, 
  clearEmailVerificationRequired 
} = authSlice.actions;

export default authSlice.reducer;