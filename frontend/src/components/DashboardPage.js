import React from 'react';

// Basic styling for nav buttons (ensure it's defined once)
const ensureNavButtonStyles = () => {
  const styleSheetId = "nav-button-styles";
  if (!document.getElementById(styleSheetId)) {
    const styleSheet = document.createElement("style");
    styleSheet.id = styleSheetId;
    styleSheet.type = "text/css";
    styleSheet.innerText = `
      .nav-button {
        background: none; border: none; color: blue; text-decoration: underline;
        cursor: pointer; padding: 5px 0; text-align: left; display: block; width: 100%;
      }
      .nav-button:hover { color: darkblue; }
    `;
    document.head.appendChild(styleSheet);
  }
};
ensureNavButtonStyles(); // Call it to make sure styles are available

function DashboardPage({ onLogout, currentUser, onNavigateToProfile, onNavigateToClients, onNavigateToServers, onNavigateToChat }) {
  return (
    <div>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #ccc', padding: '10px', margin: '0 10px 10px 10px' }}>
        <h2>Dashboard</h2>
        <div>
          {currentUser && <span style={{ marginRight: '10px' }}>Welcome, {currentUser.username}!</span>}
          <button onClick={onNavigateToProfile} style={{ marginRight: '10px' }}>User Profile</button>
          <button onClick={onLogout}>Logout</button>
        </div>
      </header>
      <div style={{ display: 'flex', padding: '0 10px' }}>
        <aside style={{ width: '200px', border: '1px solid #ccc', padding: '10px', marginRight: '10px' }}>
          <h4>Navigation</h4>
          <ul>
            <li><button onClick={onNavigateToProfile} className="nav-button">Edit Profile</button></li>
            <li><button onClick={onNavigateToClients} className="nav-button">Manage Clients</button></li>
            <li><button onClick={onNavigateToServers} className="nav-button">Manage Servers</button></li>
            <li><button onClick={onNavigateToChat} className="nav-button">AI Chat Agent</button></li> {/* Add Chat link */}
          </ul>
        </aside>
        <main style={{ flex: 1, border: '1px solid #ccc', padding: '10px' }}>
          Main Content Area
          <p>Welcome to the AI Support Agent application!</p>
          {currentUser && <p>Your User ID is: {currentUser.id}. Your email is: {currentUser.email}.</p>}
        </main>
      </div>
    </div>
  );
}

export default DashboardPage;
