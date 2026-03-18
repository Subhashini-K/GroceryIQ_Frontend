import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import { useAppContext } from '../context/AppContext';

// Auth Pages
import Login from '../pages/Auth/Login';
import Unauthorized from '../pages/Auth/Unauthorized';

// Real Pages
import Dashboard from '../pages/Dashboard/Dashboard';
import Products from '../pages/Products/Products';
import ProductForm from '../pages/Products/ProductForm';
import ProductDetail from '../pages/Products/ProductDetail';
import Categories from '../pages/Categories/Categories';
import Suppliers from '../pages/Suppliers/Suppliers';
import SupplierDetail from '../pages/Suppliers/SupplierDetail';
import InventoryLogs from '../pages/InventoryLogs/InventoryLogs';
import Restocking from '../pages/Restocking/Restocking';
import BarcodeScanner from '../pages/BarcodeScanner/BarcodeScanner';
import ExpiryTracker from '../pages/ExpiryTracker/ExpiryTracker';
import Reports from '../pages/Reports/Reports';
import Settings from '../pages/Settings/Settings';
import Heatmap from '../pages/Heatmap/Heatmap';

const ProtectedRoute = ({ allowedRoles }) => {
  const { user, loading } = useAppContext();

  if (loading) return <div className="flex h-screen items-center justify-center">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/unauthorized" replace />;

  return <Outlet />;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      <Route path="/" element={<Layout />}>
        <Route element={<ProtectedRoute />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="products" element={<Products />} />
          <Route path="products/:id" element={<ProductDetail />} />
          <Route path="categories" element={<Categories />} />
          <Route path="suppliers" element={<Suppliers />} />
          <Route path="suppliers/:id" element={<SupplierDetail />} />
          <Route path="logs" element={<InventoryLogs />} />
          <Route path="restocking" element={<Restocking />} />
          <Route path="scanner" element={<BarcodeScanner />} />
          <Route path="expiry" element={<ExpiryTracker />} />
          <Route path="reports" element={<Reports />} />
          <Route path="heatmap" element={<Heatmap />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['admin', 'manager']} />}>
          <Route path="products/new" element={<ProductForm mode="add" />} />
          <Route path="products/:id/edit" element={<ProductForm mode="edit" />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
          <Route path="settings" element={<Settings />} />
        </Route>
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
