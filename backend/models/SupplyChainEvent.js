const mongoose = require('mongoose');

const supplyChainEventSchema = new mongoose.Schema(
  {
    productId: { type: String, required: true },
    eventType: { type: String, required: true },
    actor: { type: String, default: '' },
    location: { type: String, default: '' },
    description: { type: String, default: '' },
    timestamp: { type: Date, default: Date.now },
    blockchainTxHash: { type: String, default: '' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('SupplyChainEvent', supplyChainEventSchema);
