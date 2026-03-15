import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FiLock, FiUser, FiAlertCircle, FiEye, FiEyeOff } from 'react-icons/fi';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError('Email and password are required');
      return;
    }

    setLoading(true);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await axios.post(`${apiUrl}/api/login`, {
        email,
        password,
      });

      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        navigate('/dashboard');
      }
    } catch (err) {
      setError(
        err.response?.data?.msg || 'Login failed. Please check your credentials.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError('Email and password are required');
      return;
    }

    setLoading(true);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await axios.post(`${apiUrl}/api/signup`, {
        email,
        password,
      });

      if (response.status === 201) {
        setError('Signup successful! Please log in.');
      }
    } catch (err) {
      setError(
        err.response?.data?.msg || 'Signup failed.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#121212] text-white overflow-hidden relative">
      <div className="absolute top-0 w-full h-full bg-gradient-to-br from-purple-900/20 to-blue-900/20 z-0"></div>
      
      <div className="z-10 bg-[#1e1e1e]/80 backdrop-blur-lg border border-gray-700/50 p-10 rounded-3xl shadow-2xl w-full max-w-md">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 mb-4 shadow-lg shadow-indigo-500/30">
            <FiLock className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white mb-2">Secure Access</h1>
          <p className="text-gray-400 text-sm">Social Media Hijack Detection System</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-3 text-red-400 text-sm">
            <FiAlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300 ml-1">Email <span className="text-red-400">*</span></label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <FiUser className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-400 transition-colors" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full pl-11 pr-4 py-3 bg-[#2a2a2a] border border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-white placeholder-gray-500 outline-none transition-all shadow-inner"
                placeholder="developer@example.com"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300 ml-1">Password <span className="text-red-400">*</span></label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <FiLock className="h-5 w-5 text-gray-400 group-focus-within:text-purple-400 transition-colors" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full pl-11 pr-12 py-3 bg-[#2a2a2a] border border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-white placeholder-gray-500 outline-none transition-all shadow-inner"
                placeholder="••••••••"
                required
              />
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-gray-400 hover:text-white transition-colors focus:outline-none"
                >
                  {showPassword ? (
                    <FiEyeOff className="h-5 w-5" />
                  ) : (
                    <FiEye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="pt-2 flex gap-4">
            <button
              onClick={handleSignup}
              disabled={loading}
              className="flex-1 py-3 px-4 rounded-xl text-gray-300 bg-[#2a2a2a] hover:bg-[#333] border border-gray-600 hover:border-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-all font-semibold"
            >
              Sign Up
            </button>            
            <button
              onClick={handleLogin}
              disabled={loading}
              className="flex-1 py-3 px-4 rounded-xl text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-[#121212] transition-all font-semibold shadow-lg shadow-purple-600/20 disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Login'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;
