import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Tags,
  Truck,
  ClipboardList,
  RefreshCw,
  ScanBarcode,
  Clock,
  PieChart,
  Settings as SettingsIcon,
  Grid,
  ShoppingCart,
  X
} from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import clsx from 'clsx';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/products', label: 'Products', icon: Package },
  { path: '/categories', label: 'Categories', icon: Tags },
  { path: '/suppliers', label: 'Suppliers', icon: Truck },
  { path: '/logs', label: 'Inventory Logs', icon: ClipboardList },
  { path: '/restocking', label: 'Restocking', icon: RefreshCw },
  { path: '/scanner', label: 'Barcode Scanner', icon: ScanBarcode },
  { path: '/expiry', label: 'Expiry Tracker', icon: Clock },
  { path: '/heatmap', label: 'Shelf Expiry Heatmap', icon: Grid },
  { path: '/reports', label: 'Reports', icon: PieChart },
];

const Sidebar = () => {
  const { sidebarOpen, toggleSidebar, user } = useAppContext();

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-20 bg-gray-900/50 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={clsx(
          "fixed inset-y-0 left-0 z-30 flex w-64 flex-col bg-gray-900 text-gray-300 transition-transform duration-300 ease-in-out lg:static lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo Area */}
        <div className="flex h-16 items-center justify-between px-6 bg-gray-900 border-b border-gray-800">
          <Link to="/" className="flex items-center gap-2 text-white">
            <ShoppingCart className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold tracking-tight">GroceryIQ</span>
          </Link>
          <button onClick={toggleSidebar} className="lg:hidden text-gray-400 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto py-4 scrollbar-hide">
          <nav className="space-y-1 px-3">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => clsx(
                  "group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-gray-800 text-white border-l-4 border-primary pl-2 shadow-sm"
                    : "text-gray-300 hover:bg-gray-800 hover:text-white border-l-4 border-transparent pl-2"
                )}
              >
                <item.icon className={clsx(
                  "mr-3 h-5 w-5 flex-shrink-0 transition-colors",
                  "group-hover:text-white"
                )} />
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 p-4 space-y-4">
          <NavLink
            to="/settings"
            className={({ isActive }) => clsx(
              "group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
              isActive
                ? "bg-gray-800 text-white border-l-4 border-primary pl-2"
                : "text-gray-300 hover:bg-gray-800 hover:text-white border-l-4 border-transparent pl-2"
            )}
          >
            <SettingsIcon className="mr-3 h-5 w-5 text-gray-400 group-hover:text-white" />
            Settings
          </NavLink>
          
          {/* User Mini Card */}
          <div className="flex items-center gap-3 rounded-lg bg-gray-800 p-3">
            {user?.avatar ? (
              <img 
                src={user.avatar} 
                alt={user?.name || 'User'}
                className="h-10 w-10 rounded-full bg-gray-700 object-cover border border-gray-600"
              />
            ) : (
              <div className="h-10 w-10 rounded-full bg-primary flex-shrink-0 flex items-center justify-center text-white font-bold text-sm border border-primary/20">
                {user?.name?.charAt(0).toUpperCase() || 'G'}
              </div>
            )}
            <div className="flex flex-col min-w-0">
              <span className="truncate text-sm font-medium text-white">{user?.name || 'Guest'}</span>
              <span className="truncate text-xs text-gray-400 font-medium capitalize">{user?.role || 'User'}</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
