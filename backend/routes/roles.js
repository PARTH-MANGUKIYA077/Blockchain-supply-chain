const express = require("express");
const router = express.Router();
const blockchainService = require("../services/blockchainService");

// GET /api/roles - Fetch all registered users and their roles
router.get("/", async (req, res) => {
  try {
    const users = await blockchainService.getAllUsers();
    res.json({ success: true, data: users });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/roles/:address - Fetch role for specific address
router.get("/:address", async (req, res) => {
  try {
    const role = await blockchainService.getUserRole(req.params.address);
    res.json({ success: true, address: req.params.address, role: role || "NONE" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
