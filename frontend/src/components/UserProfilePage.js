import React, { useState, useEffect } from 'react';

function UserProfilePage({ currentUser, onUpdateUser, onBackToDashboard }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [settings, setSettings] = useState(''); // Assuming settings is a string for simplicity
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (currentUser) {
      setUsername(currentUser.username || '');
      setEmail(currentUser.email || ''); // Assuming email is part of currentUser from App.js
      setSettings(currentUser.settings || ''); // Assuming settings is part of currentUser
    }
  }, [currentUser]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage('');
    setError('');

    if (!username || !email) {
      setError('Username and Email cannot be empty.');
      return;
    }

    const updatedUserData = {
      username,
      email,
      settings
      // password should be updated via a separate "change password" form for security
    };

    console.log('Attempting to update user profile with:', updatedUserData);
    // Simulate API call to PUT /users/:id
    // In a real app, you would use fetch or axios here:
    // try {
    //   const response = await fetch(`/users/${currentUser.id}`, { // Path to your backend endpoint
    //     method: 'PUT',
    //     headers: {
    //       'Content-Type': 'application/json',
    //       'Authorization': `Bearer ${localStorage.getItem('authToken')}` // Or however token is stored
    //     },
    //     body: JSON.stringify(updatedUserData),
    //   });
    //   const data = await response.json();
    //   if (response.ok) {
    //     setMessage('Profile updated successfully!');
    //     onUpdateUser(data); // Update App.js state
    //   } else {
    //     setError(data.error || 'Profile update failed.');
    //   }
    // } catch (err) {
    //   setError('Network error or server is unavailable.');
    //   console.error('Profile update API call failed:', err);
    // }

    // --- Simulation for current environment ---
    if (currentUser && currentUser.id) { // Check if currentUser and id exist
        console.log(`Simulating update for user ID: ${currentUser.id}`);
        // Simulate successful update
        onUpdateUser({ ...currentUser, ...updatedUserData }); // Update user in App.js state
        setMessage('Profile updated successfully! (Simulation)');
    } else {
        setError('User data not available for update (Simulation).');
    }
    // --- End Simulation ---
  };

  if (!currentUser) {
    return (
      <div>
        <p>Loading user data or user not found...</p>
        <button onClick={onBackToDashboard}>Back to Dashboard</button>
      </div>
    );
  }

  return (
    <div>
      <h2>User Profile</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="username">Username:</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="settings">Settings (e.g., theme preference):</label>
          <textarea
            id="settings"
            value={settings}
            onChange={(e) => setSettings(e.target.value)}
            placeholder="Enter any personalization settings here (e.g., JSON string)"
          />
        </div>
        {message && <p style={{ color: 'green' }}>{message}</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button type="submit">Update Profile</button>
      </form>
      <button onClick={onBackToDashboard} style={{ marginTop: '10px' }}>Back to Dashboard</button>
    </div>
  );
}

export default UserProfilePage;
