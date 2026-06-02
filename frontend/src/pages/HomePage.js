import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../utils/axios';
import useAuthStore from '../stores/authStore';
import useCartStore from '../stores/cartStore';
import { isProductExpired, isProductExpiringSoon, getExpiredStatus } from '../utils/productUtils';

const HomePage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, isAuthenticated } = useAuthStore();
  const { addItem } = useCartStore();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [isVisible, setIsVisible] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // grid or list



  // Categories
  const categories = [
    { id: 'makanan-pokok', name: 'Makanan Pokok', icon: '🍚', color: 'from-green-400 to-green-600' },
    { id: 'roti', name: 'Roti & Kue', icon: '🥐', color: 'from-yellow-400 to-yellow-600' },
    { id: 'minuman', name: 'Minuman', icon: '🥤', color: 'from-blue-400 to-blue-600' },
    { id: 'camilan', name: 'Camilan', icon: '🍪', color: 'from-amber-400 to-amber-600' },
  ];

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        // Ambil produk dari backend
        const res = await api.get('/products');
        let allProducts = res.data;

        // Filter search
        if (searchQuery) {
          const searchLower = searchQuery.toLowerCase();
          allProducts = allProducts.filter(p =>
            p.name.toLowerCase().includes(searchLower) ||
            (p.description && p.description.toLowerCase().includes(searchLower)) ||
            (p.sellerId && p.sellerId.name && p.sellerId.name.toLowerCase().includes(searchLower))
          );
        }
        // Filter kategori
        if (selectedCategory) {
          allProducts = allProducts.filter(p => p.category === selectedCategory);
        }

        setProducts(allProducts);
      } catch (err) {
        console.error('Error fetching products:', err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [searchQuery, selectedCategory]);

  // animasi
  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchParams({ search: searchQuery });
  };

  const handleCategoryClick = (categoryId) => {
    setSelectedCategory(categoryId === selectedCategory ? '' : categoryId);
    setSearchParams({ category: categoryId === selectedCategory ? '' : categoryId });
  };

  const handleAddToCart = (product) => {
    // Cek apakah produk sudah expired
    if (isProductExpired(product.expiredDate)) {
      alert('Maaf, produk ini sudah kedaluwarsa dan tidak bisa ditambahkan ke keranjang!');
      return;
    }

    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    // Cek jika user adalah seller dari produk ini
    if (user && product && product.sellerId && user._id === (product.sellerId._id || product.sellerId)) {
      alert('Anda tidak bisa membeli produk milik toko Anda sendiri!');
      return;
    }
    addItem(product);
    alert(`${product.name} ditambahkan ke keranjang!`);
  };

  const getDiscountPercentage = (product) => {
    return Math.round((1 - product.discountPrice / product.originalPrice) * 100);
  };

  const formatDistance = (distance) => {
    return distance;
  };

  const getAverageRating = (product) => {
    if (!product.reviews || product.reviews.length === 0) return 0;
    const total = product.reviews.reduce((sum, review) => sum + review.rating, 0);
    return (total / product.reviews.length).toFixed(1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Search Bar */}
            <div className="flex-1 max-w-2xl mx-8">
              <form onSubmit={handleSearch} className="relative">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Cari makanan surplus, toko, atau lokasi..."
                    className="w-full pl-12 pr-4 py-3 bg-gray-100 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                    <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
              </form>
            </div>




            <div className="flex items-center gap-2 ml-4">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-all duration-300 ${viewMode === 'grid' ? 'bg-green-100 text-green-600' : 'text-gray-400 hover:text-gray-600'
                  }`}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-all duration-300 ${viewMode === 'list' ? 'bg-green-100 text-green-600' : 'text-gray-400 hover:text-gray-600'
                  }`}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>


          <div className="flex items-center gap-4 mt-4 overflow-x-auto pb-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategoryClick(category.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all duration-300 ${selectedCategory === category.id
                  ? 'bg-green-500 text-white shadow-lg'
                  : 'bg-white border border-gray-200 text-gray-700 hover:border-green-300 hover:shadow-md'
                  }`}
              >
                <span className="text-lg">{category.icon}</span>
                <span className="text-sm font-medium">{category.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>




      <div className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {searchQuery ? `Hasil pencarian untuk "${searchQuery}"` : 'Makanan Surplus Terdekat'}
            </h1>
            <p className="text-gray-600 mt-1">
              {products.length} produk tersedia
            </p>
          </div>

        </div>


        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="relative">
              <div className="w-12 h-12 border-4 border-green-200 border-t-green-500 rounded-full animate-spin"></div>
            </div>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Tidak ada produk ditemukan</h2>
            <p className="text-gray-600">Coba ubah filter pencarian Anda</p>
          </div>
        ) : (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' : 'space-y-4'}>
            {products.map((product, index) => {
              const expired = isProductExpired(product.expiredDate);
              const expiringSoon = !expired && isProductExpiringSoon(product.expiredDate);

              return (
                <div
                  key={product._id}
                  className={`group bg-white rounded-2xl shadow-sm border-2 overflow-hidden transition-all duration-300 ${
                    expired
                      ? 'border-red-200 opacity-60'
                      : 'border-green-100 hover:shadow-xl'
                  } ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
                  <div className="relative">
                    <Link to={`/products/${product._id}`}>
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className={`w-full object-cover transition-transform duration-300 group-hover:scale-105 ${viewMode === 'grid' ? 'h-48' : 'h-32'} ${
                          expired ? 'grayscale' : ''
                        }`}
                      />
                    </Link>

                    {/* Badge Status */}
                    {expired ? (
                      <div className="absolute top-3 left-3 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-lg">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        Kedaluwarsa
                      </div>
                    ) : expiringSoon ? (
                      <div className="absolute top-3 left-3 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-lg animate-pulse">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18.868 14.545c.111.717-.652 1.312-1.364 1.087-.329-.101-.604-.208-.83-.322-.223.114-.501.221-.83.322-.712.225-1.475-.37-1.364-1.087.051-.325.233-.713.675-1.304-.072-.072-.15-.14-.23-.205a.866.866 0 00-.21-.14c-.625-.305-1.153-.59-1.153-1.254 0-.742.737-1.344 1.647-1.344.908 0 1.647.602 1.647 1.344 0 .663-.528.95-1.153 1.254-.072.035-.145.087-.21.14-.08.065-.157.133-.23.205.442.591.624.979.675 1.304zM10 20a10 10 0 100-20 10 10 0 000 20z" clipRule="evenodd" />
                        </svg>
                        Segera Habis
                      </div>
                    ) : product.discountPrice ? (
                      <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                        -{getDiscountPercentage(product)}%
                      </div>
                    ) : null}

                    {/* button add - disable jika expired */}
                    <button
                      onClick={() => handleAddToCart(product)}
                      disabled={expired}
                      className={`absolute bottom-3 right-3 w-10 h-10 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 ${
                        expired
                          ? 'bg-gray-300 cursor-not-allowed opacity-50'
                          : 'bg-white opacity-0 group-hover:opacity-100 hover:scale-110'
                      }`}
                      title={expired ? 'Produk sudah kedaluwarsa' : 'Tambah ke keranjang'}
                    >
                      <svg className={`w-5 h-5 ${expired ? 'text-gray-400' : 'text-green-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        {expired ? (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        ) : (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        )}
                      </svg>
                    </button>
                  </div>

                  {/* info produk */}
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <Link to={`/products/${product._id}`} className="flex-1">
                        <h3 className={`font-semibold group-hover:text-green-600 transition-colors duration-300 line-clamp-2 ${
                          expired ? 'text-gray-500' : 'text-gray-900'
                        }`}>
                          {product.name}
                        </h3>
                      </Link>
                    </div>

                    {/* Status expired info */}
                    {expired && (
                      <div className="text-xs text-red-600 font-semibold mb-2">
                        {getExpiredStatus(product.expiredDate)}
                      </div>
                    )}

                    {/* info penjual */}
                    <div className="flex items-center gap-2 mb-3">
                      <div className={`w-4 h-4 rounded-full ${expired ? 'bg-gray-300' : 'bg-green-500'}`}></div>
                      <span className={`text-sm ${expired ? 'text-gray-500' : 'text-gray-600'}`}>{product.sellerId?.name || 'Toko'}</span>
                    </div>

                    {/* Rating */}
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex items-center">
                        <svg className={`w-4 h-4 ${expired ? 'text-gray-400' : 'text-yellow-400'}`} fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span className={`text-sm ml-1 ${expired ? 'text-gray-500' : 'text-gray-600'}`}>{getAverageRating(product)}</span>
                      </div>
                      <span className={`text-sm ${expired ? 'text-gray-400' : 'text-gray-500'}`}>({product.reviews?.length || 0})</span>
                    </div>

                    {/* harga */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`text-lg font-bold ${expired ? 'text-gray-400' : 'text-green-600'}`}>
                          Rp{(product.discountPrice || product.price).toLocaleString()}
                        </span>
                        {product.originalPrice && (
                          <span className={`text-sm line-through ${expired ? 'text-gray-300' : 'text-gray-400'}`}>
                            Rp{product.originalPrice.toLocaleString()}
                          </span>
                        )}
                      </div>

                      {/* info stock */}
                      <div className={`text-xs font-medium ${
                        expired ? 'text-red-600' : product.stock > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {expired ? 'Kedaluwarsa' : product.stock > 0 ? `Stok: ${product.stock}` : 'Habis'}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}


      </div>
    </div>
  );
};

export default HomePage;
