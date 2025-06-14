import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, TextField, Button, Typography, Container, Paper, Alert } from '@mui/material';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';

const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const mutation = useMutation({
    mutationFn: async (credentials) => {
      const response = await axios.post('http://localhost:8000/api/auth/login/', credentials);
      return response.data;
    },
    onSuccess: (data) => {
      // Guardar el token en localStorage
      localStorage.setItem('token', data.token);
      // Redirigir al chat
      navigate('/chat');
    },
    onError: (error) => {
      console.error('Error en login:', error);
      setError(error.response?.data?.error || 'Error al iniciar sesión');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    mutation.mutate({ email, password });
  };

  return (
    <Container maxWidth="sm" sx={{ height: '100vh', display: 'flex', alignItems: 'center' }}>
      <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Iniciar Sesión
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            margin="normal"
            required
            disabled={mutation.isPending}
          />
          <TextField
            fullWidth
            label="Contraseña"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            margin="normal"
            required
            disabled={mutation.isPending}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            size="large"
            sx={{ mt: 3 }}
            disabled={mutation.isPending}
          >
            {mutation.isPending ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default LoginPage; 