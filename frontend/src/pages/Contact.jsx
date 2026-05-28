import React, { useState } from 'react';
import { Heart, Send, CheckCircle, ShieldAlert, Mail, MapPin, Phone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { API_BASE } from '../config';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
    query_type: 'query' // 'query' or 'feedback'
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

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

    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      setErrorMsg('Please fill out all fields before submitting.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/api/submissions/query`, {
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

      setSuccess(true);
      setFormData({
        name: '',
        email: '',
        message: '',
        query_type: 'query'
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
      {/* Success Popup Modal */}
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
              <h3 className="font-poppins font-bold text-2xl text-white">Message Received!</h3>
              <p className="text-brand-grayDark text-sm leading-relaxed">
                Thank you for reaching out to She Can Foundation. Our administration has categorized your query using our smart AI classifier and will follow up shortly.
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

      {/* Info Column */}
      <div className="flex flex-col space-y-8 text-left lg:sticky lg:top-28">
        <div className="flex flex-col space-y-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-brand-red/10 border border-brand-red/20 w-fit">
            <Heart className="w-3.5 h-3.5 text-brand-red fill-brand-red animate-pulse" />
            <span className="font-poppins font-semibold text-xs tracking-wider uppercase text-brand-red">
              GET IN TOUCH
            </span>
          </div>
          <h1 className="font-poppins font-bold text-4xl sm:text-5xl text-white leading-tight">
            We are Here <br />
            To Listen & <span className="text-brand-red text-gradient-red">Support.</span>
          </h1>
          <p className="text-brand-grayDark text-base leading-relaxed font-dmsans max-w-md">
            Do you have questions about our donation campaigns? Are you raising an emergency support request for sanitary hygiene in your community? Or do you want to share suggestions? Leave a message!
          </p>
        </div>

        {/* Contact details */}
        <div className="flex flex-col space-y-6 pt-4 border-t border-white/5 max-w-sm">
          <div className="flex items-center space-x-4">
            <div className="w-11 h-11 rounded-xl bg-brand-red/10 border border-brand-red/20 flex items-center justify-center text-brand-red flex-shrink-0">
              <Mail className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-white/55 font-poppins uppercase tracking-wide">Write to Us</span>
              <a href="mailto:president@shecanfoundation.org" className="text-sm font-semibold text-white hover:text-brand-red transition-colors duration-300">
                president@shecanfoundation.org
              </a>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="w-11 h-11 rounded-xl bg-brand-red/10 border border-brand-red/20 flex items-center justify-center text-brand-red flex-shrink-0">
              <Phone className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-white/55 font-poppins uppercase tracking-wide">Call Support</span>
              <a href="tel:+918283841830" className="text-sm font-semibold text-white hover:text-brand-red transition-colors duration-300">
                +91-8283841830
              </a>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="w-11 h-11 rounded-xl bg-brand-red/10 border border-brand-red/20 flex items-center justify-center text-brand-red flex-shrink-0">
              <MapPin className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-white/55 font-poppins uppercase tracking-wide">Our Head Office</span>
              <span className="text-sm font-semibold text-white">
                New Delhi, India
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Form Card */}
      <div className="glass-panel p-8 sm:p-10 rounded-3xl w-full text-left relative overflow-hidden">
        <h2 className="font-poppins font-bold text-2xl text-white mb-2">Send a Message</h2>
        <p className="text-brand-grayDark text-sm mb-8 font-dmsans">
          Raise queries, report local resource shortages, or send suggestions.
        </p>

        <form onSubmit={handleFormSubmit} className="space-y-6">
          {errorMsg && (
            <div className="p-4 rounded-xl bg-brand-red/10 border border-brand-red/20 text-brand-red text-sm flex items-start space-x-2 font-dmsans">
              <ShieldAlert className="w-5 h-5 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Submission Type Switcher */}
          <div className="flex flex-col space-y-2">
            <label className="text-xs font-poppins font-semibold text-white/80 uppercase tracking-wide">
              Select Message Nature
            </label>
            <div className="grid grid-cols-2 gap-2 p-1.5 rounded-xl bg-brand-dark/50 border border-white/5">
              <button
                type="button"
                onClick={() => setFormData(p => ({ ...p, query_type: 'query' }))}
                className={`py-2 rounded-lg font-poppins font-semibold text-xs tracking-wide transition-all duration-300 ${
                  formData.query_type === 'query'
                    ? 'bg-brand-red text-white shadow-md'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                Query / Help Request
              </button>
              <button
                type="button"
                onClick={() => setFormData(p => ({ ...p, query_type: 'feedback' }))}
                className={`py-2 rounded-lg font-poppins font-semibold text-xs tracking-wide transition-all duration-300 ${
                  formData.query_type === 'feedback'
                    ? 'bg-brand-red text-white shadow-md'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                Feedback / Suggestion
              </button>
            </div>
          </div>

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
              placeholder="e.g. Komal Singh"
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
              placeholder="e.g. komal@gmail.com"
              required
              className="w-full px-4 py-3 rounded-xl bg-brand-dark/40 border border-white/5 hover:border-white/10 focus:border-brand-red focus:ring-1 focus:ring-brand-red outline-none text-white transition-all duration-300 font-dmsans text-sm"
            />
          </div>

          {/* Message Textarea */}
          <div className="flex flex-col space-y-2">
            <label className="text-xs font-poppins font-semibold text-white/80 uppercase tracking-wide">
              Message Content
            </label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleInputChange}
              rows="4"
              placeholder={
                formData.query_type === 'query'
                  ? "Describe the issue or details of the resource request (e.g. school name, district, pads counts needed...)"
                  : "Tell us about your experience or give your valuable suggestions to improve our campaign models..."
              }
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
              <span>Sending Message...</span>
            ) : (
              <>
                <span>Send Message</span>
                <Send className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Contact;
