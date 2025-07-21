import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useCartStore from '../stores/cartStore';
import useAuthStore from '../stores/authStore';
import api from '../utils/axios';

const CartPage = () => {
  const { items, updateItemQuantity, removeItem, getTotalPrice, clearCart, validateStock, refreshAllItems } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const [stockErrors, setStockErrors] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  // Refresh cart dengan data stok terbaru
  const handleRefreshCart = async () => {
    setRefreshing(true);
    try {
      const updatedItems = await Promise.all(
        items.map(async (item) => {
          try {
            const response = await api.get(`/products/${item._id}`);
            return { ...item, ...response.data };
          } catch (err) {
            console.error(`Error fetching product ${item._id}:`, err);
            return item;
          }
        })
      );
      
      refreshAllItems(updatedItems);
      
      // Cek stok errors
      const validation = validateStock();
      setStockErrors(validation.invalidItems);
      
    } catch (err) {
      console.error('Error refreshing cart:', err);
    } finally {
      setRefreshing(false);
    }
  };

  // Cek stok saat component mount
  useEffect(() => {
    const validation = validateStock();
    setStockErrors(validation.invalidItems);
  }, [items]);

  const handleCheckout = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    // Cek stok sebelum checkout
    const validation = validateStock();
    if (!validation.isValid) {
      alert(`Stok tidak mencukupi untuk produk: ${validation.invalidItems.map(item => item.name).join(', ')}`);
      return;
    }
    
    navigate('/checkout');
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-sm border-2 border-green-100 p-12 text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Keranjang Belanja Kosong</h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">Anda belum menambahkan produk ke keranjang belanja. Mulai berbelanja untuk menemukan makanan surplus berkualitas.</p>
            <Link
              to="/"
              className="inline-flex items-center bg-green-500 text-white font-medium px-6 py-3 rounded-lg hover:bg-green-600 transition shadow-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Jelajahi Produk
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Keranjang Belanja</h1>
          <p className="text-gray-600">Kelola produk yang akan Anda beli</p>
            </div>
            <button
              onClick={handleRefreshCart}
              disabled={refreshing}
              className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition disabled:opacity-50"
            >
              <svg className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {refreshing ? 'Memperbarui...' : 'Refresh Stok'}
            </button>
          </div>
          
          {/* Stock Error Messages */}
          {stockErrors.length > 0 && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-semibold text-red-800">Stok Tidak Mencukupi</span>
              </div>
              <ul className="text-red-700 text-sm space-y-1">
                {stockErrors.map((item, index) => (
                  <li key={index}>
                    • {item.name}: Stok tersedia {item.stock}, yang diminta {item.quantity}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Daftar Item */}
          <div className="lg:w-2/3">
            <div className="bg-white rounded-xl shadow-sm border-2 border-green-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-800">Item ({items.length})</h2>
                  <button 
                    onClick={() => clearCart()}
                    className="text-red-500 hover:text-red-700 text-sm font-medium flex items-center transition"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Kosongkan Keranjang
                  </button>
                </div>
              </div>
              
              <div className="divide-y divide-gray-100">
                {items.map((item) => (
                  <div key={item._id} className="p-6 flex items-center gap-4 hover:bg-gray-50 transition">
                    <div className="w-20 h-20 flex-shrink-0">
                      <img 
                        src={item.imageUrl || 'https://via.placeholder.com/150'} 
                        alt={item.name} 
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-800 text-lg mb-1 truncate">{item.name}</h3>
                      <p className="text-gray-500 text-sm mb-2">{item.sellerId?.name || 'Toko'}</p>
                      <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-green-600 font-bold text-lg">
                          Rp{(item.discountPrice || item.price).toLocaleString()}
                        </span>
                        {item.originalPrice && (
                          <span className="text-gray-400 text-sm line-through">
                            Rp{item.originalPrice.toLocaleString()}
                          </span>
                        )}
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          item.quantity > item.stock 
                            ? 'bg-red-100 text-red-700' 
                            : 'bg-green-100 text-green-700'
                        }`}>
                          Stok: {item.stock}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                        <button 
                          onClick={() => updateItemQuantity(item._id, item.quantity - 1)}
                          className="w-10 h-10 bg-gray-50 text-gray-600 flex items-center justify-center hover:bg-gray-100 transition"
                          disabled={item.quantity <= 1}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                          </svg>
                        </button>
                        <span className="w-12 h-10 bg-white flex items-center justify-center border-x border-gray-200 font-medium">
                          {item.quantity}
                        </span>
                        <button 
                          onClick={() => updateItemQuantity(item._id, item.quantity + 1)}
                          className="w-10 h-10 bg-gray-50 text-gray-600 flex items-center justify-center hover:bg-gray-100 transition"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                        </button>
                      </div>
                      
                      <button 
                        onClick={() => removeItem(item._id)}
                        className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Ringkasan */}
          <div className="lg:w-1/3">
            <div className="bg-white rounded-xl shadow-sm border-2 border-green-100 p-6 sticky top-24">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">Ringkasan Belanja</h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Harga ({items.length} item)</span>
                  <span className="font-semibold text-gray-800">Rp{getTotalPrice().toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Biaya Pengiriman</span>
                  <span className="font-semibold text-gray-800">Rp0</span>
                </div>
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-800">Total Tagihan</span>
                    <span className="text-2xl font-bold text-green-600">Rp{getTotalPrice().toLocaleString()}</span>
                  </div>
                </div>
              </div>
              
              <button
                onClick={handleCheckout}
                className="w-full bg-green-500 text-white font-semibold py-4 rounded-lg hover:bg-green-600 transition flex items-center justify-center gap-2 shadow-sm"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                Lanjut ke Pembayaran
              </button>
              
              <div className="mt-4 text-center">
                <Link to="/" className="text-green-600 hover:text-green-700 text-sm font-medium">
                  Lanjutkan Belanja
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage; 