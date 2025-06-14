import React, { useState, useEffect } from 'react';
import { Container, Box, TextField, Button, Typography, Alert, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';

function ClientsPage() {
  const [clients, setClients] = useState([]);
  const [name, setName] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchClients = async () => {
    try {
      const response = await fetch('/api/clients/', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        setClients(data);
      } else {
        setError('Error al cargar clientes.');
      }
    } catch (err) {
      setError('Error de red o el servidor no está disponible.');
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (!name) {
      setError('El nombre es obligatorio.');
      return;
    }

    try {
      const response = await fetch('/api/clients/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ name, contact_info: contactInfo })
      });
      const data = await response.json();
      if (response.ok) {
        setSuccess('Cliente creado exitosamente.');
        setName(''); setContactInfo('');
        fetchClients();
      } else {
        setError(data.name || data.contact_info || 'Error al crear el cliente.');
      }
    } catch (err) {
      setError('Error de red o el servidor no está disponible.');
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`/api/clients/${id}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        setSuccess('Cliente eliminado exitosamente.');
        fetchClients();
      } else {
        setError('Error al eliminar el cliente.');
      }
    } catch (err) {
      setError('Error de red o el servidor no está disponible.');
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>Gestión de Clientes</Typography>
      <Box component="form" onSubmit={handleSubmit} sx={{ mb: 4, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
        <TextField
          label="Nombre"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <TextField
          label="Información de contacto"
          value={contactInfo}
          onChange={(e) => setContactInfo(e.target.value)}
        />
        <Button type="submit" variant="contained" color="primary">
          Crear Cliente
        </Button>
      </Box>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
      <Typography variant="h6" gutterBottom>Lista de Clientes</Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nombre</TableCell>
              <TableCell>Información de contacto</TableCell>
              <TableCell align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {clients.map(client => (
              <TableRow key={client.id}>
                <TableCell>{client.name}</TableCell>
                <TableCell>{client.contact_info}</TableCell>
                <TableCell align="right">
                  <Button variant="outlined" color="error" onClick={() => handleDelete(client.id)}>
                    Eliminar
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
}

export default ClientsPage; 