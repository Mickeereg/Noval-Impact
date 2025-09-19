import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import QRGenerator from '../components/QRGenerator';
import { API_BASE_URL, getAuthHeader } from '../config/api';
import { motion } from 'framer-motion';
import { FaQrcode, FaDownload, FaHistory, FaChartBar, FaUsers, FaRecycle, FaLayerGroup } from 'react-icons/fa';

const AdminPage = () => {
  const [itemType, setItemType] = useState('plastic');
  const [generatedQR, setGeneratedQR] = useState(null);
  const [loading, setLoading] = useState(false);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('generate');
  const [bulkAmount, setBulkAmount] = useState(5);
  const [stats, setStats] = useState({
    totalQRCodes: 0,
    recyclableItems: 0,
    activeUsers: 0,
    recycledItems: 0
  });
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Fetch dashboard statistics
  useEffect(() => {
    fetchStats();
  }, []);

  // Fetch QR code generation history
  useEffect(() => {
    if (activeTab === 'history') {
      fetchHistory();
    }
  }, [activeTab]);

  const fetchHistory = async () => {
    setHistoryLoading(true);
    try {
      // First, try the admin qr-history endpoint
      try {
        const response = await axios.get(`${API_BASE_URL}/api/admin/qr-history`, {
          headers: getAuthHeader()
        });
        
        if (response.data && Array.isArray(response.data)) {
          setHistory(response.data);
          setHistoryLoading(false);
          return; // Exit if successful
        }
      } catch (apiError) {
        console.error("Error with admin/qr-history endpoint:", apiError);
        // Continue to fallback method
      }

      // Fallback: Use items endpoint if admin/qr-history doesn't exist
      try {
        const itemsResponse = await axios.get(`${API_BASE_URL}/api/items`, {
          headers: getAuthHeader()
        });
        
        if (itemsResponse.data && Array.isArray(itemsResponse.data)) {
          // Transform items data to match history format
          const formattedHistory = itemsResponse.data.map(item => ({
            id: item.itemId || item._id,
            type: item.type || 'unknown',
            points: item.points || 0,
            date: item.createdAt ? new Date(item.createdAt).toISOString().split('T')[0] : 'N/A',
            used: item.isUsed || false
          }));
          
          setHistory(formattedHistory);
          setHistoryLoading(false);
          return; // Exit if fallback successful
        }
      } catch (fallbackError) {
        console.error("Error with fallback history method:", fallbackError);
        // Continue to final fallback
      }
      
      // Final fallback: Use empty array if all API methods fail
      console.warn("No QR history data available from API");
      setHistory([]);
      
    } catch (error) {
      console.error("Error fetching QR history:", error);
      toast.error("Failed to load QR code history. Please try again later.");
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleGenerateQR = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/api/items/generate-qr`, 
        { type: itemType },
        { headers: getAuthHeader() }
      );
      setGeneratedQR(response.data);
      toast.success('QR code generated successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error generating QR code');
    }
    setLoading(false);
  };

  const handleBulkGenerate = async () => {
    if (bulkAmount < 1 || bulkAmount > 50) {
      toast.error('Please enter a valid amount between 1 and 50');
      return;
    }

    setBulkLoading(true);
    try {
      // Check if bulk endpoint exists
      let bulkSuccess = false;
      
      try {
        const response = await axios.post(
          `${API_BASE_URL}/api/items/generate-bulk-qr`,
          { 
            type: itemType,
            amount: bulkAmount 
          },
          { headers: getAuthHeader() }
        );
        
        if (response.data && response.data.success) {
          bulkSuccess = true;
          toast.success(`Successfully generated ${bulkAmount} QR codes in bulk`);
        }
      } catch (bulkError) {
        console.error('Bulk generation endpoint error:', bulkError);
        // Continue to fallback method
      }

      // Fallback: If bulk endpoint doesn't exist, generate codes one by one
      if (!bulkSuccess) {
        toast.info(`Generating ${bulkAmount} QR codes individually...`);
        let successCount = 0;
        
        for (let i = 0; i < bulkAmount; i++) {
          try {
            const response = await axios.post(
              `${API_BASE_URL}/api/items/generate-qr`, 
              { type: itemType },
              { headers: getAuthHeader() }
            );
            
            if (response.data) {
              successCount++;
            }
          } catch (singleError) {
            console.error(`Error generating QR code ${i+1}:`, singleError);
          }
          
          // Update progress every 5 codes
          if ((i + 1) % 5 === 0 || i === bulkAmount - 1) {
            toast.success(`Generated ${successCount}/${bulkAmount} QR codes`);
          }
        }
      }
      
      // Refresh data regardless of generation method
      if (activeTab === 'history') {
        fetchHistory();
      }
      
      // Refresh stats
      fetchStats();
      
    } catch (error) {
      console.error('Error generating bulk QR codes:', error);
      toast.error(error.response?.data?.message || 'Failed to generate bulk QR codes');
    } finally {
      setBulkLoading(false);
    }
  };

  const getPointsForItemType = (type) => {
    const pointsMap = {
      'plastic': 5,
      'glass': 8,
      'paper': 3,
      'tin': 6,
      'electronics': 15,
      'other': 4
    };
    return pointsMap[type] || 4;
  };

  const getItemTypeColor = (type) => {
    const colorMap = {
      'plastic': 'bg-blue-500',
      'glass': 'bg-purple-500',
      'paper': 'bg-yellow-500',
      'tin': 'bg-gray-500',
      'electronics': 'bg-red-500',
      'other': 'bg-green-500'
    };
    return colorMap[type] || 'bg-green-500';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-emerald-600 text-white p-6 shadow-lg">
        <div className="container mx-auto">
          <h1 className="text-2xl md:text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-emerald-100 mt-1">Manage recyclable items and QR codes</p>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="container mx-auto p-4 md:p-6">
        {/* API Notice - Removed or set to false to hide */}
        {false && stats.totalQRCodes === 0 && (
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 rounded shadow-sm">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">API Configuration Notice</h3>
                <div className="mt-2 text-sm text-blue-700">
                  <p>We're unable to connect to some admin API endpoints. The dashboard is operating in compatibility mode.</p>
                  <p className="mt-1">If you're setting up a new backend, make sure to implement these endpoints:</p>
                  <ul className="list-disc list-inside mt-1 ml-2">
                    <li className="text-xs"><code>/api/admin/stats</code> - For dashboard statistics</li>
                    <li className="text-xs"><code>/api/admin/qr-history</code> - For QR code history</li>
                    <li className="text-xs"><code>/api/items/generate-bulk-qr</code> - For bulk QR generation</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatsCard 
            title="Total QR Codes" 
            value={stats.totalQRCodes} 
            icon={<FaQrcode />} 
            color="bg-blue-500" 
          />
          <StatsCard 
            title="Recyclable Items" 
            value={stats.recyclableItems} 
            icon={<FaRecycle />} 
            color="bg-green-500" 
          />
          <StatsCard 
            title="Active Users" 
            value={stats.activeUsers} 
            icon={<FaUsers />} 
            color="bg-purple-500" 
          />
          <StatsCard 
            title="Recycled Items" 
            value={stats.recycledItems} 
            icon={<FaChartBar />} 
            color="bg-amber-500" 
          />
        </div>
        
        {/* Tab Navigation */}
        <div className="bg-white rounded-t-lg shadow-md p-4 flex flex-wrap">
          <TabButton 
            active={activeTab === 'generate'} 
            onClick={() => setActiveTab('generate')}
            icon={<FaQrcode />}
            text="Generate QR" 
          />
          <TabButton 
            active={activeTab === 'bulk'} 
            onClick={() => setActiveTab('bulk')}
            icon={<FaLayerGroup />}
            text="Bulk Generate" 
          />
          <TabButton 
            active={activeTab === 'history'} 
            onClick={() => setActiveTab('history')}
            icon={<FaHistory />}
            text="QR History" 
          />
        </div>
        
        {/* Tab Content */}
        <div className="bg-white rounded-b-lg shadow-md p-6 mb-6">
          {activeTab === 'generate' ? (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col md:flex-row gap-8"
            >
              {/* QR Code Generator Form */}
              <div className="w-full md:w-1/2">
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <FaQrcode className="mr-2 text-emerald-600" />
                  Generate New QR Code
                </h2>
                
                <form onSubmit={handleGenerateQR} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Item Type</label>
                    <div className="relative">
              <select 
                        className="w-full p-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300"
                value={itemType}
                onChange={(e) => setItemType(e.target.value)}
              >
                        <option value="plastic">Plastic (5 points)</option>
                        <option value="tin">Tin (6 points)</option>
                        <option value="paper">Paper (3 points)</option>
                        <option value="glass">Glass (8 points)</option>
                        <option value="electronics">Electronics (15 points)</option>
                        <option value="other">Other (4 points)</option>
              </select>
                      <div className="absolute right-3 top-3 pointer-events-none text-gray-500">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
            </div>
            
                  <div className="pt-2">
                    <motion.button 
              type="submit" 
                      className="w-full py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow transition-colors flex items-center justify-center space-x-2"
              disabled={loading}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
            >
                      {loading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span>Generating...</span>
                        </>
                      ) : (
                        <>
                          <FaQrcode />
                          <span>Generate QR Code</span>
                        </>
                      )}
                    </motion.button>
                  </div>

                  {/* Item Type Preview */}
                  <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Selected Item Type:</h3>
                    <div className="flex items-center">
                      <div className={`w-10 h-10 rounded-full ${getItemTypeColor(itemType)} flex items-center justify-center text-white`}>
                        <FaRecycle />
                      </div>
                      <div className="ml-3">
                        <p className="font-medium text-gray-900 capitalize">{itemType}</p>
                        <p className="text-sm text-gray-500">{getPointsForItemType(itemType)} points per item</p>
                      </div>
                    </div>
                  </div>
                </form>
              </div>
              
              {/* QR Code Display */}
              <div className="w-full md:w-1/2">
                {generatedQR ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center bg-white p-6 rounded-xl border border-gray-200 shadow-md"
                  >
                    <QRGenerator data={generatedQR.qrCode} />
                    
                    <div className="w-full mt-6 grid grid-cols-3 gap-3">
                      <div className="bg-gray-50 p-3 rounded-lg text-center">
                        <p className="text-xs text-gray-500">Item ID</p>
                        <p className="font-mono font-medium text-gray-800 truncate text-sm">{generatedQR.itemId}</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg text-center">
                        <p className="text-xs text-gray-500">Type</p>
                        <p className={`font-medium capitalize ${getItemTypeColor(generatedQR.type)} text-white px-2 py-1 rounded text-xs inline-block`}>
                          {generatedQR.type}
                        </p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg text-center">
                        <p className="text-xs text-gray-500">Points</p>
                        <p className="font-bold text-emerald-600">{generatedQR.points}</p>
                      </div>
                    </div>
                    
                    <div className="w-full mt-4">
                      <motion.button
                        onClick={() => {
                          // Get the download function reference from the QRGenerator component
                          const downloadButton = document.querySelector('[data-qr-download]');
                          if (downloadButton) {
                            downloadButton.click();
                          } else {
                            toast.error('Download functionality not available');
                          }
                        }}
                        className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow transition-colors flex items-center justify-center space-x-2"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <FaDownload />
                        <span>Download QR Code</span>
                      </motion.button>
                    </div>
                  </motion.div>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center p-6 border-2 border-dashed border-gray-300 rounded-xl w-full">
                      <FaQrcode className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900">No QR Code Generated</h3>
                      <p className="mt-1 text-sm text-gray-500">Select an item type and click generate to create a new QR code.</p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          ) : activeTab === 'bulk' ? (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <FaLayerGroup className="mr-2 text-emerald-600" />
                Bulk QR Code Generation
              </h2>
              
              <div className="bg-emerald-50 p-4 rounded-lg mb-6 border border-emerald-100">
                <p className="text-sm text-emerald-800">
                  Generate multiple QR codes at once for efficient distribution. The codes will be saved in the database and accessible through the history tab.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <form className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Item Type</label>
                      <div className="relative">
                        <select 
                          className="w-full p-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300"
                          value={itemType}
                          onChange={(e) => setItemType(e.target.value)}
                        >
                          <option value="plastic">Plastic (5 points)</option>
                          <option value="tin">Tin (6 points)</option>
                          <option value="paper">Paper (3 points)</option>
                          <option value="glass">Glass (8 points)</option>
                          <option value="electronics">Electronics (15 points)</option>
                          <option value="other">Other (4 points)</option>
                        </select>
                        <div className="absolute right-3 top-3 pointer-events-none text-gray-500">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Number of QR Codes to Generate (1-50)
                      </label>
                      <input
                        type="number"
                        value={bulkAmount}
                        min="1"
                        max="50"
                        onChange={(e) => setBulkAmount(parseInt(e.target.value) || 1)}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300"
                      />
                    </div>
                    
                    <div className="pt-4">
                      <motion.button 
                        type="button" 
                        onClick={handleBulkGenerate}
                        className="w-full py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow transition-colors flex items-center justify-center space-x-2"
                        disabled={bulkLoading}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {bulkLoading ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span>Generating...</span>
                          </>
                        ) : (
                          <>
                            <FaLayerGroup />
                            <span>Generate {bulkAmount} QR Codes</span>
                          </>
                        )}
                      </motion.button>
                    </div>
          </form>
                </div>
                
                <div>
                  <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-md">
                    <h3 className="text-lg font-medium mb-4">Bulk Generation Preview</h3>
                    
                    <div className="flex items-center mb-4">
                      <div className={`w-10 h-10 rounded-full ${getItemTypeColor(itemType)} flex items-center justify-center text-white`}>
                        <FaRecycle />
                      </div>
                      <div className="ml-3">
                        <p className="font-medium text-gray-900 capitalize">{itemType}</p>
                        <p className="text-sm text-gray-500">{getPointsForItemType(itemType)} points per item</p>
                      </div>
                    </div>
                    
                    <div className="border-t border-gray-200 pt-4">
                      <dl className="divide-y divide-gray-200">
                        <div className="py-2 grid grid-cols-2">
                          <dt className="text-sm font-medium text-gray-500">Number of QR Codes:</dt>
                          <dd className="text-sm font-bold text-gray-900">{bulkAmount}</dd>
                        </div>
                        <div className="py-2 grid grid-cols-2">
                          <dt className="text-sm font-medium text-gray-500">Total Points Value:</dt>
                          <dd className="text-sm font-bold text-emerald-600">{bulkAmount * getPointsForItemType(itemType)}</dd>
                        </div>
                        <div className="py-2 grid grid-cols-2">
                          <dt className="text-sm font-medium text-gray-500">Estimated Time:</dt>
                          <dd className="text-sm text-gray-900">~{Math.ceil(bulkAmount / 10)} seconds</dd>
                        </div>
                      </dl>
                    </div>
                    
                    <div className="mt-4 flex flex-wrap gap-2">
                      {Array.from({ length: Math.min(10, bulkAmount) }).map((_, i) => (
                        <div 
                          key={i} 
                          className={`w-8 h-8 rounded-md flex items-center justify-center text-white text-xs ${getItemTypeColor(itemType)}`}
                        >
                          QR
                        </div>
                      ))}
                      {bulkAmount > 10 && (
                        <div className="w-8 h-8 rounded-md flex items-center justify-center bg-gray-200 text-gray-700 text-xs">
                          +{bulkAmount - 10}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <FaHistory className="mr-2 text-emerald-600" />
                QR Code History
              </h2>
              
              {historyLoading ? (
                <div className="flex justify-center my-12">
                  <svg className="animate-spin h-8 w-8 text-emerald-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Points</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {history.map((item, index) => (
                        <motion.tr
                          key={item.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.2, delay: index * 0.05 }}
                        >
                          <td className="px-6 py-4 whitespace-nowrap font-mono text-sm text-gray-800">{item.id}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 rounded text-xs font-medium text-white ${getItemTypeColor(item.type)}`}>
                              {item.type}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-emerald-600">{item.points}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.date}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {item.used ? (
                              <span className="px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800">Used</span>
                            ) : (
                              <span className="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">Active</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <button className="text-indigo-600 hover:text-indigo-900 mr-2">View</button>
                            {!item.used && (
                              <button className="text-red-600 hover:text-red-900">Deactivate</button>
                            )}
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
            </div>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

// Stats Card Component
const StatsCard = ({ title, value, icon, color }) => {
  return (
    <motion.div 
      className="bg-white rounded-lg shadow p-6"
      whileHover={{ y: -5, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-center">
        <div className={`rounded-full p-3 text-white ${color}`}>
          {icon}
        </div>
        <div className="ml-4">
          <h3 className="text-sm font-medium text-gray-500">{title}</h3>
          <motion.p 
            className="text-2xl font-bold text-gray-900"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, type: 'spring' }}
          >
            {value}
          </motion.p>
        </div>
      </div>
    </motion.div>
  );
};

// Tab Button Component
const TabButton = ({ active, onClick, icon, text }) => {
  return (
    <button
      className={`flex items-center mr-4 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
        active 
          ? 'bg-emerald-600 text-white' 
          : 'text-gray-600 hover:bg-gray-100'
      }`}
      onClick={onClick}
    >
      <span className="mr-2">{icon}</span>
      {text}
    </button>
  );
};

// Add a separate fetchStats function so we can call it from other places
const fetchStats = async () => {
  try {
    // First, try to fetch from the specified API endpoint
    try {
      const response = await axios.get(`${API_BASE_URL}/api/admin/stats`, {
        headers: getAuthHeader()
      });
      
      if (response.data) {
        setStats({
          totalQRCodes: response.data.totalQRCodes || 0,
          recyclableItems: response.data.recyclableItems || 0,
          activeUsers: response.data.activeUsers || 0,
          recycledItems: response.data.recycledItems || 0
        });
        return; // Exit if successful
      }
    } catch (apiError) {
      console.error("Error with admin/stats endpoint:", apiError);
      // Continue to fallback method
    }

    // Fallback: Aggregate stats from existing endpoints if admin/stats doesn't exist
    try {
      // Get QR code count from items endpoint
      const itemsResponse = await axios.get(`${API_BASE_URL}/api/items`, {
        headers: getAuthHeader()
      });
      
      // Get users count
      const usersResponse = await axios.get(`${API_BASE_URL}/api/users/count`, {
        headers: getAuthHeader()
      });
      
      // Calculate stats from the available data
      setStats({
        totalQRCodes: itemsResponse.data?.length || 0,
        recyclableItems: itemsResponse.data?.filter(item => !item.isUsed)?.length || 0,
        activeUsers: usersResponse.data?.count || 0,
        recycledItems: itemsResponse.data?.filter(item => item.isUsed)?.length || 0
      });
    } catch (fallbackError) {
      console.error("Error with fallback stats method:", fallbackError);
      // No further fallback needed here
    }
  } catch (error) {
    console.error("Error fetching stats:", error);
  }
};

export default AdminPage; 