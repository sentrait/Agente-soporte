import React from 'react';

function ServerListPage({ servers, client, onEditServer, onDeleteServer, onAddNewServer, onBackToClients, onBackToDashboard }) {
  return (
    <div>
      <h2>Servers {client ? `for ${client.name}` : 'All Servers'}</h2>
      <button onClick={onAddNewServer} style={{ marginBottom: '10px' }}>Add New Server</button>
      {client && <button onClick={onBackToClients} style={{ marginBottom: '10px', marginLeft: '5px' }}>Back to Clients</button>}
      <button onClick={onBackToDashboard} style={{ marginBottom: '10px', marginLeft: '5px' }}>Back to Dashboard</button>

      {servers.length === 0 ? (
        <p>No servers found.</p>
      ) : (
        <table border="1" cellPadding="5" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th>Name</th>
              <th>IP Address</th>
              <th>OS Type</th>
              {!client && <th>Client Name</th>}
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {servers.map(server => (
              <tr key={server.id}>
                <td>{server.name}</td>
                <td>{server.ip_address}</td>
                <td>{server.os_type}</td>
                {!client && <td>{server.Client ? server.Client.name : 'N/A'}</td>}
                <td>
                  <button onClick={() => onEditServer(server)}>Edit</button>
                  <button onClick={() => onDeleteServer(server.id)} style={{ marginLeft: '5px' }}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default ServerListPage;
