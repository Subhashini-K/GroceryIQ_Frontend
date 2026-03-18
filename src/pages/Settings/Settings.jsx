import React, { useState, useEffect } from 'react';
import { Save, Bell, Shield, Store, LayoutGrid, Loader2 } from 'lucide-react';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { settingsService } from '../../services/settingsService';
import { authService } from '../../services/authService';
import { getErrorMessage } from '../../utils/errorHandler';
import { useAppContext } from '../../context/AppContext';

const Settings = () => {
  const { user, setUser } = useAppContext();
  const [activeTab, setActiveTab] = useState('store');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  
  const [storeData, setStoreData] = useState({
    storeName: '',
    currency: 'USD',
    lowStockThresholdPercent: 20,
    expiryAlertDays: 7,
    emailNotifications: false,
    autoReorderEnabled: false
  });

  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const resp = await settingsService.get();
      const settings = resp?.data || resp;
      if (settings) {
        setStoreData({
          storeName: settings.storeName || '',
          currency: settings.currency || 'USD',
          lowStockThresholdPercent: settings.lowStockThresholdPercent || 20,
          expiryAlertDays: settings.expiryAlertDays || 7,
          emailNotifications: settings.emailNotifications || false,
          autoReorderEnabled: settings.autoReorderEnabled || false
        });
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSettings = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await settingsService.update(storeData);
      alert('Settings updated successfully!');
    } catch (err) {
      alert(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const resp = await authService.updateProfile({ name: profileData.name });
      const updatedUser = resp?.data || resp;
      setUser(prev => ({ ...prev, ...updatedUser }));
      alert('Profile updated successfully!');
    } catch (err) {
      alert(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("New passwords don't match");
      return;
    }
    setSaving(true);
    try {
      await authService.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      alert('Password changed successfully!');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      alert(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'store', label: 'Store Profile', icon: Store },
    { id: 'preferences', label: 'Preferences', icon: LayoutGrid },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
  ];

  if (loading) return <div className="p-20 text-center text-gray-500">Loading system settings...</div>;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      
      <div>
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">System Settings</h2>
        <p className="text-sm text-gray-500 mt-1">Manage your store profile, preferences, and system notifications.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Sidebar Nav */}
        <div className="w-full md:w-64 flex-shrink-0">
          <nav className="flex md:flex-col gap-1 overflow-x-auto md:overflow-visible pb-2 md:pb-0">
            {tabs.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors whitespace-nowrap
                    ${isActive ? 'bg-blue-50 text-primary' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}
                  `}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-primary' : 'text-gray-400'}`} />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 min-h-[400px]">
          
          {/* Store Profile Tab */}
          {activeTab === 'store' && (
            <form onSubmit={handleUpdateSettings} className="p-6 space-y-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">Store Profile</h3>
                <p className="text-sm text-gray-500">Update your primary store information.</p>
              </div>
              
              <div className="h-px bg-gray-100" />
              
              <div className="grid grid-cols-1 gap-4 max-w-lg">
                <Input 
                  label="Store Name" 
                  value={storeData.storeName} 
                  onChange={(e) => setStoreData({...storeData, storeName: e.target.value})}
                />
                
                <div className="flex flex-col gap-1.5">
                  <label className="block text-sm font-medium text-gray-700">Currency Settings</label>
                  <select 
                    value={storeData.currency}
                    onChange={(e) => setStoreData({...storeData, currency: e.target.value})}
                    className="block w-full rounded-md border-0 py-2 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm"
                  >
                    <option value="INR">Indian Rupee (₹)</option>
                    <option value="USD">US Dollar ($)</option>
                    <option value="EUR">Euro (€)</option>
                    <option value="GBP">British Pound (£)</option>
                  </select>
                </div>
              </div>
              
              <div className="pt-4 flex justify-end">
                <Button type="submit" variant="primary" leftIcon={saving ? Loader2 : Save} disabled={saving}>
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          )}

          {/* Preferences Tab */}
          {activeTab === 'preferences' && (
            <form onSubmit={handleUpdateSettings} className="p-6 space-y-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">System Preferences</h3>
                <p className="text-sm text-gray-500">Customize global thresholds and alerts.</p>
              </div>
              <div className="h-px bg-gray-100" />
              
              <div className="space-y-6 max-w-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Low Stock Threshold (%)</h4>
                    <p className="text-xs text-gray-500">Default fallback percentage for low stock alerts.</p>
                  </div>
                  <input 
                    type="number" 
                    value={storeData.lowStockThresholdPercent}
                    onChange={(e) => setStoreData({...storeData, lowStockThresholdPercent: Number(e.target.value)})}
                    className="w-20 rounded-md border-0 py-1.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-primary sm:text-sm" 
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Expiry Alert Buffer (Days)</h4>
                    <p className="text-xs text-gray-500">How many days before expiry should we alert you?</p>
                  </div>
                  <input 
                    type="number" 
                    value={storeData.expiryAlertDays}
                    onChange={(e) => setStoreData({...storeData, expiryAlertDays: Number(e.target.value)})}
                    className="w-20 rounded-md border-0 py-1.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-primary sm:text-sm" 
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Auto Reorder</h4>
                    <p className="text-xs text-gray-500">Enable automatic PO draft suggestion.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                        type="checkbox" 
                        checked={storeData.autoReorderEnabled}
                        onChange={(e) => setStoreData({...storeData, autoReorderEnabled: e.target.checked})}
                        className="sr-only peer" 
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <Button type="submit" variant="primary" leftIcon={saving ? Loader2 : Save} disabled={saving}>
                   {saving ? 'Updating...' : 'Save Preferences'}
                </Button>
              </div>
            </form>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <form onSubmit={handleUpdateSettings} className="p-6 space-y-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">Notification Settings</h3>
                <p className="text-sm text-gray-500">Control what alerts you receive and how.</p>
              </div>
              <div className="h-px bg-gray-100" />
              
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between py-3 border-b border-gray-50 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Email Notifications</h4>
                    <p className="text-xs text-gray-500 mt-0.5">Receive low stock and expiry alerts via email.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                        type="checkbox" 
                        checked={storeData.emailNotifications}
                        onChange={(e) => setStoreData({...storeData, emailNotifications: e.target.checked})}
                        className="sr-only peer" 
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
                
                <p className="text-xs text-gray-400 italic">In-app notifications are enabled by default for all critical stock events.</p>
              </div>

              <div className="pt-4 flex justify-end">
                <Button type="submit" variant="primary" leftIcon={saving ? Loader2 : Save} disabled={saving}>
                  Save Notifications
                </Button>
              </div>
            </form>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="p-6 space-y-8">
              {/* Profile Section */}
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div>
                  <h3 className="text-base font-bold text-gray-900 mb-1">My Profile</h3>
                  <div className="h-px bg-gray-100 mb-4" />
                </div>
                <div className="grid grid-cols-1 gap-4 max-w-sm">
                  <Input 
                    label="Full Name" 
                    value={profileData.name} 
                    onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                  />
                  <Input label="Email Address" value={profileData.email} disabled />
                  <p className="text-[10px] text-gray-400 -mt-2">Email address cannot be changed. Contact admin for assistance.</p>
                </div>
                <Button type="submit" variant="secondary" size="sm" disabled={saving}>Update Profile</Button>
              </form>

              {/* Password Section */}
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <h3 className="text-base font-bold text-gray-900 mb-1">Security & Password</h3>
                  <div className="h-px bg-gray-100 mb-4" />
                </div>
                <div className="grid grid-cols-1 gap-4 max-w-sm">
                  <Input 
                    label="Current Password" 
                    type="password" 
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                  />
                  <Input 
                    label="New Password" 
                    type="password" 
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                  />
                  <Input 
                    label="Confirm New Password" 
                    type="password" 
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                  />
                </div>
                <Button type="submit" variant="primary" size="sm" disabled={saving}>Change Password</Button>
              </form>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default Settings;
