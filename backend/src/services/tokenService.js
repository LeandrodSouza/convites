const crypto = require('crypto');

const generateToken = () => {
  return crypto.randomBytes(6).toString('hex');
};

const validateToken = (token) => {
  return token && typeof token === 'string' && token.length === 12;
};

module.exports = {
  generateToken,
  validateToken
};
