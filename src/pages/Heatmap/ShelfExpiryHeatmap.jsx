import React, { useState } from 'react';
import { Filter, Info, Package, AlertTriangle, Calendar as CalendarIcon } from 'lucide-react';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';

// Generate a grid of 100 mock items to represent a large shelf layout
const MOCK_GRID = Array.from({ length: 60 }).map((_, i) => {
  const rand = Math.random();
  let status = 'safe';
  let days = Math.floor(Math.random() * 30) + 8; // > 7 days

  if (rand < 0.1) {
    status = 'expired';
    days = Math.floor(Math.random() * -5);
  } else if (rand < 0.25) {
    status = 'critical'; // <= 3 days
    days = Math.floor(Math.random() * 3) + 1;
  } else if (rand < 0.4) {
    status = 'warning'; // <= 7 days
    days = Math.floor(Math.random() * 4) + 4;
  }

  return {
    id: i + 1,
    name: `Product ${i + 1}`,
    batch: `B-1${i.toString().padStart(3, '0')}`,
    qty: Math.floor(Math.random() * 50) + 10,
    status,
    daysRemaining: days,
    category: ['Dairy', 'Meat', 'Produce', 'Bakery'][Math.floor(Math.random() * 4)],
    supplier: 'Local Farms'
  };
});

const ShelfExpiryHeatmap = () => {
  const [gridData, setGridData] = useState(MOCK_GRID);
  const [showRiskOnly, setShowRiskOnly] = useState(false);
  const [selectedCell, setSelectedCell] = useState(null);

  const getCellColor = (status) => {
    switch (status) {
      case 'expired': return 'bg-danger-200 border-danger-300 text-danger-900';
      case 'critical': return 'bg-danger-100 border-danger-200 text-danger-800'; // red/pink for <=3 days
      case 'warning': return 'bg-warning-100 border-warning-200 text-warning-800'; // amber for <= 7 days
      case 'clearance': return 'bg-purple-100 border-purple-300 text-purple-900'; // Marked for clearance
      default: return 'bg-success-50 border-success-100 text-success-800'; // Safe
    }
  };

  const handleCellClick = (item) => {
    if (showRiskOnly && item.status === 'safe') return;
    setSelectedCell(item);
  };

  const markForClearance = () => {
    if (selectedCell) {
      setGridData(gridData.map(item => 
        item.id === selectedCell.id ? { ...item, status: 'clearance' } : item
      ));
      setSelectedCell(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-24px font-bold text-gray-900">Shelf Expiry Heatmap</h1>
          <p className="text-gray-500 text-sm mt-1">Visual representation of product expiration dates on shelves.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Legend */}
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-medium">
            <span className="w-3 h-3 rounded-full bg-danger-200"></span> Expired
            <span className="w-3 h-3 rounded-full bg-danger-100 ml-2"></span> ≤3 Days
            <span className="w-3 h-3 rounded-full bg-warning-100 ml-2"></span> ≤7 Days
            <span className="w-3 h-3 rounded-full bg-success-50 ml-2"></span> Safe
            <span className="w-3 h-3 rounded-full bg-purple-100 ml-2"></span> Clearance
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex gap-2">
            <select className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm bg-white">
              <option>All Categories</option>
              <option>Dairy</option>
              <option>Meat</option>
              <option>Produce</option>
            </select>
          </div>
          
          <div className="flex items-center">
            <label className="flex items-center cursor-pointer">
              <div className="relative">
                <input 
                  type="checkbox" 
                  className="sr-only"
                  checked={showRiskOnly}
                  onChange={() => setShowRiskOnly(!showRiskOnly)}
                />
                <div className={`block w-10 h-6 rounded-full transition-colors ${showRiskOnly ? 'bg-primary-600' : 'bg-gray-200'}`}></div>
                <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${showRiskOnly ? 'transform translate-x-4' : ''}`}></div>
              </div>
              <div className="ml-3 text-sm font-medium text-gray-700">
                Show Only At Risk
              </div>
            </label>
          </div>
        </div>

        {/* Heatmap Grid */}
        <div className="grid grid-cols-5 md:grid-cols-10 gap-2 p-4 bg-gray-50 rounded-xl border border-gray-100">
          {gridData.map((item) => {
            const isHidden = showRiskOnly && item.status === 'safe';
            return (
              <div 
                key={item.id}
                onClick={() => handleCellClick(item)}
                className={`
                  aspect-square rounded-md border
                  flex flex-col items-center justify-center p-1 text-center cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-md
                  ${isHidden ? 'opacity-20 cursor-not-allowed bg-gray-100 border-gray-200' : getCellColor(item.status)}
                `}
                title={`${item.name} (${item.daysRemaining} days)`}
              >
                {!isHidden && (
                  <>
                    <span className="text-[10px] sm:text-xs font-bold leading-tight truncate w-full px-1">{item.name}</span>
                    <span className="text-[10px] mt-1 font-medium bg-white/50 px-1.5 rounded">{item.daysRemaining}d</span>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Detail Modal */}
      <Modal 
        isOpen={!!selectedCell}
        onClose={() => setSelectedCell(null)}
        title="Product Expiry Details"
        footer={(
          <div className="flex justify-end gap-3 w-full">
            <Button variant="ghost" onClick={() => setSelectedCell(null)}>Cancel</Button>
            {selectedCell?.status !== 'clearance' && (
              <Button variant="primary" className="bg-purple-600 hover:bg-purple-700" onClick={markForClearance}>
                Mark for Clearance
              </Button>
            )}
          </div>
        )}
      >
        {selectedCell && (
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-900">{selectedCell.name}</h3>
                <span className="inline-block mt-1 bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">{selectedCell.category}</span>
              </div>
              <div className={`px-3 py-1 rounded-full text-sm font-bold border ${getCellColor(selectedCell.status)}`}>
                {selectedCell.daysRemaining} Days
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Package className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Batch / Qty</p>
                  <p className="text-sm font-semibold">{selectedCell.batch} • {selectedCell.qty} units</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <CalendarIcon className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Est. Expiry</p>
                  <p className="text-sm font-semibold">In {selectedCell.daysRemaining} days</p>
                </div>
              </div>
            </div>

            <p className="text-sm text-gray-600 mt-4 flex items-start gap-2">
              <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
              Supplier: {selectedCell.supplier}
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ShelfExpiryHeatmap;
