import React, { useState } from "react";
import { useWeb3 } from "../context/Web3Context";
import { ShieldAlert, UserPlus, Check } from "lucide-react";

export const RoleManagement = () => {
  const { contract, currentRole, allUsers, refresh } = useWeb3();
  const [targetAddress, setTargetAddress] = useState("");
  const [selectedRole, setSelectedRole] = useState("MANUFACTURER");
  const [submitting, setSubmitting] = useState(false);

  const isAdmin = currentRole === "ADMIN";

  const handleAssignRole = async (e) => {
    e.preventDefault();
    if (!targetAddress) {
      alert("Please enter a valid wallet address.");
      return;
    }

    try {
      setSubmitting(true);
      const tx = await contract.assignRole(targetAddress, selectedRole);
      await tx.wait();
      alert(`Role ${selectedRole} assigned to address ${targetAddress}`);
      setTargetAddress("");
      refresh();
    } catch (err) {
      console.error("Role assignment error:", err);
      alert("Failed to assign role: " + (err.reason || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  const truncate = (addr) =>
    addr ? `${addr.substring(0, 8)}...${addr.substring(addr.length - 6)}` : "";

  return (
    <div style={{ background: "var(--bg-card)", padding: "1.5rem", borderRadius: "var(--radius)", border: "1px solid var(--border-color)" }}>
      <h3 style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
        <UserPlus color="#8b5cf6" /> Role-Based Access Control Management
      </h3>

      {isAdmin ? (
        <form onSubmit={handleAssignRole} style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
          <input
            type="text"
            className="form-control"
            placeholder="0x... Wallet Address"
            style={{ flex: 2, minWidth: "260px" }}
            value={targetAddress}
            onChange={(e) => setTargetAddress(e.target.value)}
            required
          />

          <select
            className="form-control"
            style={{ flex: 1, minWidth: "160px" }}
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
          >
            <option value="ADMIN">ADMIN</option>
            <option value="MANUFACTURER">MANUFACTURER</option>
            <option value="SUPPLIER">SUPPLIER</option>
            <option value="DISTRIBUTOR">DISTRIBUTOR</option>
            <option value="RETAILER">RETAILER</option>
            <option value="CONSUMER">CONSUMER</option>
          </select>

          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? "Granting..." : "Assign Role"}
          </button>
        </form>
      ) : (
        <p style={{ color: "#94a3b8", fontSize: "0.85rem", marginBottom: "1rem" }}>
          <ShieldAlert size={14} color="#f43f5e" /> Only users with ADMIN role can assign or modify access permissions on-chain. Switch to Admin role using the navbar top right selector.
        </p>
      )}

      <h4>Registered On-Chain Accounts</h4>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginTop: "0.75rem" }}>
        {allUsers.map((u, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              background: "rgba(15, 23, 42, 0.4)",
              padding: "0.75rem 1rem",
              borderRadius: "8px",
              border: "1px solid var(--border-color)"
            }}
          >
            <code className="address-truncate">{u.address}</code>
            <span className={`role-badge role-${u.role}`}>{u.role}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
