import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchRecentTransactions } from '../../store/slices/transactionSlice';
import { fetchCategories } from '../../store/slices/categorySlice';
import { 
  Grid, Paper, Typography, Box, Divider, Card, CardContent,
  List, ListItem, ListItemText,
  CircularProgress, Button, useTheme
} from '@mui/material';
import {
  TrendingUp as IncomeIcon,
  TrendingDown as ExpenseIcon,
  AccountBalance as BalanceIcon
} from '@mui/icons-material';

// Chart components
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const Dashboard = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const { recentTransactions, loading: transactionLoading } = useSelector(state => state.transactions);
  const { loading: categoryLoading } = useSelector(state => state.categories);

  const [summary, setSummary] = useState({
    totalIncome: 0,
    totalExpense: 0,
    balance: 0
  });

  const [expenseByCategory, setExpenseByCategory] = useState([]);
  
  useEffect(() => {
    dispatch(fetchRecentTransactions(5));
    dispatch(fetchCategories());
  }, [dispatch]);
  // Calculate summary and expense by category when transactions or categories change
  useEffect(() => {
    if (recentTransactions.length > 0) {
      const totalIncome = recentTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
      
      const totalExpense = recentTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
      
      setSummary({
        totalIncome,
        totalExpense,
        balance: totalIncome - totalExpense
      });

      // Group expenses by category
      const expensesByCategory = recentTransactions
        .filter(t => t.type === 'expense')
        .reduce((acc, t) => {
          const catId = t.category_id;
          if (!acc[catId]) {
            acc[catId] = {
              name: t.category_name,
              value: 0
            };
          }
          acc[catId].value += t.amount;
          return acc;
        }, {});
        setExpenseByCategory(Object.values(expensesByCategory));
    }
  }, [recentTransactions]);

  // Chart colors
  const COLORS = [
    theme.palette.primary.main,
    theme.palette.secondary.main,
    theme.palette.error.main,
    theme.palette.warning.main,
    theme.palette.info.main,
    theme.palette.success.main,
    // Add more colors if needed
  ];

  // Loading indicator
  if (transactionLoading || categoryLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      
      {/* Financial Summary */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <Card raised>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <BalanceIcon sx={{ color: 'text.secondary', mr: 1 }} />
                <Typography variant="h6" component="div">
                  Balance
                </Typography>
              </Box>
              <Typography variant="h4" component="div" sx={{ mt: 2 }}>
                ${summary.balance.toFixed(2)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={4}>
          <Card raised>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <IncomeIcon sx={{ color: 'success.main', mr: 1 }} />
                <Typography variant="h6" component="div">
                  Income
                </Typography>
              </Box>
              <Typography variant="h4" component="div" sx={{ mt: 2, color: 'success.main' }}>
                ${summary.totalIncome.toFixed(2)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={4}>
          <Card raised>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <ExpenseIcon sx={{ color: 'error.main', mr: 1 }} />
                <Typography variant="h6" component="div">
                  Expense
                </Typography>
              </Box>
              <Typography variant="h4" component="div" sx={{ mt: 2, color: 'error.main' }}>
                ${summary.totalExpense.toFixed(2)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      <Grid container spacing={3}>
        {/* Expense Breakdown Chart */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: 300 }}>
            <Typography variant="h6" gutterBottom>
              Expense Breakdown
            </Typography>
            {expenseByCategory.length > 0 ? (
              <ResponsiveContainer width="100%" height="90%">
                <PieChart>
                  <Pie
                    data={expenseByCategory}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill={theme.palette.primary.main}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {expenseByCategory.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80%' }}>
                <Typography variant="body1" color="text.secondary">
                  No expense data available
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
        
        {/* Recent Transactions */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: 300, overflow: 'auto' }}>
            <Typography variant="h6" gutterBottom>
              Recent Transactions
            </Typography>
            {recentTransactions.length > 0 ? (
              <List>
                {recentTransactions.map((transaction) => (
                  <React.Fragment key={transaction._id}>
                    <ListItem alignItems="flex-start">
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography component="span">
                              {transaction.category_name}
                            </Typography>
                            <Typography 
                              component="span" 
                              sx={{ 
                                color: transaction.type === 'income' ? 'success.main' : 'error.main',
                                fontWeight: 'bold'
                              }}
                            >
                              {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)}
                            </Typography>
                          </Box>
                        }
                        secondary={
                          <React.Fragment>
                            <Typography
                              component="span"
                              variant="body2"
                              color="text.primary"
                            >
                              {new Date(transaction.date).toLocaleDateString()}
                            </Typography>
                            {transaction.note && ` — ${transaction.note}`}
                          </React.Fragment>
                        }
                      />
                    </ListItem>
                    <Divider component="li" />
                  </React.Fragment>
                ))}
              </List>
            ) : (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80%' }}>
                <Typography variant="body1" color="text.secondary">
                  No recent transactions
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
        
        {/* Call to Action */}
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
            <Button 
              variant="contained" 
              color="primary" 
              size="large"
              onClick={() => window.location.href = '/transactions/add'}
            >
              Add New Transaction
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;