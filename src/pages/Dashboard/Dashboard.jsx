import React, { useEffect, useState } from 'react';
import { Package, AlertTriangle, Clock, Tags, ArrowRight } from 'lucide-react';
import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { Link } from 'react-router-dom';
import DashboardCard from '../../components/cards/DashboardCard';
import AlertCard from '../../components/cards/AlertCard';
import DataTable from '../../components/table/DataTable';
import { formatDate } from '../../utils/formatDate';
import { reportService } from '../../services/reportService';
import { inventoryService } from '../../services/inventoryService';
import { restockService } from '../../services/restockService';
import { useFetch } from '../../hooks/useFetch';
import { getErrorMessage } from '../../utils/errorHandler';

const Dashboard = () => {
  const { data: summaryData, loading: summaryLoading, error: summaryError } = useFetch(reportService.getStockSummary);
  const { data: movementData, loading: movementLoading } = useFetch(reportService.getMovementReport);
  const { data: logsData, loading: logsLoading } = useFetch(inventoryService.getLogs, { limit: 10 });
  const { data: alertsData, loading: alertsLoading } = useFetch(restockService.getAlerts);

  if (summaryLoading || movementLoading || logsLoading || alertsLoading) {
    return <div className="flex h-64 items-center justify-center">Loading dashboard...</div>;
  }

  if (summaryError) {
    return <div className="bg-red-50 text-red-600 p-4 rounded-md">Error loading dashboard: {getErrorMessage(summaryError)}</div>;
  }

  // KPIs
  const kpis = [
    { title: "Total Products", value: summaryData?.data?.totalProducts || 0, icon: Package, variant: "primary" },
    { title: "Low Stock Items", value: summaryData?.data?.lowStockCount || 0, icon: AlertTriangle, variant: "warning" },
    { title: "Out of Stock", value: summaryData?.data?.outOfStockCount || 0, icon: Clock, variant: "danger" },
    { title: "Total Categories", value: summaryData?.data?.totalCategories || 0, icon: Tags, variant: "success" }
  ];

  // Stock by category chart data mapping (we use Top 10 by value for this chart)
  const stockByCategory = (summaryData?.data?.top10ByValue || []).map(p => ({
    name: p.name.length > 15 ? p.name.substring(0, 15) + '...' : p.name,
    stock: p.stockQty
  }));

  // Movement chart data
  const inventoryMovement = Object.values((movementData?.data?.dailyMovement || []).reduce((acc, m) => {
    const day = m._id.date.substring(5); // MM-DD
    if (!acc[day]) acc[day] = { day, in: 0, out: 0 };
    if (m._id.action === 'stock_in') acc[day].in += m.total;
    if (m._id.action === 'stock_out') acc[day].out += m.total;
    return acc;
  }, {})).sort((a, b) => a.day.localeCompare(b.day));

  // Map alerts
  const recentAlerts = [
    ...(alertsData?.data?.critical || []).map(p => ({
      id: p._id,
      title: p.name,
      message: 'Out of Stock or Critical',
      stock: p.stockQty,
      threshold: p.reorderThreshold,
      variant: 'danger'
    })),
    ...(alertsData?.data?.lowStock || []).map(p => ({
      id: p._id,
      title: p.name,
      message: 'Low Stock',
      stock: p.stockQty,
      threshold: p.reorderThreshold,
      variant: 'warning'
    }))
  ].slice(0, 10);

  const recentLogs = (logsData?.data || []).slice(0, 10).map(log => ({
    id: log._id,
    product: log.product?.name || 'Unknown',
    action: log.action,
    qty: log.quantityChanged,
    date: log.createdAt
  }));

  const logColumns = [
    { header: 'ID', accessorKey: 'id', cell: ({ row }) => <span className="text-xs text-gray-500">{row.id.substring(0, 8)}</span> },
    { header: 'Product', accessorKey: 'product' },
    { 
      header: 'Action', 
      accessorKey: 'action',
      cell: ({ row }) => {
        const actionMap = {
          'Stock In': 'bg-green-100 text-green-800',
          'Stock Out': 'bg-blue-100 text-blue-800',
          'Wastage': 'bg-red-100 text-red-800',
          'Adjustment': 'bg-gray-100 text-gray-800'
        };
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${actionMap[row.action] || 'bg-gray-100'}`}>
            {row.action}
          </span>
        );
      }
    },
    { 
      header: 'Qty', 
      accessorKey: 'qty',
      cell: ({ row }) => (
        <span className={row.qty > 0 ? 'text-success font-medium' : 'text-danger font-medium'}>
          {row.qty > 0 ? `+${row.qty}` : row.qty}
        </span>
      )
    },
    { 
      header: 'Time', 
      accessorKey: 'date',
      cell: ({ row }) => formatDate(row.date, 'MMM dd, HH:mm')
    }
  ];

  return (
    <div className="space-y-6">
      
      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {kpis.map((kpi, index) => (
          <DashboardCard key={index} {...kpi} />
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Bar Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Top Products by Stock</h3>
          </div>
          <div className="h-72">
            {stockByCategory.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stockByCategory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                  <Tooltip cursor={{ fill: '#f9fafb' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Bar dataKey="stock" fill="#1A56DB" radius={[4, 4, 0, 0]} maxBarSize={50} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
               <div className="flex bg-gray-50 items-center justify-center h-full rounded-md text-gray-400">No data available</div>
            )}
          </div>
        </div>

        {/* Line Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Inventory Movement (30 Days)</h3>
          </div>
          <div className="h-72">
            {inventoryMovement.length > 0 ? (
               <ResponsiveContainer width="100%" height="100%">
                <LineChart data={inventoryMovement} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} minTickGap={30} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                  <Line type="monotone" dataKey="in" name="Stock In" stroke="#057A55" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="out" name="Stock Out" stroke="#E02424" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
               <div className="flex bg-gray-50 items-center justify-center h-full rounded-md text-gray-400">No data available</div>
            )}
           
          </div>
        </div>

      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent Logs Table */}
        <div className="lg:col-span-2 flex flex-col h-full space-y-4">
          <div className="flex justify-between items-end">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Recent Inventory Logs</h3>
              <p className="text-sm text-gray-500">Last 10 transactions across all stores.</p>
            </div>
            <Link to="/logs" className="text-sm font-medium text-primary hover:text-blue-700 flex items-center gap-1 group">
              View All Logs
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          
          <div className="flex-1">
             {recentLogs.length > 0 ? <DataTable columns={logColumns} data={recentLogs} /> : <div className="p-4 bg-gray-50 text-center rounded-md text-gray-500">No recent logs found</div>}
          </div>
        </div>

        {/* Action Required Feed */}
        <div className="flex flex-col space-y-4">
          <div className="flex justify-between items-end">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Action Required</h3>
              <p className="text-sm text-gray-500">Low stock and expiring items.</p>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-2 flex-1 flex flex-col gap-2 overflow-y-auto max-h-[460px]">
            {recentAlerts.length > 0 ? recentAlerts.map(alert => (
              <AlertCard 
                key={alert.id}
                title={alert.title}
                message={alert.message}
                stock={alert.stock}
                threshold={alert.threshold}
                variant={alert.variant}
                actionLabel="Reorder"
                onActionClick={() => { /* Implement reorder logic here */ }}
              />
            )) : <div className="p-4 text-center text-gray-500">No alerts</div>}
          </div>
        </div>

      </div>
      
    </div>
  );
};

export default Dashboard;
