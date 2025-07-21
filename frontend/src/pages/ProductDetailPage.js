import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useAuthStore from '../stores/authStore';
import useCartStore from '../stores/cartStore';
import api from '../utils/axios';


const ProductDetailPage = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const { addItem } = useCartStore();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [isVisible, setIsVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    setLoading(true);
    api.get(`/products/${productId}`)
      .then(res => {
        setProduct(res.data);
        setError(null);
      })
      .catch(() => {
        setProduct(null);
        setError('Produk tidak ditemukan');
      })
      .finally(() => setLoading(false));
  }, [productId]);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    const itemToAdd = {
      ...product,
      quantity: quantity
    };
    addItem(itemToAdd, quantity);
    // Produk berhasil ditambahkan ke keranjang
    alert(`${product.name} ditambahkan ke keranjang!`);
  };

  const handleBuyNow = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    const itemToAdd = {
      ...product,
      quantity: quantity
    };
    addItem(itemToAdd, quantity);
    navigate('/cart');
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getDiscountPercentage = () => {
    if (!product.discountPrice || !product.originalPrice) return 0;
    return Math.round((1 - product.discountPrice / product.originalPrice) * 100);
  };

  const getAverageRating = () => {
    if (!product.reviews || product.reviews.length === 0) return 0;
    const total = product.reviews.reduce((sum, review) => sum + review.rating, 0);
    return (total / product.reviews.length).toFixed(1);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      alert('Silakan login untuk memberikan ulasan!');
      navigate('/login');
      return;
    }
    if (!newReview.comment.trim()) {
      alert('Komentar tidak boleh kosong!');
      return;
    }
    setSubmittingReview(true);
    try {
      await api.post(`/products/${product._id}/reviews`, {
        userId: user._id,
        rating: newReview.rating,
        comment: newReview.comment
      });
      const response = await api.get(`/products/${product._id}`);
      setProduct(response.data);
      setNewReview({ rating: 5, comment: '' });
      alert('Ulasan berhasil ditambahkan!');
    } catch (err) {
      alert('Gagal menambah ulasan');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-100 via-white to-green-50 flex items-center justify-center">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-green-500/20 border-t-green-500 rounded-full animate-spin"></div>
          <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-green-400 rounded-full animate-spin" style={{ animationDelay: '0.5s' }}></div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-100 via-white to-green-50 flex items-center justify-center">
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-6 py-4 rounded-2xl backdrop-blur-xl">
          {error || 'Produk tidak ditemukan'}
        </div>
      </div>
    );
  }

  // Galeri gambar
  const mainImage = product.images && product.images.length > 0
    ? product.images[0]
    : (product.imageUrl || product.image || 'https://via.placeholder.com/400x400?text=Produk');

  // Pastikan checklist array
  let checklist = product.checklist;
  if (typeof checklist === 'string') {
    try { checklist = JSON.parse(checklist); } catch (e) { checklist = []; }
  }

  // Info tambahan dari produk seller
  const infoProduk = {
    foodStatus: product.foodStatus || '-',
    storage: product.storage || '-',
    suggestion: product.suggestion || '-',
    halal: product.halal || '-',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100 text-gray-900">
      <div className="container mx-auto px-2 py-8 max-w-5xl">
        {/* HERO PRODUK + INFO GABUNGAN */}
        <div className="flex flex-col md:flex-row gap-6 md:gap-10 mb-6 md:items-start animate-fade-in">
          {/* Gambar utama */}
          <div className="flex-1 flex flex-col items-center md:items-start">
            <div className="relative w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl border-4 border-green-100 bg-white group">
              <img 
                src={mainImage} 
                alt={product.name} 
                className="w-full h-[340px] object-cover object-center transition-transform duration-500 group-hover:scale-105"
                style={{ aspectRatio: '1/1' }}
              />
              {/* Badge Diskon */}
              {product.discountPrice && (
                <span className="absolute top-4 left-4 bg-gradient-to-r from-red-500 to-yellow-400 text-white text-lg font-bold px-5 py-2 rounded-full shadow-lg animate-pulse">
                  -{getDiscountPercentage()}%
                </span>
              )}
              {/* Badge Kategori */}
              <span className="absolute top-4 right-4 bg-green-100 text-green-700 text-xs font-bold px-4 py-1 rounded-full shadow">
                {product.category?.replace('-', ' ').toUpperCase() || 'PRODUK'}
              </span>
            </div>
            {/* Thumbnail Images */}
            {product.images && product.images.length > 1 && (
              <div className="flex gap-2 mt-4">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`w-14 h-14 rounded-xl overflow-hidden border-2 transition-all duration-300 ${selectedImage === idx ? 'border-green-500 scale-110' : 'border-green-100 hover:border-green-300'}`}
                  >
                    <img src={img} alt={product.name + ' ' + (idx + 1)} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
            {/* Card Aksi Pembelian */}
            <div className="w-full mt-4 animate-fade-in">
              <div className="bg-white rounded-3xl shadow-2xl border-2 border-green-100 p-6 flex flex-col gap-4">
                                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <label className="text-gray-700 font-semibold text-sm">Jumlah:</label>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="w-8 h-8 bg-white border border-green-200 rounded-lg flex items-center justify-center hover:bg-green-50 transition-colors duration-300 shadow"
                      >
                        <svg className="w-4 h-4 text-green-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                        </svg>
                      </button>
                      <span className="text-lg font-bold text-gray-900 min-w-[2rem] text-center">{quantity}</span>
                      <button 
                        onClick={() => setQuantity(Math.min(product.stock || 0, quantity + 1))}
                        disabled={quantity >= (product.stock || 0)}
                        className={`w-8 h-8 border rounded-lg flex items-center justify-center transition-colors duration-300 shadow ${
                          quantity >= (product.stock || 0) 
                            ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed' 
                            : 'bg-white border-green-200 hover:bg-green-50 text-green-700'
                        }`}
                      >
                        <svg className="w-4 h-4 text-green-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <span className="text-sm text-gray-500">
                    Stok: {product.stock || 0}
                  </span>
                </div>
                <button
                  onClick={handleAddToCart}
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-3 px-4 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-green-500/25 flex items-center justify-center gap-2 text-sm shadow-lg"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  Tambah ke Keranjang
                </button>
                <button
                  onClick={handleBuyNow}
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold py-3 px-4 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/25 flex items-center justify-center gap-2 text-sm shadow-lg"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Beli Sekarang
                </button>
              </div>
            </div>
            {/* Info Penjual & Lokasi Toko */}
            <div className="w-full mt-4 animate-fade-in">
              <div className="bg-white rounded-3xl shadow-2xl border-2 border-green-100 p-6 md:p-8 flex flex-col gap-4">
                <h3 className="text-lg font-bold text-green-700 mb-2 flex items-center gap-2">
                  <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7V6a2 2 0 012-2h14a2 2 0 012 2v1M3 7l1.553 9.32A2 2 0 006.53 18h10.94a2 2 0 001.977-1.68L21 7M3 7h18" /></svg>
                  Info Toko Penjual
                </h3>
                <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {/* Foto toko bulat jika ada, fallback ke icon toko */}
                      {product.sellerId?.photo ? (
                        <img
                          src={product.sellerId.photo}
                          alt={product.sellerId.name}
                          className="w-10 h-10 rounded-full object-cover border-2 border-green-200 shadow"
                        />
                      ) : (
                        <svg className="w-8 h-8 text-green-600 bg-green-100 rounded-full p-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7V6a2 2 0 012-2h14a2 2 0 012 2v1M3 7l1.553 9.32A2 2 0 006.53 18h10.94a2 2 0 001.977-1.68L21 7M3 7h18" /></svg>
                      )}
                      <span className="font-semibold text-green-800">Toko:</span>
                      {product.sellerId?.name ? (
                        <span
                          className="text-green-600 font-bold text-base flex items-center gap-1"
                        >
                          {product.sellerId.name}
                        </span>
                      ) : (
                        <span className="text-gray-700">-</span>
                      )}
                    </div>
                    {/* Alamat dan Lihat di Peta, lebih simetris */}
                    <div className="flex flex-col gap-1 mb-2">
                      <div className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-blue-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 12.414a2 2 0 00-2.828 0l-4.243 4.243m6.364-6.364A4 4 0 1112 20a4 4 0 010-8z" /></svg>
                        <span className="font-semibold text-green-800">Alamat:</span>
                        <span className="text-gray-700">{product.sellerId?.address || '-'}</span>
                      </div>
                      {product.sellerId?.address && (
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(product.sellerId.address)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-blue-600 hover:underline text-sm font-medium mt-1 ml-7"
                        >
                          <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A2 2 0 013 15.382V6a2 2 0 012-2h14a2 2 0 012 2v9.382a2 2 0 01-1.553 1.894L15 20v-2a2 2 0 00-2-2h-2a2 2 0 00-2 2v2z" /></svg>
                          Lihat di Peta
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* CARD BESAR: Info produk + deskripsi + nutrisi + info tambahan */}
          <div className="flex-1">
            <div className="bg-white rounded-3xl shadow-2xl border-2 border-green-100 p-6 md:p-8 flex flex-col gap-4">
              {/* Nama, harga, rating, stok, expired */}
              <div className="flex flex-col md:flex-row md:items-end gap-2 md:gap-6">
                <div className="flex-1">
                  <h1 className="text-2xl md:text-3xl font-extrabold text-green-800 mb-1 flex items-center gap-2">
                    {product.name}
                    {product.discountPrice && (
                      <span className="bg-red-100 text-red-600 text-xs font-bold px-3 py-1 rounded-full ml-2">Diskon</span>
                    )}
                  </h1>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex items-center">
                      {[1,2,3,4,5].map((star) => (
                        <svg
                          key={star}
                          className={`w-5 h-5 ${star <= Math.round(getAverageRating()) ? 'text-yellow-400' : 'text-gray-300'}`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                      <span className="text-sm text-gray-600 font-semibold ml-1">{getAverageRating()}</span>
                    </div>
                    <span className="text-xs text-gray-500">({product.reviews?.length || 0} ulasan)</span>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-2">
                    <span className="inline-block bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs font-semibold border border-green-200">Stok: {product.stock}</span>
                    <span className="inline-block bg-yellow-50 text-yellow-700 px-3 py-1 rounded-full text-xs font-semibold border border-yellow-200">Expired: {formatDate(product.expiredDate)}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-2xl md:text-3xl font-bold text-green-600">Rp{(product.discountPrice || product.price).toLocaleString()}</span>
                  {product.originalPrice && (
                    <span className="text-base text-gray-400 line-through">Rp{product.originalPrice.toLocaleString()}</span>
                  )}
                </div>
              </div>
              {/* Deskripsi */}
              <div className="text-gray-800 leading-relaxed text-base md:text-lg tracking-wide whitespace-pre-line break-words">
                <h3 className="text-lg font-bold text-green-700 mb-1">Deskripsi</h3>
                {showFullDescription || !product.description || product.description.length < 300
                  ? <span>{product.description}</span>
                  : (
                    <>
                      <span>{product.description.slice(0, 300)}</span>...
                      <button className="text-green-600 hover:underline ml-2 text-sm font-semibold" onClick={() => setShowFullDescription(true)}>Lihat Selengkapnya</button>
                    </>
                  )}
              </div>
              {/* Nutrisi & Bahan */}
              {/* Bagian Waktu Produksi dan Informasi Nutrisi dihapus */}
              {/* Info Tambahan */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                <div>
                  <h4 className="font-semibold text-green-700 mb-1">Status Makanan</h4>
                  <div className="text-gray-700 text-sm">{infoProduk.foodStatus}</div>
                </div>
                <div>
                  <h4 className="font-semibold text-green-700 mb-1">Label</h4>
                  <div className="text-gray-700 text-sm">{infoProduk.halal}</div>
                </div>
                <div>
                  <h4 className="font-semibold text-green-700 mb-1">Cara Penyimpanan</h4>
                  <div className="text-gray-700 text-sm">{infoProduk.storage}</div>
                </div>
                <div>
                  <h4 className="font-semibold text-green-700 mb-1">Saran Konsumsi</h4>
                  <div className="text-gray-700 text-sm">{infoProduk.suggestion}</div>
                </div>
              </div>
            </div>
            {/* EDUKASI FOODWASTE */}
            <div className="w-full mt-4 animate-fade-in">
              <div className="relative flex flex-col md:flex-row items-center gap-6 p-6 rounded-3xl shadow-2xl border-2 border-green-200 bg-gradient-to-br from-green-50 via-white to-yellow-50 overflow-hidden">
                {/* Icon/Ilustrasi */}
                <div className="flex-shrink-0 flex flex-col items-center justify-center">
                  <div className="w-20 h-20 md:w-28 md:h-28 rounded-full bg-gradient-to-br from-green-400 to-yellow-300 flex items-center justify-center shadow-lg mb-2">
                    <svg className="w-12 h-12 md:w-16 md:h-16 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </div>
                  <span className="text-xs text-green-700 font-semibold mt-1">#FoodRescue</span>
                </div>
                {/* Edukasi & Motivasi */}
                <div className="flex-1 flex flex-col gap-3">
                  <div className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-white/80 border border-yellow-200 text-yellow-800 font-semibold text-base shadow animate-slide-in-up">
                    <svg className="w-6 h-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <span>Makanan ini <b>masih layak konsumsi</b> dan sudah dicek penjual.</span>
                  </div>
                  <div className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-green-100 via-green-50 to-green-200 border border-green-200 text-green-900 font-semibold text-base shadow animate-slide-in-up" style={{ animationDelay: '100ms' }}>
                    <svg className="w-6 h-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    <span>Beli makanan surplus = <b>ikut selamatkan bumi</b> & bantu kurangi food waste!</span>
                  </div>
                  <div className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 font-semibold text-base shadow animate-slide-in-up" style={{ animationDelay: '200ms' }}>
                    <svg className="w-6 h-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <span><b>Konsumsi segera</b> setelah pembelian untuk kualitas terbaik.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* ULASAN PEMBELI */}
        <div className="mb-6 animate-fade-in">
          <div className="bg-green-50/80 backdrop-blur-xl rounded-3xl p-8 border border-green-200 shadow-xl">
            <h3 className="text-2xl font-bold text-green-700 mb-8 flex items-center gap-2">
              <svg className="w-7 h-7 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              Ulasan Pembeli
              <span className="ml-2 bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm font-semibold">{product.reviews?.length || 0} ulasan</span>
            </h3>
            {/* Form Ulasan */}
            <form onSubmit={handleReviewSubmit} className="mb-10 bg-green-100/70 rounded-2xl p-6 flex flex-col md:flex-row gap-4 items-center border border-green-200 shadow">
              <div className="flex items-center gap-2">
                <span className="text-green-700 font-semibold">Rating:</span>
                {[1,2,3,4,5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setNewReview((r) => ({ ...r, rating: star }))}
                    className="focus:outline-none"
                  >
                    <svg
                      className={`w-6 h-6 ${star <= newReview.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </button>
                ))}
              </div>
              <textarea
                className="flex-1 px-4 py-2 rounded-lg border border-green-100 bg-white/80 text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-400"
                placeholder="Tulis ulasan Anda..."
                value={newReview.comment}
                onChange={e => setNewReview((r) => ({ ...r, comment: e.target.value }))}
                rows={2}
                required
                disabled={submittingReview}
              />
              <button
                type="submit"
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold px-6 py-2 rounded-lg transition-all duration-300 shadow-lg"
                disabled={submittingReview}
              >
                {submittingReview ? 'Mengirim...' : 'Kirim Ulasan'}
              </button>
            </form>
            <div className="space-y-6">
              {product.reviews && product.reviews.length > 0 ? product.reviews.map((review, idx) => (
                <div key={review.id || idx} className="bg-white/70 rounded-2xl p-6 border-2 border-green-100 shadow flex flex-col md:flex-row gap-4 items-start">
                  <div className="flex items-center gap-3 mb-2 md:mb-0">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold">{typeof review.user === 'string' ? review.user.charAt(0) : (review.user?.name?.charAt(0) || 'U')}</span>
                    </div>
                    <div>
                      <div className="text-green-700 font-semibold">{typeof review.user === 'string' ? review.user : (review.user?.name || 'User')}</div>
                      <div className="text-gray-400 text-sm">{review.date ? formatDate(review.date) : '-'}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 mb-2 md:mb-0">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg
                        key={star}
                        className={`w-5 h-5 ${star <= review.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-gray-700 leading-relaxed flex-1">{review.comment}</p>
                </div>
              )) : (
                <div className="text-gray-400 text-center py-8">Belum ada ulasan untuk produk ini.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage; 