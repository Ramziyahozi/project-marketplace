import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../../stores/authStore';
import useCartStore from '../../stores/cartStore';


const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [toast, setToast] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  
  const { user, isAuthenticated, logout } = useAuthStore();
  const { getItemCount } = useCartStore();
  
  const navigate = useNavigate();



  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Tampilkan toast notification
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };



  const handleLogout = () => {
    // Hapus data user dari localStorage dan state
    logout();
    // Redirect ke halaman utama
    navigate('/');
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // Redirect ke halaman produk dengan query search
    navigate(`/products?search=${searchQuery}`);
  };

  // Data kategori untuk dropdown
  const categories = [
    { id: 'makanan-pokok', name: 'Makanan Pokok' },
    { id: 'roti', name: 'Roti & Kue' },
    { id: 'buah', name: 'Buah Segar' },
    { id: 'sayuran', name: 'Sayuran' },
    { id: 'minuman', name: 'Minuman' },
    { id: 'camilan', name: 'Camilan' },
  ];

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled 
          ? 'bg-white/80 backdrop-blur-xl shadow-lg border-b border-gray-200/50' 
          : 'bg-transparent'
      }`}>
        {/* Top Bar - Minimal & Elegant */}
        <div className={`transition-all duration-500 ${
          isScrolled ? 'py-2' : 'py-4'
        }`}>
          <div className="container mx-auto px-6">
            <div className="flex items-center justify-between">
              {/* Logo */}
              <Link to="/" className="flex items-center group">
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                    <span className="text-white font-bold text-lg">S</span>
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
                </div>
                <div className="ml-3">
                  <span className="text-2xl font-bold bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent">
                    SurplusFood
            </span>
          </div>
              </Link>

              {/* Right Icons */}
              <div className="flex items-center space-x-2">
                {isAuthenticated && user?.role === 'admin' ? (
                  <>
                    <Link to="/admin/users" className="bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:shadow-lg hover:shadow-green-500/25 transition-all duration-300 hover:scale-105">
                      Dashboard Admin
                </Link>
                    <button
                      onClick={() => navigate('/admin/users')}
                      className="w-10 h-10 rounded-full bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center font-bold text-green-700 border-2 border-green-300 hover:scale-110 transition-all duration-300 shadow-lg"
                      title="Dashboard Admin"
                    >
                      {user.name?.slice(0,2).toUpperCase() || 'AD'}
                    </button>
                <button 
                  onClick={handleLogout} 
                      className="bg-gradient-to-r from-red-500 to-red-600 text-white font-medium px-4 py-2 rounded-xl text-sm transition-all duration-300 hover:shadow-lg hover:shadow-red-500/25 hover:scale-105"
                >
                  Logout
                </button>
              </>
                ) : isAuthenticated ? (
              <>
                    

                    {/* Cart */}
                    <Link to="/cart" className="relative w-10 h-10 rounded-full bg-gray-100/50 hover:bg-white border border-gray-200/50 flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg group">
                      <svg className="w-5 h-5 text-gray-600 group-hover:text-green-600 transition-colors duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {getItemCount() > 0 && (
                        <span className="absolute -top-1 -right-1 bg-green-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse shadow-lg">
                  {getItemCount()}
                </span>
              )}
            </Link>
                {/* Tambahkan icon riwayat pesanan */}
                <Link to="/order-history" className="relative w-10 h-10 rounded-full bg-gray-100/50 hover:bg-white border border-gray-200/50 flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg group" title="Riwayat Pesanan">
                  <svg className="w-5 h-5 text-gray-600 group-hover:text-green-600 transition-colors duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </Link>

                    {/* Profile */}
                    <Link to="/profile" className="flex items-center gap-2 group">
                      <div className="relative">
                        <img
                          src={user?.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=random`}
                          alt="Avatar"
                          className="w-10 h-10 rounded-full object-cover border-2 border-gray-200 shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110"
                        />
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
                      </div>
                    </Link>

                    {user?.role === 'penjual' && (
                      <button
                        onClick={() => navigate('/seller-dashboard')}
                        className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300 hover:scale-105"
                      >
                        Dashboard
                      </button>
                    )}
                    
                    <button 
                      onClick={handleLogout} 
                      className="bg-gradient-to-r from-red-500 to-red-600 text-white font-medium px-4 py-2 rounded-xl text-sm transition-all duration-300 hover:shadow-lg hover:shadow-red-500/25 hover:scale-105"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/login" className="text-gray-600 hover:text-green-600 text-sm font-medium transition-colors duration-300 hover:scale-105">Masuk</Link>
                    <Link to="/register" className="bg-gradient-to-r from-green-500 to-green-600 text-white font-medium px-6 py-2 rounded-xl text-sm transition-all duration-300 hover:shadow-lg hover:shadow-green-500/25 hover:scale-105">
                      Daftar Sekarang
                    </Link>
                  </>
                )}
                
                {/* Mobile Menu Button */}
            <button
              onClick={toggleMenu}
                  className="md:hidden w-10 h-10 rounded-full bg-gray-100/50 hover:bg-white border border-gray-200/50 flex items-center justify-center transition-all duration-300 hover:scale-110"
            >
                  <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="md:hidden px-6 pb-4">
          <div className="relative">
            <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              placeholder="Cari makanan surplus..."
                className="w-full py-3 pl-12 pr-4 rounded-2xl border-2 border-gray-200 bg-gray-50/50 focus:border-green-500 focus:bg-white focus:outline-none focus:ring-0 text-sm font-medium transition-all duration-300"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </form>
          </div>
        </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
          <div className="md:hidden bg-white/95 backdrop-blur-xl border-t border-gray-200/50 animate-in slide-in-from-top-2 duration-300">
            <div className="container mx-auto px-6 py-4">
              <div className="space-y-4">
                <Link to="/" className="block text-gray-700 hover:text-green-600 py-2 transition-colors duration-300 font-medium" onClick={toggleMenu}>
                  Beranda
                </Link>
                <Link to="/sellers" className="block text-gray-700 hover:text-green-600 py-2 transition-colors duration-300 font-medium" onClick={toggleMenu}>
                  Toko
                </Link>
                {isAuthenticated && (
                <>
                    <div className="border-t border-gray-200/50 pt-4">
                      <Link to="/profile" className="block text-gray-700 hover:text-green-600 py-2 transition-colors duration-300 font-medium" onClick={toggleMenu}>
                      Profil Saya
                    </Link>

                      <Link to="/order-history" className="block text-gray-700 hover:text-green-600 py-2 transition-colors duration-300 font-medium" onClick={toggleMenu}>
                      Riwayat Pesanan
                    </Link>
                  {user?.role === 'penjual' && (
                        <Link to="/seller-dashboard" className="block text-gray-700 hover:text-green-600 py-2 transition-colors duration-300 font-medium" onClick={toggleMenu}>
                        Dashboard Penjual
                      </Link>
                  )}
                    <button 
                      onClick={() => {
                        handleLogout();
                        toggleMenu();
                      }} 
                        className="block text-gray-700 hover:text-red-600 w-full text-left py-2 transition-colors duration-300 font-medium"
                    >
                      Logout
                    </button>
                    </div>
                </>
              )}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Spacer untuk fixed navbar */}
      <div className="h-32 md:h-24"></div>
      
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-24 right-6 z-50 p-4 rounded-2xl shadow-2xl max-w-sm backdrop-blur-xl border border-gray-200/50 animate-in slide-in-from-right-2 duration-300 ${
          toast.type === 'success' ? 'bg-green-500/90 text-white' : 'bg-red-500/90 text-white'
        }`}>
          <div className="flex items-center gap-3">
            {toast.type === 'success' ? (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
            <span className="text-sm font-medium">{toast.message}</span>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar; 