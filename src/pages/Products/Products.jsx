import React, { useState, useCallback, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import DataTable from '../../components/table/DataTable';
import TableFilters from '../../components/table/TableFilters';
import Button from '../../components/common/Button';
import { getStockStatus } from '../../utils/calculateStock';
import { formatDate } from '../../utils/formatDate';
import { productService } from '../../services/productService';
import { categoryService } from '../../services/categoryService';
import { useFetch } from '../../hooks/useFetch';
import { getErrorMessage } from '../../utils/errorHandler';

const statusOptions = [
  { label: 'In Stock', value: 'in_stock' },
  { label: 'Low Stock', value: 'low_stock' },
  { label: 'Out of Stock', value: 'out_of_stock' }
];

const Products = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';
  
  // Local state for backend filters mapping
  const [apiParams, setApiParams] = useState({
    page: 1,
    limit: 50,
    search: initialSearch,
    category: '',
    status: '', 
  });

  const { data: responseData, loading, error, refetch } = useFetch(productService.getAll, apiParams);
  const { data: categoriesData } = useFetch(categoryService.getAll);

  const categoryOptions = useMemo(() => 
    (categoriesData?.data || categoriesData || []).map(cat => ({
      label: cat.name,
      value: cat._id
    })),
    [categoriesData]
  );

  const handleFilterChange = useCallback((filters) => {
    setApiParams(prev => {
      // Only update if values actually changed to avoid unnecessary re-fetches
      const newParams = {
        ...prev,
        search: filters.search || '',
        category: filters.category || '',
        stockStatus: filters.status || '',
        page: 1
      };
      
      // Simple equality check
      if (
        prev.search === newParams.search && 
        prev.category === newParams.category && 
        prev.stockStatus === newParams.stockStatus &&
        prev.page === newParams.page
      ) {
        return prev;
      }
      
      return newParams;
    });
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await productService.delete(id);
        refetch();
      } catch (err) {
        alert(getErrorMessage(err));
      }
    }
  };

  const products = responseData?.data || [];

  const columns = [
    { header: 'Barcode', accessorKey: 'barcode', sortable: true },
    { 
      header: 'Name', 
      accessorKey: 'name', 
      sortable: true,
      cell: ({ row }) => <span className="font-semibold text-gray-900">{row.name}</span>
    },
    { header: 'Category', accessorKey: 'category', cell: ({row}) => row.category?.name || 'N/A' },
    { header: 'Supplier', accessorKey: 'supplier', cell: ({row}) => row.supplier?.name || 'N/A' },
    { 
      header: 'Stock', 
      sortable: true,
      accessorKey: 'stockQty',
      cell: ({ row }) => (
        <span>{row.stockQty} <span className="text-gray-400 text-xs ml-1">{row.unit}</span></span>
      )
    },
    { header: 'Threshold', accessorKey: 'reorderThreshold' },
    { 
      header: 'Expiry Date', 
      sortable: true,
      accessorKey: 'expiryDate',
      cell: ({ row }) => formatDate(row.expiryDate)
    },
    { 
      header: 'Status', 
      cell: ({ row }) => {
        const status = getStockStatus(row.stockQty, row.reorderThreshold);
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${status.colorClass}`}>
            {status.label}
          </span>
        );
      }
    },
    { 
      header: 'Actions', 
      cell: ({ row }) => (
        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          <button 
            className="p-1 text-gray-400 hover:text-primary transition-colors rounded"
            onClick={(e) => { e.stopPropagation(); navigate(`/products/${row._id}/edit`); }}
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button 
            className="p-1 text-gray-400 hover:text-danger transition-colors rounded"
            onClick={(e) => { e.stopPropagation(); handleDelete(row._id); }}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      
      {/* Header Area */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Products</h2>
          <p className="text-sm text-gray-500 mt-1">Manage your inventory catalog, barcode mappings, and supply details.</p>
        </div>
        <Button 
          variant="primary" 
          leftIcon={Plus} 
          onClick={() => navigate('/products/new')}
        >
          Add Product
        </Button>
      </div>

      {/* Filters Area */}
      <TableFilters 
        initialSearch={initialSearch}
        categoryOptions={categoryOptions}
        statusOptions={statusOptions}
        onFilterChange={handleFilterChange}
      />

      {error && <div className="text-red-500 bg-red-50 p-3 rounded">{getErrorMessage(error)}</div>}

      {/* Data Table */}
      {loading ? (
        <div className="p-8 text-center text-gray-500">Loading products...</div>
      ) : products.length > 0 ? (
        <DataTable 
          columns={columns} 
          data={products} 
          onRowClick={(row) => navigate(`/products/${row._id}`)}
        />
      ) : (
        <div className="p-8 text-center text-gray-500 bg-white rounded-xl border border-gray-100">No products found</div>
      )}

    </div>
  );
};

export default Products;
