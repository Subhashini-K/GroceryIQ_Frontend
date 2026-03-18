import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import { Package, Truck, ShoppingCart, LogIn, ShieldCheck, ArrowRight, Loader2 } from 'lucide-react';
import Button from '../../components/common/Button';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAppContext();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    try {
      await login(formData);
      navigate('/');
    } catch (err) {
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Verification failed. Use the demo credentials provided.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FBFBFE] flex items-center justify-center p-4 relative overflow-hidden font-inter">
      
      {/* Dynamic Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>

      <div className="w-full max-w-[1100px] grid lg:grid-cols-2 items-center gap-12 relative z-10">
        
        {/* Left Side: Branding & Visuals */}
        <div className="hidden lg:flex flex-col space-y-8 animate-in slide-in-from-left duration-700">
           <div className="flex items-center gap-3">
             <div className="p-3 bg-white rounded-2xl shadow-premium border border-gray-100 animate-float">
                <ShoppingCart className="w-8 h-8 text-indigo-600" />
             </div>
             <div>
               <h1 className="text-4xl font-black text-gray-900 tracking-tight font-outfit">Grocery<span className="text-indigo-600">IQ</span></h1>
               <p className="text-gray-500 font-medium font-outfit">Next-Gen Inventory Control</p>
             </div>
           </div>

           <div className="space-y-6">
              <h2 className="text-5xl font-extrabold text-gray-900 leading-[1.1] font-outfit">
                Master Your Stock with <span className="text-gradient-login">Precision.</span>
              </h2>
              <p className="text-lg text-gray-600 max-w-md leading-relaxed">
                Experience seamless inventory management, real-time analytics, and automated restocking in a stunningly simple interface.
              </p>
           </div>

           <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-white/50 backdrop-blur rounded-2xl border border-gray-100 shadow-sm">
                <div className="flex items-center gap-2 text-indigo-600 font-bold mb-1">
                  <ShieldCheck className="w-4 h-4" />
                  <span className="text-xs uppercase tracking-wider">Secure</span>
                </div>
                <p className="text-sm font-semibold text-gray-700">Enterprise Auth</p>
              </div>
              <div className="p-4 bg-white/50 backdrop-blur rounded-2xl border border-gray-100 shadow-sm">
                <div className="flex items-center gap-2 text-green-600 font-bold mb-1">
                  <Package className="w-4 h-4" />
                  <span className="text-xs uppercase tracking-wider">Swift</span>
                </div>
                <p className="text-sm font-semibold text-gray-700">Live Syncing</p>
              </div>
           </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="flex flex-col items-center lg:items-end animate-in fade-in zoom-in duration-700">
          <div className="w-full max-w-[450px] space-y-8 bg-white p-10 rounded-3xl shadow-premium border border-gray-100 relative">
            
            <div className="text-center lg:text-left space-y-2">
              <h3 className="text-3xl font-black text-gray-900 font-outfit">Welcome Back</h3>
              <p className="text-sm text-gray-500 font-medium">Please enter your credentials to access the console.</p>
            </div>


            <form className="space-y-6" onSubmit={handleSubmit}>
              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-xl animate-in fade-in slide-in-from-top-2">
                  <p className="text-red-700 text-sm font-medium">{error}</p>
                </div>
              )}

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-gray-700 ml-1">Email Address</label>
                  <input
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-gray-900 placeholder:text-gray-300"
                    placeholder="Enter your email"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-gray-700 ml-1">Password</label>
                  <input
                    name="password"
                    type="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-gray-900 placeholder:text-gray-300"
                    placeholder="••••••••••••"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="group w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-lg shadow-lg shadow-indigo-500/30 transition-all flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50"
              >
                {isSubmitting ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <>
                    Sign In to Console
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            <div className="pt-4 text-center">
              <p className="text-xs text-gray-400 font-medium tracking-wide italic">Secure authorized access only. Session recorded.</p>
            </div>
          </div>

          <div className="mt-8 flex items-center gap-6 opacity-10 grayscale">
             <ShoppingCart className="w-6 h-6" />
             <Truck className="w-6 h-6" />
             <Package className="w-6 h-6" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
