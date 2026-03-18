import React, { useState } from 'react';
import { ShoppingCart, CheckCircle2, TrendingDown, Loader2 } from 'lucide-react';
import Button from '../../components/common/Button';
import { restockService } from '../../services/restockService';
import { useFetch } from '../../hooks/useFetch';
import { getErrorMessage } from '../../utils/errorHandler';

const Restocking = () => {
  const [selectedItems, setSelectedItems] = useState([]);
  const [processing, setProcessing] = useState(false);

  const { data: resp, loading, error, refetch } = useFetch(restockService.getAlerts);
  const alerts = resp?.data || { critical: [], low: [] };

  const toggleSelect = (id) => {
    setSelectedItems(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handlePurchase = async (itemsToOrder) => {
    if (!itemsToOrder || itemsToOrder.length === 0) return;
    
    setProcessing(true);
    try {
      // Group items by supplier for POs
      // The backend createPurchaseOrder takes one supplierId at a time.
      // So if multiple items from different suppliers are selected, we should ideally loop or prompt.
      // For this simplified logic, we group by supplier and send multiple requests.
      
      const itemsBySupplier = itemsToOrder.reduce((acc, item) => {
        const supplierId = item.supplier?._id;
        if (!supplierId) return acc;
        if (!acc[supplierId]) acc[supplierId] = [];
        acc[supplierId].push({
          productId: item._id,
          quantity: (item.reorderThreshold || 20) * 2, // Simple logic: order double the threshold
          unitPrice: item.costPrice || 0
        });
        return acc;
      }, {});

      const supplierIds = Object.keys(itemsBySupplier);
      
      for (const sId of supplierIds) {
        await restockService.createPO({
          supplierId: sId,
          items: itemsBySupplier[sId],
          notes: `Auto-generated restock order for ${itemsBySupplier[sId].length} items.`
        });
      }

      alert(`Successfully created ${supplierIds.length} purchase order(s).`);
      setSelectedItems([]);
      refetch();
    } catch (err) {
      alert(getErrorMessage(err));
    } finally {
      setProcessing(false);
    }
  };

  const renderProductCard = (item) => {
    const isCritical = item.stockQty === 0;
    const threshold = item.reorderThreshold || 20;
    const progressPercent = Math.min(100, (item.stockQty / threshold) * 100);
    const isSelected = selectedItems.find(i => i._id === item._id);

    return (
      <div 
        key={item._id} 
        className={`bg-white rounded-xl shadow-sm border p-4 transition-all cursor-pointer ${isSelected ? 'border-primary ring-1 ring-primary' : 'border-gray-200 hover:border-blue-300'}`}
        onClick={() => {
            if (isSelected) {
                setSelectedItems(prev => prev.filter(i => i._id !== item._id));
            } else {
                setSelectedItems(prev => [...prev, item]);
            }
        }}
      >
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-start gap-3">
            <input 
              type="checkbox" 
              checked={!!isSelected}
              readOnly
              className="mt-1 w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary focus:ring-2 cursor-pointer"
            />
            <div>
              <h4 className="font-bold text-gray-900 leading-tight">{item.name}</h4>
              <p className="text-xs text-gray-500 mt-1">{item.supplier?.name || 'No Supplier'} • {item.category?.name || 'No Category'}</p>
            </div>
          </div>
          <span className={`px-2 py-1 rounded-md text-[10px] uppercase font-bold tracking-widest ${isCritical ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'}`}>
            {isCritical ? 'Out of Stock' : 'Low Stock'}
          </span>
        </div>

        <div className="mt-4">
          <div className="flex justify-between items-end mb-1">
            <div className="text-sm font-medium text-gray-700">
              <span className={isCritical ? 'text-danger font-bold' : ''}>{item.stockQty}</span>
              <span className="text-gray-400 mx-1">/</span>
              <span>{threshold} threshold</span>
            </div>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2 flex overflow-hidden">
            <div 
              className={`h-2 rounded-full ${isCritical ? 'bg-danger' : 'bg-warning'}`} 
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-4">
          <Button 
            variant="secondary" 
            size="sm" 
            className="w-full"
            disabled={processing}
            onClick={(e) => { e.stopPropagation(); handlePurchase([item]); }}
            leftIcon={processing ? Loader2 : ShoppingCart}
          >
            {processing ? 'Creating...' : 'Create PO'}
          </Button>
        </div>
      </div>
    );
  };

  const isAllDone = alerts.critical.length === 0 && alerts.low.length === 0;

  if (loading && !resp) {
      return <div className="p-20 text-center text-gray-500">Scanning inventory for restock alerts...</div>;
  }

  return (
    <div className="space-y-8 pb-10">
      
      {/* Header Area */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <TrendingDown className="w-6 h-6 text-primary" />
            Restocking Action Center
          </h2>
          <p className="text-sm text-gray-500 mt-1">Generate purchase orders for items below their threshold levels.</p>
        </div>
        
        {selectedItems.length > 0 && (
          <div className="flex items-center gap-3 bg-blue-50 border border-blue-100 p-2 pl-4 rounded-lg w-full sm:w-auto animate-in fade-in zoom-in duration-200">
            <span className="text-sm font-semibold text-primary">{selectedItems.length} items selected</span>
            <Button 
              variant="primary" 
              disabled={processing}
              onClick={() => handlePurchase(selectedItems)}
            >
              {processing ? 'Processing...' : 'Reorder Selected'}
            </Button>
          </div>
        )}
      </div>

      {error && <div className="p-4 bg-red-50 text-red-500 rounded-lg border border-red-100">{getErrorMessage(error)}</div>}

      {isAllDone ? (
        <div className="bg-white rounded-xl border border-gray-200 border-dashed p-12 text-center flex flex-col items-center shadow-sm">
          <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-4">
            <CheckCircle2 className="w-8 h-8 text-success" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">All Caught Up!</h3>
          <p className="text-gray-500 max-w-md mx-auto">There are currently no items below their stock threshold. Your inventory is looking healthy.</p>
        </div>
      ) : (
        <>
          {/* CRITICAL SECTION */}
          {alerts.critical.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-red-200 pb-2">
                <div className="w-2 h-2 rounded-full bg-danger animate-pulse"></div>
                <h3 className="text-lg font-bold text-gray-900">Critical: Out of Stock</h3>
                <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs font-bold">{alerts.critical.length}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {alerts.critical.map(renderProductCard)}
              </div>
            </div>
          )}

          {/* LOW STOCK SECTION */}
          {alerts.low.length > 0 && (
            <div className="space-y-4 mt-8">
              <div className="flex items-center gap-2 border-b border-warning pb-2">
                <div className="w-2 h-2 rounded-full bg-warning"></div>
                <h3 className="text-lg font-bold text-gray-900">Attention: Low Stock</h3>
                <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs font-bold">{alerts.low.length}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {alerts.low.map(renderProductCard)}
              </div>
            </div>
          )}
        </>
      )}

    </div>
  );
};

export default Restocking;
