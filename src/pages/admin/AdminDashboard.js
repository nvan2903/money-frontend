import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box, Typography, Grid, Card, CardContent, Paper,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Chip, CircularProgress, useTheme, IconButton, Tooltip,
  LinearProgress, Avatar, Stack
} from '@mui/material';
import {
  People as UsersIcon,
  Receipt as TransactionsIcon,
  TrendingUp as IncomeIcon,
  TrendingDown as ExpenseIcon,
  AccountBalance as BalanceIcon,
  Refresh as RefreshIcon,
  Analytics as AnalyticsIcon,
  Category as CategoryIcon,
  StarRate as StarIcon
} from '@mui/icons-material';
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { fetchSystemStats } from '../../store/slices/adminSlice';
import { formatCurrency } from '../../utils/formatCurrency';

const AdminDashboard = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const { systemStats, loading, error } = useSelector(state => state.admin);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  useEffect(() => {
    dispatch(fetchSystemStats());
  }, [dispatch]);

  const handleRefresh = () => {
    dispatch(fetchSystemStats());
    setLastRefresh(new Date());
  };

  // Color palette for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  // Prepare chart data
  const categoryData = systemStats?.category_distribution?.map((item, index) => ({
    name: item.category_name || 'Uncategorized',
    value: item.total_amount,
    count: item.transaction_count,
    fill: COLORS[index % COLORS.length]
  })) || [];

  const monthlyTrends = systemStats?.monthly_trends?.map(item => ({
    month: new Date(item._id.year, item._id.month - 1).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
    income: item.total_income || 0,
    expense: item.total_expense || 0,
    transactions: item.transaction_count || 0
  })) || [];

  // Loading state
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Error state
  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">Error loading dashboard: {error}</Typography>
      </Box>
    );
  }

  const stats = systemStats || {};
  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Bảng điều khiển quản trị
        </Typography>
        <Stack direction="row" spacing={2} alignItems="center">
          <Typography variant="body2" color="text.secondary">
            Cập nhật lần cuối: {lastRefresh.toLocaleTimeString()}
          </Typography>
          <Tooltip title="Làm mới dữ liệu">
            <IconButton onClick={handleRefresh} disabled={loading}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Stack>
      </Box>
      
      {/* System Overview */}
      <Grid container spacing={3} sx={{ mb: 4 }}>        <Grid item xs={12} sm={6} md={2.4}>
          <Card raised sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h6" component="div">
                    Tổng số người dùng
                  </Typography>
                  <Typography variant="h4" component="div" sx={{ mt: 1 }}>
                    {stats.user_count || 0}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    Đang hoạt động: {stats.active_users || 0}
                  </Typography>
                </Box>
                <UsersIcon sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={2.4}>
          <Card raised sx={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h6" component="div">
                    Giao dịch
                  </Typography>
                  <Typography variant="h4" component="div" sx={{ mt: 1 }}>
                    {stats.transaction_count || 0}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    Tháng này
                  </Typography>
                </Box>
                <TransactionsIcon sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <Card raised sx={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h6" component="div">
                    Tổng thu nhập
                  </Typography>
                  <Typography variant="h4" component="div" sx={{ mt: 1 }}>
                    {formatCurrency(stats.total_income || 0)}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    +{((stats.total_income || 0) / (stats.transaction_count || 1) * 100).toFixed(1)}% avg
                  </Typography>
                </Box>
                <IncomeIcon sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
          <Card raised sx={{ background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h6" component="div">
                    Tổng chi tiêu
                  </Typography>
                  <Typography variant="h4" component="div" sx={{ mt: 1 }}>
                    {formatCurrency(stats.total_expense || 0)}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    Avg: {formatCurrency((stats.total_expense || 0) / (stats.transaction_count || 1))}
                  </Typography>
                </Box>
                <ExpenseIcon sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <Card raised sx={{ background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)', color: 'text.primary' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h6" component="div">
                    Số dư ròng
                  </Typography>
                  <Typography 
                    variant="h4" 
                    component="div" 
                    sx={{ 
                      mt: 1,
                      color: ((stats.total_income || 0) - (stats.total_expense || 0)) >= 0 ? 'success.main' : 'error.main'
                    }}
                  >
                    {formatCurrency((stats.total_income || 0) - (stats.total_expense || 0))}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    {((stats.total_income || 0) - (stats.total_expense || 0)) >= 0 ? 'Lợi nhuận' : 'Thua lỗ'}
                  </Typography>
                </Box>
                <BalanceIcon sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>      <Grid container spacing={3}>
        {/* Enhanced Analytics Section */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, mb: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <AnalyticsIcon sx={{ mr: 2, fontSize: 32 }} />
              <Typography variant="h5">
                Phân tích nâng cao
              </Typography>
            </Box>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
                    {((stats.total_income || 0) / ((stats.total_income || 0) + (stats.total_expense || 0)) * 100).toFixed(1)}%
                  </Typography>
                  <Typography variant="body2">Tỉ lệ thu nhập</Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
                    {formatCurrency((stats.total_income || 0) + (stats.total_expense || 0) / (stats.transaction_count || 1))}
                  </Typography>
                  <Typography variant="body2">Giao dịch trung bình</Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
                    {stats.active_categories || 0}
                  </Typography>
                  <Typography variant="body2">Danh mục đang hoạt động</Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
                    {((stats.active_users || 0) / (stats.user_count || 1) * 100).toFixed(1)}%
                  </Typography>
                  <Typography variant="body2">Hoạt động người dùng</Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Enhanced Top Spenders */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: 500 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
                <StarIcon sx={{ mr: 1, color: 'warning.main' }} />
                Top Spenders
              </Typography>
              <Chip label={`${stats.high_spenders?.length || 0} users`} size="small" color="primary" />
            </Box>
            {stats.high_spenders && stats.high_spenders.length > 0 ? (
              <TableContainer sx={{ maxHeight: 400 }}>
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell>Rank</TableCell>
                      <TableCell>User</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell align="right">Total Spent</TableCell>
                      <TableCell align="center">Activity</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {stats.high_spenders.map((spender, index) => (
                      <TableRow key={index} hover>
                        <TableCell>
                          <Avatar 
                            sx={{ 
                              width: 24, 
                              height: 24, 
                              bgcolor: index < 3 ? 'warning.main' : 'grey.400',
                              fontSize: '0.875rem'
                            }}
                          >
                            {index + 1}
                          </Avatar>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight="medium">
                            {spender.user_info?.username || 'N/A'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {spender.user_info?.email || 'N/A'}
                          </Typography>
                        </TableCell>                        <TableCell align="right">
                          <Chip 
                            label={formatCurrency(spender.total_expense || 0)}
                            color={index < 3 ? "error" : "default"}
                            variant={index < 3 ? "filled" : "outlined"}
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="center">
                          <LinearProgress 
                            variant="determinate" 
                            value={Math.min((spender.total_expense / Math.max(...stats.high_spenders.map(s => s.total_expense))) * 100, 100)}
                            sx={{ width: 60, height: 6, borderRadius: 3 }}
                            color={index < 3 ? "error" : "primary"}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
                <Typography variant="body1" color="text.secondary">
                  Không có dữ liệu chi tiêu
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>        {/* Enhanced Category Distribution & Monthly Trends */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: 500 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
                <CategoryIcon sx={{ mr: 1, color: 'primary.main' }} />
                Phân phối danh mục
              </Typography>
              <Chip label={`${categoryData.length} categories`} size="small" color="primary" />
            </Box>
            <ResponsiveContainer width="100%" height="90%">
              <PieChart>
                <Pie
                  data={categoryData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={120}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                  labelLine={false}
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>                <RechartsTooltip 
                  formatter={(value, name) => [
                    formatCurrency(value),
                    name
                  ]}
                  labelFormatter={(label) => `Category: ${label}`}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Monthly Trends Chart */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" gutterBottom>
              Phân tích xu hướng hàng tháng
            </Typography>
            {monthlyTrends.length > 0 ? (
              <ResponsiveContainer width="100%" height="90%">
                <BarChart data={monthlyTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />                  <RechartsTooltip 
                    formatter={(value, name) => [
                      formatCurrency(value),
                      name === 'income' ? 'Income' : name === 'expense' ? 'Expense' : 'Transactions'
                    ]}
                  />
                  <Legend />
                  <Bar 
                    dataKey="income" 
                    fill={theme.palette.success.main} 
                    name="Income"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar 
                    dataKey="expense" 
                    fill={theme.palette.error.main} 
                    name="Expense"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
                <Typography variant="body1" color="text.secondary">
                  Không có dữ liệu xu hướng hàng tháng
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminDashboard;
