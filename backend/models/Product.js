const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    productId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    category: { type: String, default: 'General' },
    description: { type: String, default: '' },
    manufacturer: { type: String, required: true },
    manufacturerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    batchNumber: { type: String, default: '' },
    manufacturingDate: { type: Date },
    expiryDate: { type: Date },
    initialLocation: { type: String, default: '' },
    quantity: { type: Number, default: 1 },
    price: { type: Number, default: 0 },
    currentOwner: { type: String, default: '' },
    currentLocation: { type: String, default: '' },
    status: {
      type: String,
      enum: ['Manufactured', 'In Transit', 'Received', 'At Warehouse', 'At Retailer', 'Sold'],
      default: 'Manufactured'
    },
    qrCode: { type: String, default: '' },
    blockchainTxHash: { type: String, default: '' },
    createdAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Product', productSchema);
