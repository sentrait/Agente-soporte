import React, { useState } from 'react';
import { sendMessage } from '../services/api';

const Chat = () => {
    const [message, setMessage] = useState('');
    const [response, setResponse] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!message.trim()) return;
        
        setLoading(true);
        setError(null);
        
        try {
            console.log('Enviando mensaje:', message);
            const result = await sendMessage(message);
            console.log('Respuesta recibida:', result);
            setResponse(result.response);
            setMessage('');
        } catch (err) {
            console.error('Error en el chat:', err);
            setError('Error al enviar el mensaje. Por favor, intenta de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4">
            <h2 className="text-2xl font-bold mb-4">Chat con IA</h2>
            
            <form onSubmit={handleSubmit} className="mb-4">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="flex-1 p-2 border rounded"
                        placeholder="Escribe tu mensaje..."
                        disabled={loading}
                    />
                    <button
                        type="submit"
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-blue-300"
                        disabled={loading || !message.trim()}
                    >
                        {loading ? 'Enviando...' : 'Enviar'}
                    </button>
                </div>
            </form>

            {error && (
                <div className="text-red-500 mb-4">
                    {error}
                </div>
            )}

            {response && (
                <div className="bg-gray-100 p-4 rounded">
                    <h3 className="font-bold mb-2">Respuesta:</h3>
                    <p>{response}</p>
                </div>
            )}
        </div>
    );
};

export default Chat; 