import React, { useState, useEffect } from "react";
import { Html5QrcodeScanner, Html5Qrcode } from "html5-qrcode";
import { X, Camera, Upload, Search, CheckCircle, AlertTriangle } from "lucide-react";

export const QRScannerModal = ({ isOpen, onClose, onSelectProduct }) => {
  const [scanMode, setScanMode] = useState("camera"); // "camera", "file", "manual"
  const [manualInput, setManualInput] = useState("");
  const [scanError, setScanError] = useState("");
  const [fileScanning, setFileScanning] = useState(false);

  useEffect(() => {
    let scanner = null;

    if (isOpen && scanMode === "camera") {
      setScanError("");
      const config = { fps: 10, qrbox: { width: 220, height: 220 } };
      scanner = new Html5QrcodeScanner("qr-reader", config, false);

      scanner.render(
        (decodedText) => {
          handleSuccess(decodedText);
          scanner.clear();
        },
        (error) => {
          // Keep scanning silently on frame fail
        }
      );
    }

    return () => {
      if (scanner) {
        scanner.clear().catch(() => {});
      }
    };
  }, [isOpen, scanMode]);

  if (!isOpen) return null;

  const handleSuccess = (decodedText) => {
    try {
      let productId = null;

      if (decodedText.startsWith("{")) {
        const parsed = JSON.parse(decodedText);
        productId = parsed.productId || parsed.id;
      } else if (!isNaN(decodedText)) {
        productId = Number(decodedText);
      } else {
        // Try parsing URL query like http://localhost:3000/?product=1
        const urlParams = new URLSearchParams(decodedText.split("?")[1]);
        if (urlParams.has("product")) {
          productId = urlParams.get("product");
        }
      }

      if (productId) {
        onSelectProduct(productId);
        onClose();
      } else {
        setScanError("Invalid QR Code payload format.");
      }
    } catch (err) {
      setScanError("Failed to parse QR code data.");
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setFileScanning(true);
      setScanError("");
      const html5Qrcode = new Html5Qrcode("qr-file-reader");
      const decodedText = await html5Qrcode.scanFile(file, true);
      handleSuccess(decodedText);
    } catch (err) {
      setScanError("No valid QR code detected in the uploaded image.");
    } finally {
      setFileScanning(false);
    }
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!manualInput.trim()) return;
    handleSuccess(manualInput.trim());
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: "500px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
          <h3 style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Camera color="#3b82f6" /> Scan QR Code & Verify On-Chain
          </h3>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer" }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Scan Mode Switcher */}
        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.25rem" }}>
          <button
            className={`btn ${scanMode === "camera" ? "btn-primary" : "btn-secondary"} btn-sm`}
            style={{ flex: 1 }}
            onClick={() => setScanMode("camera")}
          >
            <Camera size={14} /> Camera Scan
          </button>
          <button
            className={`btn ${scanMode === "file" ? "btn-primary" : "btn-secondary"} btn-sm`}
            style={{ flex: 1 }}
            onClick={() => setScanMode("file")}
          >
            <Upload size={14} /> Upload Image
          </button>
          <button
            className={`btn ${scanMode === "manual" ? "btn-primary" : "btn-secondary"} btn-sm`}
            style={{ flex: 1 }}
            onClick={() => setScanMode("manual")}
          >
            <Search size={14} /> Manual Code
          </button>
        </div>

        {scanError && (
          <div style={{ background: "rgba(244, 63, 94, 0.15)", border: "1px solid #f43f5e", padding: "0.75rem", borderRadius: "8px", color: "#fda4af", fontSize: "0.85rem", marginBottom: "1rem", display: "flex", gap: "0.5rem", alignItems: "center" }}>
            <AlertTriangle size={16} /> {scanError}
          </div>
        )}

        {scanMode === "camera" && (
          <div>
            <div id="qr-reader" style={{ border: "none" }}></div>
            <p style={{ fontSize: "0.8rem", color: "#94a3b8", textAlign: "center", marginTop: "0.5rem" }}>
              Align the item's QR code within the camera frame
            </p>
          </div>
        )}

        {scanMode === "file" && (
          <div style={{ textAlign: "center", border: "2px dashed var(--border-color)", padding: "2rem", borderRadius: "12px" }}>
            <Upload size={36} color="#60a5fa" style={{ marginBottom: "0.75rem" }} />
            <p style={{ marginBottom: "1rem", fontSize: "0.9rem" }}>Select a photo or label image containing a QR code</p>
            <input
              type="file"
              accept="image/*"
              id="qr-file-input"
              onChange={handleFileUpload}
              style={{ display: "none" }}
            />
            <label htmlFor="qr-file-input" className="btn btn-primary btn-sm">
              {fileScanning ? "Decoding..." : "Choose Image File"}
            </label>
            <div id="qr-file-reader" style={{ display: "none" }}></div>
          </div>
        )}

        {scanMode === "manual" && (
          <form onSubmit={handleManualSubmit}>
            <div className="form-group">
              <label>Enter Product ID, SKU, or Paste QR Payload</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. 1 or SKU-PHARMA-1001"
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: "100%", marginTop: "1rem" }}>
              Verify & Trace Product
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
