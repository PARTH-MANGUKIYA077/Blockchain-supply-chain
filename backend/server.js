require('dotenv').config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const mongoose = require("mongoose");

const blockchainService = require("./services/blockchainService");
const productRoutes = require("./routes/products");
const roleRoutes = require("./routes/roles");
const authRoutes = require("./routes/auth");
const usersRoutes = require("./routes/users");
const verifyRoutes = require("./routes/verify");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: "10mb" }));

app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/products", productRoutes);
app.use("/api/roles", roleRoutes);
app.use("/api/verify", verifyRoutes);

app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "Backend is running", timestamp: new Date().toISOString() });
});

app.get("/api/status", (req, res) => {
  const configPath = path.join(__dirname, "config/contractDetails.json");
  let contractInfo = null;
  if (fs.existsSync(configPath)) {
    contractInfo = JSON.parse(fs.readFileSync(configPath, "utf8"));
  }

  res.json({
    status: "online",
    timestamp: new Date().toISOString(),
    contractDeployed: !!contractInfo,
    contractAddress: contractInfo ? contractInfo.address : null,
    sampleAccounts: contractInfo ? contractInfo.sampleAccounts : null,
    database: mongoose.connection.readyState === 1 ? "connected" : "offline"
  });
});

const startServer = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/blockchain-supply-chain";
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
      autoIndex: true
    });
    console.log("MongoDB connected successfully.");
  } catch (error) {
    console.warn("MongoDB unavailable. Continuing with local blockchain-only mode.", error.message);
  }

  // Serve frontend build if dist exists (e.g. Render/production deployment)
  const frontendDist = path.join(__dirname, "../frontend/dist");
  if (fs.existsSync(frontendDist)) {
    app.use(express.static(frontendDist));
    app.get("*", (req, res, next) => {
      if (req.path.startsWith("/api")) {
        return next();
      }
      res.sendFile(path.join(frontendDist, "index.html"));
    });
  }

  app.listen(PORT, async () => {
    console.log(`Backend Server listening on http://localhost:${PORT}`);
    await blockchainService.init();
  });
};

startServer();
