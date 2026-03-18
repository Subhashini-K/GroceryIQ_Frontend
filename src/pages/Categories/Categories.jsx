import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Search, Package, Tags } from 'lucide-react';
import * as Icons from 'lucide-react';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import { categoryService } from '../../services/categoryService';
import { useFetch } from '../../hooks/useFetch';
import { getErrorMessage } from '../../utils/errorHandler';

const Categories = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCat, setEditingCat] = useState(null);
  
  const { data: catResp, loading, error, refetch } = useFetch(categoryService.getAll);
  const categoriesDb = catResp?.data || catResp || [];

  const filteredCategories = categoriesDb.filter(c => 
    c.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenModal = (cat = null) => {
    setEditingCat(cat ? { ...cat } : { name: '', description: '', color: '#6366f1', icon: 'Package' });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditingCat(null);
    setIsModalOpen(false);
  };

  const handleSave = async () => {
    if (!editingCat?.name) return alert('Name is required');
    try {
      if (editingCat._id) {
         await categoryService.update(editingCat._id, {
           name: editingCat.name,
           description: editingCat.description,
           color: editingCat.color,
           icon: editingCat.icon
         });
      } else {
         await categoryService.create({
           name: editingCat.name,
           description: editingCat.description,
           color: editingCat.color,
           icon: editingCat.icon
         });
      }
      handleCloseModal();
      refetch();
    } catch (err) {
      alert(getErrorMessage(err));
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this category? Cannot delete if it has active products.')) {
      try {
        await categoryService.delete(id);
        refetch();
      } catch (err) {
        alert(getErrorMessage(err));
      }
    }
  };

  return (
    <div className="space-y-6">
      
      {/* HEADER & SEARCH */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Categories</h2>
          <p className="text-sm text-gray-500 mt-1">Organize products and view product counts.</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-shadow bg-white"
            />
          </div>
          <Button variant="primary" leftIcon={Plus} onClick={() => handleOpenModal()}>
            Add Category
          </Button>
        </div>
      </div>

      {error && <div className="text-red-500 bg-red-50 p-3 rounded">{getErrorMessage(error)}</div>}
      {loading && <div className="text-gray-500 p-8 text-center bg-white rounded-xl border border-gray-100 shadow-sm">Loading categories...</div>}

      {/* GRID LAYOUT */}
      {!loading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredCategories.map(cat => {
            const IconComponent = Icons[cat.icon] || Package;
            const hexColor = cat.color || '#6366f1';

            return (
              <div key={cat._id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 relative group hover:shadow-md transition-all hover:border-gray-200">
                
                {/* Top Icons */}
                <div className="flex justify-between items-start mb-4">
                  <div 
                    className="p-3 rounded-lg bg-gray-50"
                    style={{ color: hexColor }}
                  >
                    <IconComponent className="w-6 h-6" />
                  </div>
                  
                  {/* Hover Actions */}
                  <div className="flex opacity-0 group-hover:opacity-100 transition-opacity gap-1">
                    <button onClick={() => handleOpenModal(cat)} className="p-1.5 text-gray-400 hover:text-primary hover:bg-blue-50 rounded-md transition-colors">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(cat._id)} className="p-1.5 text-gray-400 hover:text-danger hover:bg-red-50 rounded-md transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Name & Desc */}
                <h3 className="text-lg font-bold text-gray-900 mb-1">{cat.name}</h3>
                <p className="text-xs text-gray-500 line-clamp-2 h-8 leading-snug">{cat.description || 'No description provided.'}</p>

                {/* Stats Bar */}
                <div className="mt-4 pt-4 border-t border-gray-50 flex justify-between items-center">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-widest">Products Linked</span>
                    <span className="font-bold text-gray-900">{cat.productCount || 0}</span>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Categories Empty State */}
      {!loading && filteredCategories.length === 0 && !error && (
        <div className="py-20 text-center flex flex-col items-center justify-center bg-white rounded-xl border border-gray-100 shadow-sm">
          <Tags className="w-12 h-12 text-gray-300 mb-3" />
          <p className="text-gray-900 font-medium">No categories found.</p>
          <p className="text-gray-500 text-sm">Try adjusting your search criteria or add a new category.</p>
        </div>
      )}

      {/* CREATE / EDIT MODAL */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingCat?._id ? "Edit Category" : "Add Category"}
        size="sm"
        footer={(
          <>
            <Button variant="ghost" onClick={handleCloseModal}>Cancel</Button>
            <Button variant="primary" onClick={handleSave}>Save Category</Button>
          </>
        )}
      >
        <div className="space-y-4 pt-2">
          <Input 
            label="Category Name *" 
            placeholder="e.g. Frozen Foods"
            value={editingCat?.name || ''}
            onChange={(e) => setEditingCat({...editingCat, name: e.target.value})}
          />
          <div className="flex flex-col gap-1.5">
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              rows={3}
              value={editingCat?.description || ''}
              onChange={(e) => setEditingCat({...editingCat, description: e.target.value})}
              className="block w-full rounded-md border-0 py-2 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6 px-3"
              placeholder="Brief description of category contents..."
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
             <Input 
               label="Color Hex" 
               type="color"
               value={editingCat?.color || '#6366f1'}
               onChange={(e) => setEditingCat({...editingCat, color: e.target.value})}
               className="h-10 cursor-pointer p-1"
             />
             <Input 
               label="Lucide Icon Name" 
               placeholder="Package"
               value={editingCat?.icon || ''}
               onChange={(e) => setEditingCat({...editingCat, icon: e.target.value})}
               helperText="e.g. Milk, Beef, Carrot"
             />
          </div>
        </div>
      </Modal>

    </div>
  );
};

export default Categories;
