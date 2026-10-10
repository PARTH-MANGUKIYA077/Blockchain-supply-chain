// In-browser Simulated Blockchain Ledger for Cloud Demo Environments
// Mirrors SupplyChain.sol interface when running on Render/cloud without local Hardhat RPC

const STORAGE_KEY = "blockchain_supply_chain_ledger_v1";

const DEFAULT_ACCOUNTS = {
  admin: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
  manufacturer: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
  supplier: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
  distributor: "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
  retailer: "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65",
  consumer: "0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc"
};

const DEFAULT_USERS = [
  { address: DEFAULT_ACCOUNTS.admin, role: "ADMIN" },
  { address: DEFAULT_ACCOUNTS.manufacturer, role: "MANUFACTURER" },
  { address: DEFAULT_ACCOUNTS.supplier, role: "SUPPLIER" },
  { address: DEFAULT_ACCOUNTS.distributor, role: "DISTRIBUTOR" },
  { address: DEFAULT_ACCOUNTS.retailer, role: "RETAILER" },
  { address: DEFAULT_ACCOUNTS.consumer, role: "CONSUMER" }
];

const nowSec = Math.floor(Date.now() / 1000);

const DEFAULT_INITIAL_STATE = {
  users: DEFAULT_USERS,
  products: [
    {
      id: "1",
      sku: "SKU-PHARMA-1001",
      name: "LifeSave Organic Vaccine",
      description: "Temperature-sensitive medical supply batch 001",
      price: "50000000000000000", // 0.05 ETH in wei
      state: 1, // Manufactured
      owner: DEFAULT_ACCOUNTS.manufacturer,
      manufacturer: DEFAULT_ACCOUNTS.manufacturer,
      supplier: "0x0000000000000000000000000000000000000000",
      distributor: "0x0000000000000000000000000000000000000000",
      retailer: "0x0000000000000000000000000000000000000000",
      consumer: "0x0000000000000000000000000000000000000000",
      createdAt: nowSec - 7200,
      history: [
        {
          state: 1,
          updatedBy: DEFAULT_ACCOUNTS.manufacturer,
          timestamp: nowSec - 7200,
          location: "Zurich Facility Lab 4",
          notes: "Product Manufactured"
        }
      ]
    }
  ]
};

function loadLedgerState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.warn("Could not read simulated ledger from localStorage:", err);
  }
  return DEFAULT_INITIAL_STATE;
}

function saveLedgerState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.warn("Could not save simulated ledger to localStorage:", err);
  }
}

export function createSimulatedContract(getCurrentCaller) {
  let state = loadLedgerState();

  const getCaller = () => {
    return (getCurrentCaller && getCurrentCaller()) || DEFAULT_ACCOUNTS.admin;
  };

  const waitTx = async () => ({ status: 1 });

  return {
    isSimulated: true,

    getRole: async (account) => {
      const u = state.users.find(
        (x) => x.address.toLowerCase() === (account || "").toLowerCase()
      );
      return u ? u.role : "NONE";
    },

    getAllUsers: async () => {
      const accounts = state.users.map((u) => u.address);
      const roles = state.users.map((u) => u.role);
      return [accounts, roles];
    },

    assignRole: async (account, role) => {
      const existing = state.users.find(
        (u) => u.address.toLowerCase() === account.toLowerCase()
      );
      if (existing) {
        existing.role = role;
      } else {
        state.users.push({ address: account, role });
      }
      saveLedgerState(state);
      return { wait: waitTx };
    },

    getAllProducts: async () => {
      return state.products.map((p) => ({
        id: BigInt(p.id),
        sku: p.sku,
        name: p.name,
        description: p.description,
        price: BigInt(p.price),
        state: Number(p.state),
        owner: p.owner,
        manufacturer: p.manufacturer,
        supplier: p.supplier,
        distributor: p.distributor,
        retailer: p.retailer,
        consumer: p.consumer,
        createdAt: BigInt(p.createdAt)
      }));
    },

    getProduct: async (id) => {
      const numId = String(id);
      const p = state.products.find((x) => String(x.id) === numId);
      if (!p) throw new Error("Product does not exist");
      return {
        id: BigInt(p.id),
        sku: p.sku,
        name: p.name,
        description: p.description,
        price: BigInt(p.price),
        state: Number(p.state),
        owner: p.owner,
        manufacturer: p.manufacturer,
        supplier: p.supplier,
        distributor: p.distributor,
        retailer: p.retailer,
        consumer: p.consumer,
        createdAt: BigInt(p.createdAt)
      };
    },

    getProductHistory: async (id) => {
      const numId = String(id);
      const p = state.products.find((x) => String(x.id) === numId);
      if (!p) throw new Error("Product does not exist");
      return p.history.map((h) => ({
        state: Number(h.state),
        updatedBy: h.updatedBy,
        timestamp: BigInt(h.timestamp),
        location: h.location,
        notes: h.notes
      }));
    },

    createProduct: async (sku, name, desc, priceWei, location) => {
      const caller = getCaller();
      const newId = String(state.products.length + 1);
      const timestamp = Math.floor(Date.now() / 1000);

      const newProduct = {
        id: newId,
        sku,
        name,
        description: desc,
        price: priceWei.toString(),
        state: 1, // Manufactured
        owner: caller,
        manufacturer: caller,
        supplier: "0x0000000000000000000000000000000000000000",
        distributor: "0x0000000000000000000000000000000000000000",
        retailer: "0x0000000000000000000000000000000000000000",
        consumer: "0x0000000000000000000000000000000000000000",
        createdAt: timestamp,
        history: [
          {
            state: 1,
            updatedBy: caller,
            timestamp,
            location: location || "Factory",
            notes: "Product Manufactured"
          }
        ]
      };

      state.products.push(newProduct);
      saveLedgerState(state);
      return { wait: waitTx };
    },

    shipToSupplier: async (id, supplier, location, notes) => {
      const caller = getCaller();
      const p = state.products.find((x) => String(x.id) === String(id));
      if (!p) throw new Error("Product does not exist");
      p.state = 2; // InTransitToSupplier
      p.supplier = supplier;
      p.history.push({
        state: 2,
        updatedBy: caller,
        timestamp: Math.floor(Date.now() / 1000),
        location,
        notes
      });
      saveLedgerState(state);
      return { wait: waitTx };
    },

    receiveBySupplier: async (id, location, notes) => {
      const caller = getCaller();
      const p = state.products.find((x) => String(x.id) === String(id));
      if (!p) throw new Error("Product does not exist");
      p.state = 3; // WithSupplier
      p.owner = caller;
      p.history.push({
        state: 3,
        updatedBy: caller,
        timestamp: Math.floor(Date.now() / 1000),
        location,
        notes
      });
      saveLedgerState(state);
      return { wait: waitTx };
    },

    shipToDistributor: async (id, distributor, location, notes) => {
      const caller = getCaller();
      const p = state.products.find((x) => String(x.id) === String(id));
      if (!p) throw new Error("Product does not exist");
      p.state = 4; // InTransitToDistributor
      p.distributor = distributor;
      p.history.push({
        state: 4,
        updatedBy: caller,
        timestamp: Math.floor(Date.now() / 1000),
        location,
        notes
      });
      saveLedgerState(state);
      return { wait: waitTx };
    },

    receiveByDistributor: async (id, location, notes) => {
      const caller = getCaller();
      const p = state.products.find((x) => String(x.id) === String(id));
      if (!p) throw new Error("Product does not exist");
      p.state = 5; // WithDistributor
      p.owner = caller;
      p.history.push({
        state: 5,
        updatedBy: caller,
        timestamp: Math.floor(Date.now() / 1000),
        location,
        notes
      });
      saveLedgerState(state);
      return { wait: waitTx };
    },

    shipToRetailer: async (id, retailer, location, notes) => {
      const caller = getCaller();
      const p = state.products.find((x) => String(x.id) === String(id));
      if (!p) throw new Error("Product does not exist");
      p.state = 6; // InTransitToRetailer
      p.retailer = retailer;
      p.history.push({
        state: 6,
        updatedBy: caller,
        timestamp: Math.floor(Date.now() / 1000),
        location,
        notes
      });
      saveLedgerState(state);
      return { wait: waitTx };
    },

    receiveByRetailer: async (id, location, notes) => {
      const caller = getCaller();
      const p = state.products.find((x) => String(x.id) === String(id));
      if (!p) throw new Error("Product does not exist");
      p.state = 7; // WithRetailer
      p.owner = caller;
      p.history.push({
        state: 7,
        updatedBy: caller,
        timestamp: Math.floor(Date.now() / 1000),
        location,
        notes
      });
      saveLedgerState(state);
      return { wait: waitTx };
    },

    sellToConsumer: async (id, consumer, location, notes) => {
      const caller = getCaller();
      const p = state.products.find((x) => String(x.id) === String(id));
      if (!p) throw new Error("Product does not exist");
      p.state = 8; // SoldToConsumer
      p.consumer = consumer;
      p.owner = consumer;
      p.history.push({
        state: 8,
        updatedBy: caller,
        timestamp: Math.floor(Date.now() / 1000),
        location,
        notes
      });
      saveLedgerState(state);
      return { wait: waitTx };
    }
  };
}

export { DEFAULT_ACCOUNTS };
