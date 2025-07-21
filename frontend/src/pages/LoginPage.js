import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../stores/authStore';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const navigate = useNavigate();
  const { login, user } = useAuthStore();

  // Animation on mount
  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const success = await login(email, password);
    setLoading(false);

    if (!success) {
      setError('Email tidak ditemukan atau password salah');
      return;
    }

    
    
    // Redirect berdasarkan role
    if (user?.role === 'admin') {
      navigate('/admin/users');
    } else if (user?.role === 'penjual') {
      navigate('/seller-dashboard');
    } else {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-green-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-64 h-64 bg-green-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-48 h-48 bg-blue-500/10 rounded-full blur-2xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-1/4 w-56 h-56 bg-yellow-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      <div className="max-w-md w-full space-y-8 relative z-10">
        {/* Header */}
        <div className={`text-center transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="relative mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-3xl flex items-center justify-center mx-auto shadow-2xl shadow-green-500/25">
              <svg className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full animate-pulse"></div>
          </div>
          <h2 className="text-4xl font-bold text-white mb-4">Selamat Datang Kembali</h2>
          <p className="text-gray-400 text-lg">Masuk ke akun SurplusFood Anda</p>
        </div>

        {/* Form */}
        <div className={`bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-8 shadow-2xl transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} style={{ transitionDelay: '200ms' }}>
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-6 py-4 rounded-2xl mb-8 backdrop-blur-xl">
              <div className="flex items-center">
                <svg className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-3">
                Email
              </label>
              <div className="relative">
                <input 
                  id="email"
                  type="email" 
                  className={`w-full px-6 py-4 bg-white/10 border-2 rounded-2xl focus:outline-none focus:ring-0 text-white placeholder-gray-400 transition-all duration-300 ${
                    emailFocused 
                      ? 'border-green-500 bg-white/20 shadow-lg shadow-green-500/20' 
                      : 'border-white/20 hover:border-white/30'
                  }`}
                  value={email} 
                  onChange={e => setEmail(e.target.value)} 
                  onFocus={() => setEmailFocused(true)}
                  onBlur={() => setEmailFocused(false)}
                  required 
                  placeholder="Masukkan email Anda"
                />
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                  <svg className={`w-5 h-5 transition-colors duration-300 ${emailFocused ? 'text-green-400' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                </div>
              </div>
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-3">
                Password
              </label>
              <div className="relative">
                <input 
                  id="password"
                  type="password" 
                  className={`w-full px-6 py-4 bg-white/10 border-2 rounded-2xl focus:outline-none focus:ring-0 text-white placeholder-gray-400 transition-all duration-300 ${
                    passwordFocused 
                      ? 'border-green-500 bg-white/20 shadow-lg shadow-green-500/20' 
                      : 'border-white/20 hover:border-white/30'
                  }`}
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                  required 
                  placeholder="Masukkan password Anda"
                />
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                  <svg className={`w-5 h-5 transition-colors duration-300 ${passwordFocused ? 'text-green-400' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
              </div>
            </div>

            <button 
              type="submit" 
              className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-4 px-6 rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-green-500/25 flex items-center justify-center gap-3 group"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="relative">
                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  </div>
                  Memproses...
                </>
              ) : (
                <>
                  <svg className="w-6 h-6 group-hover:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  Masuk
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-gray-400">
              Belum punya akun?{' '}
              <Link to="/register" className="font-semibold text-green-400 hover:text-green-300 transition-colors duration-300">
                Daftar sekarang
              </Link>
            </p>
          </div>
        </div>

        {/* Info */}
        <div className={`text-center transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} style={{ transitionDelay: '400ms' }}>
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
            <div className="flex items-center justify-center mb-4">
              <div className="w-10 h-10 bg-green-500/20 rounded-2xl flex items-center justify-center mr-3">
                <svg className="h-5 w-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-lg font-semibold text-white">Tentang SurplusFood</span>
            </div>
            <p className="text-gray-400 leading-relaxed">
              Platform jual beli makanan surplus untuk mengurangi limbah makanan dan memberikan manfaat bagi semua.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage; 