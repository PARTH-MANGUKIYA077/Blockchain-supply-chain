import React, { useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import { X, Download, Printer, QrCode, ShieldCheck } from "lucide-react";

export const QRCodeModal = ({ isOpen, onClose, product }) => {
  const qrRef = useRef(null);

  if (!isOpen || !product) return null;

  const payload = JSON.stringify({
    productId: product.id,
    sku: product.sku,
    name: product.name,
    owner: product.owner,
    state: product.stateName,
    verifyUrl: `http://localhost:3000/?product=${product.id}`
  });

  const handleDownload = () => {
    const svgElement = document.getElementById("product-qr-code");
    if (!svgElement) return;

    const svgData = new XMLSerializer().serializeToString(svgElement);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width + 40;
      canvas.height = img.height + 40;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 20, 20);

      const pngFile = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.download = `QR_${product.sku}_Product_${product.id}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };

    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
  };

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    const svgElement = document.getElementById("product-qr-code").outerHTML;
    printWindow.document.write(`
      <html>
        <head>
          <title>Print QR Label - ${product.name}</title>
          <style>
            body { font-family: sans-serif; text-align: center; padding: 2rem; }
            .label-box { border: 2px solid #000; padding: 1.5rem; display: inline-block; border-radius: 8px; }
            h2 { margin: 0 0 0.5rem 0; }
            p { margin: 0.25rem 0; font-size: 0.9rem; color: #555; }
          </style>
        </head>
        <body>
          <div class="label-box">
            <h2>${product.name}</h2>
            <p><strong>SKU:</strong> #${product.sku} | <strong>ID:</strong> #${product.id}</p>
            <div style="margin: 1rem 0;">${svgElement}</div>
            <p>Scan to verify authentic on-chain blockchain provenance</p>
          </div>
          <script>
            window.onload = function() { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ textAlign: "center", maxWidth: "460px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
          <h3 style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <QrCode color="#3b82f6" /> Product QR Code Verification
          </h3>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer" }}
          >
            <X size={20} />
          </button>
        </div>

        <div style={{ background: "#ffffff", padding: "1.5rem", borderRadius: "12px", display: "inline-block", margin: "1rem 0" }}>
          <QRCodeSVG
            id="product-qr-code"
            value={payload}
            size={200}
            level="H"
            includeMargin={true}
          />
        </div>

        <div style={{ marginBottom: "1rem", textAlign: "left", background: "rgba(15, 23, 42, 0.5)", padding: "0.85rem", borderRadius: "8px", fontSize: "0.85rem" }}>
          <div><strong>Item:</strong> {product.name}</div>
          <div><strong>SKU:</strong> #{product.sku}</div>
          <div><strong>Blockchain State:</strong> <span style={{ color: "#60a5fa" }}>{product.stateName}</span></div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.3rem", marginTop: "0.4rem", color: "#10b981" }}>
            <ShieldCheck size={14} /> Immutable On-Chain Digital Passport
          </div>
        </div>

        <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center" }}>
          <button className="btn btn-primary btn-sm" onClick={handleDownload}>
            <Download size={14} /> Download PNG
          </button>
          <button className="btn btn-secondary btn-sm" onClick={handlePrint}>
            <Printer size={14} /> Print Label
          </button>
        </div>
      </div>
    </div>
  );
};
