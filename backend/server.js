require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { initializeFirebase } = require('./src/services/firebaseService');

// Initialize Firebase
initializeFirebase();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const inviteRoutes = require('./src/routes/inviteRoutes');
const giftRoutes = require('./src/routes/giftRoutes');
const adminRoutes = require('./src/routes/adminRoutes');
const emailRoutes = require('./src/routes/emailRoutes');
const userRoutes = require('./src/routes/userRoutes');

app.use('/api/invites', inviteRoutes);
app.use('/api/gifts', giftRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/email', emailRoutes);
app.use('/api/users', userRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
