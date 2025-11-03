const { sendEmail } = require('../services/emailService');

const testEmail = async (req, res) => {
  try {
    const result = await sendEmail('invite', {
      token: 'test123',
      link: 'http://localhost:3000/invite?t=test123'
    });

    res.json(result);
  } catch (error) {
    console.error('Error testing email:', error);
    res.status(500).json({ error: 'Error testing email' });
  }
};

module.exports = {
  testEmail
};
