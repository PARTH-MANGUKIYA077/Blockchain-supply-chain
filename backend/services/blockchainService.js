const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");

class BlockchainService {
  constructor() {
    this.provider = null;
    this.contract = null;
    this.configPath = path.join(__dirname, "../config/contractDetails.json");
    this.stateNames = [
      "Created",
      "Manufactured",
      "In Transit to Supplier",
      "With Supplier",
      "In Transit to Distributor",
      "With Distributor",
      "In Transit to Retailer",
      "With Retailer",
      "Sold to Consumer"
    ];
  }

  async init() {
    try {
      const rpcUrl = process.env.RPC_URL || "http://127.0.0.1:8545";
      this.provider = new ethers.JsonRpcProvider(rpcUrl);

      if (fs.existsSync(this.configPath)) {
        const config = JSON.parse(fs.readFileSync(this.configPath, "utf8"));
        this.contract = new ethers.Contract(config.address, config.abi, this.provider);
        console.log(`Connected to Blockchain Contract at ${config.address}`);
      } else {
        console.warn("contractDetails.json not found yet. Run 'npm run deploy' to create it.");
      }
    } catch (err) {
      console.error("Error initializing BlockchainService:", err.message);
    }
  }

  getContract() {
    if (!this.contract) {
      if (fs.existsSync(this.configPath)) {
        const config = JSON.parse(fs.readFileSync(this.configPath, "utf8"));
        this.contract = new ethers.Contract(config.address, config.abi, this.provider);
      } else {
        throw new Error("Contract not deployed or config file missing.");
      }
    }
    return this.contract;
  }

  formatProduct(raw) {
    return {
      id: Number(raw.id),
      sku: raw.sku,
      name: raw.name,
      description: raw.description,
      priceEth: ethers.formatEther(raw.price),
      priceWei: raw.price.toString(),
      stateCode: Number(raw.state),
      stateName: this.stateNames[Number(raw.state)] || "Unknown",
      owner: raw.owner,
      manufacturer: raw.manufacturer,
      supplier: raw.supplier,
      distributor: raw.distributor,
      retailer: raw.retailer,
      consumer: raw.consumer,
      createdAt: new Date(Number(raw.createdAt) * 1000).toISOString()
    };
  }

  formatHistory(historyItems) {
    return historyItems.map((item) => ({
      stateCode: Number(item.state),
      stateName: this.stateNames[Number(item.state)] || "Unknown",
      updatedBy: item.updatedBy,
      timestamp: new Date(Number(item.timestamp) * 1000).toISOString(),
      location: item.location,
      notes: item.notes
    }));
  }

  async getAllProducts() {
    const contract = this.getContract();
    const rawProducts = await contract.getAllProducts();
    return rawProducts.map((p) => this.formatProduct(p));
  }

  async getProductById(id) {
    const contract = this.getContract();
    const raw = await contract.getProduct(id);
    const history = await contract.getProductHistory(id);
    return {
      product: this.formatProduct(raw),
      history: this.formatHistory(history)
    };
  }

  async getAllUsers() {
    const contract = this.getContract();
    const [accounts, roles] = await contract.getAllUsers();
    return accounts.map((acc, i) => ({
      address: acc,
      role: roles[i] || "NONE"
    }));
  }

  async getUserRole(address) {
    const contract = this.getContract();
    return await contract.getRole(address);
  }
}

const instance = new BlockchainService();
module.exports = instance;
