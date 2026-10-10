# 📦 Blockchain Supply Chain Management System 🔗

[![Solidity](https://img.shields.io/badge/Solidity-^0.8.24-363636.svg?logo=solidity)](https://soliditylang.org/)
[![Hardhat](https://img.shields.io/badge/Hardhat-2.22.0-yellow.svg?logo=ethereum)](https://hardhat.org/)
[![React](https://img.shields.io/badge/React-18.2.0-61DAFB.svg?logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5.1.6-646CFF.svg?logo=vite)](https://vitejs.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-Express_4.19-339933.svg?logo=node.js)](https://nodejs.org/)
[![Ethers.js](https://img.shields.io/badge/Ethers.js-v6.11-2535a0.svg)](https://docs.ethers.org/v6/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Live Demo](https://img.shields.io/badge/Render-Live%20Demo-46E3B7.svg?logo=render&logoColor=white)](https://blockchain-supply-chain-p8e3.onrender.com)

> 🚀 **Live Demo on Render**: [https://blockchain-supply-chain-p8e3.onrender.com](https://blockchain-supply-chain-p8e3.onrender.com)  
> Explore the live application directly in your browser without local setup!

A enterprise-grade, decentralized **Blockchain Supply Chain Management DApp** built with **Solidity**, **Hardhat**, **Node.js/Express**, **React (Vite)**, **Ethers.js v6**, and an **Integrated QR Code Generation & Camera Scanner System**.

This platform tracks products across their entire lifecycle—from raw material manufacturing to retail purchase—guaranteeing end-to-end provenance, cryptographic authenticity, tamper-proof audit trails, and Role-Based Access Control (RBAC) recorded directly on the Ethereum blockchain.

---

## 🌐 Live Demo & Cloud Deployment

- 🔗 **Production URL**: [https://blockchain-supply-chain-p8e3.onrender.com](https://blockchain-supply-chain-p8e3.onrender.com)
- ⚙️ **Infrastructure**: Hosted on [Render](https://render.com) using Node.js Web Service specification (`render.yaml`).
- ⚡ **Interactive Cloud Ledger**: Supports both live Web3 MetaMask wallets and an automatic in-browser simulated blockchain ledger fallback for instant cloud previews.

---

## 📑 Table of Contents

- [Live Demo & Cloud Deployment](#-live-demo--cloud-deployment)
- [Key Features](#-key-features)
- [Supply Chain Lifecycle Workflow](#-supply-chain-lifecycle-workflow)
- [System Architecture](#-system-architecture)
- [Smart Contract Specification](#-smart-contract-specification)
- [QR Code Generation & Scanning System](#-qr-code-generation--scanning-system)
- [Project Directory Structure](#-project-directory-structure)
- [Quick Start Guide & Full Setup](#-quick-start-guide--full-setup)
  - [Prerequisites](#1-prerequisites)
  - [Clone Repository](#2-clone-repository)
  - [Install Dependencies](#3-install-dependencies)
  - [Compile Smart Contracts](#4-compile-smart-contracts)
  - [Run Automated Unit Tests](#5-run-automated-unit-tests)
  - [Start Local Ethereum Node](#6-start-local-ethereum-node)
  - [Deploy Smart Contract](#7-deploy-smart-contract)
  - [Start Backend REST API](#8-start-backend-rest-api)
  - [Start Frontend Dashboard](#9-start-frontend-dashboard)
  - [All-In-One Execution](#10-all-in-one-execution-optional)
- [MetaMask Configuration](#-metamask-configuration)
- [Pre-Configured Demo Accounts & Roles](#-pre-configured-demo-accounts--roles)
- [Backend REST API Reference](#-backend-rest-api-reference)
- [Environment Variables](#-environment-variables)
- [Author & Contact](#-author--contact)
- [Contributing & License](#-contributing--license)

---

## 🌟 Key Features

- **🔐 Cryptographic Role-Based Access Control (RBAC)**:
  - Granular smart contract function modifiers restrict actions to verified stakeholders (`Admin`, `Manufacturer`, `Supplier`, `Distributor`, `Retailer`, `Consumer`).
  - Dynamic role registration and management on-chain.
- **🔄 Complete State Machine Lifecycle**:
  - 8 distinct, verified lifecycle states enforcing linear progression.
  - Ownership tracking updates at every custody handoff.
- **📷 Advanced QR Code & Scanning Infrastructure**:
  - **Dynamic QR Code Generation**: Generates high-contrast QR codes embedded with product SKU, contract metadata, and on-chain verification URLs.
  - **Live Camera Scanner**: Hardware camera / webcam barcode scanner decoding QR codes in real-time.
  - **Image File Decoder**: Upload QR label photos from disk for immediate verification.
  - **Warehouse Printable Labels**: Print-ready warehouse shipping label views with barcode tags.
- **📜 Immutable Provenance Audit Trail**:
  - Comprehensive historical audit records of every event with block timestamps, sender wallet addresses, geolocation tags, and custom transit notes.
- **⚡ Dual-Mode Web3 Provider Context**:
  - **Zero-Setup Demo Mode**: Switch between 6 simulated Hardhat accounts with a single click in the UI navigation bar without requiring browser extensions.
  - **MetaMask Web3 Wallet Mode**: One-click connection to MetaMask for authentic decentralized web3 transactions.
- **🌐 Robust Full-Stack Architecture**:
  - Smart contracts with Hardhat tests & Solidity optimizer via IR.
  - Express REST API with MongoDB support (automatically runs in blockchain-only mode if MongoDB is offline).
  - Modern React dashboard with responsive dark glassmorphism UI built with Lucide icons.

---

## 🔄 Supply Chain Lifecycle Workflow

```
[0. Created]
     │
     ▼
[1. Manufactured] ────────> Handled by Manufacturer
     │
     ▼ (shipToSupplier)
[2. In Transit to Supplier]
     │
     ▼ (receiveBySupplier)
[3. With Supplier] ────────> Received & verified by Supplier
     │
     ▼ (shipToDistributor)
[4. In Transit to Distributor]
     │
     ▼ (receiveByDistributor)
[5. With Distributor] ─────> Stocked at regional distribution center
     │
     ▼ (shipToRetailer)
[6. In Transit to Retailer]
     │
     ▼ (receiveByRetailer)
[7. With Retailer] ────────> Placed on store shelf
     │
     ▼ (sellToConsumer)
[8. Sold to Consumer] ─────> Transferred to end customer with proof of authenticity
```

---

## 🏗 System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    REACT FRONTEND (VITE)                    │
│  - Web3 Provider (Ethers.js v6)  - QR Scanner (html5-qrcode) │
│  - Role Simulator Selector       - Product Management       │
│  - Provenance Audit Timeline     - Stats Analytics Card     │
└──────────────┬──────────────────────────────┬───────────────┘
               │                              │
     (Direct RPC Reads/Writes)      (REST HTTP API)
               │                              │
               ▼                              ▼
┌──────────────────────────────┐ ┌────────────────────────────┐
│      ETHEREUM BLOCKCHAIN     │ │   NODE.JS EXPRESS SERVER   │
│   (Hardhat Local Node :8545) │ │   - Product APIs           │
│  - SupplyChain.sol           │ │   - QR Code Service        │
│  - RBAC Storage              │ │   - Fallback DB Sync       │
│  - State Machine & Events    │ │   - Auth & Users Engine    │
└──────────────────────────────┘ └────────────────────────────┘
```

---

## 📜 Smart Contract Specification

The smart contract [`SupplyChain.sol`](contracts/SupplyChain.sol) is compiled with Solidity `0.8.24` and configured with `viaIR: true` optimizer.

### Core Data Structures

```solidity
enum State {
    Created,                // 0
    Manufactured,           // 1
    InTransitToSupplier,    // 2
    WithSupplier,           // 3
    InTransitToDistributor, // 4
    WithDistributor,        // 5
    InTransitToRetailer,    // 6
    WithRetailer,           // 7
    SoldToConsumer          // 8
}

struct StateHistory {
    State state;
    address updatedBy;
    uint256 timestamp;
    string location;
    string notes;
}

struct Product {
    uint256 id;
    string sku;
    string name;
    string description;
    uint256 price;
    State state;
    address owner;
    address manufacturer;
    address supplier;
    address distributor;
    address retailer;
    address consumer;
    uint256 createdAt;
}
```

### Smart Contract Methods

| Method | Role Required | Description |
| :--- | :--- | :--- |
| `assignRole(account, role)` | `Admin` | Assigns a permissioned supply chain role to an Ethereum address |
| `getRole(account)` | Public View | Returns the string role identifier of a given address |
| `getAllUsers()` | Public View | Returns all registered addresses and their roles |
| `createProduct(sku, name, desc, price, location)` | `Manufacturer` / `Admin` | Registers a new batch/product and mints ID |
| `shipToSupplier(id, supplier, location, notes)` | Current Owner | Dispatches product to designated Supplier |
| `receiveBySupplier(id, location, notes)` | Designated `Supplier` | Acknowledges receipt and transfers ownership |
| `shipToDistributor(id, distributor, location, notes)` | Current Owner | Dispatches product to designated Distributor |
| `receiveByDistributor(id, location, notes)` | Designated `Distributor` | Acknowledges receipt and transfers ownership |
| `shipToRetailer(id, retailer, location, notes)` | Current Owner | Dispatches product to designated Retailer |
| `receiveByRetailer(id, location, notes)` | Designated `Retailer` | Acknowledges store arrival and transfers ownership |
| `sellToConsumer(id, consumer, location, notes)` | Current Owner | Completes point-of-sale transfer to buyer |
| `getProduct(id)` | Public View | Fetches complete state & ownership record |
| `getProductHistory(id)` | Public View | Fetches immutable historical audit checkpoints |
| `getAllProducts()` | Public View | Fetches array of all registered products |

---

## 📷 QR Code Generation & Scanning System

1. **Generation**:
   - Each product card contains a **QR Code** action button.
   - Generates high-density QR with verification data: Product ID, Name, Manufacturer, Owner, Status, and Verification URL.
2. **Download & Printing**:
   - **Download PNG**: Instant offline export.
   - **Print Warehouse Label**: Formats a printable industrial warehouse tag with barcoding and details.
3. **Live Camera Scanner**:
   - Integrated camera viewfinder powered by `html5-qrcode`.
   - Scan directly using a smartphone or laptop camera.
   - Alternative: Upload an existing QR image or enter product ID to instantly view authentic provenance records.

---

## 📂 Project Directory Structure

```
Blockchain-supply-chain/
├── contracts/
│   └── SupplyChain.sol               # Core Solidity smart contract
├── scripts/
│   └── deploy.js                     # Deployment & demo seeding script
├── test/
│   └── SupplyChain.test.js           # Hardhat automated unit test suite
├── backend/                          # Express REST API
│   ├── config/                       # Generated contract details & config
│   ├── middleware/                   # JWT & authorization middleware
│   ├── models/                       # MongoDB schema models (Product, User, Event)
│   ├── routes/                       # Express routes (products, roles, auth, verify)
│   ├── services/                     # Ethers.js blockchain wrapper service
│   ├── utils/                        # Authentication & helper utilities
│   ├── .env.example                  # Backend environment variable template
│   ├── package.json
│   └── server.js                     # Express application entrypoint
├── frontend/                         # React + Vite Web Dashboard
│   ├── src/
│   │   ├── auth/                     # Session & authentication management
│   │   ├── components/               # React UI Components
│   │   │   ├── AddProductModal.jsx   # Product creation dialog
│   │   │   ├── Navbar.jsx            # Header & role switching controls
│   │   │   ├── ProductCard.jsx       # Interactive product display card
│   │   │   ├── ProductTimeline.jsx   # Provenance audit history visualizer
│   │   │   ├── QRCodeModal.jsx       # QR generation & warehouse label print
│   │   │   ├── QRScannerModal.jsx    # Live webcam scanner & file decoder
│   │   │   ├── RoleManagement.jsx    # Admin access control panel
│   │   │   ├── StatsDashboard.jsx    # Supply chain metrics dashboard
│   │   │   └── UpdateStateModal.jsx  # Stage transition & handoff dialog
│   │   ├── config/                   # Contract details & ABI
│   │   ├── context/                  # Web3 & Ethers provider context
│   │   ├── App.jsx                   # Application root
│   │   ├── index.css                 # Premium custom design system
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── hardhat.config.js                 # Hardhat configuration (Solidity 0.8.24)
├── package.json                      # Workspace scripts & dependencies
├── .gitignore                        # Git exclusion rules
└── README.md                         # Project documentation
```

---

## 🚀 Quick Start Guide & Full Setup

> 🌐 **Live Cloud Deployment**: You can also run and test the live application directly online without installing anything locally at **[https://blockchain-supply-chain-p8e3.onrender.com](https://blockchain-supply-chain-p8e3.onrender.com)**.

Follow these exact steps to set up and run the entire decentralized application on your local machine.

### 1. Prerequisites

Ensure you have the following installed:
- [Node.js](https://nodejs.org/) (version `v18.0.0` or higher recommended)
- `npm` (bundled with Node.js)
- [Git](https://git-scm.com/)
- [MetaMask Extension](https://metamask.io/) (optional, required only for browser wallet mode)

---

### 2. Clone Repository

```bash
# Clone via SSH (Recommended)
git clone git@github.com:PARTH-MANGUKIYA077/Blockchain-supply-chain.git

# Or clone via HTTPS
git clone https://github.com/PARTH-MANGUKIYA077/Blockchain-supply-chain.git

cd Blockchain-supply-chain
```

---

### 3. Install Dependencies

Install all dependencies across the root workspace, backend, and frontend:

```bash
# 1. Install root workspace dependencies
npm install

# 2. Install backend dependencies
cd backend && npm install && cd ..

# 3. Install frontend dependencies
cd frontend && npm install && cd ..
```

---

### 4. Compile Smart Contracts

Compile the Solidity contracts using Hardhat:

```bash
npm run compile
```

This compiles `SupplyChain.sol` using Solidity `0.8.24` and exports the compiled ABIs to `frontend/src/artifacts`.

---

### 5. Run Automated Unit Tests

Run the Hardhat automated test suite to verify smart contract logic and state transitions:

```bash
npm run test
```

Expected output:
```
  SupplyChain Smart Contract
    ✔ Should correctly assign and fetch user roles
    ✔ Should allow a manufacturer to create a product
    ✔ Should reject non-manufacturers from creating products
    ✔ Should track complete supply chain lifecycle through state transitions

  4 passing
```

---

### 6. Start Local Ethereum Node

Launch the local Hardhat Ethereum JSON-RPC node in a separate terminal:

```bash
npm run chain
```

- **Local RPC URL**: `http://127.0.0.1:8545`
- **Chain ID**: `31337`
- Generates 20 pre-funded test accounts with 10,000 ETH each.
- **Keep this terminal running.**

---

### 7. Deploy Smart Contract

In a **new terminal window**, deploy the smart contract to the local network:

```bash
npm run deploy
```

What this script does:
1. Deploys `SupplyChain.sol` to the local network.
2. Automatically assigns initial roles to 6 default Hardhat accounts:
   - Account #0 -> `ADMIN`
   - Account #1 -> `MANUFACTURER`
   - Account #2 -> `SUPPLIER`
   - Account #3 -> `DISTRIBUTOR`
   - Account #4 -> `RETAILER`
   - Account #5 -> `CONSUMER`
3. Creates a sample demo pharmaceutical product (`SKU-PHARMA-1001: LifeSave Organic Vaccine`).
4. Generates and syncs `contractDetails.json` to both `frontend/src/config/` and `backend/config/`.

---

### 8. Start Backend REST API

In a **separate terminal window**, launch the backend server:

```bash
npm run backend
```

- The Express REST API will start at **`http://localhost:5000`**.
- It connects to the local blockchain via RPC and serves endpoints for products, roles, audit trails, and QR codes.

---

### 9. Start Frontend Dashboard

In a **separate terminal window**, launch the React Vite client:

```bash
npm run frontend
```

- The React dashboard will start at **`http://localhost:3000`** (or `http://localhost:5173`).
- Open your browser and navigate to the displayed URL.

---

### 10. All-In-One Execution (Optional)

Alternatively, once smart contracts are compiled and deployed, you can run all services concurrently in a single terminal:

```bash
npm start
```

---

## 🦊 MetaMask Configuration

To interact using MetaMask instead of the simulated demo accounts:

1. Open MetaMask and select **Add Network** -> **Add a network manually**.
2. Fill in the network details:
   - **Network Name**: `Hardhat Localhost`
   - **New RPC URL**: `http://127.0.0.1:8545`
   - **Chain ID**: `31337`
   - **Currency Symbol**: `ETH`
3. Click **Save**.
4. In MetaMask, click **Import Account** and paste one of the private keys output by `npm run chain` (e.g. Deployer/Admin private key):
   ```
   0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
   ```
5. Click **Connect MetaMask** in the dashboard navbar.

---

## 👥 Pre-Configured Demo Accounts & Roles

The application includes an integrated **Role Switcher** in the top navigation bar. You can test each stakeholder perspective instantly without importing private keys:

| Role | Address | Description |
| :--- | :--- | :--- |
| **Admin** | `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266` | Contract owner; assigns roles and oversees full system |
| **Manufacturer** | `0x70997970C51812dc3A010C7d01b50e0d17dc79C8` | Manufactures products, mints QR codes, ships to suppliers |
| **Supplier** | `0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC` | Receives raw shipments and dispatches to distributors |
| **Distributor** | `0x90F79bf6EB2c4f870365E785982E1f101E93b906` | Manages regional logistics hubs and ships to retail stores |
| **Retailer** | `0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65` | Receives retail stock and records sales to consumers |
| **Consumer** | `0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc` | Scans QR codes, validates provenance, and owns purchased items |

---

## 📡 Backend REST API Reference

The backend provides REST endpoints for external systems, IoT sensors, and mobile applications:

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Healthcheck and timestamp | No |
| `GET` | `/api/status` | Network & deployed contract status | No |
| `GET` | `/api/products` | Retrieve list of all supply chain items | No |
| `POST` | `/api/products` | Register a new product | Yes (Admin/Manufacturer) |
| `GET` | `/api/products/:id` | Fetch specific product details by ID | No |
| `POST` | `/api/products/:id/transfer` | Update ownership and location | Yes |
| `POST` | `/api/products/:id/status` | Update product lifecycle status | Yes |
| `GET` | `/api/products/:id/history` | Retrieve full timeline audit history | No |
| `GET` | `/api/products/:id/qr` | Get base64 Data URL for product QR code | No |
| `GET` | `/api/roles` | List all registered users & assigned roles | No |
| `GET` | `/api/roles/:address` | Get role for specific wallet address | No |
| `GET` | `/api/verify/:productId` | Verify authenticity of product via ID/SKU | No |
| `POST` | `/api/auth/register` | Register new system user | No |
| `POST` | `/api/auth/login` | Authenticate user and receive JWT token | No |
| `GET` | `/api/auth/me` | Fetch currently logged in user profile | Yes (JWT) |

---

## ⚙️ Environment Variables

Create `.env` inside `backend/` if you want to override default settings (see [`backend/.env.example`](backend/.env.example)):

```ini
# Blockchain RPC URL
RPC_URL=http://127.0.0.1:8545

# Port for Backend Server
PORT=5000

# MongoDB URI (Optional: system runs in local blockchain-only mode if omitted or offline)
MONGODB_URI=mongodb://127.0.0.1:27017/blockchain-supply-chain

# JWT Secret Token
JWT_SECRET=super-secret-jwt-token-change-in-production
```

---

## 🛡 Security & Best Practices

- **Reentrancy Protection**: State updates precede event emissions.
- **Access Modifiers**: Functions enforce caller validation using `msg.sender` against authorized role hashes (`keccak256`).
- **Owner Verification**: State progression requires verified custody of the asset.
- **Fail-Safe Fallback**: Backend gracefully operates with or without an active MongoDB connection by reading directly from on-chain smart contract logs.

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:
1. Fork the repository.
2. Create your feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

## 📬 Author & Contact

- **Author**: Parth Mangukiya
- **Email**: [parthmangukiya063@gmail.com](mailto:parthmangukiya063@gmail.com)
- **GitHub**: [@PARTH-MANGUKIYA077](https://github.com/PARTH-MANGUKIYA077)
- **Repository**: [Blockchain-supply-chain](https://github.com/PARTH-MANGUKIYA077/Blockchain-supply-chain)

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.
