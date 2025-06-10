import React, { useState } from 'react';

function LoginPage({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(''); // Clear previous errors

    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    // Simulate API call
    console.log('Attempting login with:', email, password);
    // In a real app, you would use fetch or axios here:
    // try {
    //   const response = await fetch('/auth/login', { // Path to your backend endpoint
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({ email, password }),
    //   });
    //   const data = await response.json();
    //   if (response.ok) {
    //     onLogin(data.token, { username: data.username, id: data.userId }); // Pass token and user info
    //   } else {
    //     setError(data.error || 'Login failed.');
    //   }
    // } catch (err) {
    //   setError('Network error or server is unavailable.');
    //   console.error('Login API call failed:', err);
    // }

    // --- Simulation for current environment ---
    if (email === "test@example.com" && password === "password") {
      // Simulate a successful login with a dummy token and user info
      const dummyToken = "fake-jwt-token." + Math.random().toString(36).substring(7);
      const dummyUser = { username: "TestUser", id: 1 };
      console.log("Simulated login successful for test@example.com");
      onLogin(dummyToken, dummyUser);
    } else {
      console.log("Simulated login failed for:", email);
      setError('Invalid credentials (simulation). Try test@example.com and password.');
    }
    // --- End Simulation ---
  };

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email">Email:</label>
          <input
            type="email" // Changed from text to email
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button type="submit">Login</button>
      </form>
    </div>
  );
}

export default LoginPage;
