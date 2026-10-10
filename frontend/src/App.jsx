import React, { useState } from "react";
import { Web3Provider, useWeb3 } from "./context/Web3Context";
import { Navbar } from "./components/Navbar";
import { StatsDashboard } from "./components/StatsDashboard";
import { ProductCard } from "./components/ProductCard";
import { AddProductModal } from "./components/AddProductModal";
import { UpdateStateModal } from "./components/UpdateStateModal";
import { ProductTimeline } from "./components/ProductTimeline";
import { RoleManagement } from "./components/RoleManagement";
import { QRCodeModal } from "./components/QRCodeModal";
import { QRScannerModal } from "./components/QRScannerModal";
import { Plus, Search, RefreshCw, Layers, Users, AlertCircle, QrCode, UserRound, LockKeyhole } from "lucide-react";

const LoginScreen = () => {
  const { switchSimulatedAccount, login, currentRole } = useWeb3();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState("MANUFACTURER");
  const [loginError, setLoginError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoginError("");

    if (!username.trim() || !password.trim()) {
      setLoginError("Please enter a username and password.");
      return;
    }

    try {
      setSubmitting(true);
      await switchSimulatedAccount(selectedRole);
      login({ username, password, role: selectedRole });
    } catch (error) {
      setLoginError(error.message || "Unable to log in.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "radial-gradient(circle at top, rgba(59,130,246,0.15), transparent 45%), #020817" }}>
      <div style={{ width: "100%", maxWidth: "420px", background: "rgba(15, 23, 42, 0.9)", border: "1px solid rgba(148, 163, 184, 0.2)", borderRadius: "18px", padding: "2rem", boxShadow: "0 20px 45px rgba(15, 23, 42, 0.4)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.25rem" }}>
          <div style={{ width: "42px", height: "42px", borderRadius: "12px", background: "rgba(96, 165, 250, 0.12)", display: "grid", placeItems: "center" }}>
            <LockKeyhole size={20} color="#60a5fa" />
          </div>
          <div>
            <div style={{ fontSize: "0.8rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "#94a3b8" }}>Supply Chain</div>
            <h2 style={{ margin: 0, fontSize: "1.7rem" }}>User Login</h2>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div>
            <label style={{ display: "block", marginBottom: "0.5rem", color: "#cbd5e1", fontSize: "0.92rem" }}>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              className="form-control"
            />
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "0.5rem", color: "#cbd5e1", fontSize: "0.92rem" }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="form-control"
            />
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "0.5rem", color: "#cbd5e1", fontSize: "0.92rem" }}>Role</label>
            <select
              className="form-control"
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
            >
              <option value="ADMIN">Admin</option>
              <option value="MANUFACTURER">Manufacturer</option>
              <option value="SUPPLIER">Supplier</option>
              <option value="DISTRIBUTOR">Distributor</option>
              <option value="RETAILER">Retailer</option>
              <option value="CONSUMER">Consumer</option>
            </select>
          </div>

          {loginError && (
            <div style={{ padding: "0.75rem 0.9rem", borderRadius: "10px", background: "rgba(244,63,94,0.1)", color: "#fda4af", border: "1px solid rgba(244,63,94,0.25)", fontSize: "0.9rem" }}>
              {loginError}
            </div>
          )}

          <button type="submit" className="btn btn-primary" disabled={submitting}>
            <UserRound size={16} /> {submitting ? "Signing In..." : "Login"}
          </button>

          <div style={{ fontSize: "0.8rem", color: "#94a3b8", textAlign: "center" }}>
            Active account role: <strong>{currentRole || "NONE"}</strong>
          </div>
        </form>
      </div>
    </div>
  );
};

const MainApp = () => {
  const { products, loading, error, isDemoMode, currentRole, refresh, isAuthenticated, login, switchSimulatedAccount, logout } = useWeb3();
  const [activeTab, setActiveTab] = useState("products");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTimelineId, setSelectedTimelineId] = useState(null);
  const [selectedQRProduct, setSelectedQRProduct] = useState(null);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [updateModalConfig, setUpdateModalConfig] = useState({ isOpen: false, product: null, actionType: "" });

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.id.toString() === searchQuery.trim()
  );

  const canCreate = currentRole === "MANUFACTURER" || currentRole === "ADMIN";

  const handleOpenActionModal = (product, actionType) => {
    setUpdateModalConfig({
      isOpen: true,
      product,
      actionType
    });
  };

  const handleScanProductSelect = (productId) => {
    setSelectedTimelineId(productId);
    setActiveTab("products");
  };

  return (
    <div>
      <Navbar />

      <main className="container">
        {error && (
          <div style={{ background: "rgba(244, 63, 94, 0.15)", border: "1px solid #f43f5e", padding: "1rem", borderRadius: "8px", color: "#fda4af", marginBottom: "1.5rem", display: "flex", gap: "0.75rem", alignItems: "center" }}>
            <AlertCircle size={20} />
            <div>
              <strong>Blockchain Network Error:</strong> {error}
              <div style={{ fontSize: "0.85rem", marginTop: "0.25rem" }}>
                Make sure the local Hardhat RPC node is running (<code>npm run chain</code>) and contract is deployed (<code>npm run deploy</code>).
              </div>
            </div>
          </div>
        )}

        {isDemoMode && !error && (
          <div style={{ background: "rgba(37, 99, 235, 0.12)", border: "1px solid rgba(96, 165, 250, 0.3)", padding: "0.85rem 1.25rem", borderRadius: "10px", color: "#93c5fd", marginBottom: "1.5rem", display: "flex", gap: "0.75rem", alignItems: "center" }}>
            <span style={{ fontSize: "1.2rem" }}>🌐</span>
            <div>
              <strong>Live Cloud Demo Ledger Active:</strong> Running in simulated on-chain sandbox mode. Role switching, stage updates, product registration, QR generation, and webcam scanning are fully functional. Connect MetaMask at any time to submit real on-chain transactions.
            </div>
          </div>
        )}

        <StatsDashboard />

        {/* Tab Navigation */}
        <div className="tabs">
          <button
            className={`tab-btn ${activeTab === "products" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("products");
              setSelectedTimelineId(null);
            }}
          >
            <Layers size={16} /> Supply Chain Items
          </button>
          <button
            className={`tab-btn ${activeTab === "roles" ? "active" : ""}`}
            onClick={() => setActiveTab("roles")}
          >
            <Users size={16} /> Access Roles & Accounts
          </button>
        </div>

        {activeTab === "roles" ? (
          <RoleManagement />
        ) : selectedTimelineId ? (
          <ProductTimeline
            productId={selectedTimelineId}
            onBack={() => setSelectedTimelineId(null)}
          />
        ) : (
          <div>
            <div className="section-header">
              <div className="search-bar">
                <Search size={18} color="#94a3b8" />
                <input
                  type="text"
                  placeholder="Search by Product Name, SKU, or ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                <button className="btn btn-secondary" onClick={() => setIsScannerOpen(true)}>
                  <QrCode size={16} color="#60a5fa" /> Scan QR Code
                </button>

                <button className="btn btn-secondary" onClick={refresh}>
                  <RefreshCw size={16} /> Sync State
                </button>

                {canCreate && (
                  <button className="btn btn-primary" onClick={() => setIsAddModalOpen(true)}>
                    <Plus size={16} /> Add New Product
                  </button>
                )}
              </div>
            </div>

            {loading ? (
              <div className="empty-state">Loading products from Blockchain...</div>
            ) : filteredProducts.length === 0 ? (
              <div className="empty-state">
                <h3>No supply chain products found</h3>
                <p style={{ marginTop: "0.5rem" }}>
                  {searchQuery ? "No matching products for your search query." : "Click 'Add New Product' above to manufacture and register your first item on-chain!"}
                </p>
              </div>
            ) : (
              <div className="products-grid">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onSelectTimeline={(id) => setSelectedTimelineId(id)}
                    onAction={handleOpenActionModal}
                    onShowQRCode={(prod) => setSelectedQRProduct(prod)}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Modals */}
      <AddProductModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />

      <UpdateStateModal
        isOpen={updateModalConfig.isOpen}
        product={updateModalConfig.product}
        actionType={updateModalConfig.actionType}
        onClose={() => setUpdateModalConfig({ isOpen: false, product: null, actionType: "" })}
      />

      <QRCodeModal
        isOpen={!!selectedQRProduct}
        product={selectedQRProduct}
        onClose={() => setSelectedQRProduct(null)}
      />

      <QRScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onSelectProduct={handleScanProductSelect}
      />
    </div>
  );
};

export function App() {
  return (
    <Web3Provider>
      <MainApp />
    </Web3Provider>
  );
}

export default App;
