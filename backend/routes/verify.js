const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Transaction = require('../models/Transaction');
const SupplyChainEvent = require('../models/SupplyChainEvent');

router.get('/:productId', async (req, res) => {
  try {
    const product = await Product.findOne({ productId: req.params.productId });
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found or could not be verified.'
      });
    }

    const history = await Transaction.find({ productId: req.params.productId }).sort({ timestamp: 1 });
    const events = await SupplyChainEvent.find({ productId: req.params.productId }).sort({ timestamp: 1 });

    const response = {
      success: true,
      verified: true,
      product: {
        productId: product.productId,
        name: product.name,
        category: product.category,
        manufacturer: product.manufacturer,
        batchNumber: product.batchNumber,
        manufacturingDate: product.manufacturingDate,
        currentOwner: product.currentOwner,
        currentLocation: product.currentLocation,
        status: product.status,
        blockchainTxHash: product.blockchainTxHash,
        createdAt: product.createdAt
      },
      history,
      events
    };

    return res.json(response);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
