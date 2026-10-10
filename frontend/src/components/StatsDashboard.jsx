import React from "react";
import { useWeb3 } from "../context/Web3Context";
import { Package, Truck, CheckCircle2, Users } from "lucide-react";

export const StatsDashboard = () => {
  const { products, allUsers } = useWeb3();

  const totalProducts = products.length;
  const inTransit = products.filter(
    (p) => p.stateCode === 2 || p.stateCode === 4 || p.stateCode === 6
  ).length;
  const completed = products.filter((p) => p.stateCode === 8).length;
  const totalUsers = allUsers.length;

  return (
    <div className="dashboard-grid">
      <div className="stat-card">
        <div className="stat-icon">
          <Package size={24} />
        </div>
        <div>
          <div className="stat-val">{totalProducts}</div>
          <div className="stat-label">Total Products Tracked</div>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon" style={{ background: "rgba(245, 158, 11, 0.15)", color: "#f59e0b" }}>
          <Truck size={24} />
        </div>
        <div>
          <div className="stat-val">{inTransit}</div>
          <div className="stat-label">In Transit Shipments</div>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon" style={{ background: "rgba(16, 185, 129, 0.15)", color: "#10b981" }}>
          <CheckCircle2 size={24} />
        </div>
        <div>
          <div className="stat-val">{completed}</div>
          <div className="stat-label">Delivered & Sold</div>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon" style={{ background: "rgba(139, 92, 246, 0.15)", color: "#8b5cf6" }}>
          <Users size={24} />
        </div>
        <div>
          <div className="stat-val">{totalUsers}</div>
          <div className="stat-label">Registered Participants</div>
        </div>
      </div>
    </div>
  );
};
