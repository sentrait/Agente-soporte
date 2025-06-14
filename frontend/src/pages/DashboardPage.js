import React from 'react';
import { Box, Typography, Paper, Grid, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ChatIcon from '@mui/icons-material/Chat';
import AssessmentIcon from '@mui/icons-material/Assessment';
import SettingsIcon from '@mui/icons-material/Settings';

const DashboardPage = () => {
  const navigate = useNavigate();

  const menuItems = [
    {
      title: 'Chat',
      description: 'Inicia una conversación con el asistente virtual',
      icon: <ChatIcon sx={{ fontSize: 40 }} />,
      path: '/chat'
    },
    {
      title: 'Reportes',
      description: 'Visualiza estadísticas y reportes de uso',
      icon: <AssessmentIcon sx={{ fontSize: 40 }} />,
      path: '/reports'
    },
    {
      title: 'Configuración',
      description: 'Ajusta las preferencias del sistema',
      icon: <SettingsIcon sx={{ fontSize: 40 }} />,
      path: '/settings'
    }
  ];

  return (
    <Box sx={{ p: 3, maxWidth: '1200px', margin: '0 auto' }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Dashboard
      </Typography>
      
      <Grid container spacing={3}>
        {menuItems.map((item, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Paper
              sx={{
                p: 3,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'scale(1.02)',
                  boxShadow: 3
                }
              }}
              onClick={() => navigate(item.path)}
            >
              <Box sx={{ color: 'primary.main', mb: 2 }}>
                {item.icon}
              </Box>
              <Typography variant="h6" gutterBottom>
                {item.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {item.description}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default DashboardPage; 