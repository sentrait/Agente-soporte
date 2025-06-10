import React from 'react';

function ClientListPage({ clients, onEditClient, onDeleteClient, onAddNewClient, onBackToDashboard, onManageServersForClient }) {
  return (
    <div>
      <h2>Clients</h2>
      <button onClick={onAddNewClient} style={{ marginBottom: '10px' }}>Add New Client</button>
      <button onClick={onBackToDashboard} style={{ marginBottom: '10px', marginLeft: '5px' }}>Back to Dashboard</button>
      {clients.length === 0 ? (
        <p>No clients found. Add one!</p>
      ) : (
        <table border="1" cellPadding="5" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Contact Info</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {clients.map(client => (
              <tr key={client.id}>
                <td>{client.name}</td>
                <td>{client.contact_info}</td>
                <td>
                  <button onClick={() => onEditClient(client)}>Edit</button>
                  <button onClick={() => onDeleteClient(client.id)} style={{ marginLeft: '5px' }}>Delete</button>
                  <button onClick={() => onManageServersForClient(client)} style={{ marginLeft: '5px' }}>Manage Servers</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default ClientListPage;
