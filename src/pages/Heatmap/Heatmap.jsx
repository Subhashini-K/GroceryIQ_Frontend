import React, { useState, useEffect } from 'react';
import { Layers, AlertTriangle, Calendar as CalendarIcon, Info, Package, Loader2 } from 'lucide-react';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import { productService } from '../../services/productService';
import { daysUntilExpiry, formatDate } from '../../utils/formatDate';
import { getExpiryStatus } from '../../utils/calculateStock';
import { getErrorMessage } from '../../utils/errorHandler';

const Heatmap = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showRiskOnly, setShowRiskOnly] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    fetchExpiringProducts();
  }, []);

  const fetchExpiringProducts = async () => {
    setLoading(true);
    try {
      // Fetch products expiring in the next 90 days to populate a decent heatmap grid
      const resp = await productService.getExpiring({ days: 90 });
      setProducts(resp?.data?.data || []);
    } catch (err) {
      console.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const getCellColor = (expiryDate) => {
    const days = daysUntilExpiry(expiryDate);
    if (days < 0) return 'bg-red-500 border-red-600 shadow-[0_0_10px_rgba(239,68,68,0.4)] text-white';
    if (days <= 3) return 'bg-rose-400 border-rose-500 text-white';
    if (days <= 7) return 'bg-amber-400 border-amber-500 text-white';
    if (days <= 14) return 'bg-yellow-100 border-yellow-300 text-yellow-900';
    return 'bg-emerald-50 border-emerald-100 text-emerald-800';
  };

  const filteredProducts = showRiskOnly 
    ? products.filter(p => daysUntilExpiry(p.expiryDate) <= 7) 
    : products;

  return (
    <div className="space-y-6">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <Layers className="w-7 h-7 text-primary" />
            Shelf Expiry Heatmap
          </h2>
          <p className="text-sm text-gray-500 mt-1">Grid representation of product expiration across the store.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-3 bg-white px-3 py-1.5 rounded-lg border border-gray-100 text-[10px] font-bold uppercase tracking-wider shadow-sm">
            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 bg-red-500 rounded-sm"></div> Expired</div>
            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 bg-rose-400 rounded-sm"></div> ≤3d</div>
            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 bg-amber-400 rounded-sm"></div> ≤7d</div>
            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 bg-yellow-100 border border-yellow-200 rounded-sm"></div> ≤14d</div>
            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 bg-emerald-50 border border-emerald-100 rounded-sm"></div> Safe</div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Inventory Grid ({filteredProducts.length} Items)</h3>
          
          <div className="flex items-center gap-3">
            <label className="flex items-center cursor-pointer">
              <span className="mr-3 text-xs font-bold text-gray-500 uppercase">Risk Focus</span>
              <div className="relative">
                <input 
                  type="checkbox" 
                  className="sr-only"
                  checked={showRiskOnly}
                  onChange={() => setShowRiskOnly(!showRiskOnly)}
                />
                <div className={`block w-8 h-4.5 rounded-full transition-colors ${showRiskOnly ? 'bg-red-500' : 'bg-gray-200'}`}></div>
                <div className={`absolute left-0.5 top-0.5 bg-white w-3.5 h-3.5 rounded-full transition-transform ${showRiskOnly ? 'transform translate-x-3.5' : ''}`}></div>
              </div>
            </label>
            <Button size="sm" variant="ghost" className="h-8" onClick={fetchExpiringProducts}>
                <Loader2 className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="h-[400px] flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : products.length === 0 ? (
          <div className="h-[400px] flex flex-col items-center justify-center text-gray-400 italic">
            <Package className="w-12 h-12 mb-3 opacity-20" />
            <p>No products found with expiry data in selected period.</p>
          </div>
        ) : (
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2">
            {filteredProducts.map((product) => (
              <div 
                key={product._id}
                onClick={() => setSelectedProduct(product)}
                className={`
                  aspect-square rounded-lg border border-transparent
                  flex flex-col items-center justify-center p-2 text-center cursor-pointer 
                  transition-all duration-300 hover:scale-110 hover:z-10 hover:shadow-xl
                  ${getCellColor(product.expiryDate)}
                `}
              >
                <div className="text-[10px] font-black leading-none break-all line-clamp-2 mb-1 uppercase">
                    {product.name}
                </div>
                <div className="text-[9px] font-bold opacity-80 mt-auto">
                    {daysUntilExpiry(product.expiryDate)}d
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Product Detail Modal */}
      <Modal 
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
        title="Shelf Item Details"
        size="md"
      >
        {selectedProduct && (
          <div className="space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-900">{selectedProduct.name}</h3>
                <div className="flex gap-2 mt-1">
                    <span className="bg-gray-100 text-gray-600 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter">
                        {selectedProduct.category?.name || 'No Category'}
                    </span>
                    <span className="bg-blue-100 text-blue-600 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter">
                        Batch: {selectedProduct.batchNumber || 'N/A'}
                    </span>
                </div>
              </div>
              <div className={`px-4 py-2 rounded-xl text-center shadow-sm border ${getCellColor(selectedProduct.expiryDate)}`}>
                <p className="text-xs font-bold uppercase opacity-80">Remaining</p>
                <p className="text-xl font-black">{daysUntilExpiry(selectedProduct.expiryDate)}d</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Current Stock</p>
                <div className="flex items-center gap-2">
                    <Package className="w-5 h-5 text-primary" />
                    <span className="text-lg font-bold text-gray-900">{selectedProduct.stockQty} {selectedProduct.unit}</span>
                </div>
              </div>
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Expiry Date</p>
                <div className="flex items-center gap-2">
                    <CalendarIcon className="w-5 h-5 text-gray-400" />
                    <span className="text-sm font-bold text-gray-700">{formatDate(selectedProduct.expiryDate)}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-gray-500 bg-blue-50/50 p-3 rounded-xl border border-blue-50">
               <Info className="w-4 h-4 text-blue-400" />
               <p>Supplied by <span className="font-bold text-gray-700">{selectedProduct.supplier?.name || 'Direct Procurement'}</span></p>
            </div>

            <div className="flex gap-3 pt-2">
                <Button 
                    variant="primary" 
                    className="flex-1"
                    onClick={() => {
                        window.location.href = `/products/${selectedProduct._id}`;
                    }}
                >
                    View Product Details
                </Button>
                <Button 
                    variant="secondary" 
                    className="flex-1"
                    onClick={() => setSelectedProduct(null)}
                >
                    Close
                </Button>
            </div>
          </div>
        )}
      </Modal>

    </div>
  );
};

export default Heatmap;
