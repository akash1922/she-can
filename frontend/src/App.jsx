import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import PersistentLayout from './layouts/PersistentLayout';
import Home from './pages/Home';
import About from './pages/About';
import JoinUs from './pages/JoinUs';
import Contact from './pages/Contact';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  return (
    <Router>
      <PersistentLayout>
        <Routes>
          {/* Public Pages */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/join-us" element={<JoinUs />} />
          <Route path="/contact" element={<Contact />} />
          
          {/* Administrative Gateway */}
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />

          {/* Catch-all Fallback */}
          <Route path="*" element={<Home />} />
        </Routes>
      </PersistentLayout>
    </Router>
  );
}

export default App;
