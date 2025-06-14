import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Box,
  Chip,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const ServersPage = () => {
  const navigate = useNavigate();

  const { data: servers, isLoading } = useQuery({
    queryKey: ['servers'],
    queryFn: () => api.get('/servers/').then((res) => res.data),
  });

  if (isLoading) {
    return <Typography>Cargando...</Typography>;
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Container>
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Servidores
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate('/servers/new')}
          sx={{ mb: 2 }}
        >
          Nuevo Servidor
        </Button>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Nombre</TableCell>
                <TableCell>IP</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {servers?.map((server) => (
                <TableRow key={server.id}>
                  <TableCell>{server.id}</TableCell>
                  <TableCell>{server.name}</TableCell>
                  <TableCell>{server.ip_address}</TableCell>
                  <TableCell>
                    <Chip
                      label={server.status}
                      color={getStatusColor(server.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Button
                      size="small"
                      onClick={() => navigate(`/servers/${server.id}`)}
                    >
                      Ver Detalles
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Container>
  );
};

export default ServersPage; 