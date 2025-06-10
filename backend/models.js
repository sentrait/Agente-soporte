const { DataTypes } = require('sequelize');
const sequelize = require('./database');

// Define User model
const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password_hash: {
    type: DataTypes.STRING,
    allowNull: false
  },
  // Placeholder for personalization settings (can be JSON or separate table)
  settings: {
    type: DataTypes.TEXT
  }
});

// Define Client model
const Client = sequelize.define('Client', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  contact_info: {
    type: DataTypes.STRING
  }
});

// Define Server model
const Server = sequelize.define('Server', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  ip_address: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isIP: true
    }
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false
  },
  password_hash: { // For storing encrypted password or reference to vault
    type: DataTypes.STRING
  },
  ssh_key_path: { // Path to SSH key file, or reference to vault
    type: DataTypes.STRING
  },
  os_type: {
    type: DataTypes.STRING
  }
});

// Define AIConfiguration model
const AIConfiguration = sequelize.define('AIConfiguration', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  provider_name: { // e.g., 'OpenAI', 'Gemini', 'DeepSeek'
    type: DataTypes.STRING,
    allowNull: false
  },
  api_key: { // Encrypted API key
    type: DataTypes.STRING,
    allowNull: false
  },
  model_name: { // e.g., 'gpt-3.5-turbo', 'gemini-pro'
    type: DataTypes.STRING
  }
});

// Define relationships
User.hasMany(AIConfiguration);
AIConfiguration.belongsTo(User);

User.hasMany(Client); // Assuming a user can manage multiple clients
Client.belongsTo(User);

Client.hasMany(Server);
Server.belongsTo(Client);

module.exports = {
  sequelize,
  User,
  Client,
  Server,
  AIConfiguration
};
