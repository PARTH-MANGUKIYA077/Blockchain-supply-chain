const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'blockchain-supply-chain-secret';

const signToken = (user) =>
  jwt.sign({ id: user._id, role: user.role, email: user.email }, JWT_SECRET, {
    expiresIn: '7d'
  });

module.exports = { signToken };
