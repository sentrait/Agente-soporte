import React, { useState, useEffect, useRef } from 'react';

function ChatPage({ servers, currentUser, onBackToDashboard }) {
  const [selectedServerId, setSelectedServerId] = useState('');
  const [currentMessage, setCurrentMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]); // Array of { sender: 'user'/'ai', text: 'message' }
  const [isLoading, setIsLoading] = useState(false); // For AI response simulation

  const chatDisplayRef = useRef(null); // To auto-scroll chat

  useEffect(() => {
    // Auto-scroll to the bottom of the chat display when new messages are added
    if (chatDisplayRef.current) {
      chatDisplayRef.current.scrollTop = chatDisplayRef.current.scrollHeight;
    }
  }, [chatHistory]);

  useEffect(() => {
    // Pre-select the first server if servers list is available and no server is selected
    if (servers && servers.length > 0 && !selectedServerId) {
      setSelectedServerId(servers[0].id.toString());
    }
  }, [servers, selectedServerId]);


  const handleServerChange = (e) => {
    setSelectedServerId(e.target.value);
    setChatHistory([]); // Clear chat history when server changes
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!currentMessage.trim()) return;
    if (!selectedServerId) {
      alert('Please select a server first.');
      return;
    }

    const userMessage = { sender: 'user', text: currentMessage, timestamp: new Date() };
    setChatHistory(prev => [...prev, userMessage]);
    setCurrentMessage('');
    setIsLoading(true);

    // Simulate API call to backend AI agent
    console.log(`Sending message to AI for server ${selectedServerId}: "${userMessage.text}"`);
    // In a real app, this would be:
    // try {
    //   const response = await fetch('/api/chat', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` },
    //     body: JSON.stringify({ message: userMessage.text, serverId: selectedServerId, userId: currentUser.id })
    //   });
    //   const data = await response.json();
    //   if (response.ok) {
    //     const aiResponse = { sender: 'ai', text: data.reply, timestamp: new Date() };
    //     setChatHistory(prev => [...prev, aiResponse]);
    //   } else {
    //     const errorResponse = { sender: 'ai', text: `Error: ${data.error || 'Failed to get response.'}`, timestamp: new Date() };
    //     setChatHistory(prev => [...prev, errorResponse]);
    //   }
    // } catch (error) {
    //    const errorResponse = { sender: 'ai', text: `Error: Network or server issue.`, timestamp: new Date() };
    //    setChatHistory(prev => [...prev, errorResponse]);
    // } finally {
    //   setIsLoading(false);
    // }

    // --- Simulation for current environment ---
    setTimeout(() => {
      const selectedServer = servers.find(s => s.id.toString() === selectedServerId);
      const aiResponseText = `Simulated AI response regarding server: ${selectedServer ? selectedServer.name : 'Unknown Server'}. You said: "${userMessage.text}". I am processing this.`;
      const aiResponse = { sender: 'ai', text: aiResponseText, timestamp: new Date() };
      setChatHistory(prev => [...prev, aiResponse]);
      setIsLoading(false);
    }, 1500); // Simulate network delay
    // --- End Simulation ---
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 40px)', padding: '10px' }}>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px'}}>
        <h2>AI Chat Agent</h2>
        <button onClick={onBackToDashboard}>Back to Dashboard</button>
      </div>

      <div>
        <label htmlFor="server-select">Select Server: </label>
        <select id="server-select" value={selectedServerId} onChange={handleServerChange} disabled={!servers || servers.length === 0}>
          <option value="">-- {servers && servers.length > 0 ? "Select a server" : "No servers available"} --</option>
          {servers && servers.map(server => (
            <option key={server.id} value={server.id}>
              {server.name} ({server.ip_address}) - Client: {server.Client ? server.Client.name : 'N/A'}
            </option>
          ))}
        </select>
      </div>

      <div ref={chatDisplayRef} style={{ flexGrow: 1, border: '1px solid #ccc', padding: '10px', marginBottom: '10px', overflowY: 'auto', backgroundColor: '#f9f9f9' }}>
        {chatHistory.map((msg, index) => (
          <div key={index} style={{ marginBottom: '10px', textAlign: msg.sender === 'user' ? 'right' : 'left' }}>
            <div style={{
              display: 'inline-block',
              padding: '8px 12px',
              borderRadius: '10px',
              backgroundColor: msg.sender === 'user' ? '#007bff' : '#e9ecef',
              color: msg.sender === 'user' ? 'white' : 'black',
              maxWidth: '70%',
            }}>
              <div style={{ fontWeight: 'bold', marginBottom: '3px' }}>{msg.sender === 'user' ? (currentUser ? currentUser.username : 'User') : 'AI Agent'}</div>
              <div>{msg.text}</div>
              <div style={{ fontSize: '0.75em', marginTop: '4px', textAlign: 'right' }}>
                {new Date(msg.timestamp).toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}
        {isLoading && <div style={{textAlign: 'center', color: '#777'}}>AI is thinking...</div>}
      </div>

      <form onSubmit={handleSendMessage} style={{ display: 'flex' }}>
        <input
          type="text"
          value={currentMessage}
          onChange={(e) => setCurrentMessage(e.target.value)}
          placeholder="Type your message here..."
          style={{ flexGrow: 1, marginRight: '10px', padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
          disabled={!selectedServerId || isLoading}
        />
        <button type="submit" style={{ padding: '10px 15px', borderRadius: '5px', border: 'none', backgroundColor: '#007bff', color: 'white', cursor: 'pointer' }} disabled={!selectedServerId || isLoading}>
          Send
        </button>
      </form>
    </div>
  );
}

export default ChatPage;
