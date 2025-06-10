import React, { useState, useEffect } from 'react';
import LoginPage from './components/LoginPage';
import DashboardPage from './components/DashboardPage';
import UserProfilePage from './components/UserProfilePage';
import ClientListPage from './components/ClientListPage';
import ClientForm from './components/ClientForm';
import ServerListPage from './components/ServerListPage';
import ServerForm from './components/ServerForm';
import ChatPage from './components/ChatPage'; // Import ChatPage
import './App.css';

let storedAuthToken = null;
let storedUser = null;

let simDB = {
  clients: [
    { id: 1, UserId: 1, name: 'Client Alpha', contact_info: 'alpha@example.com' },
    { id: 2, UserId: 1, name: 'Client Beta', contact_info: 'beta@example.com' },
  ],
  servers: [ // Ensure Client objects are embedded or look them up
    { id: 1, ClientId: 1, name: 'Server A1', ip_address: '192.168.1.10', username: 'user_a1', os_type: 'Linux', password_hash: 'fakepass', ssh_key_path: '/path/to/key_a1' },
    { id: 2, ClientId: 1, name: 'Server A2', ip_address: '192.168.1.11', username: 'user_a2', os_type: 'Windows' },
    { id: 3, ClientId: 2, name: 'Server B1', ip_address: '10.0.0.5', username: 'user_b1', os_type: 'Linux' },
  ],
  nextClientId: 3,
  nextServerId: 4,
};
// Function to ensure servers have their Client object linked for display
const getServersWithClientData = () => {
  return simDB.servers.map(s => ({
    ...s,
    Client: simDB.clients.find(c => c.id === s.ClientId)
  }));
};


const VIEWS = {
  LOGIN: 'login',
  DASHBOARD: 'dashboard',
  PROFILE: 'profile',
  CLIENT_LIST: 'client_list',
  CLIENT_FORM: 'client_form',
  SERVER_LIST: 'server_list',
  SERVER_FORM: 'server_form',
  CHAT_PAGE: 'chat_page', // Add CHAT_PAGE view
};

function App() {
  const [authToken, setAuthToken] = useState(storedAuthToken);
  const [currentUser, setCurrentUser] = useState(storedUser);
  const [currentView, setCurrentView] = useState(VIEWS.LOGIN);

  const [clients, setClients] = useState([]);
  const [servers, setServers] = useState([]); // Will store servers with Client info
  const [editingClient, setEditingClient] = useState(null);
  const [editingServer, setEditingServer] = useState(null);
  const [currentManagingClient, setCurrentManagingClient] = useState(null);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (authToken && currentUser) {
      setClients(simDB.clients.filter(c => c.UserId === currentUser.id));
      setServers(getServersWithClientData().filter(s => s.Client && s.Client.UserId === currentUser.id)); // Filter servers by user's clients
      if(currentView === VIEWS.LOGIN) setCurrentView(VIEWS.DASHBOARD);
    } else {
      setCurrentView(VIEWS.LOGIN);
      setClients([]);
      setServers([]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authToken, currentUser]);

  useEffect(() => {
    storedAuthToken = authToken;
    storedUser = currentUser;
  }, [authToken, currentUser]);

  const handleLogin = (token, user) => {
    const fullUser = {
      id: user.id || 1, username: user.username || "TestUser",
      email: user.email || "test@example.com", settings: user.settings || "{}"
    };
    setAuthToken(token);
    setCurrentUser(fullUser);
  };

  const handleLogout = () => {
    setAuthToken(null);
    setCurrentUser(null);
  };

  const handleUpdateUser = (updatedUserData) => {
    setCurrentUser(updatedUserData);
  };

  const clearFormError = () => setFormError('');

  const navigateTo = (view) => {
    if (authToken) {
      clearFormError();
      setCurrentView(view);
    } else {
      setCurrentView(VIEWS.LOGIN);
    }
  };

  const handleAddNewClient = () => { setEditingClient(null); navigateTo(VIEWS.CLIENT_FORM); };
  const handleEditClient = (client) => { setEditingClient(client); navigateTo(VIEWS.CLIENT_FORM); };

  const handleClientSubmit = (clientData) => {
    if (clientData.id) {
      simDB.clients = simDB.clients.map(c => c.id === clientData.id ? {...c, ...clientData} : c);
    } else {
      const newClient = { ...clientData, id: simDB.nextClientId++, UserId: currentUser.id };
      simDB.clients.push(newClient);
    }
    setClients(simDB.clients.filter(c => c.UserId === currentUser.id));
    setServers(getServersWithClientData().filter(s => s.Client && s.Client.UserId === currentUser.id)); // Update servers too, client name might have changed
    navigateTo(VIEWS.CLIENT_LIST);
  };

  const handleDeleteClient = (clientId) => {
    const clientHasServers = simDB.servers.some(s => s.ClientId === clientId);
    if (clientHasServers) {
        alert("Cannot delete client: Associated servers exist. (Simulated)"); return;
    }
    if (window.confirm("Delete this client? (Simulation)")) {
        simDB.clients = simDB.clients.filter(c => c.id !== clientId);
        setClients(simDB.clients.filter(c => c.UserId === currentUser.id));
    }
  };

  const handleManageServersForClient = (client) => {
    setCurrentManagingClient(client);
    navigateTo(VIEWS.SERVER_LIST);
  };

  const handleAddNewServer = () => { setEditingServer(null); navigateTo(VIEWS.SERVER_FORM); };
  const handleEditServer = (server) => { setEditingServer(server); navigateTo(VIEWS.SERVER_FORM); };

  const handleServerSubmit = (serverData) => {
    if (serverData.id) {
      simDB.servers = simDB.servers.map(s => s.id === serverData.id ? {...s, ...serverData} : s);
    } else {
      const newServer = { ...serverData, id: simDB.nextServerId++ };
      simDB.servers.push(newServer);
    }
    setServers(getServersWithClientData().filter(s => s.Client && s.Client.UserId === currentUser.id));
    navigateTo(VIEWS.SERVER_LIST);
  };

  const handleDeleteServer = (serverId) => {
     if (window.confirm("Delete this server? (Simulation)")) {
        simDB.servers = simDB.servers.filter(s => s.id !== serverId);
        setServers(getServersWithClientData().filter(s => s.Client && s.Client.UserId === currentUser.id));
     }
  };

  const renderView = () => {
    if (!authToken) return <LoginPage onLogin={handleLogin} />;

    switch (currentView) {
      case VIEWS.DASHBOARD:
        return <DashboardPage onLogout={handleLogout} currentUser={currentUser}
                              onNavigateToProfile={() => navigateTo(VIEWS.PROFILE)}
                              onNavigateToClients={() => navigateTo(VIEWS.CLIENT_LIST)}
                              onNavigateToServers={() => { setCurrentManagingClient(null); navigateTo(VIEWS.SERVER_LIST);}}
                              onNavigateToChat={() => navigateTo(VIEWS.CHAT_PAGE)} />; // Add chat navigation
      case VIEWS.PROFILE:
        return <UserProfilePage currentUser={currentUser} onUpdateUser={handleUpdateUser} onBackToDashboard={() => navigateTo(VIEWS.DASHBOARD)} />;
      case VIEWS.CLIENT_LIST:
        return <ClientListPage clients={clients} onEditClient={handleEditClient} onDeleteClient={handleDeleteClient}
                               onAddNewClient={handleAddNewClient} onBackToDashboard={() => navigateTo(VIEWS.DASHBOARD)}
                               onManageServersForClient={handleManageServersForClient} />;
      case VIEWS.CLIENT_FORM:
        return <ClientForm initialClient={editingClient} onSubmitForm={handleClientSubmit}
                           onCancel={() => navigateTo(VIEWS.CLIENT_LIST)} formError={formError} />;
      case VIEWS.SERVER_LIST:
        const serversToList = currentManagingClient
          ? servers.filter(s => s.ClientId === currentManagingClient.id)
          : servers;
        return <ServerListPage servers={serversToList} client={currentManagingClient}
                               onEditServer={handleEditServer} onDeleteServer={handleDeleteServer}
                               onAddNewServer={handleAddNewServer}
                               onBackToClients={() => { setCurrentManagingClient(null); navigateTo(VIEWS.CLIENT_LIST); }}
                               onBackToDashboard={() => navigateTo(VIEWS.DASHBOARD)} />;
      case VIEWS.SERVER_FORM:
        const userClientsForForm = simDB.clients.filter(c => c.UserId === currentUser.id);
        return <ServerForm initialServer={editingServer} clients={userClientsForForm}
                           selectedClientId={currentManagingClient ? currentManagingClient.id : (editingServer ? editingServer.ClientId : null) }
                           onSubmitForm={handleServerSubmit}
                           onCancel={() => navigateTo(VIEWS.SERVER_LIST)} formError={formError} />;
      case VIEWS.CHAT_PAGE: // Add case for ChatPage
        return <ChatPage servers={servers} currentUser={currentUser} onBackToDashboard={() => navigateTo(VIEWS.DASHBOARD)} />;
      default:
        return <LoginPage onLogin={handleLogin} />;
    }
  };

  return <div className="App">{renderView()}</div>;
}

export default App;
