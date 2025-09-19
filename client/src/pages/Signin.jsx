import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, LogIn, Loader, AlertCircle, Waves, CheckCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const Signin = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [rememberMe, setRememberMe] = useState(false);
  
  // Safely get auth state with fallbacks
  let login = async () => ({ success: false, error: 'Authentication not available' });
  let loading = false;
  let error = null;
  let isAuthenticated = false;
  let clearError = () => {};
  
  try {
    const authState = useAuth();
    login = authState?.login || login;
    loading = authState?.loading || false;
    error = authState?.error || null;
    isAuthenticated = authState?.isAuthenticated || false;
    clearError = authState?.clearError || (() => {});
  } catch (authError) {
    console.log('Auth not available:', authError.message);
    error = 'Authentication service not available';
  }
  const navigate = useNavigate();
  const location = useLocation();
  
  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Clear errors when component mounts or form changes
  useEffect(() => {
    clearError();
  }, [clearError]);

  useEffect(() => {
    if (formData.email || formData.password) {
      setValidationErrors({});
    }
  }, [formData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (!formData.password) {
      errors.password = 'Password is required';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const result = await login(formData.email, formData.password);
    
    if (result.success) {
      // Always redirect to home page after successful signin
      navigate('/', { replace: true });
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50 to-blue-50">
      <Navbar />
      
      {/* Hero Section with Split Layout */}
      <div className="pt-32 pb-20 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            
            {/* Left Side - Welcome Content */}
            <div className="text-center lg:text-left">
              <div className="mb-8">
                <h1 className="text-5xl lg:text-6xl font-bold text-gray-800 mb-6 leading-tight">
                  Welcome Back to
                  <br />
                  <span className="bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent">
                    Shore Clean
                  </span>
                </h1>
                <p className="text-xl text-gray-600 max-w-2xl">
                  Continue your environmental impact journey. Sign in to access your dashboard, 
                  view upcoming cleanup events, and track your contributions.
                </p>
              </div>
              
              {/* Features List */}
              <div className="space-y-4 mb-8">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center mr-4">
                    <CheckCircle className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-gray-700">Access your personalized dashboard</span>
                </div>
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center mr-4">
                    <CheckCircle className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-gray-700">Track your environmental impact</span>
                </div>
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center mr-4">
                    <CheckCircle className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-gray-700">Join upcoming cleanup events</span>
                </div>
              </div>
              
              {/* New User CTA */}
              <div className="p-6 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl border border-cyan-200">
                <h3 className="font-semibold text-gray-800 mb-2">New to Shore Clean?</h3>
                <p className="text-gray-600 mb-4">
                  Join thousands of environmental champions making a real difference.
                </p>
                <Link
                  to="/register"
                  className="inline-flex items-center text-cyan-600 hover:text-cyan-700 font-medium transition-colors"
                >
                  Create Account
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </div>
            </div>

            {/* Right Side - Signin Form */}
            <div className="max-w-md mx-auto lg:mx-0 w-full">
              <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
                {/* Form Header */}
                <div className="text-center mb-8">
                  <div className="flex items-center justify-center mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center">
                      <Waves className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">Sign In</h2>
                  <p className="text-gray-600">Access your Shore Clean account</p>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center text-red-700">
                    <AlertCircle className="h-5 w-5 mr-3 flex-shrink-0" />
                    <span className="text-sm">{error}</span>
                  </div>
                )}

                {/* Signin Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Email Field */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300 ${
                          validationErrors.email 
                            ? 'border-red-300 bg-red-50' 
                            : 'border-gray-300 bg-white hover:border-gray-400'
                        }`}
                        placeholder="Enter your email"
                        disabled={loading}
                      />
                    </div>
                    {validationErrors.email && (
                      <p className="mt-2 text-sm text-red-600">{validationErrors.email}</p>
                    )}
                  </div>

                  {/* Password Field */}
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className={`w-full pl-10 pr-12 py-3 border rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300 ${
                          validationErrors.password 
                            ? 'border-red-300 bg-red-50' 
                            : 'border-gray-300 bg-white hover:border-gray-400'
                        }`}
                        placeholder="Enter your password"
                        disabled={loading}
                      />
                      <button
                        type="button"
                        onClick={togglePasswordVisibility}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                        disabled={loading}
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                    {validationErrors.password && (
                      <p className="mt-2 text-sm text-red-600">{validationErrors.password}</p>
                    )}
                  </div>

                  {/* Remember Me & Forgot Password */}
                  <div className="flex items-center justify-between">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="h-4 w-4 text-cyan-600 focus:ring-cyan-500 border-gray-300 rounded"
                        disabled={loading}
                      />
                      <span className="ml-2 text-sm text-gray-600">Remember me</span>
                    </label>
                    <Link 
                      to="/forgot-password" 
                      className="text-sm text-cyan-600 hover:text-cyan-700 transition-colors duration-300"
                    >
                      Forgot password?
                    </Link>
                  </div>

                  {/* Signin Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white py-3 px-4 rounded-xl hover:from-cyan-600 hover:to-blue-600 focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 transition-all duration-300 font-semibold flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <Loader className="h-5 w-5 mr-2 animate-spin" />
                        Signing In...
                      </>
                    ) : (
                      <>
                        <LogIn className="h-5 w-5 mr-2" />
                        Sign In
                      </>
                    )}
                  </button>
                </form>

                {/* Register Link */}
                <div className="mt-6 text-center">
                  <p className="text-gray-600">
                    Don't have an account?{' '}
                    <Link 
                      to="/register" 
                      className="text-cyan-600 hover:text-cyan-700 font-medium transition-colors duration-300"
                    >
                      Create Account
                    </Link>
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Signin;
