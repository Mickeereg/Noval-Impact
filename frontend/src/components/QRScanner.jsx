import React, { useState } from 'react';
import { QrReader } from 'react-qr-reader';
import axios from 'axios';
import { toast } from 'react-toastify';
import { API_BASE_URL, getAuthHeader } from '../config/api';

const QRScanner = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);

  const handleScan = async (data) => {
    if (data) {
      try {
        // Parse the QR code data
        const [itemId, type, points] = data.split('|');
        
        // Send the scanned data to the backend
        const response = await axios.post(
          `${API_BASE_URL}/api/items/validate-qr`,
          { qrData: data },
          { headers: getAuthHeader() }
        );

        if (response.data.valid) {
          setScanResult({
            itemType: type,
            points: parseInt(points),
            totalPoints: response.data.totalPoints
          });
          toast.success(`Successfully recycled ${type}! You earned ${points} points.`);
        }
      } catch (error) {
        toast.error(error.response?.data?.message || 'Error processing QR code');
      }
      setIsScanning(false);
    }
  };

  const handleError = (error) => {
    console.error(error);
    toast.error('Error accessing camera');
    setIsScanning(false);
  };

  return (
    <div className="qr-scanner-container">
      {!isScanning ? (
        <button
          onClick={() => setIsScanning(true)}
          className="btn btn-primary mb-3"
        >
          Scan QR Code
        </button>
      ) : (
        <div className="scanner-wrapper">
          <QrReader
            constraints={{ facingMode: 'user' }}
            onResult={(result, error) => {
              if (result) {
                handleScan(result?.text);
              }
              if (error) {
                handleError(error);
              }
            }}
          />
          <button
            onClick={() => setIsScanning(false)}
            className="btn btn-secondary mt-3"
          >
            Cancel
          </button>
        </div>
      )}

      {scanResult && (
        <div className="scan-result mt-3">
          <h4>Scan Result</h4>
          <p>Item Type: {scanResult.itemType}</p>
          <p>Points Earned: {scanResult.points}</p>
          <p>Total Points: {scanResult.totalPoints}</p>
        </div>
      )}
    </div>
  );
};

export default QRScanner; 