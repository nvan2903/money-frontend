import React from 'react';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import { 
  Box, Drawer, List, ListItem, ListItemIcon, ListItemText, 
  Typography, Divider, Toolbar
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as UsersIcon,
  Receipt as TransactionsIcon,
  Assessment as ReportsIcon,
  ArrowBack as BackIcon
} from '@mui/icons-material';

const drawerWidth = 240;

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const adminMenuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/admin/dashboard' },
    { text: 'User Management', icon: <UsersIcon />, path: '/admin/users' },
    { text: 'Transactions', icon: <TransactionsIcon />, path: '/admin/transactions' },
    { text: 'Reports', icon: <ReportsIcon />, path: '/admin/reports' }
  ];

  const handleBackToMain = () => {
    navigate('/dashboard');
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      {/* Admin Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: drawerWidth,
            boxSizing: 'border-box',
            position: 'relative',
            height: '100%'
          },
        }}
      >
        <Toolbar sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2 }}>
          <Typography variant="h6" noWrap component="div" color="primary">
            Admin Panel
          </Typography>
        </Toolbar>
        <Divider />
        
        {/* Back to Main */}
        <ListItem 
          button 
          onClick={handleBackToMain}
          sx={{ mb: 1, backgroundColor: 'grey.100' }}
        >
          <ListItemIcon>
            <BackIcon />
          </ListItemIcon>
          <ListItemText primary="Back to Main" />
        </ListItem>
        
        <Divider />
        
        {/* Admin Menu Items */}
        <List>
          {adminMenuItems.map((item) => (
            <ListItem 
              button 
              key={item.text}
              selected={location.pathname === item.path}
              onClick={() => navigate(item.path)}
              sx={{
                '&.Mui-selected': {
                  backgroundColor: 'primary.main',
                  color: 'white',
                  '& .MuiListItemIcon-root': {
                    color: 'white',
                  },
                },
                '&.Mui-selected:hover': {
                  backgroundColor: 'primary.dark',
                },
              }}
            >
              <ListItemIcon 
                sx={{ 
                  color: location.pathname === item.path ? 'white' : 'inherit' 
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItem>
          ))}
        </List>
      </Drawer>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          height: '100vh',
          overflow: 'auto',
          backgroundColor: 'grey.50'
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default AdminLayout;
