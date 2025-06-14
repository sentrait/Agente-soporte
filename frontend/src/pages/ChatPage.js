import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, TextField, Button, Typography, Paper, CircularProgress, Alert, Snackbar } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { useAuth } from '../contexts/AuthContext';
import { sendMessage } from '../../services/api'; // Importar sendMessage

const ChatPage = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showError, setShowError] = useState(false);
  const messagesEndRef = useRef(null);
  // const { token } = useAuth(); // No longer needed for direct header construction
  const navigate = useNavigate();

  useEffect(() => {
    // Mensaje de bienvenida automático
    setMessages([
      {
        text: "¡Hola! Soy tu asistente virtual. ¿En qué puedo ayudarte hoy?",
        sender: 'bot'
      }
    ]);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const userMessage = {
      text: newMessage,
      sender: 'user'
    };

    setMessages(prev => [...prev, userMessage]);
    setNewMessage('');
    setLoading(true);
    setError(null);

    try {
      // Llamar a la función sendMessage importada
      const responseData = await sendMessage(newMessage);
      
      setMessages(prev => [...prev, {
        text: responseData.response, // Acceder a la propiedad 'response' de la data retornada
        sender: 'bot'
      }]);
    } catch (err) {
      console.error('Error al enviar mensaje:', err);
      // El error ya debería ser un objeto Error, potencialmente con err.response.data
      const errorMessage = err.response?.data?.error || err.message || 'Error al enviar el mensaje. Por favor, intenta de nuevo en unos minutos.';
      setError(errorMessage);
      setShowError(true);
      setMessages(prev => [...prev, {
        text: "Lo siento, hubo un error al procesar tu mensaje. Por favor, intenta de nuevo en unos minutos.",
        sender: 'bot'
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseError = () => {
    setShowError(false);
  };

  return (
    <Box sx={{ 
      height: 'calc(100vh - 64px)', 
      display: 'flex', 
      flexDirection: 'column',
      p: 2,
      maxWidth: '800px',
      margin: '0 auto'
    }}>
      <Paper 
        elevation={3} 
        sx={{ 
          flex: 1, 
          mb: 2, 
          p: 2, 
          overflow: 'auto',
          backgroundColor: '#f5f5f5'
        }}
      >
        {messages.map((message, index) => (
          <Box
            key={index}
            sx={{
              display: 'flex',
              justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start',
              mb: 2
            }}
          >
            <Paper
              elevation={1}
              sx={{
                p: 2,
                maxWidth: '70%',
                backgroundColor: message.sender === 'user' ? '#e3f2fd' : '#ffffff',
                borderRadius: 2
              }}
            >
              <Typography variant="body1">{message.text}</Typography>
            </Paper>
          </Box>
        ))}
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
            <CircularProgress size={24} />
          </Box>
        )}
        <div ref={messagesEndRef} />
      </Paper>

      <Snackbar 
        open={showError} 
        autoHideDuration={6000} 
        onClose={handleCloseError}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseError} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>

      <Paper 
        component="form" 
        onSubmit={handleSendMessage}
        sx={{ 
          p: 2, 
          display: 'flex', 
          gap: 1,
          backgroundColor: '#ffffff'
        }}
      >
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Escribe tu mensaje..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          disabled={loading}
          size="small"
        />
        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={loading || !newMessage.trim()}
          endIcon={<SendIcon />}
        >
          Enviar
        </Button>
      </Paper>
    </Box>
  );
};

export default ChatPage; 