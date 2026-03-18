import React, { useState, useMemo } from 'react';
import { Download, Loader2, AlertCircle } from 'lucide-react';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import Button from '../../components/common/Button';
import { reportService } from '../../services/reportService';
import { useFetch } from '../../hooks/useFetch';
import { getErrorMessage } from '../../utils/errorHandler';

const COLORS = ['#1A56DB', '#057A55', '#C27803', '#E02424', '#7E3AF2', '#D61F69'];

const Reports = () => {
  const [activeTab, setActiveTab] = useState('summary');
  const [filters, setFilters] = useState({});

  const fetchFn = useMemo(() => {
    switch (activeTab) {
      case 'summary': return reportService.getStockSummary;
      case 'movement': return reportService.getMovementReport;
      case 'expiry': return reportService.getExpiryReport;
      case 'supplier': return reportService.getSupplierReport;
      default: return reportService.getStockSummary;
    }
  }, [activeTab]);

  const { data: resp, loading, error } = useFetch(fetchFn, filters);
  const data = resp?.data || {};

  const exportReport = (format) => {
    window.print(); // Simple fallback for PDF
  };

  // --- Data Transformation Helpers ---

  const statusPieData = useMemo(() => {
    if (activeTab === 'summary' && data.productsByStatus) {
      return data.productsByStatus.map(item => ({
        name: item._id.charAt(0).toUpperCase() + item._id.slice(1),
        value: item.count
      }));
    }
    return [];
  }, [activeTab, data]);

  const movementChartData = useMemo(() => {
    if (activeTab === 'movement' && data.dailyMovement) {
      const grouped = data.dailyMovement.reduce((acc, curr) => {
        const date = curr._id.date;
        if (!acc[date]) acc[date] = { day: date, in: 0, out: 0, adjustment: 0, wastage: 0 };
        
        const action = curr._id.action;
        if (action === 'stock_in') acc[date].in += curr.total;
        else if (action === 'stock_out') acc[date].out += curr.total;
        else if (action === 'adjustment') acc[date].adjustment += curr.total;
        else if (action === 'wastage') acc[date].wastage += curr.total;
        
        return acc;
      }, {});
      return Object.values(grouped).sort((a,b) => new Date(a.day) - new Date(b.day));
    }
    return [];
  }, [activeTab, data]);

  const expiryChartData = useMemo(() => {
    if (activeTab === 'expiry' && data.counts) {
      return [
        { name: 'Expired', count: data.counts.expired },
        { name: 'In 3 Days', count: data.counts.expiringIn3Days },
        { name: 'In 7 Days', count: data.counts.expiringIn7Days },
        { name: 'In 30 Days', count: data.counts.expiringIn30Days },
      ];
    }
    return [];
  }, [activeTab, data]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Analytics & Reports</h2>
          <p className="text-sm text-gray-500 mt-1">Comprehensive views of your inventory health, movement, and supplier metrics.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" leftIcon={Download} onClick={() => exportReport('CSV')}>Export CSV</Button>
          <Button variant="primary" leftIcon={Download} onClick={() => exportReport('PDF')}>Export PDF</Button>
        </div>
      </div>

      {/* TABS */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8 overflow-x-auto scrollbar-hide">
          {[
            { id: 'summary', label: 'Stock Summary' },
            { id: 'movement', label: 'Movement Report' },
            { id: 'expiry', label: 'Expiry Analysis' },
            { id: 'supplier', label: 'Supplier Performance' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                  setActiveTab(tab.id);
                  setFilters({}); // Reset filters on tab change
              }}
              className={`
                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors
                ${activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Loading & Error States */}
      {loading && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-20 flex flex-col items-center justify-center">
            <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
            <p className="text-gray-500 font-medium">Generating Analytics...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 rounded-xl border border-red-100 p-10 flex flex-col items-center justify-center text-red-600">
            <AlertCircle className="w-10 h-10 mb-4" />
            <p className="font-bold">Error Loading Report</p>
            <p className="text-sm mt-1">{getErrorMessage(error)}</p>
        </div>
      )}

      {/* CONTENT */}
      {!loading && !error && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 min-h-[500px]">
            
            {activeTab === 'summary' && (
            <div className="space-y-8 animate-in fade-in duration-300">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-4 text-center md:text-left">Product Status Distribution</h3>
                        <div className="h-64 w-full flex justify-center">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={statusPieData} innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                                        {statusPieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                    <Legend verticalAlign="bottom" height={36}/>
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Total Products</p>
                            <p className="text-3xl font-black text-gray-900 mt-1">{data.totalProducts}</p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Total Categories</p>
                            <p className="text-3xl font-black text-gray-900 mt-1">{data.totalCategories}</p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Stock Valuation</p>
                            <p className="text-3xl font-black text-primary mt-1">${(data.totalStockValue || 0).toLocaleString()}</p>
                        </div>
                        <div className="bg-red-50 p-4 rounded-xl border border-red-100">
                            <p className="text-xs text-red-400 font-bold uppercase tracking-wider">Alerts (Low/Out)</p>
                            <p className="text-3xl font-black text-red-600 mt-1">{(data.lowStockCount || 0) + (data.outOfStockCount || 0)}</p>
                        </div>
                    </div>
                </div>
                
                <div className="border-t border-gray-100 pt-6">
                    <h4 className="text-base font-bold text-gray-900 mb-4">Top 10 Products by Stock Value</h4>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-600">
                            <thead className="bg-gray-50 text-gray-900 border-b border-gray-200">
                                <tr>
                                    <th className="p-3">Product</th>
                                    <th className="p-3 text-right">Qty</th>
                                    <th className="p-3 text-right">Stock Value</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.top10ByValue?.map((item, i) => (
                                <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/50">
                                    <td className="p-3">
                                        <div className="flex flex-col">
                                            <span className="font-medium text-gray-900">{item.name}</span>
                                            <span className="text-[10px] text-gray-400">{item.category?.name}</span>
                                        </div>
                                    </td>
                                    <td className="p-3 text-right">{item.stockQty}</td>
                                    <td className="p-3 text-right font-bold text-gray-900">${(item.stockValue || 0).toLocaleString()}</td>
                                </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            )}

            {activeTab === 'movement' && (
            <div className="space-y-8 animate-in fade-in duration-300">
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-bold text-gray-900">Weekly Flow Analysis (Last 30 Days)</h3>
                </div>
                <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={movementChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                        <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#6b7280' }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#6b7280' }} />
                        <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                        <Legend />
                        <Line type="monotone" dataKey="in" name="Stock In" stroke="#057A55" strokeWidth={3} dot={{r: 4}} />
                        <Line type="monotone" dataKey="out" name="Stock Out" stroke="#1A56DB" strokeWidth={3} dot={{r: 4}} />
                        <Line type="monotone" dataKey="wastage" name="Wastage" stroke="#E02424" strokeWidth={2} strokeDasharray="5 5" />
                    </LineChart>
                    </ResponsiveContainer>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
                    <div className="border border-gray-100 rounded-xl p-4 bg-gray-50/30">
                        <h4 className="text-sm font-bold text-gray-900 mb-3 border-b border-gray-100 pb-2">Top 5 Highly Moved Products</h4>
                        <div className="space-y-2">
                            {data.topProducts?.map((item, idx) => (
                                <div key={idx} className="flex justify-between items-center bg-white p-2 rounded border border-gray-100">
                                    <span className="text-xs font-medium text-gray-700">{item.product?.name}</span>
                                    <span className="text-xs font-bold text-primary">{item.totalMoved} units</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            )}

            {activeTab === 'expiry' && (
            <div className="space-y-8 animate-in fade-in duration-300">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Expiry Risk Profile</h3>
                        <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={expiryChartData} margin={{ top: 20, right: 20, bottom: 0, left: -20 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6"/>
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }}/>
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }}/>
                                <Tooltip cursor={{ fill: '#f9fafb' }} contentStyle={{ borderRadius: '8px', border: 'none' }} />
                                <Bar dataKey="count" fill="#E02424" radius={[4, 4, 0, 0]} maxBarSize={60}>
                                {
                                    expiryChartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={
                                        entry.name === 'Expired' ? '#991B1B' : 
                                        entry.name.includes('3') ? '#E02424' : 
                                        entry.name.includes('7') ? '#C27803' : '#057A55'
                                    } />
                                    ))
                                }
                                </Bar>
                            </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                    <div className="bg-amber-50 p-8 rounded-2xl border border-amber-100 flex flex-col items-center">
                        <AlertCircle className="w-12 h-12 text-warning mb-4" />
                        <h4 className="text-xl font-black text-gray-900 uppercase">Risk Valuation</h4>
                        <p className="text-4xl font-black text-warning mt-2">${(data.totalValueAtRisk || 0).toLocaleString()}</p>
                        <p className="text-xs text-gray-500 mt-4 text-center">Total market value of products expiring within the next 30 days that are currently in stock.</p>
                    </div>
                </div>

                <div className="border-t border-gray-100 pt-6">
                    <h4 className="text-base font-bold text-gray-900 mb-4">Critical Expiry List (Next 30 Days)</h4>
                    <table className="w-full text-sm text-left text-gray-600">
                        <thead className="bg-gray-50 text-gray-900 border-b border-gray-200 uppercase text-[10px] tracking-widest">
                            <tr><th className="p-3">Product</th><th className="p-3">Stock</th><th className="p-3">Expiry</th><th className="p-3 text-right">Value Risk</th></tr>
                        </thead>
                        <tbody>
                            {data.expiringProducts?.slice(0, 10).map((item, i) => (
                            <tr key={i} className="border-b border-gray-50">
                                <td className="p-3 font-medium text-gray-900">{item.name}</td>
                                <td className="p-3">{item.stockQty} {item.unit}</td>
                                <td className="p-3 text-red-600 font-bold">{item.daysUntilExpiry < 0 ? 'EXPIRED' : `${item.daysUntilExpiry} days left`}</td>
                                <td className="p-3 text-right font-medium">${(item.valueAtRisk || 0).toFixed(2)}</td>
                            </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            )}

            {activeTab === 'supplier' && (
            <div className="space-y-8 animate-in fade-in duration-300">
                <div className="flex justify-between items-center bg-blue-50/50 p-4 border border-blue-100 rounded-xl">
                    <h3 className="text-sm font-bold text-blue-800 uppercase tracking-widest">Network Overview</h3>
                    <div className="flex gap-10">
                        <div className="text-center">
                            <p className="text-[10px] text-blue-500 font-bold uppercase">Avg Lead Time</p>
                            <p className="text-2xl font-black text-blue-900">{(data.averageLeadTimeDays || 0).toFixed(1)} <span className="text-xs font-normal">Days</span></p>
                        </div>
                        <div className="text-center">
                            <p className="text-[10px] text-blue-500 font-bold uppercase">Total Suppliers</p>
                            <p className="text-2xl font-black text-blue-900">{data.suppliers?.length || 0}</p>
                        </div>
                    </div>
                </div>

                <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                    <table className="w-full text-sm text-left text-gray-600">
                    <thead className="bg-gray-50 text-gray-900 border-b border-gray-200 uppercase text-[10px] tracking-widest">
                        <tr><th className="p-4">Supplier</th><th className="p-4">Products</th><th className="p-4">Pending POs</th><th className="p-4">Lead Time</th><th className="p-4 text-center">Rating</th></tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {data.suppliers?.map((item, i) => (
                        <tr key={i} className="bg-white hover:bg-gray-50/50 transition-colors">
                            <td className="p-4">
                                <span className="font-bold text-gray-900">{item.name}</span>
                                <p className="text-[10px] text-gray-400 mt-0.5">{item.email || item.phone}</p>
                            </td>
                            <td className="p-4 text-gray-600 font-medium">{item.productCount} active SKU</td>
                            <td className="p-4">
                                <span className={`px-2 py-0.5 rounded text-xs font-bold ${item.pendingOrderCount > 0 ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-400'}`}>
                                    {item.pendingOrderCount} pending
                                </span>
                            </td>
                            <td className="p-4 font-mono">{item.leadTimeDays}d</td>
                            <td className="p-4">
                                <div className="flex items-center justify-center gap-1">
                                    <span className="font-black text-gray-900">{item.rating?.toFixed(1) || '0.0'}</span>
                                    <div className="flex">
                                        {[...Array(5)].map((_, i) => (
                                            <div key={i} className={`w-1.5 h-1.5 rounded-full mx-0.5 ${i < Math.floor(item.rating || 0) ? 'bg-yellow-400' : 'bg-gray-200'}`}></div>
                                        ))}
                                    </div>
                                </div>
                            </td>
                        </tr>
                        ))}
                    </tbody>
                    </table>
                </div>
            </div>
            )}

        </div>
      )}
    </div>
  );
};

export default Reports;
