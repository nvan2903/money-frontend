import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box, Typography, Paper, Grid, Card, CardContent, Button,
  FormControl, InputLabel, Select, MenuItem, TextField,
  CircularProgress, Alert, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Menu,
  ListItemIcon, ListItemText, Divider, Tooltip as MuiTooltip
} from '@mui/material';
import {
  PictureAsPdf as PdfIcon,
  TableChart as ExcelIcon,
  Description as CsvIcon,
  TrendingUp as IncomeIcon,
  TrendingDown as ExpenseIcon,
  AccountBalance as BalanceIcon,
  FileDownload as DownloadIcon
} from '@mui/icons-material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { fetchSystemStats, fetchAllTransactions, clearAdminError } from '../../store/slices/adminSlice';
import { formatCurrency } from '../../utils/formatCurrency';

const AdminReports = () => {
  const dispatch = useDispatch();
  const { systemStats, transactions = [], loading, error } = useSelector(state => state.admin);
    const [reportType, setReportType] = useState('overview');
  const [dateRange, setDateRange] = useState({
    start: null,
    end: null
  });
  const [period, setPeriod] = useState('month'); // month, quarter, year
  const [generating, setGenerating] = useState(false);
  const [exportMenuAnchor, setExportMenuAnchor] = useState(null);
  const [selectedFormat, setSelectedFormat] = useState(null);

  // Chart data
  const [chartData, setChartData] = useState({
    monthly: [],
    categories: [],
    userActivity: []
  });

  useEffect(() => {
    dispatch(fetchSystemStats());
    dispatch(fetchAllTransactions({}));
  }, [dispatch]);

  // Process data for charts
  useEffect(() => {
    if (transactions && transactions.length > 0) {
      // Monthly data
      const monthlyData = {};
      transactions.forEach(transaction => {
        const month = new Date(transaction.date).toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'short' 
        });
        if (!monthlyData[month]) {
          monthlyData[month] = { month, income: 0, expense: 0 };
        }
        if (transaction.type === 'income') {
          monthlyData[month].income += transaction.amount;
        } else {
          monthlyData[month].expense += transaction.amount;
        }
      });

      // Category data
      const categoryData = {};
      transactions.forEach(transaction => {
        if (transaction.type === 'expense') {
          const category = transaction.category_name || 'Unknown';
          categoryData[category] = (categoryData[category] || 0) + transaction.amount;
        }
      });

      setChartData({
        monthly: Object.values(monthlyData).slice(-12), // Last 12 months
        categories: Object.entries(categoryData).map(([name, value]) => ({ name, value })).slice(0, 10),
        userActivity: systemStats.high_spenders || []
      });
    }
  }, [transactions, systemStats]);  const handleGenerateReport = async (format) => {
    setSelectedFormat(format);
    setGenerating(true);
    setExportMenuAnchor(null);
    
    try {
      // Call the backend API for admin report generation
      const reportData = {
        format,
        type: reportType,
        start_date: dateRange.start,
        end_date: dateRange.end,
        period
      };
      
      // Call backend service
      const response = await fetch('/api/admin/generate-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(reportData)
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `admin_report_${format}_${new Date().toISOString().slice(0, 10)}.${format === 'excel' ? 'xlsx' : format}`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } else {
        // Fallback to client-side generation for CSV
        if (format === 'csv') {
          const csvContent = generateCSVContent();
          downloadFile(csvContent, `admin_report_${new Date().toISOString().slice(0, 10)}.csv`, 'text/csv');
        } else {
          throw new Error('Server-side generation failed');
        }
      }
      
    } catch (error) {
      console.error('Error generating report:', error);
      // Fallback for CSV
      if (format === 'csv') {
        const csvContent = generateCSVContent();
        downloadFile(csvContent, `admin_report_${new Date().toISOString().slice(0, 10)}.csv`, 'text/csv');
      } else {
        alert(`Failed to generate ${format.toUpperCase()} report. Please try again.`);
      }
    } finally {
      setGenerating(false);
      setSelectedFormat(null);
    }
  };
  const generateCSVContent = () => {
    const now = new Date();
    const reportDate = now.toLocaleDateString();
    const reportTime = now.toLocaleTimeString();
    
    let csvContent = `Admin System Report\n`;
    csvContent += `Generated on: ${reportDate} at ${reportTime}\n`;
    csvContent += `Report Type: ${reportType}\n`;
    csvContent += `Period: ${period}\n`;
    if (dateRange.start) csvContent += `Date Range: ${dateRange.start} to ${dateRange.end || 'Present'}\n`;
    csvContent += `\n`;
    
    // System Overview
    csvContent += `SYSTEM OVERVIEW\n`;
    csvContent += `Metric,Value\n`;
    csvContent += `Total Users,${systemStats.total_users || 0}\n`;
    csvContent += `Active Users,${systemStats.active_users || 0}\n`;    csvContent += `Total Income,${formatCurrency(systemStats.total_income || 0)}\n`;
    csvContent += `Total Expenses,${formatCurrency(systemStats.total_expense || 0)}\n`;
    csvContent += `Net Profit,${formatCurrency((systemStats.total_income || 0) - (systemStats.total_expense || 0))}\n`;
    csvContent += `Total Transactions,${systemStats.transaction_count || 0}\n`;
    csvContent += `Average Transaction,${formatCurrency((systemStats.total_income + systemStats.total_expense) / (systemStats.transaction_count || 1))}\n`;
    csvContent += `\n`;
    
    // Top Spenders
    if (systemStats.high_spenders && systemStats.high_spenders.length > 0) {
      csvContent += `TOP SPENDERS\n`;
      csvContent += `Rank,Username,Email,Total Spending\n`;
      systemStats.high_spenders.forEach((spender, index) => {
        csvContent += `${index + 1},${spender.user_info?.username || 'N/A'},${spender.user_info?.email || 'N/A'},${formatCurrency(spender.total_expense)}\n`;
      });
      csvContent += `\n`;
    }
    
    // Category Breakdown
    if (chartData.categories && chartData.categories.length > 0) {
      csvContent += `EXPENSE CATEGORIES\n`;
      csvContent += `Category,Amount,Percentage\n`;
      const totalCategoryExpense = chartData.categories.reduce((sum, cat) => sum + cat.value, 0);
      chartData.categories.forEach(category => {
        const percentage = totalCategoryExpense > 0 ? ((category.value / totalCategoryExpense) * 100).toFixed(2) : '0.00';
        csvContent += `${category.name},${formatCurrency(category.value)},${percentage}%\n`;
      });
      csvContent += `\n`;
    }
    
    // Recent Transactions Sample
    csvContent += `RECENT TRANSACTIONS (Last 50)\n`;
    csvContent += `Date,User ID,Category,Type,Amount,Description\n`;
    transactions.slice(0, 50).forEach(transaction => {
      const date = new Date(transaction.date).toLocaleDateString();
      const description = (transaction.description || '').replace(/,/g, ';'); // Replace commas to avoid CSV issues
      csvContent += `${date},${transaction.user_id},${transaction.category_name || 'N/A'},${transaction.type},${formatCurrency(transaction.amount)},${description}\n`;
    });
    
    return csvContent;
  };

  const downloadFile = (content, filename, contentType) => {
    const blob = new Blob([content], { type: contentType });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const reportStats = {
    totalRevenue: systemStats.total_income || 0,
    totalExpenses: systemStats.total_expense || 0,
    netProfit: (systemStats.total_income || 0) - (systemStats.total_expense || 0),
    totalTransactions: systemStats.transaction_count || 0,
    totalUsers: systemStats.user_count || 0,
    avgTransactionValue: systemStats.transaction_count > 0 
      ? ((systemStats.total_income || 0) + (systemStats.total_expense || 0)) / systemStats.transaction_count 
      : 0
  };
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
        <Typography variant="h4" gutterBottom>
          System Reports & Analytics
        </Typography>

        {/* Error Messages */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => dispatch(clearAdminError())}>
            {error}
          </Alert>
        )}

        {/* Report Controls */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Loại báo cáo</InputLabel>
                  <Select
                    value={reportType}
                    label="Report Type"
                    onChange={(e) => setReportType(e.target.value)}
                  >
                    <MenuItem value="overview">Tổng quan</MenuItem>
                    <MenuItem value="detailed">Phân tích chi tiết</MenuItem>
                    <MenuItem value="trends">Xu hướng & Mẫu hình</MenuItem>
                    <MenuItem value="transaction-details">Chi tiết giao dịch</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6} md={2}>
                <FormControl fullWidth>
                  <InputLabel>Thời gian</InputLabel>
                  <Select
                    value={period}
                    label="Period"
                    onChange={(e) => setPeriod(e.target.value)}
                  >
                    <MenuItem value="month">Tháng</MenuItem>
                    <MenuItem value="quarter">Quý</MenuItem>
                    <MenuItem value="year">Năm</MenuItem>
                  </Select>
                </FormControl>
              </Grid>              <Grid item xs={12} sm={6} md={2}>
                <TextField
                  fullWidth
                  label="Ngày bắt đầu"
                  type="date"
                  value={dateRange.start || ''}
                  onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={2}>
                <TextField
                  fullWidth
                  label="Ngày kết thúc"
                  type="date"
                  value={dateRange.end || ''}
                  onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                  InputLabelProps={{ shrink: true }}
                />              </Grid>              <Grid item xs={12} md={3}>
                <MuiTooltip title="Xuất báo cáo dưới nhiều định dạng">
                  <Button
                    variant="contained"
                    startIcon={<DownloadIcon />}
                    onClick={(e) => setExportMenuAnchor(e.currentTarget)}
                    disabled={generating}
                    sx={{ 
                      minWidth: 140,
                      background: 'linear-gradient(45deg, #2196f3 30%, #21cbf3 90%)',
                      boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)',
                    }}
                  >
                    {generating ? (
                      <>
                        <CircularProgress size={16} sx={{ mr: 1, color: 'white' }} />
                        {selectedFormat ? `Xuất ${selectedFormat.toUpperCase()}...` : 'Đang xuất...'}
                      </>
                    ) : (
                      'Xuất báo cáo'
                    )}                  </Button>
                </MuiTooltip>
                
                <Menu
                  anchorEl={exportMenuAnchor}
                  open={Boolean(exportMenuAnchor)}
                  onClose={() => setExportMenuAnchor(null)}
                  transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                  anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                  PaperProps={{
                    sx: {
                      minWidth: 200,
                      boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                    }
                  }}
                >
                  <MenuItem onClick={() => handleGenerateReport('pdf')} disabled={generating}>
                    <ListItemIcon>
                      <PdfIcon sx={{ color: '#d32f2f' }} />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Báo cáo PDF" 
                      secondary="Báo cáo định dạng hoàn chỉnh"
                    />
                  </MenuItem>
                  
                  <MenuItem onClick={() => handleGenerateReport('excel')} disabled={generating}>
                    <ListItemIcon>
                      <ExcelIcon sx={{ color: '#2e7d32' }} />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Sổ làm việc Excel" 
                      secondary="Dữ liệu chi tiết với biểu đồ"
                    />
                  </MenuItem>
                  
                  <Divider />
                  
                  <MenuItem onClick={() => handleGenerateReport('csv')} disabled={generating}>
                    <ListItemIcon>
                      <CsvIcon sx={{ color: '#ed6c02' }} />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Dữ liệu CSV" 
                      secondary="Dữ liệu thô để phân tích"
                    />
                  </MenuItem>
                </Menu>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {/* Key Metrics */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={6} md={2}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <IncomeIcon sx={{ color: 'success.main', mr: 1 }} />
                      <Typography variant="h6">Doanh thu</Typography>
                    </Box>                    <Typography variant="h4" sx={{ color: 'success.main', mt: 1 }}>
                      {formatCurrency(reportStats.totalRevenue)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={2}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <ExpenseIcon sx={{ color: 'error.main', mr: 1 }} />
                      <Typography variant="h6">Chi phí</Typography>
                    </Box>                    <Typography variant="h4" sx={{ color: 'error.main', mt: 1 }}>
                      {formatCurrency(reportStats.totalExpenses)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={2}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <BalanceIcon sx={{ color: 'primary.main', mr: 1 }} />
                      <Typography variant="h6">Lợi nhuận ròng</Typography>
                    </Box>                    <Typography 
                      variant="h4" 
                      sx={{ 
                        color: reportStats.netProfit >= 0 ? 'success.main' : 'error.main',
                        mt: 1 
                      }}
                    >
                      {formatCurrency(reportStats.netProfit)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={2}>
                <Card>
                  <CardContent>
                    <Typography variant="h6">Giao dịch</Typography>
                    <Typography variant="h4" sx={{ color: 'info.main', mt: 1 }}>
                      {reportStats.totalTransactions}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={2}>
                <Card>
                  <CardContent>
                    <Typography variant="h6">Người dùng hoạt động</Typography>
                    <Typography variant="h4" sx={{ color: 'primary.main', mt: 1 }}>
                      {reportStats.totalUsers}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={2}>
                <Card>
                  <CardContent>
                    <Typography variant="h6">Giá trị giao dịch trung bình</Typography>                    <Typography variant="h4" sx={{ color: 'text.primary', mt: 1 }}>
                      {formatCurrency(reportStats.avgTransactionValue)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Charts */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              {/* Monthly Income vs Expenses */}
              <Grid item xs={12} lg={8}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Doanh thu và Chi phí theo tháng
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>                    <BarChart data={chartData.monthly}>
                      <CartesianGrid strokeDasharray="3 3" />                      <XAxis dataKey="month" />
                      <YAxis />
                      <RechartsTooltip formatter={(value) => formatCurrency(value)} />
                      <Legend />
                      <Bar dataKey="income" fill="#4caf50" name="Doanh thu" />
                      <Bar dataKey="expense" fill="#f44336" name="Chi phí" />
                    </BarChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>

              {/* Category Distribution */}
              <Grid item xs={12} lg={4}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Phân bổ Chi phí theo Danh mục
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={chartData.categories}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                      >
                        {chartData.categories.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />                      ))}
                      </Pie>
                      <RechartsTooltip formatter={(value) => formatCurrency(value)} />
                    </PieChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>
            </Grid>

            {/* Top Spenders Table */}
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Người chi tiêu nhiều nhất
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Hạng</TableCell>
                      <TableCell>Tên đăng nhập</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell align="right">Tổng chi tiêu</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {systemStats.high_spenders && systemStats.high_spenders.map((spender, index) => (
                      <TableRow key={spender.user_id} hover>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>{spender.user_info?.username || 'N/A'}</TableCell>
                        <TableCell>{spender.user_info?.email || 'N/A'}</TableCell>                        <TableCell align="right">
                          <Typography variant="body2" sx={{ color: 'error.main', fontWeight: 'bold' }}>
                            {formatCurrency(spender.total_expense)}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </>        )}
      </Box>
  );
};

export default AdminReports;
