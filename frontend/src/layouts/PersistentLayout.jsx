import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Heart, Menu, X, ShieldAlert, LogOut, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const PersistentLayout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // Check if admin session exists
  useEffect(() => {
    const adminToken = localStorage.getItem('she_can_admin_token');
    setIsAdmin(!!adminToken);
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem('she_can_admin_token');
    localStorage.removeItem('she_can_admin_email');
    setIsAdmin(false);
    navigate('/');
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Join Us', path: '/join-us' },
    { name: 'Contact', path: '/contact' }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-brand-dark bg-gradient-hero selection:bg-brand-red selection:text-white relative">
      {/* Persistent Global Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-panel border-b border-white/5 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-brand-red flex items-center justify-center shadow-lg shadow-brand-red/20 group-hover:scale-105 transition-transform duration-300">
                <Heart className="w-5.5 h-5.5 text-white fill-white animate-pulse-subtle" />
              </div>
              <span className="font-poppins font-bold text-xl tracking-tight text-white group-hover:text-brand-red transition-colors duration-300">
                She Can<span className="text-brand-red">.</span>
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.name}
                    to={link.path}
                    className={`font-poppins font-medium text-sm tracking-wide transition-colors duration-300 relative py-1 ${
                      isActive ? 'text-brand-red' : 'text-white/80 hover:text-white'
                    }`}
                  >
                    {link.name}
                    {isActive && (
                      <motion.div
                        layoutId="activeNavIndicator"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-red"
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}
                  </Link>
                );
              })}
            </div>

            {/* CTA Buttons */}
            <div className="hidden md:flex items-center space-x-4">
              {isAdmin ? (
                <>
                  <Link
                    to="/admin/dashboard"
                    className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-brand-red/10 border border-brand-red/20 text-brand-red hover:bg-brand-red hover:text-white transition-all duration-300 font-poppins font-medium text-sm tracking-wide"
                  >
                    <ShieldAlert className="w-4 h-4" />
                    <span>Dashboard</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 px-4 py-2.5 rounded-xl hover:bg-white/5 text-white/75 hover:text-white transition-all duration-300 font-poppins font-medium text-sm tracking-wide"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <Link
                  to="/admin-login"
                  className="px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:border-brand-red/30 text-white hover:text-brand-red hover:bg-brand-red/5 transition-all duration-300 font-poppins font-medium text-sm tracking-wide"
                >
                  Admin Login
                </Link>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center space-x-4">
              {isAdmin && (
                <Link
                  to="/admin/dashboard"
                  className="p-2 rounded-xl bg-brand-red/10 border border-brand-red/20 text-brand-red"
                >
                  <ShieldAlert className="w-5 h-5" />
                </Link>
              )}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-xl hover:bg-white/5 text-white/80 hover:text-white transition-colors duration-300"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu, show/hide based on menu state */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden glass-panel border-t border-white/5 overflow-hidden"
            >
              <div className="px-4 pt-2 pb-6 space-y-3">
                {navLinks.map((link) => {
                  const isActive = location.pathname === link.path;
                  return (
                    <Link
                      key={link.name}
                      to={link.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`block px-4 py-3 rounded-xl font-poppins font-medium text-base ${
                        isActive ? 'bg-brand-red/10 text-brand-red' : 'hover:bg-white/5 text-white/85 hover:text-white'
                      }`}
                    >
                      {link.name}
                    </Link>
                  );
                })}
                <div className="h-px bg-white/5 my-2"></div>
                {isAdmin ? (
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleLogout();
                    }}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-3.5 rounded-xl bg-white/5 text-white/85 font-poppins font-semibold"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Admin Logout</span>
                  </button>
                ) : (
                  <Link
                    to="/admin-login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-center px-4 py-3.5 rounded-xl bg-brand-red text-white hover:bg-brand-redHover transition-colors duration-300 font-poppins font-semibold text-base shadow-lg shadow-brand-red/15"
                  >
                    Admin Login
                  </Link>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Main Content Area swap container */}
      <main className="flex-grow pt-20 flex flex-col justify-start relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
            className="flex-grow flex flex-col justify-start"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Global Footer (shows only on non-dashboard admin pages) */}
      {!location.pathname.startsWith('/admin/') && (
        <footer className="glass-panel border-t border-white/5 py-12 mt-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <Link to="/" className="flex items-center space-x-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-brand-red flex items-center justify-center">
                    <Heart className="w-4 h-4 text-white fill-white" />
                  </div>
                  <span className="font-poppins font-bold text-lg text-white">
                    She Can<span className="text-brand-red">.</span>
                  </span>
                </Link>
                <p className="text-brand-grayDark text-sm leading-relaxed max-w-sm">
                  Empowering underprivileged women and eradicating  poverty. Registered under the Indian Society Act, 1860.
                </p>
              </div>
              <div className="flex flex-col space-y-2 md:items-center">
                <span className="font-poppins font-semibold text-white text-sm tracking-wide mb-2 uppercase">
                  Quick Links
                </span>
                <div className="flex flex-col space-y-2 md:items-center text-sm text-brand-grayDark">
                  {navLinks.map((link) => (
                    <Link key={link.name} to={link.path} className="hover:text-brand-red transition-colors duration-300">
                      {link.name}
                    </Link>
                  ))}
                </div>
              </div>
              <div className="flex flex-col space-y-2 md:items-end">
                <span className="font-poppins font-semibold text-white text-sm tracking-wide mb-2 uppercase">
                  Contact Support
                </span>
                <p className="text-sm text-brand-grayDark md:text-right">
                  Email: <a href="mailto:president@shecanfoundation.org" className="hover:text-brand-red transition-colors duration-300">president@shecanfoundation.org</a>
                </p>
                <p className="text-sm text-brand-grayDark md:text-right">
                  Phone: <a href="tel:+918283841830" className="hover:text-brand-red transition-colors duration-300">+91-8283841830</a>
                </p>
              </div>
            </div>
            <div className="h-px bg-white/5 my-8"></div>
            <p className="text-center text-xs text-brand-grayDark font-poppins">
              &copy; {new Date().getFullYear()} She Can Foundation. All rights reserved. Registered Govt. NGO under Indian Society Act, 1860.
            </p>
          </div>
        </footer>
      )}
    </div>
  );
};

export default PersistentLayout;
