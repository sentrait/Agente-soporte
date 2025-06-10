const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
// const CryptoJS = require('crypto-js'); // Conceptually for API key encryption
const sequelize = require('./database');
const { User, Client, Server, AIConfiguration } = require('./models');

const app = express();
const port = process.env.PORT || 3001;
const JWT_SECRET = 'your-very-secret-key-that-should-be-in-env';
// const ENCRYPTION_KEY = process.env.API_KEY_ENCRYPTION_KEY; // For actual encryption

app.use(express.json());

// --- Utility functions for conceptual encryption/decryption ---
// These are placeholders. In a real app, use a robust library and proper key management.
// const encryptApiKey = (apiKey) => {
//   if (!ENCRYPTION_KEY) { console.error("ENCRYPTION_KEY not set!"); return apiKey; }
//   return CryptoJS.AES.encrypt(apiKey, ENCRYPTION_KEY).toString();
// };
// const decryptApiKey = (encryptedApiKey) => {
//   if (!ENCRYPTION_KEY) { console.error("ENCRYPTION_KEY not set!"); return encryptedApiKey; }
//   const bytes = CryptoJS.AES.decrypt(encryptedApiKey, ENCRYPTION_KEY);
//   return bytes.toString(CryptoJS.enc.Utf8);
// };


// --- Authentication Middleware ---
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (token == null) return res.sendStatus(401);
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// --- Auth Routes ---
app.post('/auth/register', async (req, res) => {
  try {
    const { username, email, password, settings } = req.body;
    if (!password) return res.status(400).json({ error: "Password is required" });
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({ username, email, password_hash: hashedPassword, settings });
    const userResponse = newUser.toJSON();
    delete userResponse.password_hash;
    res.status(201).json(userResponse);
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') return res.status(409).json({ error: 'Username or email already exists.' });
    res.status(400).json({ error: error.message });
  }
});

app.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });
    const tokenPayload = { id: user.id, username: user.username, email: user.email }; // Added email to token
    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '1h' });
    res.status(200).json({ token, userId: user.id, username: user.username, email: user.email });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- User Routes ---
app.get('/users', authenticateToken, async (req, res) => {
  try {
    const users = await User.findAll({ attributes: { exclude: ['password_hash'] } });
    res.status(200).json(users);
  } catch (error) { res.status(500).json({ error: error.message }); }
});
app.get('/users/:id', authenticateToken, async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, { attributes: { exclude: ['password_hash'] } });
    // Example admin check or self-check (assuming isAdmin field in JWT payload or DB)
    // For simplicity, allow access if token is valid, but in real app this needs more granular authZ
    if (user) {
        // if (req.user.id === parseInt(req.params.id) || req.user.isAdmin)
      res.status(200).json(user);
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) { res.status(500).json({ error: error.message }); }
});
app.put('/users/:id', authenticateToken, async (req, res) => {
  try {
    if (req.user.id !== parseInt(req.params.id) /* && !req.user.isAdmin */) {
       return res.status(403).json({ error: "Forbidden" });
    }
    const { username, email, settings } = req.body;
    const [updated] = await User.update({ username, email, settings }, { where: { id: req.params.id } });
    if (updated) {
      const updatedUser = await User.findByPk(req.params.id, { attributes: { exclude: ['password_hash'] } });
      res.status(200).json(updatedUser);
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) { res.status(400).json({ error: error.message }); }
});
app.delete('/users/:id', authenticateToken, async (req, res) => {
  try {
    if (req.user.id !== parseInt(req.params.id) /* && !req.user.isAdmin */) {
      return res.status(403).json({ error: "Forbidden" });
    }
    const deleted = await User.destroy({ where: { id: req.params.id } });
    if (deleted) { res.status(204).send(); }
    else { res.status(404).json({ error: 'User not found' }); }
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// --- Client Routes ---
app.post('/clients', authenticateToken, async (req, res) => {
  try {
    const { name, contact_info } = req.body;
    const newClient = await Client.create({ name, contact_info, UserId: req.user.id });
    res.status(201).json(newClient);
  } catch (error) { res.status(400).json({ error: error.message }); }
});
app.get('/clients', authenticateToken, async (req, res) => {
  try {
    const clients = await Client.findAll({ where: { UserId: req.user.id } });
    res.status(200).json(clients);
  } catch (error) { res.status(500).json({ error: error.message }); }
});
app.get('/clients/:id', authenticateToken, async (req, res) => {
  try {
    const client = await Client.findOne({ where: { id: req.params.id, UserId: req.user.id } });
    if (client) { res.status(200).json(client); }
    else { res.status(404).json({ error: 'Client not found or not authorized' }); }
  } catch (error) { res.status(500).json({ error: error.message }); }
});
app.put('/clients/:id', authenticateToken, async (req, res) => {
  try {
    const { name, contact_info } = req.body;
    const [updated] = await Client.update({ name, contact_info }, { where: { id: req.params.id, UserId: req.user.id } });
    if (updated) {
      const updatedClient = await Client.findByPk(req.params.id);
      res.status(200).json(updatedClient);
    } else {
      res.status(404).json({ error: 'Client not found or not authorized' });
    }
  } catch (error) { res.status(400).json({ error: error.message }); }
});
app.delete('/clients/:id', authenticateToken, async (req, res) => {
  try {
    const serverCount = await Server.count({ where: { ClientId: req.params.id } });
    if (serverCount > 0) {
        return res.status(400).json({ error: 'Cannot delete client: It has associated servers. Please delete or reassign servers first.' });
    }
    const deleted = await Client.destroy({ where: { id: req.params.id, UserId: req.user.id } });
    if (deleted) { res.status(204).send(); }
    else { res.status(404).json({ error: 'Client not found or not authorized' }); }
  } catch (error) { res.status(500).json({ error: error.message }); }
});


// --- Server Routes ---
app.post('/servers', authenticateToken, async (req, res) => {
  try {
    const { name, ip_address, username, password_hash, ssh_key_path, os_type, ClientId } = req.body;
    const client = await Client.findOne({ where: { id: ClientId, UserId: req.user.id } });
    if (!client) return res.status(403).json({ error: 'Forbidden: Client does not belong to the authenticated user.' });
    // TODO: Encrypt password_hash if provided (e.g., using bcrypt if it's a new password, or specific encryption for stored secrets)
    // TODO: Manage SSH key storage securely (e.g., store path to a secure vault or encrypted key itself)
    const newServer = await Server.create({ name, ip_address, username, password_hash /* store encrypted */, ssh_key_path, os_type, ClientId });
    const serverJson = newServer.toJSON();
    delete serverJson.password_hash; // Ensure password hash is not returned
    res.status(201).json(serverJson);
  } catch (error) { res.status(400).json({ error: error.message }); }
});

app.get('/servers', authenticateToken, async (req, res) => {
  try {
    const servers = await Server.findAll({
      include: [{ model: Client, where: { UserId: req.user.id }, attributes: ['id', 'name'] }]
    });
    res.status(200).json(servers.map(s => {
        const serverJson = s.toJSON();
        delete serverJson.password_hash;
        // TODO: Decide how to represent ssh_key_path (e.g., boolean 'sshKeySet')
        return serverJson;
    }));
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.get('/servers/:id', authenticateToken, async (req, res) => {
  try {
    const server = await Server.findOne({
      where: { id: req.params.id },
      include: [{ model: Client, where: { UserId: req.user.id }, required: true, attributes: ['id', 'name'] }]
    });
    if (server) {
      const serverJson = server.toJSON();
      delete serverJson.password_hash;
      res.status(200).json(serverJson);
    } else {
      res.status(404).json({ error: 'Server not found or not authorized' });
    }
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.put('/servers/:id', authenticateToken, async (req, res) => {
  try {
    const { name, ip_address, username, password_hash, ssh_key_path, os_type, ClientId } = req.body;
    const existingServer = await Server.findOne({ where: { id: req.params.id }, include: [{ model: Client, where: { UserId: req.user.id } }]});
    if (!existingServer || !existingServer.Client) return res.status(404).json({ error: 'Server not found or not authorized.' });
    if (ClientId && existingServer.ClientId !== ClientId) {
        const newClient = await Client.findOne({ where: { id: ClientId, UserId: req.user.id } });
        if (!newClient) return res.status(403).json({ error: 'Forbidden: New Client does not belong to user.' });
    }
    let updateData = { name, ip_address, username, ssh_key_path, os_type, ClientId };
    if (password_hash) {
      // TODO: Encrypt password_hash if it's a new password being set
      updateData.password_hash = password_hash; // Conceptual: store encrypted if new one provided
    }

    const [updated] = await Server.update(updateData, { where: { id: req.params.id } });
    if (updated) {
      const updatedServer = await Server.findByPk(req.params.id, {attributes: {exclude: ['password_hash']}});
      res.status(200).json(updatedServer);
    } else {
      // This might happen if data is identical, not necessarily an error.
      // Re-fetch to send current state or rely on client to not see this as error if data was same.
      const currentServer = await Server.findByPk(req.params.id, {attributes: {exclude: ['password_hash']}});
      if(currentServer) return res.status(200).json(currentServer); // Return current if no actual change but record exists
      res.status(404).json({ error: 'Server not found (after auth check).' });
    }
  } catch (error) { res.status(400).json({ error: error.message }); }
});

app.delete('/servers/:id', authenticateToken, async (req, res) => {
  try {
    const server = await Server.findOne({ where: { id: req.params.id }, include: [{ model: Client, where: { UserId: req.user.id } }]});
    if (!server || !server.Client) return res.status(404).json({ error: 'Server not found or not authorized.' });
    const deleted = await Server.destroy({ where: { id: req.params.id } });
    if (deleted) { res.status(204).send(); }
    else { res.status(404).json({ error: 'Server not found (after auth check).' }); }
  } catch (error) { res.status(500).json({ error: error.message }); }
});


// --- AIConfiguration Routes (with encryption comments) ---
app.post('/ai-configurations', authenticateToken, async (req, res) => {
  try {
    let { provider_name, api_key, model_name } = req.body;
    // IMPORTANT: API keys MUST be encrypted at rest.
    // const encryptedApiKey = encryptApiKey(api_key); // Conceptual
    // Store 'encryptedApiKey' instead of 'api_key'
    const newConfig = await AIConfiguration.create({
      provider_name,
      api_key: api_key, // Storing raw key - MAJOR SECURITY RISK - FOR SIMULATION ONLY
      model_name,
      UserId: req.user.id
    });
    const responseConfig = newConfig.toJSON();
    delete responseConfig.api_key; // Never return API key
    res.status(201).json(responseConfig);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/ai-configurations', authenticateToken, async (req, res) => {
  try {
    const configs = await AIConfiguration.findAll({
      where: { UserId: req.user.id },
      attributes: { exclude: ['api_key'] } // Always exclude API key from listings
    });
    res.status(200).json(configs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/ai-configurations/:id', authenticateToken, async (req, res) => {
  try {
    const config = await AIConfiguration.findOne({
      where: { id: req.params.id, UserId: req.user.id },
      attributes: { exclude: ['api_key'] } // Exclude API key by default
    });
    // If displaying in an edit form, the client should know not to expect the key.
    // If the key needs to be updated, it's a separate input.
    if (config) {
      res.status(200).json(config);
    } else {
      res.status(404).json({ error: 'AI Configuration not found or not authorized' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/ai-configurations/:id', authenticateToken, async (req, res) => {
  try {
    let { provider_name, api_key, model_name } = req.body;
    let updateData = { provider_name, model_name };

    if (api_key && api_key.trim() !== '') { // Check if api_key is provided and not empty
      // IMPORTANT: Encrypt the new API KEY before saving.
      // updateData.api_key = encryptApiKey(api_key); // Conceptual
      updateData.api_key = api_key; // Storing raw key - MAJOR SECURITY RISK - FOR SIMULATION ONLY
    }
    // If api_key is not in req.body or is empty, it will not be included in updateData,
    // so the existing api_key in the database will remain unchanged.

    const [updated] = await AIConfiguration.update(updateData, {
      where: { id: req.params.id, UserId: req.user.id },
    });

    if (updated) {
      const updatedConfig = await AIConfiguration.findByPk(req.params.id, {
        attributes: { exclude: ['api_key'] } // Exclude API key from response
      });
      res.status(200).json(updatedConfig);
    } else {
      res.status(404).json({ error: 'AI Configuration not found or not authorized, or data was unchanged.' });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.delete('/ai-configurations/:id', authenticateToken, async (req, res) => {
  try {
    const deleted = await AIConfiguration.destroy({
      where: { id: req.params.id, UserId: req.user.id }
    });
    if (deleted) {
      res.status(204).send();
    } else {
      res.status(404).json({ error: 'AI Configuration not found or not authorized' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Basic route
app.get('/', (req, res) => { res.send('Backend server is running!'); });

sequelize.sync({ force: false })
  .then(() => { console.log('Database synced (or would be).'); app.listen(port, () => { console.log(`Server listening (or would be).`); }); })
  .catch(err => { console.error('Failed to sync/start server:', err); });
