import React from "react";
import { useWeb3 } from "../context/Web3Context";
import { Package, MapPin, Tag, User, Clock, ChevronRight } from "lucide-react";

export const ProductCard = ({ product, onSelectTimeline, onAction, onShowQRCode }) => {
  const { currentAccount, currentRole } = useWeb3();

  const isOwner = product.owner.toLowerCase() === currentAccount.toLowerCase();
  const isAdmin = currentRole === "ADMIN";

  const truncate = (addr) =>
    addr ? `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}` : "None";

  // Determine available action buttons based on product state & role/ownership
  const renderActions = () => {
    const s = product.stateCode;

    // State 1: Manufactured -> Can ship to Supplier (Owner or Manufacturer/Admin)
    if (s === 1 && (isOwner || currentRole === "MANUFACTURER" || isAdmin)) {
      return (
        <button
          className="btn btn-primary btn-sm"
          style={{ width: "100%" }}
          onClick={() => onAction(product, "shipToSupplier")}
        >
          Ship to Supplier <ChevronRight size={14} />
        </button>
      );
    }

    // State 2: InTransitToSupplier -> Supplier or Admin can Receive
    if (s === 2 && (currentRole === "SUPPLIER" || isAdmin)) {
      return (
        <button
          className="btn btn-primary btn-sm"
          style={{ width: "100%" }}
          onClick={() => onAction(product, "receiveBySupplier")}
        >
          Receive Shipment <ChevronRight size={14} />
        </button>
      );
    }

    // State 3: WithSupplier -> Can ship to Distributor
    if (s === 3 && (isOwner || currentRole === "SUPPLIER" || isAdmin)) {
      return (
        <button
          className="btn btn-primary btn-sm"
          style={{ width: "100%" }}
          onClick={() => onAction(product, "shipToDistributor")}
        >
          Ship to Distributor <ChevronRight size={14} />
        </button>
      );
    }

    // State 4: InTransitToDistributor -> Distributor or Admin can Receive
    if (s === 4 && (currentRole === "DISTRIBUTOR" || isAdmin)) {
      return (
        <button
          className="btn btn-primary btn-sm"
          style={{ width: "100%" }}
          onClick={() => onAction(product, "receiveByDistributor")}
        >
          Receive Shipment <ChevronRight size={14} />
        </button>
      );
    }

    // State 5: WithDistributor -> Can ship to Retailer
    if (s === 5 && (isOwner || currentRole === "DISTRIBUTOR" || isAdmin)) {
      return (
        <button
          className="btn btn-primary btn-sm"
          style={{ width: "100%" }}
          onClick={() => onAction(product, "shipToRetailer")}
        >
          Ship to Retailer <ChevronRight size={14} />
        </button>
      );
    }

    // State 6: InTransitToRetailer -> Retailer or Admin can Receive
    if (s === 6 && (currentRole === "RETAILER" || isAdmin)) {
      return (
        <button
          className="btn btn-primary btn-sm"
          style={{ width: "100%" }}
          onClick={() => onAction(product, "receiveByRetailer")}
        >
          Receive Shipment <ChevronRight size={14} />
        </button>
      );
    }

    // State 7: WithRetailer -> Can sell to Consumer
    if (s === 7 && (isOwner || currentRole === "RETAILER" || isAdmin)) {
      return (
        <button
          className="btn btn-primary btn-sm"
          style={{ width: "100%" }}
          onClick={() => onAction(product, "sellToConsumer")}
        >
          Sell to Consumer <ChevronRight size={14} />
        </button>
      );
    }

    if (s === 8) {
      return (
        <div style={{ textAlign: "center", color: "#10b981", fontSize: "0.85rem", fontWeight: 600 }}>
          ✓ Completed & Sold
        </div>
      );
    }

    return null;
  };

  return (
    <div className="product-card">
      <div>
        <div className="product-header">
          <span className="product-title">{product.name}</span>
          <span className={`state-badge state-${product.stateCode}`}>{product.stateName}</span>
        </div>

        <div className="product-sku">#{product.sku}</div>
        <p className="product-desc">{product.description}</p>

        <div className="product-meta">
          <div>
            <span><Tag size={12} /> Price:</span>
            <strong style={{ color: "#60a5fa" }}>{product.priceEth} ETH</strong>
          </div>
          <div>
            <span><User size={12} /> Current Owner:</span>
            <span className="address-truncate">{truncate(product.owner)}</span>
          </div>
          <div>
            <span><Clock size={12} /> Created:</span>
            <span>{product.createdAt}</span>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginTop: "1rem" }}>
        {renderActions()}
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button
            className="btn btn-secondary btn-sm"
            style={{ flex: 1 }}
            onClick={() => onSelectTimeline(product.id)}
          >
            View History
          </button>
          <button
            className="btn btn-secondary btn-sm"
            style={{ flex: 1 }}
            onClick={() => onShowQRCode(product)}
          >
            QR Code
          </button>
        </div>
      </div>
    </div>
  );
};
