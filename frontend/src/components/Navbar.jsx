import React from "react";
import { useWeb3 } from "../context/Web3Context";
import { Box, Wallet, ShieldCheck, UserCheck, LogOut } from "lucide-react";

export const Navbar = () => {
  const {
    currentAccount,
    currentRole,
    authUser,
    lastUpdated,
    switchSimulatedAccount,
    connectMetaMask,
    useMetaMask,
    logout
  } = useWeb3();

  const truncate = (addr) =>
    addr ? `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}` : "Not Connected";

  return (
    <nav className="navbar">
      <div className="brand">
        <Box size={28} color="#60a5fa" />
        <span>BlockChain Supply Chain</span>
      </div>

      <div className="nav-actions">
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.45rem 0.8rem", borderRadius: "999px", background: "rgba(16, 185, 129, 0.08)", border: "1px solid rgba(16, 185, 129, 0.18)" }}>
          <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#34d399", boxShadow: "0 0 12px rgba(52, 211, 153, 0.8)" }} />
          <span style={{ fontSize: "0.75rem", color: "#d1fae5" }}>LIVE</span>
          <span style={{ fontSize: "0.7rem", color: "#a7f3d0" }}>{lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}</span>
        </div>

        {authUser && (
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.45rem 0.8rem", borderRadius: "999px", background: "rgba(96, 165, 250, 0.08)", border: "1px solid rgba(96, 165, 250, 0.18)" }}>
            <UserCheck size={14} color="#60a5fa" />
            <span style={{ fontSize: "0.78rem", color: "#dbeafe" }}>{authUser.username}</span>
          </div>
        )}

        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <UserCheck size={16} color="#94a3b8" />
          <span style={{ fontSize: "0.8rem", color: "#94a3b8" }}>Demo Role:</span>
          <select
            className="account-selector-select"
            value={currentRole.toLowerCase()}
            onChange={(e) => switchSimulatedAccount(e.target.value.toUpperCase())}
          >
            <option value="admin">Admin</option>
            <option value="manufacturer">Manufacturer</option>
            <option value="supplier">Supplier</option>
            <option value="distributor">Distributor</option>
            <option value="retailer">Retailer</option>
            <option value="consumer">Consumer</option>
          </select>
        </div>

        <span className={`role-badge role-${currentRole}`}>
          <ShieldCheck size={14} />
          {currentRole}
        </span>

        <button
          className={`btn ${useMetaMask ? "btn-secondary" : "btn-primary"} btn-sm`}
          onClick={connectMetaMask}
        >
          <Wallet size={16} />
          {useMetaMask ? truncate(currentAccount) : "Connect MetaMask"}
        </button>

        {authUser && (
          <button className="btn btn-secondary btn-sm" onClick={logout}>
            <LogOut size={16} />
            Logout
          </button>
        )}
      </div>
    </nav>
  );
};
