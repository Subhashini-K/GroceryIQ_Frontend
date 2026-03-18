import React, { useState } from 'react';
import DataTable from '../../components/table/DataTable';
import TableFilters from '../../components/table/TableFilters';
import { formatDate } from '../../utils/formatDate';
import { inventoryService } from '../../services/inventoryService';
import { useFetch } from '../../hooks/useFetch';
import { getErrorMessage } from '../../utils/errorHandler';

const InventoryLogs = () => {
  const [filters, setFilters] = useState({ page: 1, limit: 20 });

  const { data: resp, loading, error } = useFetch(inventoryService.getLogs, filters);
  
  const logs = resp?.data || [];
  const pagination = resp?.meta || {};

  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 }));
  };

  const columns = [
    { header: 'Date', accessorKey: 'createdAt', cell: ({row}) => formatDate(row.createdAt, 'MMM dd, yyyy HH:mm'), sortable: true },
    { 
      header: 'Product', 
      accessorKey: 'product', 
      cell: ({row}) => (
        <div className="flex flex-col">
          <span className="font-semibold text-gray-900">{row.product?.name || 'Deleted Product'}</span>
          <span className="text-[10px] text-gray-400 font-mono">{row.product?.barcode || '-'}</span>
        </div>
      ), 
      sortable: true 
    },
    { 
      header: 'Action', 
      accessorKey: 'action',
      cell: ({ row }) => {
        const actionMap = {
          'stock_in': { label: 'Stock In', class: 'bg-green-100 text-green-800' },
          'stock_out': { label: 'Stock Out', class: 'bg-blue-100 text-blue-800' },
          'wastage': { label: 'Wastage', class: 'bg-red-100 text-red-800' },
          'adjustment': { label: 'Adjustment', class: 'bg-gray-100 text-gray-800' }
        };
        const act = actionMap[row.action] || { label: row.action, class: 'bg-gray-100 text-gray-800' };
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${act.class}`}>
            {act.label}
          </span>
        );
      }
    },
    { 
      header: 'Qty Change', 
      accessorKey: 'quantityChanged',
      cell: ({ row }) => (
        <span className={`font-bold ${row.quantityChanged > 0 ? 'text-success' : 'text-danger'}`}>
          {row.quantityChanged > 0 ? `+${row.quantityChanged}` : row.quantityChanged}
        </span>
      )
    },
    { header: 'Before', accessorKey: 'quantityBefore', cell: ({row}) => <span className="text-gray-500">{row.quantityBefore}</span> },
    { header: 'After', accessorKey: 'quantityAfter', cell: ({row}) => <span className="font-medium text-gray-900">{row.quantityAfter}</span> },
    { header: 'Performed By', accessorKey: 'performedBy', cell: ({row}) => row.performedBy?.name || 'System' },
    { header: 'Reason', accessorKey: 'reason', cell: ({row}) => <span className="text-xs text-gray-500 italic max-w-xs truncate block">{row.reason || '-'}</span> },
  ];

  return (
    <div className="space-y-6">
      
      {/* Header Area */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Inventory Logs</h2>
          <p className="text-sm text-gray-500 mt-1">Audit trail of all stock movements, adjustments, and wastage.</p>
        </div>
      </div>

      {/* Filters Area */}
      <TableFilters 
        statusOptions={[
          { label: 'Stock In', value: 'stock_in' },
          { label: 'Stock Out', value: 'stock_out' },
          { label: 'Wastage', value: 'wastage' },
          { label: 'Adjustment', value: 'adjustment' },
        ]}
        onFilterChange={handleFilterChange}
      />

      {error && <div className="p-4 bg-red-50 text-red-500 rounded-lg border border-red-100">{getErrorMessage(error)}</div>}

      {/* Data Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <DataTable 
          columns={columns} 
          data={logs} 
          loading={loading}
        />
        
        {/* Simple Pagination */}
        {pagination.pages > 1 && (
          <div className="px-6 py-4 flex items-center justify-between border-t border-gray-50 bg-gray-50/30">
            <p className="text-sm text-gray-500">
              Showing page <span className="font-medium text-gray-900">{pagination.page}</span> of <span className="font-medium text-gray-900">{pagination.pages}</span>
            </p>
            <div className="flex gap-2">
              <button
                disabled={pagination.page === 1 || loading}
                onClick={() => setFilters(prev => ({ ...prev, page: prev.page - 1 }))}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium disabled:opacity-50 hover:bg-white"
              >
                Previous
              </button>
              <button
                disabled={pagination.page === pagination.pages || loading}
                onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1 }))}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium disabled:opacity-50 hover:bg-white"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};

export default InventoryLogs;
