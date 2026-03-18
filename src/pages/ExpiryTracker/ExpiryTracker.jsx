import React, { useState } from 'react';
import { AlertTriangle, ShieldCheck, Clock, Trash, Loader2 } from 'lucide-react';
import DataTable from '../../components/table/DataTable';
import TableFilters from '../../components/table/TableFilters';
import Button from '../../components/common/Button';
import { getExpiryStatus } from '../../utils/calculateStock';
import { formatDate, daysUntilExpiry } from '../../utils/formatDate';
import { productService } from '../../services/productService';
import { inventoryService } from '../../services/inventoryService';
import { useFetch } from '../../hooks/useFetch';
import { getErrorMessage } from '../../utils/errorHandler';

const ExpiryTracker = () => {
  const [filters, setFilters] = useState({ days: 30 }); // Default check for next 30 days
  const { data: resp, loading, error, refetch } = useFetch(productService.getExpiring, filters);
  const [actionLoading, setActionLoading] = useState(false);

  const productData = resp?.data || [];

  // Statistics calculated from full fetched list
  const stats = productData.reduce((acc, item) => {
    const days = daysUntilExpiry(item.expiryDate);
    if (days < 0) acc.expired++;
    else if (days <= 7) acc.soon++;
    else acc.safe++;
    return acc;
  }, { expired: 0, soon: 0, safe: 0 });

  // Frontend-side additional filtering for search/status if the API doesn't handle them fully
  const filteredData = productData.filter(item => {
    let matchesSearch = true;
    let matchesStatus = true;

    if (filters.search) {
      const q = filters.search.toLowerCase();
      matchesSearch = (item.name || '').toLowerCase().includes(q) || (item.batchNumber || '').toLowerCase().includes(q);
    }

    if (filters.status) {
      const days = daysUntilExpiry(item.expiryDate);
      if (filters.status === 'expired') matchesStatus = days < 0;
      if (filters.status === 'expiring_soon') matchesStatus = days >= 0 && days <= 7;
      if (filters.status === 'safe') matchesStatus = days > 7;
    }

    return matchesSearch && matchesStatus;
  });

  const handleDispose = async (product) => {
    if (!window.confirm(`Are you sure you want to dispose of all ${product.stockQty} ${product.unit} of ${product.name}? This will record a wastage log.`)) return;
    
    setActionLoading(true);
    try {
      await inventoryService.wastage({
        productId: product._id,
        quantity: product.stockQty,
        reason: 'Expired product disposal (Tracker)'
      });
      alert('Product stock successfully marked as wastage.');
      refetch();
    } catch (err) {
      alert(getErrorMessage(err));
    } finally {
      setActionLoading(false);
    }
  };

  const columns = [
    { 
      header: 'Product', 
      accessorKey: 'name', 
      cell: ({row}) => (
        <div className="flex flex-col">
          <span className="font-semibold text-gray-900">{row.name}</span>
          <span className="text-[10px] text-gray-400 font-mono">Barcode: {row.barcode}</span>
        </div>
      ) 
    },
    { header: 'Category', accessorKey: 'category.name' },
    { header: 'Batch No', accessorKey: 'batchNumber', cell: ({row}) => <span className="text-gray-500 font-mono text-xs">{row.batchNumber || 'N/A'}</span> },
    { header: 'Stock Qty', cell: ({row}) => `${row.stockQty} ${row.unit}` },
    { header: 'Expiry Date', accessorKey: 'expiryDate', cell: ({row}) => formatDate(row.expiryDate) },
    { 
      header: 'Time Left', 
      sortable: true,
      accessorKey: 'expiryDate',
      cell: ({ row }) => {
        const days = daysUntilExpiry(row.expiryDate);
        if (days < 0) return <span className="text-danger font-bold flex items-center gap-1"><AlertTriangle className="w-3 h-3"/> Expired by {Math.abs(days)}d</span>;
        if (days === 0) return <span className="text-danger font-bold flex items-center gap-1"><Clock className="w-3 h-3"/> Today</span>;
        if (days <= 7) return <span className="text-warning font-bold">{days} days</span>;
        return <span className="text-success font-medium">{days} days</span>;
      }
    },
    { 
      header: 'Status', 
      cell: ({ row }) => {
        const status = getExpiryStatus(row.expiryDate);
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${status.colorClass}`}>
            {status.label}
          </span>
        );
      }
    },
    { 
      header: 'Action', 
      cell: ({ row }) => {
        const days = daysUntilExpiry(row.expiryDate);
        if (days <= 0) {
          return (
            <Button 
                size="sm" 
                variant="danger" 
                leftIcon={actionLoading ? Loader2 : Trash} 
                disabled={actionLoading || row.stockQty <= 0}
                onClick={() => handleDispose(row)}
            >
              Dispose
            </Button>
          );
        }
        if (days <= 7) {
           return (
            <Button size="sm" variant="secondary" onClick={() => window.alert('Please go to Product Edit to apply a discount.')}>
              Discount
            </Button>
          );
        }
        return <span className="text-gray-400 text-sm italic">No action</span>;
      }
    }
  ];

  return (
    <div className="space-y-6">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Expiry Tracker</h2>
          <p className="text-sm text-gray-500 mt-1">Monitor product lifespans to minimize wastage and ensure quality.</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-red-100 shadow-sm flex items-center gap-4 border-l-4 border-l-danger">
          <div className="p-3 bg-red-50 rounded-lg text-danger"><AlertTriangle className="w-6 h-6" /></div>
          <div>
            <p className="text-sm text-gray-500 font-medium tracking-wide uppercase">Already Expired</p>
            <p className="text-2xl font-bold text-gray-900 leading-none mt-1">{stats.expired}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-amber-100 shadow-sm flex items-center gap-4 border-l-4 border-l-warning">
          <div className="p-3 bg-amber-50 rounded-lg text-warning"><Clock className="w-6 h-6" /></div>
          <div>
            <p className="text-sm text-gray-500 font-medium tracking-wide uppercase">Expiring in ≤ 7 Days</p>
            <p className="text-2xl font-bold text-gray-900 leading-none mt-1">{stats.soon}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-green-100 shadow-sm flex items-center gap-4 border-l-4 border-l-success">
          <div className="p-3 bg-green-50 rounded-lg text-success"><ShieldCheck className="w-6 h-6" /></div>
          <div>
            <p className="text-sm text-gray-500 font-medium tracking-wide uppercase">Safe Stock</p>
            <p className="text-2xl font-bold text-gray-900 leading-none mt-1">{stats.safe}</p>
          </div>
        </div>
      </div>

      <TableFilters 
        statusOptions={[
          { label: 'Already Expired', value: 'expired' },
          { label: 'Expiring Soon (≤ 7 days)', value: 'expiring_soon' },
          { label: 'Safe (> 7 days)', value: 'safe' }
        ]}
        onFilterChange={(f) => setFilters(prev => ({ ...prev, ...f }))}
      />

      {error && <div className="p-4 bg-red-50 text-red-500 rounded-lg border border-red-100">{getErrorMessage(error)}</div>}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <DataTable 
          columns={columns} 
          data={filteredData} 
          loading={loading}
        />
      </div>

    </div>
  );
};

export default ExpiryTracker;
