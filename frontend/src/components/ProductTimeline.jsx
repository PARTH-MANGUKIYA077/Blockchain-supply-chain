import React, { useState, useEffect } from "react";
import { useWeb3 } from "../context/Web3Context";
import { CheckCircle, Clock, MapPin, User, FileText, ArrowLeft } from "lucide-react";

export const ProductTimeline = ({ productId, onBack }) => {
  const { contract } = useWeb3();
  const [productData, setProductData] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    const fetchHistory = async () => {
      if (!contract || !productId) return;
      try {
        setLoading(true);
        const p = await contract.getProduct(productId);
        const rawHist = await contract.getProductHistory(productId);

        setProductData({
          id: Number(p.id),
          sku: p.sku,
          name: p.name,
          description: p.description,
          owner: p.owner,
          stateName: stateNames[Number(p.state)]
        });

        const formattedHist = rawHist.map((h) => ({
          stateCode: Number(h.state),
          stateName: stateNames[Number(h.state)],
          updatedBy: h.updatedBy,
          timestamp: new Date(Number(h.timestamp) * 1000).toLocaleString(),
          location: h.location,
          notes: h.notes
        }));

        setHistory(formattedHist);
      } catch (err) {
        console.error("Error loading product history:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [contract, productId]);

  const truncate = (addr) =>
    addr ? `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}` : "";

  if (loading) {
    return <div className="timeline-container">Loading Audit Trail...</div>;
  }

  if (!productData) {
    return <div className="timeline-container">Product not found.</div>;
  }

  return (
    <div className="timeline-container">
      <button className="btn btn-secondary btn-sm" onClick={onBack} style={{ marginBottom: "1rem" }}>
        <ArrowLeft size={16} /> Back to Products
      </button>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h2>{productData.name}</h2>
          <p style={{ color: "#94a3b8", fontSize: "0.9rem" }}>SKU: #{productData.sku} | Current State: <strong style={{ color: "#60a5fa" }}>{productData.stateName}</strong></p>
        </div>
      </div>

      <div style={{ marginTop: "1.5rem" }}>
        <h3>On-Chain Provenance Audit Trail</h3>

        <div className="timeline-stepper">
          {history.map((step, idx) => (
            <div key={idx} className="timeline-step active">
              <div className="timeline-step-icon">
                <CheckCircle size={18} />
              </div>

              <div className="timeline-step-content">
                <div className="timeline-title">
                  <span>{step.stateName}</span>
                  <span style={{ fontSize: "0.8rem", color: "#94a3b8", fontWeight: 400 }}>{step.timestamp}</span>
                </div>

                <div className="timeline-meta">
                  <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                    <MapPin size={14} color="#f59e0b" />
                    <span>Location: <strong>{step.location}</strong></span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginTop: "0.2rem" }}>
                    <User size={14} color="#3b82f6" />
                    <span>Updated By: <code className="address-truncate">{step.updatedBy}</code></span>
                  </div>
                  {step.notes && (
                    <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginTop: "0.2rem", color: "#cbd5e1" }}>
                      <FileText size={14} color="#10b981" />
                      <span>Notes: <em>{step.notes}</em></span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
