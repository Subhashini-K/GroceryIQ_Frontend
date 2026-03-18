import React, { useState, useEffect } from 'react';
import { Search, FilterX } from 'lucide-react';
import Button from '../common/Button';
import { useDebounce } from '../../hooks/useDebounce';

const TableFilters = ({ onFilterChange, categoryOptions = [], statusOptions = [], initialSearch = '' }) => {
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  // Sync with prop if it changes (e.g. from global Navbar search)
  useEffect(() => {
    setSearchTerm(initialSearch);
  }, [initialSearch]);

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Trigger parent filter update when parameters change
  useEffect(() => {
    onFilterChange({
      search: debouncedSearchTerm,
      category,
      status,
      dateRange
    });
  }, [debouncedSearchTerm, category, status, dateRange, onFilterChange]);

  const clearFilters = () => {
    setSearchTerm('');
    setCategory('');
    setStatus('');
    setDateRange({ start: '', end: '' });
  };

  const hasActiveFilters = searchTerm || category || status || dateRange.start || dateRange.end;

  return (
    <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 items-end md:items-center">
      
      {/* Search Input */}
      <div className="w-full md:w-64 relative">
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">Search</label>
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-shadow bg-gray-50"
          />
        </div>
      </div>

      {/* Category Dropdown */}
      {categoryOptions.length > 0 && (
        <div className="flex-1 min-w-[140px]">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none bg-gray-50"
          >
            <option value="">All Categories</option>
            {categoryOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      )}

      {/* Status Dropdown */}
      {statusOptions.length > 0 && (
        <div className="flex-1 min-w-[140px]">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none bg-gray-50"
          >
             <option value="">All Statuses</option>
             {statusOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      )}

      {/* Date Range Option (Example) */}
      <div className="flex-1 min-w-[200px] flex gap-2">
        <div className="w-1/2">
           <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">From Data</label>
           <input 
             type="date"
             value={dateRange.start}
             onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
             className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none bg-gray-50 text-gray-700"
           />
        </div>
        <div className="w-1/2">
           <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">To Date</label>
           <input 
             type="date"
             value={dateRange.end}
             onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
             className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none bg-gray-50 text-gray-700"
           />
        </div>
      </div>

      {/* Clear Button */}
      <div className="mt-4 md:mt-0">
        <Button 
          variant="ghost" 
          size="md"
          className="text-gray-500 font-medium"
          leftIcon={FilterX} 
          onClick={clearFilters}
          disabled={!hasActiveFilters}
        >
          Clear
        </Button>
      </div>

    </div>
  );
};

export default TableFilters;
