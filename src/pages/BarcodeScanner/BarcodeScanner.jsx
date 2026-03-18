import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ScanBarcode, Keyboard, Search, PackageOpen, History, Plus, Minus, Info, Loader2 } from 'lucide-react';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { getStockStatus, getExpiryStatus } from '../../utils/calculateStock';
import { productService } from '../../services/productService';
import { inventoryService } from '../../services/inventoryService';
import { getErrorMessage } from '../../utils/errorHandler';

const BarcodeScanner = () => {
  const navigate = useNavigate();
  const [isScanning, setIsScanning] = useState(true);
  const [manualCode, setManualCode] = useState('');
  const [scanResult, setScanResult] = useState(null);
  const [recentScans, setRecentScans] = useState([]);
  const [scanStatus, setScanStatus] = useState('idle'); // idle, loading, error, success
  const [actionLoading, setActionLoading] = useState(false);

  // Simulate hardware scanner input which sends rapid keystrokes followed by Enter
  useEffect(() => {
    let barcodeBuffer = '';
    let lastKeyTime = Date.now();
    
    const handleKeyPress = (e) => {
      // Ignore if typing in an input
      if (document.activeElement.tagName === 'INPUT' || !isScanning) return;
      
      const currentTime = Date.now();
      
      // If time between keystrokes is too long (> 50ms), it's human typing
      if (currentTime - lastKeyTime > 50) {
        barcodeBuffer = '';
      }
      
      if (e.key === 'Enter') {
        if (barcodeBuffer.length >= 3) {
           processBarcode(barcodeBuffer);
        }
        barcodeBuffer = '';
      } else {
        barcodeBuffer += e.key;
      }
      
      lastKeyTime = currentTime;
    };

    window.addEventListener('keypress', handleKeyPress);
    return () => window.removeEventListener('keypress', handleKeyPress);
  }, [isScanning]);

  const processBarcode = async (code) => {
    if (!code) return;
    setScanStatus('loading');
    setScanResult(null);
    setManualCode(''); // Clear manual input
    
    try {
      const resp = await productService.getByBarcode(code);
      const product = resp?.data?.data || null;
      
      if (product) {
        setScanResult(product);
        setScanStatus('success');
        
        // Add to recent history, max 10
        setRecentScans(prev => {
          const newHistory = [{ ...product, scannedAt: new Date() }, ...prev.filter(p => p._id !== product._id)];
          return newHistory.slice(0, 10);
        });
        
        // Reset status for next scan after 3s
        setTimeout(() => setScanStatus('idle'), 3000);
      } else {
        throw new Error('Product not found');
      }
    } catch (err) {
      setScanStatus('error');
      // Reset to idle
      setTimeout(() => setScanStatus('idle'), 2000);
    }
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (manualCode.trim()) {
      processBarcode(manualCode.trim());
    }
  };

  const handleStockAction = async (actionType) => {
    if (!scanResult || actionLoading) return;
    setActionLoading(true);
    try {
      const payload = {
          productId: scanResult._id,
          quantity: 1,
          reason: actionType === 'in' ? 'Scanner addition' : 'Scanner subtraction'
      };

      if (actionType === 'in') {
        await inventoryService.addStock(payload);
      } else {
        await inventoryService.removeStock(payload);
      }

      // Update local scanResult state to reflect new stock
      const updatedResp = await productService.getById(scanResult._id);
      const updatedProduct = updatedResp?.data?.data || null;
      setScanResult(updatedProduct);
      
      // Also update history if present
      setRecentScans(prev => prev.map(p => p._id === updatedProduct._id ? { ...updatedProduct, scannedAt: new Date() } : p));

    } catch (err) {
      alert(getErrorMessage(err));
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Barcode Scanner</h2>
          <p className="text-sm text-gray-500 mt-1">Connect a hardware scanner or enter codes manually.</p>
        </div>
        
        <div className="flex bg-gray-100 p-1 rounded-lg">
          <button 
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all flex items-center gap-2 ${isScanning ? 'bg-white text-gray-900 leading-tight shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setIsScanning(true)}
          >
            <ScanBarcode className="w-4 h-4" /> Ready to Scan
          </button>
          <button 
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all flex items-center gap-2 ${!isScanning ? 'bg-white text-gray-900 leading-tight shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setIsScanning(false)}
          >
            <Keyboard className="w-4 h-4" /> Manual Entry
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: SCANNER AREA */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Main Visual Scanner Area */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden relative">
            
            {/* Pulsing indicator when active */}
            {isScanning && scanStatus === 'idle' && (
              <div className="absolute top-4 right-4 flex items-center gap-2 bg-green-50 px-3 py-1 rounded-full border border-green-100 z-10">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
                </span>
                <span className="text-xs font-semibold text-green-700">Scanner Ready</span>
              </div>
            )}

            <div className={`p-16 flex flex-col items-center justify-center transition-colors duration-300 ${scanStatus === 'error' ? 'bg-red-50' : scanStatus === 'success' ? 'bg-green-50' : 'bg-gray-50'}`}>
              
              <div className="relative">
                {/* Laser animation box */}
                <div className={`w-64 h-32 border-2 rounded-lg relative overflow-hidden transition-all duration-300 ${isScanning ? 'border-primary border-dashed bg-white/50' : 'border-gray-300 border-solid bg-gray-100'}`}>
                   {isScanning && scanStatus === 'idle' && (
                     <div className="absolute w-full h-[2px] bg-primary/70 top-1/2 -translate-y-1/2 shadow-[0_0_8px_rgba(26,86,219,0.8)] animate-[scanLine_2s_ease-in-out_infinite] z-0"></div>
                   )}
                   
                   {/* Centered Icon */}
                   <div className="absolute inset-0 flex items-center justify-center z-10 mix-blend-multiply">
                     {scanStatus === 'loading' ? (
                       <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                     ) : (
                       <BarcodeIcon isScanning={isScanning} status={scanStatus} />
                     )}
                   </div>
                </div>
              </div>

              <div className="mt-8 text-center h-12">
                {scanStatus === 'idle' && isScanning && (
                  <p className="text-gray-500 font-medium">Point scanner at product barcode</p>
                )}
                {scanStatus === 'idle' && !isScanning && (
                  <p className="text-gray-500 font-medium">Scanner disabled. Use manual entry.</p>
                )}
                {scanStatus === 'loading' && (
                  <p className="text-primary font-medium bg-blue-50 px-4 py-1.5 rounded-full inline-block">Processing barcode...</p>
                )}
                {scanStatus === 'error' && (
                  <p className="text-danger font-bold bg-red-100 px-4 py-1.5 rounded-full inline-block">Product not found in system.</p>
                )}
                {scanStatus === 'success' && (
                  <p className="text-success font-bold bg-green-100 px-4 py-1.5 rounded-full inline-block">Product identified!</p>
                )}
              </div>
            </div>
            
            {/* Manual Entry form */}
            <div className="border-t border-gray-100 bg-white p-6">
              <form onSubmit={handleManualSubmit} className="flex gap-3 max-w-md mx-auto items-end">
                 <Input 
                   type="text"
                   label="Manual Code Entry"
                   placeholder="Enter barcode number..."
                   value={manualCode}
                   onChange={(e) => setManualCode(e.target.value)}
                   wrapperClassName="flex-1"
                   leftIcon={Keyboard}
                   disabled={scanStatus === 'loading'}
                 />
                 <Button type="submit" variant="primary" disabled={!manualCode || scanStatus === 'loading'}>Submit</Button>
              </form>
            </div>
          </div>

          {/* RESULT CARD */}
          {scanResult ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
              <div className="bg-gray-900 px-6 py-4 flex justify-between items-center text-white">
                <div className="flex items-center gap-2">
                  <PackageOpen className="w-5 h-5 text-gray-300" />
                  <h3 className="text-lg font-bold">{scanResult.name}</h3>
                </div>
                <span className="text-sm font-medium px-2.5 py-1 rounded bg-gray-800 text-gray-300 border border-gray-700 capitalize">
                  {scanResult.category?.name || 'Uncategorized'}
                </span>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                   
                   <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                     <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider">Current Stock</p>
                     <p className="text-xl font-bold text-gray-900 mt-1">{scanResult.stockQty} {scanResult.unit}</p>
                     {getStockStatus(scanResult.stockQty, scanResult.reorderThreshold).label === 'Low Stock' && (
                       <p className="text-xs text-warning font-semibold mt-1">Low (Threshold: {scanResult.reorderThreshold})</p>
                     )}
                   </div>

                   <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                     <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider">Expiry Status</p>
                     <p className="text-sm font-bold text-gray-900 mt-2">{scanResult.expiryDate ? getExpiryStatus(scanResult.expiryDate).label : 'N/A'}</p>
                   </div>

                   <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                     <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider">Barcode</p>
                     <p className="text-sm font-mono text-gray-700 mt-2">{scanResult.barcode}</p>
                   </div>

                   <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                     <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider">Price</p>
                     <p className="text-sm font-bold text-gray-900 mt-2">${(scanResult.sellingPrice || 0).toFixed(2)}</p>
                   </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Button 
                    variant="secondary" 
                    leftIcon={actionLoading ? Loader2 : Plus} 
                    disabled={actionLoading}
                    onClick={() => handleStockAction('in')}
                    className="flex-1 text-success border-success/30 hover:bg-green-50"
                  >
                    Quick Add (+1)
                  </Button>
                  <Button 
                    variant="secondary" 
                    leftIcon={actionLoading ? Loader2 : Minus} 
                    disabled={actionLoading || scanResult.stockQty <= 0}
                    onClick={() => handleStockAction('out')}
                    className="flex-1 text-danger border-danger/30 hover:bg-red-50"
                  >
                    Quick Sale (-1)
                  </Button>
                  <Button 
                    variant="primary" 
                    leftIcon={Info} 
                    onClick={() => navigate(`/products/${scanResult._id}`)}
                  >
                    Full Details
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50/50 rounded-xl border border-gray-100 border-dashed p-10 text-center flex flex-col items-center justify-center min-h-[220px]">
              <ScanBarcode className="w-12 h-12 text-gray-300 mb-3" />
              <h3 className="text-gray-500 font-medium">Waiting for scan</h3>
              <p className="text-sm text-gray-400 mt-1">Product details and quick actions will appear here.</p>
            </div>
          )}

        </div>

        {/* RIGHT COLUMN: RECENT SCANS */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 h-full max-h-[600px] flex flex-col overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex items-center gap-2 text-gray-900 bg-gray-50/50">
            <History className="w-5 h-5 text-gray-500" />
            <h3 className="font-semibold">Recent Scans</h3>
          </div>
          
          <div className="flex-1 overflow-y-auto p-2">
            {recentScans.length > 0 ? (
              <ul className="space-y-1">
                {recentScans.map((item, idx) => (
                  <li 
                    key={`${item._id}-${idx}`}
                    className="p-3 rounded-lg hover:bg-gray-50 cursor-pointer border border-transparent hover:border-gray-100 transition-colors flex items-start justify-between group"
                    onClick={() => setScanResult(item)}
                  >
                    <div>
                      <p className="text-sm font-semibold text-gray-900 group-hover:text-primary transition-colors">{item.name}</p>
                      <p className="text-[11px] text-gray-500 mt-0.5">{item.stockQty} in stock • {item.barcode}</p>
                    </div>
                    <span className="text-[10px] text-gray-400">
                      {item.scannedAt.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 grayscale opacity-50 mt-10">
                <History className="w-10 h-10 text-gray-300 mb-2" />
                <p className="text-sm text-gray-500">No recent scans</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

// SVG Icon Helper
const BarcodeIcon = ({ isScanning, status }) => {
  let color = isScanning ? "text-primary" : "text-gray-300";
  if (status === 'error') color = "text-danger/50";
  if (status === 'success') color = "text-success/50";

  return (
    <svg className={`w-16 h-16 ${color} transition-colors duration-300`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 5v14M6 5v14M10 5v14M13 5v14M18 5v14M21 5v14" strokeWidth="2" strokeDasharray={isScanning ? "0" : "2 2"} />
    </svg>
  );
};

export default BarcodeScanner;
