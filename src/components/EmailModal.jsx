import React, { useState } from 'react';
import { X, Send, CheckCircle, Mail, AlertCircle, Loader2 } from 'lucide-react';

export default function EmailModal({ isOpen, onClose, trackingData }) {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('idle'); // idle, sending, success, error

  if (!isOpen) return null;

  const handleSend = (e) => {
    e.preventDefault();
    if (!email) return;

    setStatus('sending');

    // Simulate API call to send email
    setTimeout(() => {
      setStatus('success');
      
      // Auto close after success
      setTimeout(() => {
        setStatus('idle');
        setEmail('');
        setMessage('');
        onClose();
      }, 2000);
    }, 1500);
  };

  const isDark = document.documentElement.classList.contains('dark') || 
                 document.body.classList.contains('dark') || 
                 window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  // Note: Since the app uses context, we'll try to rely on generic classes or fallback styling.
  const bgClass = 'bg-white dark:bg-[#111]';
  const textClass = 'text-gray-900 dark:text-white';
  const borderClass = 'border-gray-200 dark:border-gray-800';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className={`${bgClass} ${textClass} w-full max-w-md rounded-2xl shadow-2xl border ${borderClass} overflow-hidden transform transition-all`}>
        
        {/* Header */}
        <div className={`flex items-center justify-between px-6 py-4 border-b ${borderClass}`}>
          <div className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-blue-500" />
            <h3 className="font-semibold text-lg">Share Shipment Details</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {status === 'success' ? (
            <div className="flex flex-col items-center justify-center py-8 animate-fade-in">
              <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-500/20 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-8 h-8 text-emerald-500" />
              </div>
              <h4 className="text-xl font-semibold mb-2">Email Sent!</h4>
              <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                The tracking details for AWB {trackingData?.awb} have been successfully shared to {email}.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSend} className="space-y-4">
              <div className={`p-3 rounded-xl border ${borderClass} bg-gray-50 dark:bg-white/5 mb-6`}>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Attached Shipment</p>
                <p className="font-semibold text-sm">{trackingData?.awb} • {trackingData?.carrier || 'Carrier'}</p>
                <p className="text-xs mt-1 text-gray-500 dark:text-gray-400">
                  Status: {trackingData?.status} | Origin: {trackingData?.origin} | Dest: {trackingData?.destination}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">Recipient Email *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter email address"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#1a1a1a] focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">Message (Optional)</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Add a custom note..."
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#1a1a1a] focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl font-medium hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={status === 'sending' || !email}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-500/30"
                >
                  {status === 'sending' ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Send Email
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
