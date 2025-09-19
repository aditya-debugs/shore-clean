import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  User, Mail, Lock, Eye, EyeOff, UserPlus, Loader, AlertCircle, 
  CheckCircle, X, Shield, Users, Building, Waves 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { validatePassword, validateForm } from '../utils/validators';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordValidation, setPasswordValidation] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  
  // Safely get auth state with fallbacks
  let register = async () => ({ success: false, error: 'Authentication not available' });
  let loading = false;
  let error = null;
  let isAuthenticated = false;
  let clearError = () => {};
  
  try {
    const authState = useAuth();
    register = authState?.register || register;
    loading = authState?.loading || false;
    error = authState?.error || null;
    isAuthenticated = authState?.isAuthenticated || false;
    clearError = authState?.clearError || (() => {});
  } catch (authError) {
    console.log('Auth not available:', authError.message);
    error = 'Authentication service not available';
  }
  const navigate = useNavigate();
  
  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Clear errors when component mounts
  useEffect(() => {
    clearError();
  }, [clearError]);

  // Clear validation errors when form changes
  useEffect(() => {
    if (Object.keys(validationErrors).length > 0) {
      setValidationErrors({});
    }
  }, [formData]);

  // Real-time password validation
  useEffect(() => {
    if (formData.password) {
      setPasswordValidation(validatePassword(formData.password));
    } else {
      setPasswordValidation(null);
    }
  }, [formData.password]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRoleSelect = (role) => {
    setFormData(prev => ({
      ...prev,
      role
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    const validation = validateForm(formData, ['name', 'email', 'password', 'confirmPassword', 'role']);
    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      return;
    }

    // Check terms agreement
    if (!agreedToTerms) {
      setValidationErrors({ terms: 'Please agree to the Terms and Conditions' });
      return;
    }

    const result = await register({
      name: formData.name,
      email: formData.email,
      password: formData.password,
      role: formData.role
    });
    
    if (result.success) {
      // Redirect to home page after successful registration
      navigate('/', { replace: true });
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const roleOptions = [
    {
      id: 'user',
      title: 'Volunteer',
      description: 'Join cleanup events and make a difference',
      icon: Users,
      color: 'from-green-400 to-emerald-500'
    },
    {
      id: 'org',
      title: 'Organization',
      description: 'Create and manage cleanup events',
      icon: Building,
      color: 'from-blue-400 to-cyan-500'
    },
    {
      id: 'admin',
      title: 'Administrator',
      description: 'System administration access',
      icon: Shield,
      color: 'from-purple-400 to-indigo-500'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50 to-blue-50">
      <Navbar />
      
      {/* Hero Background Section */}
      <div className="pt-32 pb-20 relative overflow-hidden">
        {/* Background with ocean theme */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ 
            backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url('https://images.unsplash.com/photo-1559827260-dc66d52bef19?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1471&q=80')` 
          }}
        />
        
        <div className="relative z-10 max-w-2xl mx-auto px-6">
          {/* Registration Form Card */}
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="flex items-center justify-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center">
                  <Waves className="h-6 w-6 text-white" />
                </div>
              </div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Join Shore Clean</h1>
              <p className="text-gray-600">Create your account to start making a difference</p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center text-red-700">
                <AlertCircle className="h-5 w-5 mr-3 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            {/* Registration Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name Field */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300 ${
                      validationErrors.name 
                        ? 'border-red-300 bg-red-50' 
                        : 'border-gray-300 bg-white hover:border-gray-400'
                    }`}
                    placeholder="Enter your full name"
                    disabled={loading}
                  />
                </div>
                {validationErrors.name && (
                  <p className="mt-2 text-sm text-red-600">{validationErrors.name}</p>
                )}
              </div>

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

              {/* Role Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Choose Your Role
                </label>
                <div className="grid grid-cols-1 gap-3">
                  {roleOptions.map((role) => {
                    const Icon = role.icon;
                    return (
                      <div
                        key={role.id}
                        onClick={() => handleRoleSelect(role.id)}
                        className={`cursor-pointer p-4 border-2 rounded-xl transition-all duration-300 ${
                          formData.role === role.id
                            ? 'border-cyan-500 bg-cyan-50'
                            : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center">
                          <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${role.color} flex items-center justify-center mr-4`}>
                            <Icon className="h-5 w-5 text-white" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-800">{role.title}</h3>
                            <p className="text-sm text-gray-600">{role.description}</p>
                          </div>
                          <div className={`w-5 h-5 rounded-full border-2 transition-colors ${
                            formData.role === role.id
                              ? 'border-cyan-500 bg-cyan-500'
                              : 'border-gray-300'
                          }`}>
                            {formData.role === role.id && (
                              <CheckCircle className="w-5 h-5 text-white" />
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                {validationErrors.role && (
                  <p className="mt-2 text-sm text-red-600">{validationErrors.role}</p>
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
                    placeholder="Create a strong password"
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
                
                {/* Password Strength Indicator */}
                {passwordValidation && formData.password && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Password Strength:</span>
                      <span className={`text-sm font-medium ${
                        passwordValidation.strength.level === 'weak' ? 'text-red-600' :
                        passwordValidation.strength.level === 'medium' ? 'text-yellow-600' :
                        'text-green-600'
                      }`}>
                        {passwordValidation.strength.text}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${
                          passwordValidation.strength.level === 'weak' ? 'bg-red-500 w-1/4' :
                          passwordValidation.strength.level === 'medium' ? 'bg-yellow-500 w-2/4' :
                          passwordValidation.strength.level === 'strong' ? 'bg-green-500 w-3/4' :
                          'bg-green-600 w-full'
                        }`}
                      ></div>
                    </div>
                    <div className="space-y-1">
                      {passwordValidation.requirements.map((req, index) => (
                        <div key={index} className="flex items-center text-xs">
                          {req.met ? (
                            <CheckCircle className="h-3 w-3 text-green-500 mr-2" />
                          ) : (
                            <X className="h-3 w-3 text-red-500 mr-2" />
                          )}
                          <span className={req.met ? 'text-green-700' : 'text-red-700'}>
                            {req.text}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {validationErrors.password && (
                  <p className="mt-2 text-sm text-red-600">{validationErrors.password}</p>
                )}
              </div>

              {/* Confirm Password Field */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-12 py-3 border rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300 ${
                      validationErrors.confirmPassword 
                        ? 'border-red-300 bg-red-50' 
                        : 'border-gray-300 bg-white hover:border-gray-400'
                    }`}
                    placeholder="Confirm your password"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={toggleConfirmPasswordVisibility}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                    disabled={loading}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {validationErrors.confirmPassword && (
                  <p className="mt-2 text-sm text-red-600">{validationErrors.confirmPassword}</p>
                )}
              </div>

              {/* Terms and Conditions */}
              <div>
                <label className="flex items-start cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    className="mt-1 mr-3 h-4 w-4 text-cyan-600 focus:ring-cyan-500 border-gray-300 rounded"
                    disabled={loading}
                  />
                  <span className="text-sm text-gray-600">
                    I agree to the{' '}
                    <Link to="/terms" className="text-cyan-600 hover:text-cyan-700 underline">
                      Terms and Conditions
                    </Link>{' '}
                    and{' '}
                    <Link to="/privacy" className="text-cyan-600 hover:text-cyan-700 underline">
                      Privacy Policy
                    </Link>
                  </span>
                </label>
                {validationErrors.terms && (
                  <p className="mt-2 text-sm text-red-600">{validationErrors.terms}</p>
                )}
              </div>

              {/* Register Button */}
              <button
                type="submit"
                disabled={loading || !passwordValidation?.isValid}
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white py-3 px-4 rounded-xl hover:from-cyan-600 hover:to-blue-600 focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 transition-all duration-300 font-semibold flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader className="h-5 w-5 mr-2 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  <>
                    <UserPlus className="h-5 w-5 mr-2" />
                    Create Account
                  </>
                )}
              </button>
            </form>

            {/* Login Link */}
            <div className="mt-8 text-center">
              <p className="text-gray-600">
                Already have an account?{' '}
                <Link 
                  to="/login" 
                  className="text-cyan-600 hover:text-cyan-700 font-medium transition-colors duration-300"
                >
                  Sign In
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section with Ocean Theme */}
      <section className="py-16 bg-gradient-to-r from-cyan-500 to-blue-500 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/20 to-blue-600/20"></div>
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <Waves className="h-12 w-12 text-white/90 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-white mb-4">Start Your Environmental Journey</h2>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Join thousands of environmental champions who are already making a difference 
            in coastal conservation and cleanup efforts worldwide.
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Register;
