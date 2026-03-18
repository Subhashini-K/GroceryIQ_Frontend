import React, { useState, useMemo } from 'react';
import { ChevronDown, ChevronUp, Download, ChevronsUpDown, PackageOpen } from 'lucide-react';
import Button from '../common/Button';
import clsx from 'clsx';

const getRowId = (row) => row._id || row.id;

const DataTable = ({ columns, data, loading = false, onRowClick }) => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
  const [selectedRows, setSelectedRows] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Sort data
  const sortedData = useMemo(() => {
    if (!sortConfig.key) return data;
    
    return [...data].sort((a, b) => {
      let aVal = a[sortConfig.key];
      let bVal = b[sortConfig.key];
      
      // Attempt string casting for comparators if not strictly numbers
      if (typeof aVal === 'string') aVal = aVal.toLowerCase();
      if (typeof bVal === 'string') bVal = bVal.toLowerCase();
      
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data, sortConfig]);

  // Paginate
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = sortedData.slice(indexOfFirstRow, indexOfLastRow);
  const totalPages = Math.ceil(sortedData.length / rowsPerPage);

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    } else if (sortConfig.key === key && sortConfig.direction === 'desc') {
      direction = null;
      key = null;
    }
    setSortConfig({ key, direction });
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedRows(currentRows.map(row => getRowId(row)));
    } else {
      setSelectedRows([]);
    }
  };

  const handleSelectRow = (e, id) => {
    e.stopPropagation();
    if (selectedRows.includes(id)) {
      setSelectedRows(selectedRows.filter(rowId => rowId !== id));
    } else {
      setSelectedRows([...selectedRows, id]);
    }
  };

  const exportCSV = () => {
    if (!data.length) return;
    const csvExportIds = selectedRows.length > 0 ? selectedRows : data.map(d => getRowId(d));
    const exportData = data.filter(d => csvExportIds.includes(getRowId(d)));

    // Simple flat CSV generator
    const headers = columns.map(c => c.header).join(',');
    const rows = exportData.map(row => 
      columns.map(c => {
         const cell = c.accessorKey ? row[c.accessorKey] : '';
         return `"${String(cell).replace(/"/g, '""')}"`;
      }).join(',')
    );
    const csvString = [headers, ...rows].join('\n');
    
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'export.csv';
    link.click();
  };

  if (loading) {
     return <div className="p-12 text-center text-gray-500">Loading table data...</div>;
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col w-full overflow-hidden">
      {/* Table Toolbar */}
      <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-white">
        <div className="text-sm text-gray-600 font-medium">
          {selectedRows.length > 0 ? `${selectedRows.length} rows selected` : `Showing ${sortedData.length} entries`}
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={exportCSV} leftIcon={Download}>
            Export CSV
          </Button>
          <select 
            value={rowsPerPage} 
            onChange={(e) => {setRowsPerPage(Number(e.target.value)); setCurrentPage(1);}}
            className="text-sm border-gray-300 rounded-md focus:ring-primary focus:border-primary px-3 py-1.5 border outline-none"
          >
            <option value={10}>10 rows</option>
            <option value={25}>25 rows</option>
            <option value={50}>50 rows</option>
          </select>
        </div>
      </div>

      {/* Table Content Wrapper */}
      <div className="overflow-x-auto w-full">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-gray-50 uppercase text-gray-600 text-xs font-semibold sticky top-0 z-10 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 w-4 px-6 border-b border-gray-200">
                <input 
                  type="checkbox" 
                  className="rounded border-gray-300 text-primary focus:ring-primary cursor-pointer w-4 h-4"
                  checked={currentRows.length > 0 && selectedRows.length === currentRows.length}
                  onChange={handleSelectAll}
                />
              </th>
              {columns.map((col, i) => (
                <th 
                  key={i} 
                  className={clsx("px-4 py-3 border-b border-gray-200", col.sortable && "cursor-pointer select-none hover:bg-gray-100")}
                  onClick={() => col.sortable && handleSort(col.accessorKey)}
                >
                  <div className="flex items-center gap-1.5 whitespace-nowrap">
                    {col.header}
                    {col.sortable && (
                      <span className="text-gray-400">
                        {sortConfig.key === col.accessorKey ? (
                          sortConfig.direction === 'asc' ? <ChevronUp className="w-4 h-4 text-gray-800" /> : <ChevronDown className="w-4 h-4 text-gray-800" />
                        ) : (
                          <ChevronsUpDown className="w-4 h-4 opacity-50" />
                        )}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {currentRows.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 1} className="py-16 text-center">
                  <div className="flex flex-col items-center justify-center text-gray-400">
                    <PackageOpen className="w-12 h-12 mb-3 text-gray-300" />
                    <p className="text-base font-medium text-gray-900 mb-1">No data found</p>
                    <p className="text-sm">We couldn't find anything to show here.</p>
                  </div>
                </td>
              </tr>
            ) : (
              currentRows.map((row) => (
                <tr 
                  key={getRowId(row)} 
                  className={clsx(
                    "hover:bg-blue-50/50 transition-colors border-b border-gray-50 last:border-0",
                    onRowClick && "cursor-pointer"
                  )}
                  onClick={() => onRowClick && onRowClick(row)}
                >
                  <td className="px-4 py-3 w-4 px-6" onClick={(e) => e.stopPropagation()}>
                    <input 
                      type="checkbox" 
                      className="rounded border-gray-300 text-primary focus:ring-primary cursor-pointer w-4 h-4"
                      checked={selectedRows.includes(getRowId(row))}
                      onChange={(e) => handleSelectRow(e, getRowId(row))}
                    />
                  </td>
                  {columns.map((col, i) => (
                    <td key={i} className="px-4 py-3 text-gray-700">
                      {col.cell ? col.cell({ row }) : row[col.accessorKey]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {sortedData.length > 0 && (
        <div className="p-4 border-t border-gray-200 bg-white flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Showing <span className="font-medium text-gray-900">{indexOfFirstRow + 1}</span> to <span className="font-medium text-gray-900">{Math.min(indexOfLastRow, sortedData.length)}</span> of <span className="font-medium text-gray-900">{sortedData.length}</span> results
          </div>
          <div className="flex gap-1 bg-gray-50 p-1 rounded-lg border border-gray-200">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => p - 1)}
              className="px-3 py-1 text-sm rounded-md font-medium text-gray-600 hover:bg-white hover:shadow-sm disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:shadow-none transition-all"
            >
              Previous
            </button>
            <div className="px-3 py-1 text-sm font-semibold text-primary bg-white shadow-sm rounded-md border border-gray-200">
              {currentPage}
            </div>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(p => p + 1)}
              className="px-3 py-1 text-sm rounded-md font-medium text-gray-600 hover:bg-white hover:shadow-sm disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:shadow-none transition-all"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;
