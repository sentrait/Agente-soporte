import React, { useState } from 'react';
import { Container, TextField, Button, Typography, Alert, Box, Link } from '@mui/material';

function RegisterPage({ onRegister }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (!username || !email || !password || !password2) {
      setError('Por favor, completa todos los campos.');
      return;
    }
    if (password !== password2) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    try {
      const response = await fetch('/api/users/register/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password, password2 })
      });
      const data = await response.json();
      if (response.ok) {
        setSuccess('¡Registro exitoso! Ahora puedes iniciar sesión.');
        setUsername(''); setEmail(''); setPassword(''); setPassword2('');
      } else {
        setError(data.email || data.username || data.password || data.non_field_errors || 'Error en el registro.');
      }
    } catch (err) {
      setError('Error de red o el servidor no está disponible.');
    }
  };

  return (
    <Container maxWidth="xs" sx={{ mt: 8 }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography component="h1" variant="h5" sx={{ mb: 2 }}>
          Registro
        </Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
          <TextField
            margin="normal"
            fullWidth
            id="username"
            label="Nombre de usuario"
            name="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <TextField
            margin="normal"
            fullWidth
            id="email"
            label="Email"
            name="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <TextField
            margin="normal"
            fullWidth
            name="password"
            label="Contraseña"
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <TextField
            margin="normal"
            fullWidth
            name="password2"
            label="Repite la contraseña"
            type="password"
            id="password2"
            value={password2}
            onChange={(e) => setPassword2(e.target.value)}
            required
          />
          {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mt: 2 }}>{success}</Alert>}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            sx={{ mt: 3, mb: 2 }}
          >
            Registrarse
          </Button>
        </Box>
        <Typography variant="body2" sx={{ mt: 2 }}>
          ¿Ya tienes una cuenta?{' '}
          <Link href="#" onClick={e => { e.preventDefault(); window.location.reload(); }}>
            Inicia sesión aquí
          </Link>
        </Typography>
      </Box>
    </Container>
  );
}

export default RegisterPage; 