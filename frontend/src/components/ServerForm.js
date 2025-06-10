import React, { useState, useEffect } from 'react';

function ServerForm({ initialServer, clients, selectedClientId, onSubmitForm, onCancel, formError }) {
  const [server, setServer] = useState({
    id: null, name: '', ip_address: '', username: '',
    password_hash: '', ssh_key_path: '', os_type: '', ClientId: ''
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialServer) {
      setServer(prev => ({ ...prev, ...initialServer, ClientId: initialServer.ClientId || (selectedClientId ? selectedClientId.toString() : '') }));
    } else {
      setServer({
        id: null, name: '', ip_address: '', username: '',
        password_hash: '', ssh_key_path: '', os_type: '', ClientId: selectedClientId ? selectedClientId.toString() : (clients[0] ? clients[0].id.toString() : '')
      });
    }
  }, [initialServer, selectedClientId, clients]);

  useEffect(() => {
    setError(formError || '');
  }, [formError]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setServer(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!server.name || !server.ip_address || !server.username || !server.ClientId) {
      setError('Name, IP Address, Username, and Client selection are required.');
      return;
    }
    setError('');
    // In a real app, password_hash would be handled more securely (e.g. only set if new password provided)
    // For simulation, we'll just pass it along.
    onSubmitForm({...server, ClientId: parseInt(server.ClientId)});
  };

  return (
    <div>
      <h2>{server.id ? 'Edit Server' : 'Add New Server'}</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="ClientId">Client:</label>
          <select name="ClientId" id="ClientId" value={server.ClientId} onChange={handleChange} required>
            <option value="">-- Select Client --</option>
            {clients.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="name">Server Name:</label>
          <input type="text" id="name" name="name" value={server.name} onChange={handleChange} required />
        </div>
        <div>
          <label htmlFor="ip_address">IP Address:</label>
          <input type="text" id="ip_address" name="ip_address" value={server.ip_address} onChange={handleChange} required />
        </div>
        <div>
          <label htmlFor="username">Username:</label>
          <input type="text" id="username" name="username" value={server.username} onChange={handleChange} required />
        </div>
        <div>
          <label htmlFor="os_type">OS Type:</label>
          <input type="text" id="os_type" name="os_type" value={server.os_type} onChange={handleChange} />
        </div>
        <div>
          <label htmlFor="password_hash">Password (placeholder):</label>
          <input type="password" id="password_hash" name="password_hash" value={server.password_hash} onChange={handleChange} placeholder="Enter new password to change"/>
        </div>
        <div>
          <label htmlFor="ssh_key_path">SSH Key Path (optional):</label>
          <input type="text" id="ssh_key_path" name="ssh_key_path" value={server.ssh_key_path} onChange={handleChange} />
        </div>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button type="submit">{server.id ? 'Update Server' : 'Add Server'}</button>
        <button type="button" onClick={onCancel} style={{ marginLeft: '10px' }}>Cancel</button>
      </form>
    </div>
  );
}

export default ServerForm;
