import React, { useState } from 'react';
import { Heart, Send, CheckCircle, ShieldAlert, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { API_BASE } from '../config';

const JoinUs = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role_interested: 'Event Volunteer',
    message: ''
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const roles = [
    'Event Volunteer',
    'Educator',
    'Fundraising Partner',
    'Social Media Strategist'
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccess(false);

    // Front-end Validations
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      setErrorMsg('Please fill out all fields before submitting.');
      setLoading(false);
      return;
    }

    try {
      // Connect to Backend API
      const response = await fetch(`${API_BASE}/api/submissions/volunteer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Server error occurred during submission.');
      }

      // Success state
      setSuccess(true);
      setFormData({
        name: '',
        email: '',
        role_interested: 'Event Volunteer',
        message: ''
      });
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || 'Connecting to server failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-16 items-start relative">
      {/* Dynamic Success Popup */}
      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <div className="glass-panel-glow bg-gradient-card-glow max-w-md w-full p-8 rounded-3xl text-center flex flex-col items-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 mb-2">
                <CheckCircle className="w-10 h-10" />
              </div>
              <h3 className="font-poppins font-bold text-2xl text-white">Application Submitted!</h3>
              <p className="text-brand-grayDark text-sm leading-relaxed">
                Thank you for applying to join the She Can Foundation. Our administration will review your details, assign your role, and contact you shortly.
              </p>
              <button
                onClick={() => setSuccess(false)}
                className="w-full py-3 rounded-xl bg-brand-red hover:bg-brand-redHover text-white font-poppins font-semibold tracking-wide transition-all duration-300"
              >
                Close & Return
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Info Left column */}
      <div className="flex flex-col space-y-6 text-left lg:sticky lg:top-28">
        <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-brand-red/10 border border-brand-red/20 w-fit">
          <Sparkles className="w-3.5 h-3.5 text-brand-red animate-pulse" />
          <span className="font-poppins font-semibold text-xs tracking-wider uppercase text-brand-red">
            JOIN OUR TEAM
          </span>
        </div>
        
        <h1 className="font-poppins font-bold text-4xl sm:text-5xl text-white leading-tight">
          Be the Reason <br />
          She Can <span className="text-brand-red text-gradient-red">Rise Today.</span>
        </h1>

        <p className="text-brand-grayDark text-base leading-relaxed font-dmsans">
          Volunteering at She Can Foundation is more than giving time—it is restoring dignity, opening doors of education, and bringing structural social change to rural girls across India. 
        </p>

        <p className="text-brand-grayDark text-base leading-relaxed font-dmsans">
          Whether you want to organize local distributions, teach menstrual hygiene, help with fundraising, or drive awareness online, we have an active role tailored for your skills. Let's make an impact, together.
        </p>
      </div>

      {/* Form Right Column */}
      <div className="glass-panel p-8 sm:p-10 rounded-3xl w-full text-left relative overflow-hidden">
        <h2 className="font-poppins font-bold text-2xl text-white mb-2">Volunteer Application</h2>
        <p className="text-brand-grayDark text-sm mb-8 font-dmsans">
          Provide your details below, and our team will get back to you.
        </p>

        <form onSubmit={handleFormSubmit} className="space-y-6">
          {/* Error Message banner */}
          {errorMsg && (
            <div className="p-4 rounded-xl bg-brand-red/10 border border-brand-red/20 text-brand-red text-sm flex items-start space-x-2 font-dmsans">
              <ShieldAlert className="w-5 h-5 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Name Field */}
          <div className="flex flex-col space-y-2">
            <label className="text-xs font-poppins font-semibold text-white/80 uppercase tracking-wide">
              Full Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="e.g. Anjali Verma"
              required
              className="w-full px-4 py-3 rounded-xl bg-brand-dark/40 border border-white/5 hover:border-white/10 focus:border-brand-red focus:ring-1 focus:ring-brand-red outline-none text-white transition-all duration-300 font-dmsans text-sm"
            />
          </div>

          {/* Email Field */}
          <div className="flex flex-col space-y-2">
            <label className="text-xs font-poppins font-semibold text-white/80 uppercase tracking-wide">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="e.g. anjali@gmail.com"
              required
              className="w-full px-4 py-3 rounded-xl bg-brand-dark/40 border border-white/5 hover:border-white/10 focus:border-brand-red focus:ring-1 focus:ring-brand-red outline-none text-white transition-all duration-300 font-dmsans text-sm"
            />
          </div>

          {/* Role Choice */}
          <div className="flex flex-col space-y-2">
            <label className="text-xs font-poppins font-semibold text-white/80 uppercase tracking-wide">
              Role Interested In
            </label>
            <select
              name="role_interested"
              value={formData.role_interested}
              onChange={handleInputChange}
              className="w-full px-4 py-3 rounded-xl bg-brand-charcoal border border-white/5 hover:border-white/10 focus:border-brand-red text-white transition-all duration-300 font-dmsans text-sm outline-none"
            >
              {roles.map((role) => (
                <option key={role} value={role} className="bg-brand-charcoal text-white">
                  {role}
                </option>
              ))}
            </select>
          </div>

          {/* Message / Intro */}
          <div className="flex flex-col space-y-2">
            <label className="text-xs font-poppins font-semibold text-white/80 uppercase tracking-wide">
              Why do you want to join?
            </label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleInputChange}
              rows="4"
              placeholder="Tell us briefly about your interests, skills, or what motivates you to support She Can Foundation..."
              required
              className="w-full px-4 py-3 rounded-xl bg-brand-dark/40 border border-white/5 hover:border-white/10 focus:border-brand-red focus:ring-1 focus:ring-brand-red outline-none text-white transition-all duration-300 font-dmsans text-sm resize-none"
            ></textarea>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full flex items-center justify-center space-x-2.5 py-4 rounded-xl bg-brand-red hover:bg-brand-redHover disabled:bg-brand-red/50 text-white font-poppins font-semibold tracking-wide shadow-xl shadow-brand-red/10 transition-all duration-300 ${
              loading ? 'cursor-not-allowed opacity-80' : ''
            }`}
          >
            {loading ? (
              <span>Submitting Application...</span>
            ) : (
              <>
                <span>Submit Application</span>
                <Send className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default JoinUs;
