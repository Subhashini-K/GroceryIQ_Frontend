import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Barcode, Image as ImageIcon, Check } from 'lucide-react';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { productService } from '../../services/productService';
import { categoryService } from '../../services/categoryService';
import { supplierService } from '../../services/supplierService';
import { useFetch } from '../../hooks/useFetch';
import { getErrorMessage } from '../../utils/errorHandler';

const ProductForm = ({ mode = 'add' }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '', barcode: '', category: '', supplier: '', unit: '',
    costPrice: '', sellingPrice: '', stockQty: '', reorderThreshold: '',
    expiryDate: '', description: ''
  });
  const [imageFile, setImageFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Fetch categories and suppliers for dropdowns
  const { data: catResp } = useFetch(categoryService.getAll);
  const { data: supResp } = useFetch(supplierService.getAll);
  const categories = catResp?.data || catResp || [];
  const suppliers = supResp?.data || supResp || [];

  // Fetch product if in edit mode
  useEffect(() => {
    if (mode === 'edit' && id) {
      productService.getById(id).then(res => {
        const prod = res.data?.data || res.product || res;
        setFormData({
          name: prod.name || '',
          barcode: prod.barcode || '',
          category: prod.category?._id || prod.category || '',
          supplier: prod.supplier?._id || prod.supplier || '',
          unit: prod.unit || '',
          costPrice: prod.costPrice || '',
          sellingPrice: prod.sellingPrice || '',
          stockQty: prod.stockQty || '',
          reorderThreshold: prod.reorderThreshold || '',
          expiryDate: prod.expiryDate ? prod.expiryDate.split('T')[0] : '',
          description: prod.description || ''
        });
      }).catch(err => {
        alert(getErrorMessage(err));
        navigate('/products');
      });
    }
  }, [mode, id, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = 'Product name is required';
    if (!formData.barcode) newErrors.barcode = 'Barcode is required';
    if (!formData.category) newErrors.category = 'Category is required';
    if (Number(formData.sellingPrice) <= 0) newErrors.sellingPrice = 'Selling price must be greater than 0';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    
    setSubmitting(true);
    try {
      // Build FormData for multipart request
      const data = new FormData();
      Object.keys(formData).forEach(key => {
        if (formData[key] !== '' && formData[key] !== null && formData[key] !== undefined) {
           data.append(key, formData[key]);
        }
      });
      if (imageFile) {
        data.append('image', imageFile);
      }

      if (mode === 'edit') {
        await productService.update(id, data);
      } else {
        await productService.create(data);
      }
      navigate('/products');
    } catch (err) {
      alert(getErrorMessage(err));
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
            {mode === 'edit' ? 'Edit Product' : 'Add New Product'}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {mode === 'edit' ? 'Update existing product details and pricing.' : 'Add a new product to your inventory catalog.'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Basic Information */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-100">Basic Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input 
              label="Product Name *" 
              name="name"
              value={formData.name}
              onChange={handleChange}
              error={errors.name}
              placeholder="e.g. Organic Whole Milk"
            />
            
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <Input 
                  label="Barcode (SKU/UPC) *" 
                  name="barcode"
                  value={formData.barcode}
                  onChange={handleChange}
                  error={errors.barcode}
                  placeholder="Scan or type barcode"
                />
              </div>
              <Button type="button" variant="secondary" className="mb-[2px] px-3">
                <Barcode className="w-5 h-5" />
              </Button>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="block text-sm font-medium text-gray-700">Category *</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className={`block w-full rounded-md border-0 py-2 pl-3 pr-10 text-gray-900 ring-1 ring-inset focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6 ${errors.category ? 'ring-danger focus:ring-danger' : 'ring-gray-300 focus:ring-primary bg-white'}`}
              >
                <option value="">Select Category...</option>
                {categories.map(cat => (
                  <option key={cat._id} value={cat._id}>{cat.name}</option>
                ))}
              </select>
              {errors.category && <p className="mt-1 text-sm text-danger">{errors.category}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="block text-sm font-medium text-gray-700">Supplier</label>
              <select
                name="supplier"
                value={formData.supplier}
                onChange={handleChange}
                className="block w-full rounded-md border-0 py-2 pl-3 pr-10 text-gray-900 ring-1 ring-inset focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6 ring-gray-300 focus:ring-primary bg-white"
              >
                <option value="">Select Supplier...</option>
                {suppliers.map(sup => (
                   <option key={sup._id} value={sup._id}>{sup.name}</option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2 flex flex-col gap-1.5">
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                name="description"
                rows={3}
                value={formData.description}
                onChange={handleChange}
                className="block w-full rounded-md border-0 py-2 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6 px-3"
                placeholder="Brief product description..."
              />
            </div>
            
          </div>
        </div>

        {/* Pricing & Stock */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-100">Pricing & Inventory</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Input 
              label="Unit (e.g. Kg, Box)" 
              name="unit"
              value={formData.unit}
              onChange={handleChange}
            />
            
            <Input 
              label="Cost Price ($)" 
              type="number"
              step="0.01"
              name="costPrice"
              value={formData.costPrice}
              onChange={handleChange}
            />
            
            <Input 
              label="Selling Price ($) *" 
              type="number"
              step="0.01"
              name="sellingPrice"
              value={formData.sellingPrice}
              onChange={handleChange}
              error={errors.sellingPrice}
            />

            <Input 
              label="Initial Stock Qty" 
              type="number"
              name="stockQty"
              value={formData.stockQty}
              onChange={handleChange}
              disabled={mode === 'edit'}
              helperText={mode === 'edit' ? "Use the 'Adjust Stock' feature to change qty." : ""}
            />

            <Input 
              label="Low Stock Threshold" 
              type="number"
              name="reorderThreshold"
              value={formData.reorderThreshold}
              onChange={handleChange}
            />
            
            <Input 
              label="Expiry Date" 
              type="date"
              name="expiryDate"
              value={formData.expiryDate}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Media Upload */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-100">Product Image</h3>
          
          <div className="mt-2 flex justify-center rounded-lg border border-dashed border-gray-300 px-6 py-10">
            <div className="text-center">
              {imageFile ? (
                 <p className="text-sm font-medium text-success mb-2">Selected: {imageFile.name}</p>
              ) : (
                 <ImageIcon className="mx-auto h-12 w-12 text-gray-300" aria-hidden="true" />
              )}
              
              <div className="mt-4 flex text-sm leading-6 text-gray-600 justify-center">
                <label
                  htmlFor="file-upload"
                  className="relative cursor-pointer rounded-md bg-white font-semibold text-primary focus-within:outline-none focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 hover:text-blue-700"
                >
                  <span>Upload a file</span>
                  <input id="file-upload" name="image" type="file" className="sr-only" accept="image/*" onChange={handleImageChange} />
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs leading-5 text-gray-500">PNG, JPG, GIF up to 2MB</p>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end gap-3 pt-4">
          <Button variant="ghost" onClick={() => navigate('/products')} disabled={submitting}>Cancel</Button>
          <Button type="submit" variant="primary" leftIcon={Check} disabled={submitting}>
             {submitting ? 'Saving...' : 'Save Product'}
          </Button>
        </div>

      </form>
    </div>
  );
};

export default ProductForm;
