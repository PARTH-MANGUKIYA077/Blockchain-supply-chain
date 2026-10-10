const express = require("express");
const router = express.Router();
const QRCode = require("qrcode");
const crypto = require("crypto");
const blockchainService = require("../services/blockchainService");
const Product = require("../models/Product");
const Transaction = require("../models/Transaction");
const SupplyChainEvent = require("../models/SupplyChainEvent");
const { protect, authorize } = require("../middleware/auth");

const buildProductPayload = (product) => ({
  _id: product._id,
  productId: product.productId,
  name: product.name,
  category: product.category,
  description: product.description,
  manufacturer: product.manufacturer,
  batchNumber: product.batchNumber,
  manufacturingDate: product.manufacturingDate,
  expiryDate: product.expiryDate,
  initialLocation: product.initialLocation,
  quantity: product.quantity,
  price: product.price,
  currentOwner: product.currentOwner,
  currentLocation: product.currentLocation,
  status: product.status,
  qrCode: product.qrCode,
  blockchainTxHash: product.blockchainTxHash,
  createdAt: product.createdAt
});

router.get("/", async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    return res.json({ success: true, count: products.length, data: products.map(buildProductPayload) });
  } catch (error) {
    try {
      const blockchainProducts = await blockchainService.getAllProducts();
      return res.json({ success: true, count: blockchainProducts.length, data: blockchainProducts });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message || error.message });
    }
  }
});

router.post("/", protect, authorize("ADMIN", "MANUFACTURER"), async (req, res) => {
  try {
    const { name, category, description, manufacturer, batchNumber, manufacturingDate, expiryDate, initialLocation, quantity, price, currentOwner, currentLocation, status } = req.body;

    if (!name || !manufacturer) {
      return res.status(400).json({ success: false, message: 'Product name and manufacturer are required.' });
    }

    const productId = req.body.productId || `PROD-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;

    const product = await Product.create({
      productId,
      name,
      category: category || 'General',
      description: description || '',
      manufacturer,
      manufacturerId: req.user._id,
      batchNumber: batchNumber || `BATCH-${Date.now()}`,
      manufacturingDate: manufacturingDate || new Date(),
      expiryDate: expiryDate || null,
      initialLocation: initialLocation || 'Factory',
      quantity: quantity || 1,
      price: price || 0,
      currentOwner: currentOwner || manufacturer,
      currentLocation: currentLocation || initialLocation || 'Factory',
      status: status || 'Manufactured',
      qrCode: `/verify/${productId}`,
      blockchainTxHash: req.body.blockchainTxHash || 'pending'
    });

    await Transaction.create({
      productId: product.productId,
      from: 'SYSTEM',
      to: product.currentOwner,
      action: 'Registered',
      location: product.currentLocation,
      blockchainTxHash: product.blockchainTxHash,
      timestamp: new Date()
    });

    await SupplyChainEvent.create({
      productId: product.productId,
      eventType: 'Manufactured',
      actor: req.user.name,
      location: product.currentLocation,
      description: 'Product registered and created by manufacturer.',
      timestamp: new Date(),
      blockchainTxHash: product.blockchainTxHash
    });

    return res.status(201).json({ success: true, data: buildProductPayload(product) });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Unable to create product.' });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findOne({ productId: req.params.id });
    if (product) {
      return res.json({ success: true, data: buildProductPayload(product) });
    }

    const blockchainData = await blockchainService.getProductById(req.params.id);
    return res.json({ success: true, data: blockchainData });
  } catch (error) {
    return res.status(404).json({ success: false, error: error.message || 'Product not found.' });
  }
});

router.post('/:id/transfer', protect, async (req, res) => {
  try {
    const { to, action, location, notes } = req.body;
    const product = await Product.findOne({ productId: req.params.id });
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    product.currentOwner = to || product.currentOwner;
    product.currentLocation = location || product.currentLocation;
    product.status = req.body.status || product.status;

    await product.save();

    await Transaction.create({
      productId: product.productId,
      from: product.currentOwner,
      to: to || product.currentOwner,
      action: action || 'Transferred',
      location: product.currentLocation,
      blockchainTxHash: req.body.blockchainTxHash || 'pending',
      timestamp: new Date()
    });

    await SupplyChainEvent.create({
      productId: product.productId,
      eventType: action || 'Transferred',
      actor: req.user.name,
      location: product.currentLocation,
      description: notes || 'Product transferred by authorized stakeholder.',
      timestamp: new Date(),
      blockchainTxHash: req.body.blockchainTxHash || 'pending'
    });

    return res.json({ success: true, data: buildProductPayload(product) });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Transfer failed.' });
  }
});

router.post('/:id/status', protect, async (req, res) => {
  try {
    const { status, location, notes } = req.body;
    const product = await Product.findOne({ productId: req.params.id });
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    product.status = status || product.status;
    product.currentLocation = location || product.currentLocation;
    await product.save();

    await SupplyChainEvent.create({
      productId: product.productId,
      eventType: status || 'StatusUpdated',
      actor: req.user.name,
      location: product.currentLocation,
      description: notes || 'Product status updated on the platform.',
      timestamp: new Date(),
      blockchainTxHash: req.body.blockchainTxHash || 'pending'
    });

    return res.json({ success: true, data: buildProductPayload(product) });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Status update failed.' });
  }
});

router.get('/:id/history', async (req, res) => {
  try {
    const transactions = await Transaction.find({ productId: req.params.id }).sort({ timestamp: 1 });
    const events = await SupplyChainEvent.find({ productId: req.params.id }).sort({ timestamp: 1 });
    return res.json({ success: true, data: { transactions, events } });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Unable to fetch history.' });
  }
});

router.get("/:id/qr", async (req, res) => {
  try {
    const product = await Product.findOne({ productId: req.params.id });
    if (!product) {
      throw new Error('Product not found.');
    }

    const payload = JSON.stringify({
      productId: product.productId,
      name: product.name,
      manufacturer: product.manufacturer,
      owner: product.currentOwner,
      status: product.status,
      verifyUrl: `http://localhost:3000/verify/${product.productId}`
    });

    const qrDataUrl = await QRCode.toDataURL(payload, {
      errorCorrectionLevel: "H",
      margin: 2,
      width: 300,
      color: {
        dark: "#0f172a",
        light: "#ffffff"
      }
    });

    return res.json({ success: true, productId: req.params.id, qrDataUrl });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await Product.findOneAndDelete({ $or: [{ productId: req.params.id }, { _id: req.params.id }] });
    await Transaction.deleteMany({ productId: req.params.id });
    await SupplyChainEvent.deleteMany({ productId: req.params.id });
    return res.json({ success: true, message: "Product deleted." });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
