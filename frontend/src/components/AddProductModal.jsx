import React, { useState } from "react";
import { useWeb3 } from "../context/Web3Context";
import { ethers } from "ethers";
import { X, PlusCircle } from "lucide-react";

export const AddProductModal = ({ isOpen, onClose }) => {
  const { contract, currentAccount, refresh } = useWeb3();
  const [sku, setSku] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [priceEth, setPriceEth] = useState("0.01");
  const [location, setLocation] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!sku || !name || !priceEth || !location) {
      alert("Please fill in all required fields.");
      return;
    }

    try {
      setSubmitting(true);
      const priceWei = ethers.parseEther(priceEth);
      const tx = await contract.createProduct(
        sku,
        name,
        description || "N/A",
        priceWei,
        location
      );
      await tx.wait();
      alert("Product successfully registered on Blockchain!");
      refresh();
      onClose();
    } catch (err) {
      console.error("Error creating product:", err);
      alert("Failed to create product: " + (err.reason || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1.5rem" }}>
          <h2 style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <PlusCircle color="#3b82f6" /> Register New Product
          </h2>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer" }}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>SKU / Product Code *</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. SKU-PHARMA-2026"
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Product Name *</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Organic Herbal Extract Batch 4"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              className="form-control"
              rows="3"
              placeholder="Detailed item notes or batch specifics"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Price (ETH) *</label>
            <input
              type="number"
              step="0.001"
              className="form-control"
              placeholder="0.01"
              value={priceEth}
              onChange={(e) => setPriceEth(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Manufacturing Facility Location *</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Factory Lab 3, Munich, Germany"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
            />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "1rem", marginTop: "2rem" }}>
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? "Minting on Blockchain..." : "Create Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
