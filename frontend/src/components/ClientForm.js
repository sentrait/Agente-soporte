import React, { useState, useEffect } from 'react';

function ClientForm({ initialClient, onSubmitForm, onCancel, formError }) {
  const [client, setClient] = useState({ id: null, name: '', contact_info: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialClient) {
      setClient(initialClient);
    } else {
      setClient({ id: null, name: '', contact_info: '' }); // Reset for new client
    }
  }, [initialClient]);

  useEffect(() => {
    setError(formError || ''); // Display error passed from App.js
  }, [formError]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setClient(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!client.name) {
      setError('Client name is required.');
      return;
    }
    setError(''); // Clear local error
    onSubmitForm(client);
  };

  return (
    <div>
      <h2>{client.id ? 'Edit Client' : 'Add New Client'}</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="name">Name:</label>
          <input
            type="text"
            id="name"
            name="name"
            value={client.name}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label htmlFor="contact_info">Contact Info:</label>
          <textarea
            id="contact_info"
            name="contact_info"
            value={client.contact_info}
            onChange={handleChange}
          />
        </div>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button type="submit">{client.id ? 'Update Client' : 'Add Client'}</button>
        <button type="button" onClick={onCancel} style={{ marginLeft: '10px' }}>Cancel</button>
      </form>
    </div>
  );
}

export default ClientForm;
