import dns from 'dns';
import dotenv from 'dotenv';
import app from './src/app.js';
import connectToDB from './src/config/db.js';

// Set custom DNS servers to avoid potential issues with DNS resolution
dns.setServers(['8.8.8.8', '1.1.1.1']);

// Load environment variables from .env file
dotenv.config();

// Start the server
const serverStatus = () => {
  console.log('Server is running on port 3000');
};

// Connect to the database and then start the server
connectToDB();
app.listen(3000, serverStatus);
