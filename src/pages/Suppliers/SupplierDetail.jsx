import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Building2, Mail, Phone, MapPin, Clock, Star, ArrowLeft, Package } from 'lucide-react';
import DataTable from '../../components/table/DataTable';
import { getStockStatus } from '../../utils/calculateStock';
import { formatDate } from '../../utils/formatDate';
import { supplierService } from '../../services/supplierService';
import { useFetch } from '../../hooks/useFetch';
import { getErrorMessage } from '../../utils/errorHandler';

const SupplierDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  const { data: resp, loading, error } = useFetch(
    id ? () => supplierService.getById(id) : null
  );

  const data = resp?.data || resp;
  const supplier = data || {};
  const supplierProducts = supplier.products || [];
  const supplierOrders = supplier.purchaseOrders || [];

  // Rating stars generator
  const renderStars = (rating) => {
    const validRating = rating || 3;
    return Array.from({ length: 5 }).map((_, idx) => (
      <Star key={idx} className={`w-4 h-4 ${idx < validRating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
    ));
  };

  const productColumns = [
    { header: 'Barcode', accessorKey: 'barcode' },
    { header: 'Product Name', accessorKey: 'name', cell: ({row}) => <span className="font-medium text-gray-900">{row.name}</span> },
    { 
      header: 'Stock Status', 
      cell: ({ row }) => {
        const { label, colorClass } = getStockStatus(row.stockQty, row.minStock || 20); // Fallback threshold
        return <span className={`px-2 py-1 rounded-full text-xs font-semibold ${colorClass}`}>{label}</span>;
      }
    },
    { header: 'Current Stock', cell: ({row}) => `${row.stockQty || 0} ${row.unit || 'units'}` },
    { header: 'Selling Price', cell: ({row}) => `$${(row.sellingPrice || 0).toFixed(2)}` }
  ];

  const orderColumns = [
    { header: 'Order ID', accessorKey: 'orderNumber', cell: ({row}) => <span className="text-primary font-medium">{row.orderNumber}</span> },
    { header: 'Date', accessorKey: 'createdAt', cell: ({row}) => formatDate(row.createdAt) },
    { header: 'Items', accessorKey: 'items', cell: ({row}) => row.items?.length || 0 },
    { header: 'Total Value', accessorKey: 'totalAmount', cell: ({row}) => <span className="font-medium">${(row.totalAmount || 0).toFixed(2)}</span> },
    { 
      header: 'Status', 
      cell: ({ row }) => {
        let bdgClass = 'bg-gray-100 text-gray-800';
        if (row.status === 'received') bdgClass = 'bg-green-100 text-green-800';
        if (row.status === 'ordered') bdgClass = 'bg-blue-100 text-blue-800';
        if (row.status === 'pending') bdgClass = 'bg-yellow-100 text-yellow-800';
        if (row.status === 'cancelled') bdgClass = 'bg-red-100 text-red-800';
        
        return <span className={`px-2 py-1 rounded-full text-xs font-semibold capitalize ${bdgClass}`}>{row.status || 'Unknown'}</span>;
      }
    }
  ];

  if (loading) {
    return <div className="p-8 text-center text-gray-500 bg-white rounded-xl border border-gray-100 shadow-sm">Loading supplier details...</div>;
  }

  if (error) {
    return <div className="p-8 text-center text-red-500 bg-red-50 rounded-xl border border-red-100 shadow-sm">{getErrorMessage(error)}</div>;
  }

  if (!supplier._id) return null;

  const isActive = supplier.isActive !== false;
  const addressString = [supplier.address?.street, supplier.address?.city, supplier.address?.state, supplier.address?.pincode]
    .filter(Boolean)
    .join(', ');

  return (
    <div className="space-y-6">
      
      {/* Back navigation */}
      <button 
        onClick={() => navigate('/suppliers')}
        className="flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-1" /> Back to Suppliers
      </button>

      {/* HEADER CARD */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col md:flex-row gap-6 relative overflow-hidden">
        {/* Decorative background accent */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/3"></div>
        
        <div className="w-20 h-20 rounded-2xl bg-blue-50 text-primary flex items-center justify-center border border-blue-100 flex-shrink-0 z-10">
          <Building2 className="w-10 h-10" />
        </div>
        
        <div className="flex-1 z-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold text-gray-900 tracking-tight">{supplier.name}</h2>
              <span className={`px-2.5 py-1 rounded-md text-xs font-semibold border uppercase tracking-widest ${isActive ? 'bg-green-100 border-green-200 text-green-800' : 'bg-gray-100 border-gray-200 text-gray-800'}`}>
                {isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            <div className="flex bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200">
               {renderStars(supplier.rating)}
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-y-3 gap-x-6 mt-4 max-w-3xl text-sm text-gray-600">
            <p className="flex items-center gap-2"><Mail className="w-4 h-4 text-gray-400" /> {supplier.email || 'N/A'}</p>
            <p className="flex items-center gap-2"><Phone className="w-4 h-4 text-gray-400" /> {supplier.phone || 'N/A'}</p>
            <p className="flex items-center gap-2"><MapPin className="w-4 h-4 text-gray-400" /> {supplier.address?.city || 'N/A'}</p>
          </div>
        </div>
      </div>

      {/* TABS Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          {['Overview', 'Products', 'Order History'].map((tab) => {
            const tabKey = tab.toLowerCase().split(' ')[0];
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tabKey)}
                className={`
                  whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors
                  ${activeTab === tabKey
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                {tab}
              </button>
            );
          })}
        </nav>
      </div>

      {/* TABS Content */}
      <div className="pt-2">
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-5">
              <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-100 pb-3">Contact Information</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-gray-400 uppercase font-semibold tracking-wider">Primary Contact</p>
                  <p className="text-gray-900 font-medium">{supplier.contactPerson || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase font-semibold tracking-wider">Full Address</p>
                  <p className="text-gray-900">{addressString || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase font-semibold tracking-wider">Notes</p>
                  <p className="text-gray-700">{supplier.notes || 'No notes provided.'}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-5">
              <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-100 pb-3">Business Metrics</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                  <Package className="w-5 h-5 text-primary mb-2" />
                  <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider">Products Supplied</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{supplierProducts.length}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                  <Clock className="w-5 h-5 text-warning mb-2" />
                  <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider">Avg Lead Time</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{supplier.leadTimeDays || 7} days</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PRODUCTS TAB */}
        {activeTab === 'products' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-base font-semibold text-gray-900">Linked Products</h3>
            </div>
            {supplierProducts.length > 0 ? (
              <DataTable columns={productColumns} data={supplierProducts} onRowClick={(row) => navigate(`/products/${row._id}`)} />
            ) : (
              <div className="p-8 text-center text-gray-500">No active products linked to this supplier.</div>
            )}
          </div>
        )}

        {/* ORDER HISTORY TAB */}
        {activeTab === 'order' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-base font-semibold text-gray-900">Recent Purchase Orders</h3>
            </div>
            {supplierOrders.length > 0 ? (
              <DataTable columns={orderColumns} data={supplierOrders} />
            ) : (
              <div className="p-8 text-center text-gray-500">No recent orders found.</div>
            )}
          </div>
        )}
      </div>

    </div>
  );
};

export default SupplierDetail;
