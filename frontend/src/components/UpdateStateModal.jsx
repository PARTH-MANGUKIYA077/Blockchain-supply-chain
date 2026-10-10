import React, { useState, useEffect } from "react";
import { useWeb3 } from "../context/Web3Context";
import { X, ArrowRight, MapPin, FileText, User } from "lucide-react";

export const UpdateStateModal = ({ isOpen, onClose, product, actionType }) => {
  const { contract, sampleAccounts, refresh } = useWeb3();
  const [targetAddress, setTargetAddress] = useState("");
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (product && sampleAccounts) {
      if (actionType === "shipToSupplier") setTargetAddress(sampleAccounts.supplier || "");
      if (actionType === "shipToDistributor") setTargetAddress(sampleAccounts.distributor || "");
      if (actionType === "shipToRetailer") setTargetAddress(sampleAccounts.retailer || "");
      if (actionType === "sellToConsumer") setTargetAddress(sampleAccounts.consumer || "");
    }
  }, [product, actionType, sampleAccounts]);

  if (!isOpen || !product) return null;

  const actionLabels = {
    shipToSupplier: { title: "Ship to Supplier", needTarget: true, targetLabel: "Supplier Address" },
    receiveBySupplier: { title: "Receive by Supplier", needTarget: false },
    shipToDistributor: { title: "Ship to Distributor", needTarget: true, targetLabel: "Distributor Address" },
    receiveByDistributor: { title: "Receive by Distributor", needTarget: false },
    shipToRetailer: { title: "Ship to Retailer", needTarget: true, targetLabel: "Retailer Address" },
    receiveByRetailer: { title: "Receive by Retailer", needTarget: false },
    sellToConsumer: { title: "Sell to Consumer", needTarget: true, targetLabel: "Consumer Address" }
  };

  const currentConfig = actionLabels[actionType] || { title: "Update State", needTarget: false };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!location) {
      alert("Please provide location info.");
      return;
    }

    try {
      setSubmitting(true);
      let tx;
      const notesText = notes || "State transition recorded on-chain";

      if (actionType === "shipToSupplier") {
        tx = await contract.shipToSupplier(product.id, targetAddress, location, notesText);
      } else if (actionType === "receiveBySupplier") {
        tx = await contract.receiveBySupplier(product.id, location, notesText);
      } else if (actionType === "shipToDistributor") {
        tx = await contract.shipToDistributor(product.id, targetAddress, location, notesText);
      } else if (actionType === "receiveByDistributor") {
        tx = await contract.receiveByDistributor(product.id, location, notesText);
      } else if (actionType === "shipToRetailer") {
        tx = await contract.shipToRetailer(product.id, targetAddress, location, notesText);
      } else if (actionType === "receiveByRetailer") {
        tx = await contract.receiveByRetailer(product.id, location, notesText);
      } else if (actionType === "sellToConsumer") {
        tx = await contract.sellToConsumer(product.id, targetAddress, location, notesText);
      }

      if (tx) {
        await tx.wait();
        alert("State successfully updated on Blockchain!");
        refresh();
        onClose();
      }
    } catch (err) {
      console.error("Error updating product state:", err);
      alert("Transaction failed: " + (err.reason || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1.5rem" }}>
          <h3 style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <ArrowRight color="#3b82f6" /> {currentConfig.title} (Product #{product.id})
          </h3>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer" }}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {currentConfig.needTarget && (
            <div className="form-group">
              <label>{currentConfig.targetLabel} *</label>
              <input
                type="text"
                className="form-control"
                value={targetAddress}
                onChange={(e) => setTargetAddress(e.target.value)}
                required
              />
            </div>
          )}

          <div className="form-group">
            <label>Current Location *</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Distribution Center 4, Port Logistics"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Log / Audit Notes</label>
            <input
              type="text"
              className="form-control"
              placeholder="Inspection passed / Sealed package"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "1rem", marginTop: "2rem" }}>
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? "Signing Transaction..." : "Confirm & Update"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
