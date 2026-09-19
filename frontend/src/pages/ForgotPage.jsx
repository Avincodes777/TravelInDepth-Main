import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plane, ArrowLeft, MailCheck, Loader2 } from 'lucide-react';
import { forgotPassword } from '../api/authApi';

const ForgotPage = () => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setError(null);

    try {
      await forgotPassword(email.trim());
      setIsSubmitted(true);
    } catch (err) {
      console.error("Forgot password request failed:", err);
      setError(err.message || "Failed to process request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-8 font-montserrat bg-[#FDF6EC] flex items-center justify-center px-6 py-12">
      
      {/* Background Decorative Element (Optional but looks cool) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full border border-orange-200/30"></div>
        <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full border border-orange-200/30"></div>
      </div>

      <div className="w-full max-w-md bg-white p-8 md:p-10 rounded-3xl shadow-xl shadow-orange-900/5 z-10">
        
        {/* Logo Section */}
        <div className="flex flex-col items-center mb-8">
          <div className="bg-amber-500 p-3 rounded-2xl mb-4 shadow-lg shadow-orange-500/20">
            <Plane size={24} className="text-black" />
          </div>
          <span className="text-xl font-black uppercase tracking-tighter">
            Travel <span className="text-[#FF6B1A]">In Depth</span>
          </span>
        </div>

        {!isSubmitted ? (
          <>
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-2xl font-black text-[#8B1A1A] uppercase mb-2">
                Forgot Password?
              </h1>
              <p className="text-sm text-gray-500 font-medium">
                Don't worry, it happens! Enter your email and we'll send you a recovery link.
              </p>
            </div>

            {/* Error Banner */}
            {error && (
              <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
                <span>⚠️ {error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 ml-1">
                  Registered Email
                </label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@email.com"
                  required 
                  disabled={loading}
                  className="w-full px-5 py-3.5 rounded-xl border border-[#F5A623]/40 bg-[#FDF6EC]/30 text-sm outline-none focus:border-[#FF6B1A] focus:ring-2 focus:ring-[#FF6B1A]/20 transition-all font-medium disabled:opacity-60" 
                />
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-[#FF6B1A] hover:bg-[#8B1A1A] text-white py-4 rounded-xl font-black uppercase tracking-widest text-xs transition-all duration-300 active:scale-95 shadow-lg shadow-orange-500/20 disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Sending Link...
                  </>
                ) : (
                  "Send Reset Link"
                )}
              </button>
            </form>
          </>
        ) : (
          /* Success State */
          <div className="text-center animate-fadeInUp">
            <div className="flex justify-center mb-4">
              <div className="bg-green-100 p-4 rounded-full text-green-600">
                <MailCheck size={48} />
              </div>
            </div>
            <h2 className="text-xl font-black text-[#138808] uppercase mb-2">Check Your Mail</h2>
            <p className="text-sm text-gray-500 font-medium mb-8">
              We've sent a password reset link to <br />
              <span className="text-[#2D1B00] font-bold">{email}</span>
            </p>
            <button 
              onClick={() => setIsSubmitted(false)}
              className="text-[#FF6B1A] text-xs font-black uppercase tracking-widest hover:underline"
            >
              Didn't receive it? Try again
            </button>
          </div>
        )}

        {/* Back to Login */}
        <div className="mt-10 pt-6 border-t border-gray-100 flex justify-center">
          <Link to="/login" className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-gray-400 hover:text-[#FF6B1A] transition-colors">
            <ArrowLeft size={14} />
            Back to Sign In
          </Link>
        </div>

      </div>

      {/* Flag Strip Decor */}
      <div className="absolute bottom-0 left-0 w-full h-1 flex">
        <div className="flex-1 bg-[#FF6B1A]"></div>
        <div className="flex-1 bg-white"></div>
        <div className="flex-1 bg-[#138808]"></div>
      </div>

    </div>
  );
};

export default ForgotPage;