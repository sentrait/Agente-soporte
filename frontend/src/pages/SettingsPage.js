import React from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Switch,
  FormControlLabel,
  Divider,
} from '@mui/material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import useAuthStore from '../store/authStore';

const SettingsPage = () => {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);

  const { data: settings, isLoading } = useQuery({
    queryKey: ['user-settings'],
    queryFn: async () => {
      const response = await api.get('/settings/');
      return response.data;
    },
    enabled: !!user,
  });

  const updateSettings = useMutation({
    mutationFn: async (newSettings) => {
      const response = await api.put('/settings/', newSettings);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['user-settings']);
    },
  });

  const handleSubmit = (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const newSettings = {
      email_notifications: formData.get('email_notifications') === 'on',
      dark_mode: formData.get('dark_mode') === 'on',
      language: formData.get('language'),
      timezone: formData.get('timezone'),
    };
    updateSettings.mutate(newSettings);
  };

  if (isLoading) {
    return <Typography>Cargando...</Typography>;
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Configuración
      </Typography>
      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Preferencias de Notificación
              </Typography>
              <FormControlLabel
                control={
                  <Switch
                    name="email_notifications"
                    defaultChecked={settings?.email_notifications}
                  />
                }
                label="Notificaciones por correo electrónico"
              />
            </Grid>
            <Grid item xs={12}>
              <Divider />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Apariencia
              </Typography>
              <FormControlLabel
                control={
                  <Switch
                    name="dark_mode"
                    defaultChecked={settings?.dark_mode}
                  />
                }
                label="Modo oscuro"
              />
            </Grid>
            <Grid item xs={12}>
              <Divider />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Idioma"
                name="language"
                defaultValue={settings?.language}
                select
                SelectProps={{
                  native: true,
                }}
              >
                <option value="es">Español</option>
                <option value="en">English</option>
              </TextField>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Zona horaria"
                name="timezone"
                defaultValue={settings?.timezone}
                select
                SelectProps={{
                  native: true,
                }}
              >
                <option value="America/Mexico_City">Ciudad de México</option>
                <option value="America/New_York">Nueva York</option>
                <option value="Europe/Madrid">Madrid</option>
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={updateSettings.isLoading}
              >
                {updateSettings.isLoading ? 'Guardando...' : 'Guardar cambios'}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default SettingsPage; 