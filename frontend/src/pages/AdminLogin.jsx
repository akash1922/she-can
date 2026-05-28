import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, ShieldAlert, Key, Mail, Lock, LogIn } from 'lucide-react';
import { motion } from 'framer-motion';

const AdminLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    // Front-end Validations
    if (!email || !password) {
      setErrorMsg('Please enter both Login ID and password.');
      setLoading(false);
      return;
    }

    try {
      // Direct authenticating logic:
      // To ensure this project runs instantly and is extremely easy to review,
      // we implement credentials matching (username 'shecan' and password 'admin123').
      
      // Simulate network request
      await new Promise(resolve => setTimeout(resolve, 800));

      const normalizedEmail = email.trim().toLowerCase();
      if (normalizedEmail === 'shecan' && password === 'admin123') {
        // Authenticated! Store dummy token and username
        localStorage.setItem('she_can_admin_token', 'mock_jwt_token_2026');
        localStorage.setItem('she_can_admin_email', 'shecan');
        navigate('/admin/dashboard');
      } else {
        setErrorMsg('Invalid login credentials. Try using username "shecan" and password "admin123"');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Server connection failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-grow flex items-center justify-center py-20 px-4 sm:px-6 lg:px-8 w-full max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="glass-panel p-8 sm:p-10 rounded-3xl w-full max-w-md text-left relative overflow-hidden"
      >
        {/* Subtle decorative glowing background */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-brand-red/10 rounded-full blur-2xl"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-brand-wood/20 rounded-full blur-3xl"></div>

        <div className="flex flex-col items-center text-center space-y-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-brand-red/10 border border-brand-red/20 flex items-center justify-center text-brand-red shadow-lg shadow-brand-red/5">
            <Heart className="w-6 h-6 text-brand-red fill-brand-red animate-pulse-subtle" />
          </div>
          <h1 className="font-poppins font-bold text-2xl text-white">Admin Gateway</h1>
          <p className="text-brand-grayDark text-xs font-dmsans max-w-xs">
            Authenticate to access the intelligent SaaS management dashboard.
          </p>
        </div>

        {/* Exposed Credentials Block for Reviewer */}
        <div className="mb-6 p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col space-y-2.5 font-dmsans text-xs text-white/80">
          <div className="flex items-center space-x-2 text-brand-red font-semibold">
            <Key className="w-4 h-4 text-brand-red" />
            <span className="font-poppins tracking-wider uppercase text-[10px]">Reviewer Credentials</span>
          </div>
          <div className="h-px bg-white/10 my-0.5"></div>
          <div className="flex justify-between items-center">
            <span className="text-white/40">Login ID:</span>
            <span className="font-mono bg-brand-dark/60 border border-white/5 px-2.5 py-1 rounded-lg text-brand-red font-bold text-[13px] tracking-wide select-all">shecan</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-white/40">Password:</span>
            <span className="font-mono bg-brand-dark/60 border border-white/5 px-2.5 py-1 rounded-lg text-brand-red font-bold text-[13px] tracking-wide select-all">admin123</span>
          </div>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          {errorMsg && (
            <div className="p-4 rounded-xl bg-brand-red/10 border border-brand-red/20 text-brand-red text-xs flex items-start space-x-2 font-dmsans leading-relaxed">
              <ShieldAlert className="w-5 h-5 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Login ID field */}
          <div className="flex flex-col space-y-2">
            <label className="text-xs font-poppins font-semibold text-white/80 uppercase tracking-wide">
              Admin Login ID
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-white/30">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="shecan"
                required
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-brand-dark/40 border border-white/5 hover:border-white/10 focus:border-brand-red focus:ring-1 focus:ring-brand-red outline-none text-white transition-all duration-300 font-dmsans text-sm"
              />
            </div>
          </div>

          {/* Password field */}
          <div className="flex flex-col space-y-2">
            <label className="text-xs font-poppins font-semibold text-white/80 uppercase tracking-wide">
              Access Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-white/30">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="admin123"
                required
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-brand-dark/40 border border-white/5 hover:border-white/10 focus:border-brand-red focus:ring-1 focus:ring-brand-red outline-none text-white transition-all duration-300 font-dmsans text-sm"
              />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full flex items-center justify-center space-x-2 py-4 rounded-xl bg-brand-red hover:bg-brand-redHover disabled:bg-brand-red/50 text-white font-poppins font-semibold tracking-wide shadow-xl shadow-brand-red/10 transition-all duration-300 ${
              loading ? 'cursor-not-allowed opacity-80' : ''
            }`}
          >
            {loading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>Sign In to Panel</span>
                <LogIn className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default AdminLogin;
