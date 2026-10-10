import React, { createContext, useContext, useState, useEffect } from "react";
import { ethers } from "ethers";
import contractDetails from "../config/contractDetails.json";
import { normalizeRole, loadSession, saveSession, clearSession } from "../auth/session.js";
import { createSimulatedContract, DEFAULT_ACCOUNTS } from "./simulatedLedger.js";

const Web3Context = createContext(null);

export const Web3Provider = ({ children }) => {
  const persistedSession = loadSession();

  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [currentAccount, setCurrentAccount] = useState("");
  const [currentRole, setCurrentRole] = useState("NONE");
  const [sampleAccounts, setSampleAccounts] = useState(DEFAULT_ACCOUNTS);
  const [allUsers, setAllUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [useMetaMask, setUseMetaMask] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [authUser, setAuthUser] = useState(persistedSession.user);
  const [isAuthenticated, setIsAuthenticated] = useState(persistedSession.isAuthenticated);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Initialize Web3 Provider and Contract
  const initWeb3 = async () => {
    try {
      setLoading(true);
      setError(null);

      const accountsList = (contractDetails && contractDetails.sampleAccounts) || DEFAULT_ACCOUNTS;
      setSampleAccounts(accountsList);

      // Attempt to probe local Hardhat RPC node with a fast 1500ms timeout
      let rpcProvider = null;
      let isLiveRpcAvailable = false;

      try {
        const candidateProvider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
        const probePromise = candidateProvider.getBlockNumber();
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error("RPC Timeout")), 1500)
        );
        await Promise.race([probePromise, timeoutPromise]);
        rpcProvider = candidateProvider;
        isLiveRpcAvailable = true;
      } catch (probeErr) {
        // Expected when running on Render or any public web deployment without local Hardhat node
        isLiveRpcAvailable = false;
      }

      if (isLiveRpcAvailable && rpcProvider && contractDetails?.address) {
        setProvider(rpcProvider);
        const signers = await rpcProvider.listAccounts();
        if (signers.length > 0) {
          const defaultSigner = signers[0];
          setSigner(defaultSigner);
          setCurrentAccount(defaultSigner.address);

          const instance = new ethers.Contract(
            contractDetails.address,
            contractDetails.abi,
            defaultSigner
          );
          setContract(instance);
          await fetchUserData(instance, defaultSigner.address);
          await fetchProducts(instance);
          return;
        }
      }

      // Seamless Cloud Fallback: Use simulated ledger contract
      console.log("Local node offline or remote deployment detected. Starting Cloud Demo Mode.");
      setIsDemoMode(true);
      const defaultAccount = accountsList.manufacturer || DEFAULT_ACCOUNTS.manufacturer;
      setCurrentAccount(defaultAccount);
      setCurrentRole("MANUFACTURER");

      const simulatedInstance = createSimulatedContract(() => currentAccount || defaultAccount);
      setContract(simulatedInstance);
      await fetchUserData(simulatedInstance, defaultAccount);
      await fetchProducts(simulatedInstance);
    } catch (err) {
      console.warn("Falling back to simulated ledger due to:", err.message);
      setIsDemoMode(true);
      const fallbackAccount = DEFAULT_ACCOUNTS.manufacturer;
      setCurrentAccount(fallbackAccount);
      setCurrentRole("MANUFACTURER");
      const simulatedInstance = createSimulatedContract(() => currentAccount || fallbackAccount);
      setContract(simulatedInstance);
      await fetchUserData(simulatedInstance, fallbackAccount);
      await fetchProducts(simulatedInstance);
    } finally {
      setLoading(false);
    }
  };

  const connectMetaMask = async () => {
    if (!window.ethereum) {
      alert("MetaMask browser extension is not installed.");
      return;
    }
    try {
      const browserProvider = new ethers.BrowserProvider(window.ethereum);
      await browserProvider.send("eth_requestAccounts", []);
      const userSigner = await browserProvider.getSigner();
      const userAddress = await userSigner.getAddress();

      if (!contractDetails || !contractDetails.address) {
        throw new Error("Contract address configuration missing.");
      }

      const instance = new ethers.Contract(
        contractDetails.address,
        contractDetails.abi,
        userSigner
      );

      setProvider(browserProvider);
      setSigner(userSigner);
      setContract(instance);
      setCurrentAccount(userAddress);
      setUseMetaMask(true);
      setIsDemoMode(false);
      setError(null);

      await fetchUserData(instance, userAddress);
      await fetchProducts(instance);
    } catch (err) {
      console.error("MetaMask Connection Error:", err);
      alert("Failed to connect MetaMask: " + err.message);
    }
  };

  const switchSimulatedAccount = async (targetRole) => {
    try {
      const normalizedRole = normalizeRole(targetRole);
      const accountsList = sampleAccounts || DEFAULT_ACCOUNTS;
      const targetAddress = accountsList[normalizedRole.toLowerCase()] || DEFAULT_ACCOUNTS[normalizedRole.toLowerCase()];
      if (!targetAddress) {
        alert(`No account found for role ${targetRole}`);
        return;
      }

      setCurrentAccount(targetAddress);
      setCurrentRole(normalizedRole);

      if (contract && contract.isSimulated) {
        await fetchUserData(contract, targetAddress);
        await fetchProducts(contract);
      } else if (provider && !useMetaMask) {
        try {
          const targetSigner = await provider.getSigner(targetAddress);
          const instance = new ethers.Contract(
            contractDetails.address,
            contractDetails.abi,
            targetSigner
          );
          setSigner(targetSigner);
          setContract(instance);
          await fetchUserData(instance, targetAddress);
          await fetchProducts(instance);
        } catch (e) {
          console.warn("Could not switch RPC signer:", e.message);
        }
      }

      if (isAuthenticated && authUser) {
        const nextSession = saveSession({
          isAuthenticated: true,
          user: authUser,
          role: normalizedRole,
          account: targetAddress
        });
        setCurrentRole(nextSession.role);
      }
    } catch (err) {
      console.error("Error switching account:", err);
    }
  };

  const login = ({ username, password, role }) => {
    if (!username || !password) {
      throw new Error("Username and password are required to log in.");
    }

    const normalizedRole = normalizeRole(role || currentRole);
    if (normalizedRole === "NONE") {
      throw new Error("Please select a valid role before logging in.");
    }

    const user = {
      username: String(username).trim(),
      role: normalizedRole,
      account: currentAccount || ""
    };

    const session = saveSession({
      isAuthenticated: true,
      user,
      role: normalizedRole,
      account: currentAccount || ""
    });

    setAuthUser(session.user);
    setCurrentRole(session.role);
    setIsAuthenticated(true);
    return session;
  };

  const logout = () => {
    const session = clearSession();
    setAuthUser(session.user);
    setCurrentRole("NONE");
    setIsAuthenticated(false);
    return session;
  };

  const fetchUserData = async (instanceContract, accountAddress) => {
    try {
      const role = await instanceContract.getRole(accountAddress);
      setCurrentRole(role || "NONE");

      const [accounts, roles] = await instanceContract.getAllUsers();
      const userList = accounts.map((acc, i) => ({
        address: acc,
        role: roles[i]
      }));
      setAllUsers(userList);
    } catch (err) {
      console.error("Error fetching user data:", err);
    }
  };

  const fetchProducts = async (instanceContract = contract) => {
    if (!instanceContract) return;
    try {
      const rawProducts = await instanceContract.getAllProducts();
      const stateNames = [
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

      const formatted = rawProducts.map((p) => ({
        id: Number(p.id),
        sku: p.sku,
        name: p.name,
        description: p.description,
        priceEth: ethers.formatEther(p.price),
        priceWei: p.price.toString(),
        stateCode: Number(p.state),
        stateName: stateNames[Number(p.state)],
        owner: p.owner,
        manufacturer: p.manufacturer,
        supplier: p.supplier,
        distributor: p.distributor,
        retailer: p.retailer,
        consumer: p.consumer,
        createdAt: new Date(Number(p.createdAt) * 1000).toLocaleString()
      }));

      setProducts(formatted);
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Error fetching products:", err);
    }
  };

  const refresh = async () => {
    if (!contract || !currentAccount) return;
    await fetchUserData(contract, currentAccount);
    await fetchProducts(contract);
  };

  useEffect(() => {
    initWeb3();
  }, []);

  useEffect(() => {
    if (!contract || !currentAccount || !isAuthenticated) return;

    const interval = setInterval(() => {
      refresh();
    }, 5000);

    return () => clearInterval(interval);
  }, [contract, currentAccount, isAuthenticated]);

  return (
    <Web3Context.Provider
      value={{
        provider,
        signer,
        contract,
        currentAccount,
        currentRole,
        authUser,
        isAuthenticated,
        sampleAccounts,
        allUsers,
        products,
        loading,
        error,
        useMetaMask,
        isDemoMode,
        lastUpdated,
        connectMetaMask,
        switchSimulatedAccount,
        login,
        logout,
        fetchProducts,
        fetchUserData,
        refresh
      }}
    >
      {children}
    </Web3Context.Provider>
  );
};

export const useWeb3 = () => useContext(Web3Context);
