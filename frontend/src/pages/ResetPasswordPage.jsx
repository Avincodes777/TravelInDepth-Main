import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Plane, Lock, Eye, EyeOff, CheckCircle2, ArrowLeft, Loader2 } from 'lucide-react';
import { resetPassword } from '../api/authApi';
import { useAuth } from '../features/auth/useAuth';

const ResetPasswordPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please verify and try again.');
      return;
    }

    setLoading(true);

    try {
      const data = await resetPassword(token, password);
      if (data.token) {
        localStorage.setItem('token', data.token);
      }
      if (data.user) {
        setUser(data.user);
      }
      setIsSuccess(true);
      setTimeout(() => {
        navigate('/dashboard');
      }, 2500);
    } catch (err) {
      console.error('Password reset failed:', err);
      setError(err.message || 'Reset link is invalid or expired. Please request a new one.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-8 font-montserrat bg-[#FDF6EC] flex items-center justify-center px-6 py-12">
      {/* Background Decorative Element */}
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

        {!isSuccess ? (
          <>
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-2xl font-black text-[#8B1A1A] uppercase mb-2">
                Set New Password
              </h1>
              <p className="text-sm text-gray-500 font-medium">
                Create a strong password for your Travel In Depth account.
              </p>
            </div>

            {/* Error Banner */}
            {error && (
              <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
                <span>⚠️ {error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              {/* New Password */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 ml-1">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    required
                    minLength={6}
                    disabled={loading}
                    className="w-full px-5 py-3.5 pr-12 rounded-xl border border-[#F5A623]/40 bg-[#FDF6EC]/30 text-sm outline-none focus:border-[#FF6B1A] focus:ring-2 focus:ring-[#FF6B1A]/20 transition-all font-medium disabled:opacity-60"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 ml-1">
                  Confirm Password
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your password"
                  required
                  minLength={6}
                  disabled={loading}
                  className="w-full px-5 py-3.5 rounded-xl border border-[#F5A623]/40 bg-[#FDF6EC]/30 text-sm outline-none focus:border-[#FF6B1A] focus:ring-2 focus:ring-[#FF6B1A]/20 transition-all font-medium disabled:opacity-60"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 bg-[#FF6B1A] hover:bg-[#8B1A1A] text-white py-4 rounded-xl font-black uppercase tracking-widest text-xs transition-all duration-300 active:scale-95 shadow-lg shadow-orange-500/20 disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Resetting Password...
                  </>
                ) : (
                  'Update Password'
                )}
              </button>
            </form>
          </>
        ) : (
          /* Success State */
          <div className="text-center animate-fadeInUp">
            <div className="flex justify-center mb-4">
              <div className="bg-green-100 p-4 rounded-full text-green-600">
                <CheckCircle2 size={48} />
              </div>
            </div>
            <h2 className="text-xl font-black text-[#138808] uppercase mb-2">Password Updated!</h2>
            <p className="text-sm text-gray-500 font-medium mb-8">
              Your password has been reset successfully. Redirecting you to your dashboard…
            </p>
            <Link
              to="/dashboard"
              className="inline-block bg-[#138808] text-white px-6 py-3 rounded-full text-xs font-black uppercase tracking-widest hover:bg-green-800 transition-colors shadow-md"
            >
              Go to Dashboard
            </Link>
          </div>
        )}

        {/* Back to Sign In */}
        <div className="mt-10 pt-6 border-t border-gray-100 flex justify-center">
          <Link
            to="/login"
            className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-gray-400 hover:text-[#FF6B1A] transition-colors"
          >
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

export default ResetPasswordPage;
