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
import { formatCurrency } from '../../utils/formatCurrency';

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
        Bảng điều khiển
      </Typography>
      
      {/* Financial Summary */}
      <Grid container spacing={3} sx={{ mb: 4, width: '100%' }} wrap="nowrap">
        <Grid item xs={12} md={4} sx={{ flex: 1, minWidth: 0 }}>
          <Card raised sx={{ width: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <BalanceIcon sx={{ color: 'text.secondary', mr: 1 }} />
                <Typography variant="h6" component="div">
                  Số dư
                </Typography>
              </Box>
              <Typography variant="h4" component="div" sx={{ mt: 2, wordBreak: 'break-all' }}>
                {formatCurrency(summary.balance)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4} sx={{ flex: 1, minWidth: 0 }}>
          <Card raised sx={{ width: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <IncomeIcon sx={{ color: 'success.main', mr: 1 }} />
                <Typography variant="h6" component="div">
                  Thu nhập
                </Typography>
              </Box>
              <Typography variant="h4" component="div" sx={{ mt: 2, color: 'success.main', wordBreak: 'break-all' }}>
                {formatCurrency(summary.totalIncome)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4} sx={{ flex: 1, minWidth: 0 }}>
          <Card raised sx={{ width: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <ExpenseIcon sx={{ color: 'error.main', mr: 1 }} />
                <Typography variant="h6" component="div">
                  Chi tiêu
                </Typography>
              </Box>
              <Typography variant="h4" component="div" sx={{ mt: 2, color: 'error.main', wordBreak: 'break-all' }}>
                {formatCurrency(summary.totalExpense)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

            {/* Hàng thứ 2: Nút thêm giao dịch mới căn giữa */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Button 
              variant="contained" 
              color="primary" 
              size="large"
              onClick={() => window.location.href = '/transactions/add'}
            >
              Thêm giao dịch mới
            </Button>
          </Box>
        </Grid>
      </Grid>
      
      <Grid container spacing={3} sx={{ width: '100%' }}>
        {/* Expense Breakdown Chart */}
        <Grid item xs={12} md={6} sx={{ flex: 1, minWidth: 0 }}>
          <Paper sx={{ p: 2, height: 400, width: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Phân tích chi tiêu
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
                    outerRadius={100}
                    fill={theme.palette.primary.main}
                    label={({ name, percent, value }) => `${name}: ${(percent * 100).toFixed(0)}% (${formatCurrency(value)})`}
                  >
                    {expenseByCategory.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80%' }}>
                <Typography variant="body1" color="text.secondary">
                  Không có dữ liệu chi tiêu
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
        
        {/* Recent Transactions */}
        <Grid item xs={12} md={6} sx={{ flex: 1, minWidth: 0 }}>
          <Paper sx={{ p: 2, height: 400, width: '100%', overflow: 'auto' }}>
            <Typography variant="h6" gutterBottom>
              Giao dịch gần đây
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
                                fontWeight: 'bold',
                                wordBreak: 'break-all',
                                minWidth: 100,
                                textAlign: 'right'
                              }}
                            >
                              {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
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
                  Không có giao dịch gần đây
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;