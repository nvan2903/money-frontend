import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box, Typography, Paper, Grid, Card, CardContent, Button,
  FormControl, InputLabel, Select, MenuItem, Stack,
  CircularProgress, Alert, useTheme
} from '@mui/material';
import {
  TrendingUp as IncomeIcon,
  TrendingDown as ExpenseIcon,
  AccountBalance as BalanceIcon,
  PictureAsPdf as PdfIcon,
  TableChart as ExcelIcon,
  Description as CsvIcon
} from '@mui/icons-material';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area
} from 'recharts';
import { fetchTransactions } from '../../store/slices/transactionSlice';
import { fetchCategories } from '../../store/slices/categorySlice';
import { formatCurrency } from '../../utils/formatCurrency';

const Reports = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const { transactions, loading } = useSelector(state => state.transactions);
  const { categories } = useSelector(state => state.categories);

  const [timeRange, setTimeRange] = useState('last6months');
  const [reportType, setReportType] = useState('overview');
  const [chartData, setChartData] = useState({
    monthlyData: [],
    categoryData: [],
    incomeVsExpense: [],
    dailyTrend: []
  });

  // Load data on component mount
  useEffect(() => {
    dispatch(fetchCategories());
    loadReportData();
  }, [dispatch, timeRange]);

  const loadReportData = () => {
    // Calculate date range based on selection
    const endDate = new Date();
    const startDate = new Date();
    
    switch (timeRange) {
      case 'last30days':
        startDate.setDate(endDate.getDate() - 30);
        break;
      case 'last3months':
        startDate.setMonth(endDate.getMonth() - 3);
        break;
      case 'last6months':
        startDate.setMonth(endDate.getMonth() - 6);
        break;
      case 'lastyear':
        startDate.setFullYear(endDate.getFullYear() - 1);
        break;
      default:
        startDate.setMonth(endDate.getMonth() - 6);
    }

    // Fetch transactions with date range
    dispatch(fetchTransactions({
      date_from: startDate.toISOString().split('T')[0],
      date_to: endDate.toISOString().split('T')[0],
      per_page: 1000 // Get all transactions in range
    }));
  };

  // Process data for charts
  useEffect(() => {
    if (transactions && transactions.length > 0) {
      processChartData();
    }
  }, [transactions, categories]);

  const processChartData = () => {
    // Monthly summary data
    const monthlyMap = {};
    const categoryMap = {};
    const dailyMap = {};

    transactions.forEach(transaction => {
      const date = new Date(transaction.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const dayKey = date.toISOString().split('T')[0];
      
      // Monthly data
      if (!monthlyMap[monthKey]) {
        monthlyMap[monthKey] = { month: monthKey, income: 0, expense: 0, net: 0 };
      }
      
      if (transaction.type === 'income') {
        monthlyMap[monthKey].income += transaction.amount;
      } else {
        monthlyMap[monthKey].expense += transaction.amount;
      }
      monthlyMap[monthKey].net = monthlyMap[monthKey].income - monthlyMap[monthKey].expense;

      // Category data (expenses only)
      if (transaction.type === 'expense') {
        const categoryName = transaction.category_name || 'Uncategorized';
        categoryMap[categoryName] = (categoryMap[categoryName] || 0) + transaction.amount;
      }

      // Daily trend
      if (!dailyMap[dayKey]) {
        dailyMap[dayKey] = { date: dayKey, income: 0, expense: 0, net: 0 };
      }
      
      if (transaction.type === 'income') {
        dailyMap[dayKey].income += transaction.amount;
      } else {
        dailyMap[dayKey].expense += transaction.amount;
      }
      dailyMap[dayKey].net = dailyMap[dayKey].income - dailyMap[dayKey].expense;
    });

    // Convert to arrays and sort
    const monthlyData = Object.values(monthlyMap).sort((a, b) => a.month.localeCompare(b.month));
    const categoryData = Object.entries(categoryMap).map(([name, value]) => ({
      name,
      value,
      percentage: ((value / Object.values(categoryMap).reduce((a, b) => a + b, 0)) * 100).toFixed(1)
    })).sort((a, b) => b.value - a.value);

    const dailyTrend = Object.values(dailyMap).sort((a, b) => a.date.localeCompare(b.date));

    // Income vs Expense summary
    const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const incomeVsExpense = [
      { name: 'Income', value: totalIncome, color: theme.palette.success.main },
      { name: 'Expense', value: totalExpense, color: theme.palette.error.main }
    ];

    setChartData({
      monthlyData,
      categoryData,
      incomeVsExpense,
      dailyTrend
    });
  };
  const handleExportReport = (format) => {
    if (!transactions || transactions.length === 0) {
      alert('No data available to export');
      return;
    }

    if (format === 'csv') {
      exportToCSV();
    } else if (format === 'excel') {
      alert('Excel export will be implemented with backend integration');
    } else if (format === 'pdf') {
      alert('PDF export will be implemented with backend integration');
    }
  };

  const exportToCSV = () => {
    const reportData = generateReportData();
    let csvContent = `Financial Report - ${timeRange}\n`;
    csvContent += `Generated on: ${new Date().toLocaleDateString()}\n\n`;
    
    // Summary
    csvContent += "Summary\n";
    csvContent += `Total Income,${reportData.summary.totalIncome}\n`;
    csvContent += `Total Expense,${reportData.summary.totalExpense}\n`;
    csvContent += `Net Balance,${reportData.summary.balance}\n`;
    csvContent += `Number of Transactions,${reportData.summary.transactionCount}\n\n`;
    
    // Monthly breakdown
    csvContent += "Monthly Breakdown\n";
    csvContent += "Month,Income,Expense,Net\n";
    chartData.monthlyData.forEach(item => {
      csvContent += `${item.month},${item.income},${item.expense},${item.net}\n`;
    });
    csvContent += "\n";
    
    // Category breakdown
    csvContent += "Category Breakdown (Expenses)\n";
    csvContent += "Category,Amount,Percentage\n";
    chartData.categoryData.forEach(item => {
      const percentage = ((item.value / reportData.summary.totalExpense) * 100).toFixed(1);
      csvContent += `${item.name},${item.value},${percentage}%\n`;
    });
    csvContent += "\n";
    
    // Transactions
    csvContent += "Transactions\n";
    csvContent += "Date,Category,Type,Amount,Note\n";
    transactions.forEach(transaction => {
      const date = new Date(transaction.date).toLocaleDateString();
      const note = (transaction.note || '').replace(/,/g, ';'); // Replace commas to avoid CSV issues
      csvContent += `${date},${transaction.category_name},${transaction.type},${transaction.amount},"${note}"\n`;
    });
    
    // Download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `financial_report_${timeRange}_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const generateReportData = () => {
    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpense = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    return {
      summary: {
        totalIncome,
        totalExpense,
        balance: totalIncome - totalExpense,
        transactionCount: transactions.length
      }
    };
  };

  const COLORS = [
    theme.palette.primary.main,
    theme.palette.secondary.main,
    theme.palette.error.main,
    theme.palette.warning.main,
    theme.palette.info.main,
    theme.palette.success.main,
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD'
  ];

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Báo cáo & Phân tích tài chính
      </Typography>

      {/* Controls */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Khoảng thời gian</InputLabel>
              <Select
                value={timeRange}
                label="Khoảng thời gian"
                onChange={(e) => setTimeRange(e.target.value)}
              >
                <MenuItem value="last30days">30 ngày gần nhất</MenuItem>
                <MenuItem value="last3months">3 tháng gần nhất</MenuItem>
                <MenuItem value="last6months">6 tháng gần nhất</MenuItem>
                <MenuItem value="lastyear">Năm vừa qua</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Loại báo cáo</InputLabel>
              <Select
                value={reportType}
                label="Loại báo cáo"
                onChange={(e) => setReportType(e.target.value)}
              >
                <MenuItem value="overview">Tổng quan</MenuItem>
                <MenuItem value="detailed">Phân tích chi tiết</MenuItem>
                <MenuItem value="trends">Xu hướng & Mẫu hình</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <Stack direction="row" spacing={2}>
              <Button
                variant="outlined"
                startIcon={<PdfIcon />}
                onClick={() => handleExportReport('pdf')}
              >
                Xuất PDF
              </Button>
              <Button
                variant="outlined"
                startIcon={<ExcelIcon />}
                onClick={() => handleExportReport('excel')}
              >
                Xuất Excel
              </Button>
              <Button
                variant="outlined"
                startIcon={<CsvIcon />}
                onClick={() => handleExportReport('csv')}
              >
                Xuất CSV
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <IncomeIcon sx={{ color: 'success.main', mr: 1 }} />
                <Typography variant="h6">Tổng thu nhập</Typography>
              </Box>
              <Typography variant="h4" color="success.main">
                {formatCurrency(chartData.incomeVsExpense[0]?.value || 0)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <ExpenseIcon sx={{ color: 'error.main', mr: 1 }} />
                <Typography variant="h6">Tổng chi phí</Typography>
              </Box>
              <Typography variant="h4" color="error.main">
                {formatCurrency(chartData.incomeVsExpense[1]?.value || 0)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <BalanceIcon sx={{ color: 'primary.main', mr: 1 }} />
                <Typography variant="h6">Số dư ròng</Typography>
              </Box>
              <Typography variant="h4" color="primary.main">
                {formatCurrency((chartData.incomeVsExpense[0]?.value || 0) - (chartData.incomeVsExpense[1]?.value || 0))}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3}>
        {/* Monthly Income vs Expense */}
        <Grid item xs={12} lg={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              So sánh Thu nhập và Chi phí theo tháng
            </Typography>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={chartData.monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Legend />
                <Bar dataKey="income" fill={theme.palette.success.main} name="Thu nhập" />
                <Bar dataKey="expense" fill={theme.palette.error.main} name="Chi phí" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Income vs Expense Pie Chart */}
        <Grid item xs={12} lg={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Tỷ lệ Thu nhập và Chi phí
            </Typography>
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                  data={chartData.incomeVsExpense}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={120}
                  label={({ name, percentage }) => `${name}: ${((percentage || 0) * 100).toFixed(1)}%`}
                >
                  {chartData.incomeVsExpense.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Expense by Category */}
        <Grid item xs={12} lg={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Chi phí theo Danh mục
            </Typography>
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                  data={chartData.categoryData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={120}
                  label={({ name, percentage }) => `${name}: ${percentage}%`}
                >
                  {chartData.categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Daily Trend */}
        <Grid item xs={12} lg={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Xu hướng Tài chính hàng ngày
            </Typography>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={chartData.dailyTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(date) => new Date(date).toLocaleDateString()}
                />
                <YAxis />
                <Tooltip 
                  labelFormatter={(date) => new Date(date).toLocaleDateString()}
                  formatter={(value) => formatCurrency(value)}
                />
                <Legend />
                <Line type="monotone" dataKey="net" stroke={theme.palette.primary.main} name="Số dư ròng" />
                <Line type="monotone" dataKey="income" stroke={theme.palette.success.main} name="Thu nhập" />
                <Line type="monotone" dataKey="expense" stroke={theme.palette.error.main} name="Chi phí" />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Reports;
