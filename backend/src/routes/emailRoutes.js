const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const { isAdmin } = require('../middleware/adminMiddleware');
const { testEmail } = require('../controllers/emailController');

router.post('/test', verifyToken, isAdmin, testEmail);

module.exports = router;
