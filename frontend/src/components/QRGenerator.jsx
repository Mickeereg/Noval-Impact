import React from 'react';
import { QRCodeSVG } from 'qrcode.react';

const QRGenerator = ({ data }) => {
  // Format the QR data as itemId|type|points
  const qrData = typeof data === 'string' ? data : `${data.itemId}|${data.type}|${data.points}`;

  const handleDownload = () => {
    const svg = document.querySelector('svg');
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.download = `qr-${data.itemId || 'code'}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-lg">
      <QRCodeSVG
        value={qrData}
        size={256}
        level="M"
        includeMargin={true}
      />
      <button
        onClick={handleDownload}
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
      >
        Download QR Code
      </button>
    </div>
  );
};

export default QRGenerator; 