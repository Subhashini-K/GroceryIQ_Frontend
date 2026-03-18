import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Package, Truck, Ruler, DollarSign, Calendar, SlidersHorizontal, Trash2, Edit } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Button from '../../components/common/Button';
import DataTable from '../../components/table/DataTable';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import { getStockStatus, getExpiryStatus } from '../../utils/calculateStock';
import { formatDate } from '../../utils/formatDate';
import { productService } from '../../services/productService';
import { inventoryService } from '../../services/inventoryService';
import { useFetch } from '../../hooks/useFetch';
import { getErrorMessage } from '../../utils/errorHandler';
import { getImageUrl } from '../../utils/imageHelper';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [adjustData, setAdjustData] = useState({ type: 'add', qty: '', reason: '' });

  // Fetch product data
  const { data: productResp, loading: prodLoading, error: prodError } = useFetch(productService.getById, id);
  // Fetch last 10 logs for this product
  const { data: logsResp, loading: logsLoading, refetch: refetchLogs } = useFetch(inventoryService.getLogs, { product: id, limit: 10 });

  if (prodLoading) return <div className="p-8 text-center text-gray-500">Loading product details...</div>;
  if (prodError) return <div className="p-8 text-center text-red-500 bg-red-50">{getErrorMessage(prodError)}</div>;

  const product = productResp?.data || productResp;
  if (!product) return <div className="p-8 text-center text-gray-500">Product not found.</div>;

  const stockStatus = getStockStatus(product.stockQty, product.reorderThreshold);
  const expiryStatus = getExpiryStatus(product.expiryDate);

  // Use logs for stock history chart
  const logs = logsResp?.data || [];
  
  // Transform logs roughly to history chart (mocking history trend by reverse calculating from current stock)
  // Real history would need a specific endpoint to track stock balance over time.
  let currentStock = product.stockQty;
  const stockHistory = logs.map(log => {
    const point = { date: formatDate(log.createdAt, 'MMM dd'), stock: currentStock };
    currentStock -= log.quantityChanged; // backwards in time
    return point;
  }).reverse();
  
  // Only add current if no logs
  if (stockHistory.length === 0) {
      stockHistory.push({ date: 'Now', stock: product.stockQty });
  }

  // We don't have a batch endpoint in the provided API, displaying a placeholder or logs instead
  const batchColumns = [
    { header: 'Action', accessorKey: 'action' },
    { 
      header: 'Qty Changed', 
      accessorKey: 'qty',
      cell: ({ row }) => (
        <span className={row.qty > 0 ? 'text-success font-medium' : 'text-danger font-medium'}>
          {row.qty > 0 ? `+${row.qty}` : row.qty}
        </span>
      )
    },
    { header: 'Reference', accessorKey: 'reference', cell: ({row}) => row.reference || '-' },
    { header: 'Date', accessorKey: 'date', cell: ({row}) => formatDate(row.date) }
  ];

  const batchData = logs.map(log => ({
    id: log._id,
    action: log.action,
    qty: log.quantityChanged,
    reference: log.reference,
    date: log.createdAt
  }));

  const handleAdjustStock = async () => {
    try {
      const payload = {
        product: product._id,
        quantity: Number(adjustData.qty),
        reason: adjustData.reason
      };
      
      if (adjustData.type === 'add') {
         await inventoryService.addStock(payload);
      } else {
         await inventoryService.removeStock(payload);
      }
      
      setIsAdjustModalOpen(false);
      setAdjustData({ type: 'add', qty: '', reason: '' });
      window.location.reload(); // Reload to get fresh product stock
    } catch (err) {
      alert(getErrorMessage(err));
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await productService.delete(product._id);
        navigate('/products');
      } catch (err) {
        alert(getErrorMessage(err));
      }
    }
  };

  return (
    <div className="space-y-6">
      
      {/* HEADER CARD */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col sm:flex-row gap-6 items-start sm:items-center">
        {/* Product Image */}
        <div className="w-24 h-24 rounded-lg bg-gray-100 flex-shrink-0 border border-gray-200 overflow-hidden flex items-center justify-center">
          {product.imageUrl ? (
            <img src={getImageUrl(product.imageUrl)} alt={product.name} className="w-full h-full object-cover" />
          ) : (
            <Package className="w-10 h-10 text-gray-300" />
          )}
        </div>
        
        {/* Title & Badges */}
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">{product.name}</h2>
            <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-gray-100 text-gray-600 border border-gray-200 uppercase tracking-widest">
              {product.category?.name || 'Uncategorized'}
            </span>
            <span className={`px-2.5 py-1 rounded-md text-xs font-semibold border uppercase tracking-widest ${stockStatus.colorClass}`}>
              {stockStatus.label}
            </span>
          </div>
          <p className="text-gray-500 font-medium">Barcode: <span className="text-gray-900">{product.barcode}</span></p>
          <div className="mt-2 text-sm text-gray-600 max-w-2xl">{product.description || 'No description available.'}</div>
        </div>

        {/* Action Buttons */}
        <div className="flex sm:flex-col gap-2 w-full sm:w-auto">
          <Button variant="secondary" leftIcon={Edit} onClick={() => navigate(`/products/${product._id}/edit`)}>
            Edit
          </Button>
          <Button variant="primary" leftIcon={SlidersHorizontal} onClick={() => setIsAdjustModalOpen(true)}>
            Adjust Stock
          </Button>
          <Button variant="ghost" leftIcon={Trash2} onClick={handleDelete} className="text-danger hover:text-red-700 hover:bg-red-50">
            Delete
          </Button>
        </div>
      </div>

      {/* TWO COLUMN INFO & CHART */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Info Fields */}
        <div className="lg:col-span-1 border border-gray-100 bg-white rounded-xl shadow-sm p-6 space-y-5">
          <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-100 pb-3">Details</h3>
          
          <div className="grid grid-cols-2 gap-y-5">
            <div>
              <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider flex items-center gap-1.5 mb-1"><Package className="w-3.5 h-3.5"/> Stock</p>
              <p className="text-xl font-bold text-gray-900">{product.stockQty} <span className="text-sm text-gray-500 font-medium">{product.unit}</span></p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider flex items-center gap-1.5 mb-1"><Calendar className="w-3.5 h-3.5"/> Expiry Date</p>
              <div className="flex flex-col">
                <p className="font-semibold text-gray-900">{formatDate(product.expiryDate)}</p>
                 {product.expiryDate && (
                   <span className={`text-[10px] font-bold mt-0.5 ${expiryStatus.colorClass} w-max px-1.5 rounded uppercase tracking-wider`}>{expiryStatus.label}</span>
                 )}
              </div>
            </div>
            
            <div>
              <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider flex items-center gap-1.5 mb-1"><Truck className="w-3.5 h-3.5"/> Supplier</p>
              <p className="font-medium text-primary hover:underline cursor-pointer" onClick={() => product.supplier ? navigate(`/suppliers/${product.supplier._id || product.supplier}`) : null}>
                 {product.supplier?.name || 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider flex items-center gap-1.5 mb-1"><Ruler className="w-3.5 h-3.5"/> Threshold</p>
              <p className="font-semibold text-gray-900">{product.reorderThreshold} {product.unit}</p>
            </div>
            
            <div>
              <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider flex items-center gap-1.5 mb-1"><DollarSign className="w-3.5 h-3.5"/> Cost</p>
              <p className="font-semibold text-gray-900">${product.costPrice?.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider flex items-center gap-1.5 mb-1"><DollarSign className="w-3.5 h-3.5"/> Selling</p>
              <p className="font-semibold text-gray-900">${product.sellingPrice?.toFixed(2)}</p>
            </div>
          </div>
        </div>

        {/* Right Stock History Chart */}
        <div className="lg:col-span-2 border border-gray-100 bg-white rounded-xl shadow-sm p-6 flex flex-col">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Stock Movement History</h3>
          <div className="flex-1 min-h-[250px]">
             {stockHistory.length > 1 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={stockHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Line type="monotone" dataKey="stock" stroke="#1A56DB" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
             ) : (
                <div className="flex h-full items-center justify-center text-gray-400 bg-gray-50 rounded-md">Not enough history data</div>
             )}
            
          </div>
        </div>
      </div>

      {/* BATCH TABLE */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-white">
          <h3 className="text-lg font-semibold text-gray-900">Recent Logs</h3>
          <p className="text-sm text-gray-500">Last 10 transactions for this product.</p>
        </div>
        {logsLoading ? (
            <div className="p-4 text-center text-gray-500">Loading logs...</div>
        ) : batchData.length > 0 ? (
            <DataTable columns={batchColumns} data={batchData} />
        ) : (
            <div className="p-4 text-center text-gray-500">No logs found.</div>
        )}
      </div>

      {/* ADJUST STOCK MODAL */}
      <Modal
        isOpen={isAdjustModalOpen}
        onClose={() => setIsAdjustModalOpen(false)}
        title="Adjust Inventory Stock"
        size="sm"
        footer={(
          <>
            <Button variant="ghost" onClick={() => setIsAdjustModalOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleAdjustStock} disabled={!adjustData.qty}>Confirm Adjustment</Button>
          </>
        )}
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-500">Manually correct stock levels for <span className="font-medium text-gray-800">{product.name}</span>. Current stock is <span className="font-bold">{product.stockQty}</span>.</p>
          
          <div className="flex gap-4 mb-2">
            <label className="flex items-center gap-2 text-sm">
              <input type="radio" value="add" checked={adjustData.type === 'add'} onChange={e => setAdjustData({...adjustData, type: e.target.value})} className="text-primary focus:ring-primary h-4 w-4" />
              Add Stock
            </label>
            <label className="flex items-center gap-2 text-sm text-danger">
              <input type="radio" value="remove" checked={adjustData.type === 'remove'} onChange={e => setAdjustData({...adjustData, type: e.target.value})} className="text-danger focus:ring-danger h-4 w-4" />
              Remove / Waste
            </label>
          </div>

          <Input 
            label="Quantity Difference" 
            type="number"
            min="1"
            placeholder={adjustData.type === 'add' ? "+5" : "-5"}
            value={adjustData.qty}
            onChange={(e) => setAdjustData({...adjustData, qty: e.target.value})}
          />
          
          <div className="flex flex-col gap-1.5">
            <label className="block text-sm font-medium text-gray-700">Reason / Reference</label>
            <textarea
              rows={2}
              value={adjustData.reason}
              onChange={(e) => setAdjustData({...adjustData, reason: e.target.value})}
              className="block w-full rounded-md border-0 py-2 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6 px-3"
              placeholder="e.g. Broken in transit, manual count adjustment..."
            />
          </div>
        </div>
      </Modal>

    </div>
  );
};

export default ProductDetail;
