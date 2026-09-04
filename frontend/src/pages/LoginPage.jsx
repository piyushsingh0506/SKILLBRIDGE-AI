import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/api';
import { Sparkles, Mail, Lock, LogIn, ArrowRight, AlertCircle } from 'lucide-react';
import QuickLoginModal from '../components/QuickLoginModal';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await authService.login({ email, password });
      login(res.data.access_token, {
        id: res.data.user_id,
        email: res.data.email,
        role: res.data.role,
        full_name: res.data.full_name
      });
      // Redirect to correct dashboard according to role
      navigate(`/${res.data.role}/dashboard`);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || 'Invalid email or password. Try a demo account below.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoSelect = async (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError('');
    setLoading(true);

    try {
      const res = await authService.login({ email: demoEmail, password: demoPassword });
      login(res.data.access_token, {
        id: res.data.user_id,
        email: res.data.email,
        role: res.data.role,
        full_name: res.data.full_name
      });
      navigate(`/${res.data.role}/dashboard`);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 flex flex-col justify-center items-center">
      
      {/* Brand Header */}
      <div className="text-center mb-8">
        <Link to="/" className="inline-flex items-center space-x-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-ayush-600 to-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Sparkles className="w-5 h-5 text-slate-950 font-bold" />
          </div>
          <span className="font-display font-extrabold text-2xl text-white">
            Academia<span className="text-ayush-400">–Industry</span> Connect
          </span>
        </Link>
        <p className="text-xs text-slate-400 mt-2">Sign in to your role-specific AI workspace</p>
      </div>

      <div className="w-full max-w-md glass-panel p-8 rounded-2xl border border-slate-700/80 shadow-2xl bg-slate-900/90">
        
        <h2 className="text-xl font-bold text-white mb-1">Account Login</h2>
        <p className="text-xs text-slate-400 mb-6">Enter your credentials or use a 1-click demo role below</p>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-medium flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Official Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@university.edu / hr@company.com"
                className="w-full glass-input rounded-xl pl-9 pr-3 py-2.5 text-xs text-white"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-300">Password</label>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full glass-input rounded-xl pl-9 pr-3 py-2.5 text-xs text-white"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-ayush-500 to-emerald-600 hover:from-ayush-400 hover:to-emerald-500 text-slate-950 font-extrabold text-xs shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            <LogIn className="w-4 h-4" />
            <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-slate-800 text-center text-xs text-slate-400">
          Don't have an account?{' '}
          <Link to="/register" className="text-ayush-400 font-bold hover:underline">
            Register with your role
          </Link>
        </div>

      </div>

      {/* 1-Click Evaluation Switcher */}
      <div className="w-full max-w-2xl mt-8">
        <QuickLoginModal onSelectDemo={handleDemoSelect} />
      </div>

    </div>
  );
};

export default LoginPage;
