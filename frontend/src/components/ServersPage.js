import React, { useState, useEffect } from 'react';
import { Container, Box, TextField, Button, Typography, Alert, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, MenuItem } from '@mui/material';

function ServersPage() {
  const [servers, setServers] = useState([]);
  const [clients, setClients] = useState([]);
  const [name, setName] = useState('');
  const [ipAddress, setIpAddress] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [sshKeyPath, setSshKeyPath] = useState('');
  const [osType, setOsType] = useState('');
  const [clientId, setClientId] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchServers = async () => {
    try {
      const response = await fetch('/api/servers/', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        setServers(data);
      } else {
        setError('Error al cargar servidores.');
      }
    } catch (err) {
      setError('Error de red o el servidor no está disponible.');
    }
  };

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
    fetchServers();
    fetchClients();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (!name || !ipAddress || !username || !clientId) {
      setError('Todos los campos son obligatorios.');
      return;
    }

    try {
      const response = await fetch('/api/servers/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          name,
          ip_address: ipAddress,
          username,
          password,
          ssh_key_path: sshKeyPath,
          os_type: osType,
          client: clientId
        })
      });
      const data = await response.json();
      if (response.ok) {
        setSuccess('Servidor creado exitosamente.');
        setName(''); setIpAddress(''); setUsername(''); setPassword(''); setSshKeyPath(''); setOsType(''); setClientId('');
        fetchServers();
      } else {
        setError(data.name || data.ip_address || data.username || data.client || 'Error al crear el servidor.');
      }
    } catch (err) {
      setError('Error de red o el servidor no está disponible.');
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`/api/servers/${id}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        setSuccess('Servidor eliminado exitosamente.');
        fetchServers();
      } else {
        setError('Error al eliminar el servidor.');
      }
    } catch (err) {
      setError('Error de red o el servidor no está disponible.');
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>Gestión de Servidores</Typography>
      <Box component="form" onSubmit={handleSubmit} sx={{ mb: 4, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
        <TextField
          label="Nombre"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <TextField
          label="Dirección IP"
          value={ipAddress}
          onChange={(e) => setIpAddress(e.target.value)}
          required
        />
        <TextField
          label="Usuario"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <TextField
          label="Contraseña"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <TextField
          label="Ruta de clave SSH"
          value={sshKeyPath}
          onChange={(e) => setSshKeyPath(e.target.value)}
        />
        <TextField
          label="Sistema Operativo"
          value={osType}
          onChange={(e) => setOsType(e.target.value)}
        />
        <TextField
          select
          label="Cliente"
          value={clientId}
          onChange={(e) => setClientId(e.target.value)}
          required
          sx={{ minWidth: 150 }}
        >
          {clients.map(client => (
            <MenuItem key={client.id} value={client.id}>{client.name}</MenuItem>
          ))}
        </TextField>
        <Button type="submit" variant="contained" color="primary">
          Crear Servidor
        </Button>
      </Box>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
      <Typography variant="h6" gutterBottom>Lista de Servidores</Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nombre</TableCell>
              <TableCell>IP</TableCell>
              <TableCell>Usuario</TableCell>
              <TableCell>SO</TableCell>
              <TableCell>Cliente</TableCell>
              <TableCell align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {servers.map(server => (
              <TableRow key={server.id}>
                <TableCell>{server.name}</TableCell>
                <TableCell>{server.ip_address}</TableCell>
                <TableCell>{server.username}</TableCell>
                <TableCell>{server.os_type}</TableCell>
                <TableCell>{clients.find(c => c.id === server.client)?.name || ''}</TableCell>
                <TableCell align="right">
                  <Button variant="outlined" color="error" onClick={() => handleDelete(server.id)}>
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

export default ServersPage; 