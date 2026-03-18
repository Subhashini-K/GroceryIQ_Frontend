import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import DataTable from '../../components/table/DataTable';
import TableFilters from '../../components/table/TableFilters';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import { supplierService } from '../../services/supplierService';
import { useFetch } from '../../hooks/useFetch';
import { getErrorMessage } from '../../utils/errorHandler';

const Suppliers = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({ search: '' });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);

  const { data: resp, loading, error, refetch } = useFetch(supplierService.getAll, filters);
  const suppliers = resp?.data || resp || [];

  const columns = [
    { 
      header: 'Supplier Name', 
      accessorKey: 'name', 
      sortable: true,
      cell: ({ row }) => <span className="font-semibold text-gray-900">{row.name}</span>
    },
    { header: 'Contact Person', accessorKey: 'contactPerson' },
    { header: 'Phone', accessorKey: 'phone' },
    { header: 'Email', accessorKey: 'email' },
    { header: 'City', accessorKey: 'address', cell: ({row}) => row.address?.city || '-' },
    { header: 'Lead Time', accessorKey: 'leadTimeDays', sortable: true, cell: ({row}) => `${row.leadTimeDays || 7} days` },
    { 
      header: 'Status', 
      sortable: true,
      accessorKey: 'isActive',
      cell: ({ row }) => {
        const isActive = row.isActive !== false;
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
            {isActive ? 'Active' : 'Inactive'}
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
            onClick={(e) => {
              e.stopPropagation();
              setEditingSupplier({ 
                  _id: row._id,
                  name: row.name, 
                  contactPerson: row.contactPerson, 
                  email: row.email, 
                  phone: row.phone, 
                  city: row.address?.city || '', 
                  leadTimeDays: row.leadTimeDays || 7 
              });
              setIsModalOpen(true);
            }}
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button 
            className="p-1 text-gray-400 hover:text-danger transition-colors rounded"
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(row._id);
            }}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  const handleSave = async () => {
    if (!editingSupplier?.name || !editingSupplier?.contactPerson || !editingSupplier?.email || !editingSupplier?.phone) {
      return alert('Please fill in all required fields (Name, Contact, Email, Phone).');
    }

    try {
      const payload = {
        name: editingSupplier.name,
        contactPerson: editingSupplier.contactPerson,
        email: editingSupplier.email,
        phone: editingSupplier.phone,
        leadTimeDays: Number(editingSupplier.leadTimeDays),
        address: { city: editingSupplier.city }
      };

      if (editingSupplier._id) {
        await supplierService.update(editingSupplier._id, payload);
      } else {
        await supplierService.create(payload);
      }
      setIsModalOpen(false);
      setEditingSupplier(null);
      refetch();
    } catch (err) {
      alert(getErrorMessage(err));
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to deactivate this supplier?')) {
      try {
        await supplierService.delete(id);
        refetch();
      } catch (err) {
        alert(getErrorMessage(err));
      }
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Area */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Suppliers</h2>
          <p className="text-sm text-gray-500 mt-1">Manage supplier contacts, lead times, and active status.</p>
        </div>
        <Button 
          variant="primary" 
          leftIcon={Plus} 
          onClick={() => {
            setEditingSupplier({ name: '', contactPerson: '', email: '', phone: '', city: '', leadTimeDays: 7 });
            setIsModalOpen(true);
          }}
        >
          Add Supplier
        </Button>
      </div>

      {/* Filters Area */}
      <TableFilters 
        onFilterChange={setFilters}
      />

      {error && <div className="text-red-500 bg-red-50 p-3 rounded">{getErrorMessage(error)}</div>}

      {/* Data Table */}
      {loading ? (
        <div className="p-8 text-center text-gray-500">Loading suppliers...</div>
      ) : suppliers.length > 0 ? (
        <DataTable 
          columns={columns} 
          data={suppliers} 
          onRowClick={(row) => navigate(`/suppliers/${row._id}`)}
        />
      ) : (
        <div className="p-8 text-center text-gray-500 bg-white rounded-xl border border-gray-100">No suppliers found</div>
      )}

      {/* Supplier Modal (Add / Edit) */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingSupplier(null);
        }}
        title={editingSupplier?._id ? "Edit Supplier" : "Add Supplier"}
        size="md"
        footer={(
          <>
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleSave}>Save Supplier</Button>
          </>
        )}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-2">
          <Input 
            label="Company Name *" 
            value={editingSupplier?.name || ''}
            onChange={(e) => setEditingSupplier({...editingSupplier, name: e.target.value})}
            className="md:col-span-2"
          />
          <Input 
            label="Contact Person *" 
            value={editingSupplier?.contactPerson || ''}
            onChange={(e) => setEditingSupplier({...editingSupplier, contactPerson: e.target.value})}
          />
          <Input 
            label="Phone Number *" 
            value={editingSupplier?.phone || ''}
            onChange={(e) => setEditingSupplier({...editingSupplier, phone: e.target.value})}
          />
          <Input 
            label="Email Address *" 
            type="email"
            value={editingSupplier?.email || ''}
            onChange={(e) => setEditingSupplier({...editingSupplier, email: e.target.value})}
          />
          <Input 
            label="City / Location" 
            value={editingSupplier?.city || ''}
            onChange={(e) => setEditingSupplier({...editingSupplier, city: e.target.value})}
          />
          <Input 
            label="Average Lead Time (Days)" 
            type="number"
            min="1"
            value={editingSupplier?.leadTimeDays || ''}
            onChange={(e) => setEditingSupplier({...editingSupplier, leadTimeDays: e.target.value})}
          />
        </div>
      </Modal>

    </div>
  );
};

export default Suppliers;
