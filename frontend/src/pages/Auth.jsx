import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { API_BASE_URL } from '../config/api';

const slides = [
  {
    title: "Smart Recycling",
    description: "Use AI to identify and sort recyclables with just your phone camera",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    )
  },
  {
    title: "Earn Rewards",
    description: "Get points and rewards for every item you recycle through our platform",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  },
  {
    title: "Track Impact",
    description: "Monitor your environmental impact and see how much you've contributed to sustainability",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    )
  }
];

const Auth = ({ onLoginSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    aadhaarNumber: '',
    address: '',
    password: '',
    confirmPassword: '',
    showPassword: false,
    showConfirmPassword: false
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear errors when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    setApiError('');
  };

  const validateForm = () => {
    const newErrors = {};

    if (!isLogin) {
      if (!formData.fullName.trim()) {
        newErrors.fullName = 'Full name is required';
      }

      if (!formData.aadhaarNumber.trim()) {
        newErrors.aadhaarNumber = 'Aadhaar number is required';
      } else if (!/^\d{12}$/.test(formData.aadhaarNumber)) {
        newErrors.aadhaarNumber = 'Aadhaar number must be 12 digits';
      }

      if (!formData.address.trim()) {
        newErrors.address = 'Address is required';
      }

      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    setApiError('');

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const body = isLogin
        ? {
            username: formData.username,
            password: formData.password,
          }
        : {
            name: formData.fullName,
            username: formData.username,
            aadhaar: formData.aadhaarNumber,
            address: formData.address,
            password: formData.password,
          };

      console.log('Attempting to connect to:', `${API_BASE_URL}${endpoint}`);
      console.log('Request body:', body);

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(body),
      });

      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Authentication failed');
      }

      // Store the token
      localStorage.setItem('token', data.token);
      
      // Call the success callback with admin status
      onLoginSuccess(data.user.isAdmin);
      
      // Navigate to appropriate dashboard based on admin status
      navigate(data.user.isAdmin ? '/admin' : '/dashboard');
    } catch (error) {
      console.error('Authentication error:', error);
      setApiError(error.message || 'Failed to connect to the server. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper function to determine if a field should show error
  const shouldShowError = (fieldName) => {
    return errors[fieldName];
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-100">
      <div className="flex w-full h-full">
        {/* Left Section - Slider */}
        <div className="hidden lg:block w-[55%] bg-gradient-to-br from-emerald-400 to-cyan-500 relative">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-full max-w-3xl px-8">
              {slides.map((slide, index) => (
                <div
                  key={index}
                  className={`absolute inset-0 flex flex-col items-center justify-center text-white transition-all duration-700 transform ${
                    index === currentSlide
                      ? 'opacity-100 translate-x-0'
                      : index < currentSlide
                      ? 'opacity-0 -translate-x-full'
                      : 'opacity-0 translate-x-full'
                  }`}
                >
                  <div className="bg-white/10 backdrop-blur-lg p-8 rounded-3xl mb-6 transform hover:scale-105 transition-transform">
                    <div className="w-16 h-16">
                      {slide.icon}
                    </div>
                  </div>
                  <h2 className="text-5xl font-bold mb-6 text-center px-4 leading-tight">{slide.title}</h2>
                  <p className="text-lg text-white/90 text-center max-w-lg leading-relaxed px-4">
                    {slide.description}
                  </p>
                </div>
              ))}
              <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 flex space-x-3 pointer-events-auto">
                {slides.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                      index === currentSlide ? 'bg-white scale-125' : 'bg-white/30 hover:bg-white/50'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Section - Auth Form */}
        <div className="w-full lg:w-[45%] bg-white relative z-50">
          <div className="h-full px-6 lg:px-12 py-6 flex flex-col justify-center">
            <div className="w-full max-w-md mx-auto">
              <div className="absolute top-6 right-8">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center mr-3 transform hover:rotate-180 transition-transform duration-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </div>
                  <h1 className="text-xl font-bold text-gray-900">ScanCycle</h1>
                </div>
              </div>

              <div className="mb-8 mt-16">
                <h2 className="text-3xl font-bold mb-3 text-gray-900 leading-tight">
                  {isLogin ? 'Welcome back!' : 'Join our mission'}
                </h2>
                <p className="text-base text-gray-600">
                  {isLogin 
                    ? 'Sign in to continue your recycling journey'
                    : 'Start your sustainable journey with us today'}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {apiError && (
                  <div className="bg-red-50 text-red-500 p-3 rounded-lg text-sm">
                    {apiError}
                  </div>
                )}
                
                {!isLogin && (
                  <div className="space-y-3">
                    <input
                      id="fullName"
                      name="fullName"
                      type="text"
                      value={formData.fullName}
                      onChange={handleChange}
                      className="w-full px-5 py-3 rounded-lg bg-gray-100 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Full Name"
                    />
                    {shouldShowError('fullName') && (
                      <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>
                    )}

                    <input
                      id="aadhaarNumber"
                      name="aadhaarNumber"
                      type="text"
                      value={formData.aadhaarNumber}
                      onChange={handleChange}
                      className="w-full px-5 py-3 rounded-lg bg-gray-100 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Aadhaar Number"
                      maxLength="12"
                    />
                    {shouldShowError('aadhaarNumber') && (
                      <p className="mt-1 text-sm text-red-600">{errors.aadhaarNumber}</p>
                    )}

                    <input
                      id="address"
                      name="address"
                      type="text"
                      value={formData.address}
                      onChange={handleChange}
                      className="w-full px-5 py-3 rounded-lg bg-gray-100 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Address"
                    />
                    {shouldShowError('address') && (
                      <p className="mt-1 text-sm text-red-600">{errors.address}</p>
                    )}
                  </div>
                )}

                <div className="space-y-3">
                  <input
                    id="username"
                    name="username"
                    type="text"
                    value={formData.username}
                    onChange={handleChange}
                    className="w-full px-5 py-3 rounded-lg bg-gray-100 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Username"
                  />
                  {shouldShowError('username') && (
                    <p className="mt-1 text-sm text-red-600">{errors.username}</p>
                  )}

                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      type={formData.showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full px-5 py-3 rounded-lg bg-gray-100 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Password"
                    />
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, showPassword: !prev.showPassword }))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {formData.showPassword ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                  {shouldShowError('password') && (
                    <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                  )}

                  {!isLogin && (
                    <div className="relative">
                      <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={formData.showConfirmPassword ? "text" : "password"}
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className="w-full px-5 py-3 rounded-lg bg-gray-100 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="Confirm Password"
                      />
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, showConfirmPassword: !prev.showConfirmPassword }))}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {formData.showConfirmPassword ? (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        )}
                      </button>
                    </div>
                  )}
                  {shouldShowError('confirmPassword') && (
                    <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full bg-emerald-500 text-white py-3 rounded-xl text-base font-medium transition-all transform hover:scale-[1.02] active:scale-[0.98] hover:shadow-lg ${
                    isSubmitting ? 'opacity-75 cursor-not-allowed' : 'hover:bg-emerald-600'
                  }`}
                >
                  {isSubmitting 
                    ? (isLogin ? 'Signing in...' : 'Creating account...') 
                    : (isLogin ? 'Sign in' : 'Create account')}
                </button>

                <p className="mt-6 text-center text-gray-600">
                  {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setIsLogin(!isLogin);
                      setErrors({});
                      setApiError('');
                      setFormData({
                        fullName: '',
                        username: '',
                        aadhaarNumber: '',
                        address: '',
                        password: '',
                        confirmPassword: '',
                        showPassword: false,
                        showConfirmPassword: false
                      });
                    }}
                    className="font-medium text-emerald-500 hover:text-emerald-600"
                  >
                    {isLogin ? "Sign up" : "Sign in"}
                  </button>
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth; 