const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    productId: { type: String, required: true },
    from: { type: String, default: '' },
    to: { type: String, default: '' },
    action: { type: String, required: true },
    location: { type: String, default: '' },
    blockchainTxHash: { type: String, default: '' },
    timestamp: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Transaction', transactionSchema);
