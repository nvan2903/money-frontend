import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import categoryService from '../../services/categoryService';

// Fetch all categories with optional type filter
export const fetchCategories = createAsyncThunk(
  'categories/fetchAll',
  async (type = null, { rejectWithValue }) => {
    try {
      const response = await categoryService.getCategories(type);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch categories');
    }
  }
);

// Fetch a single category
export const fetchCategory = createAsyncThunk(
  'categories/fetchOne',
  async (id, { rejectWithValue }) => {
    try {
      const response = await categoryService.getCategory(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch category');
    }
  }
);

// Add a new category
export const addCategory = createAsyncThunk(
  'categories/add',
  async (categoryData, { rejectWithValue }) => {
    try {
      const response = await categoryService.addCategory(categoryData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add category');
    }
  }
);

// Update a category
export const updateCategory = createAsyncThunk(
  'categories/update',
  async ({ id, categoryData }, { rejectWithValue }) => {
    try {
      const response = await categoryService.updateCategory(id, categoryData);
      return { ...response.data, id };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update category');
    }
  }
);

// Delete a category
export const deleteCategory = createAsyncThunk(
  'categories/delete',
  async (id, { rejectWithValue }) => {
    try {
      await categoryService.deleteCategory(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete category');
    }
  }
);

// Initial state
const initialState = {
  categories: [],
  category: null,
  incomeCategories: [],
  expenseCategories: [],
  loading: false,
  error: null,
  success: false,
  message: null
};

// Category slice
const categorySlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {
    clearCategoryError: (state) => {
      state.error = null;
    },
    clearCategoryMessage: (state) => {
      state.message = null;
      state.success = false;
    },
    resetCategoryState: (state) => {
      return initialState;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch all categories cases
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload;
        
        // Separate categories by type
        state.incomeCategories = action.payload.filter(cat => cat.type === 'income');
        state.expenseCategories = action.payload.filter(cat => cat.type === 'expense');
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch single category cases
      .addCase(fetchCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.category = action.payload;
      })
      .addCase(fetchCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Add category cases
      .addCase(addCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(addCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.message = 'Category added successfully!';
        
        // Add new category to appropriate list
        if (action.payload.category) {
          state.categories.push(action.payload.category);
          if (action.payload.category.type === 'income') {
            state.incomeCategories.push(action.payload.category);
          } else {
            state.expenseCategories.push(action.payload.category);
          }
        }
      })
      .addCase(addCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update category cases
      .addCase(updateCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.message = 'Category updated successfully!';
        
        // Update category in lists
        if (action.payload.category) {
          const { category } = action.payload;
          
          // Update in main categories list
          const index = state.categories.findIndex(cat => cat._id === category._id);
          if (index !== -1) {
            state.categories[index] = category;
          }
          
          // Update in type-specific lists
          if (category.type === 'income') {
            const incomeIndex = state.incomeCategories.findIndex(cat => cat._id === category._id);
            if (incomeIndex !== -1) {
              state.incomeCategories[incomeIndex] = category;
            } else {
              state.incomeCategories.push(category);
              state.expenseCategories = state.expenseCategories.filter(cat => cat._id !== category._id);
            }
          } else {
            const expenseIndex = state.expenseCategories.findIndex(cat => cat._id === category._id);
            if (expenseIndex !== -1) {
              state.expenseCategories[expenseIndex] = category;
            } else {
              state.expenseCategories.push(category);
              state.incomeCategories = state.incomeCategories.filter(cat => cat._id !== category._id);
            }
          }
        }
        
        state.category = null;
      })
      .addCase(updateCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Delete category cases
      .addCase(deleteCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.message = 'Category deleted successfully!';
        
        // Remove category from lists
        const categoryId = action.payload;
        state.categories = state.categories.filter(cat => cat._id !== categoryId);
        state.incomeCategories = state.incomeCategories.filter(cat => cat._id !== categoryId);
        state.expenseCategories = state.expenseCategories.filter(cat => cat._id !== categoryId);
      })
      .addCase(deleteCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const {
  clearCategoryError,
  clearCategoryMessage,
  resetCategoryState
} = categorySlice.actions;

export default categorySlice.reducer;