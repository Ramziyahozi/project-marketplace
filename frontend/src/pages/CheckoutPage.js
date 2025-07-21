import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/axios';
import useCartStore from '../stores/cartStore';
import useAuthStore from '../stores/authStore';

const CheckoutPage = () => {
  const { items, getTotalPrice, clearCart, validateStock, refreshAllItems } = useCartStore();
  const { user, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    deliveryMethod: 'cod',
    pickupTime: 'siang',
    notes: '',
  });
  const [justCheckedOut, setJustCheckedOut] = useState(false);
  const [adjustedItems, setAdjustedItems] = useState([]); // Item yang sudah disesuaikan


  // Redirect jika belum login atau keranjang kosong
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    if (items.length === 0 && !justCheckedOut) {
      navigate('/cart');
      return;
    }
    
    // Isi otomatis data user ke form
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || '',
        phone: user.phone || '',
        address: user.address || '',
      }));
    }
    
    // Inisialisasi adjustedItems
    setAdjustedItems(items);
  }, [isAuthenticated, items.length, navigate, user, justCheckedOut, items]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  // Cek apakah id adalah ObjectId
  function isObjectId(id) {
    return /^[a-f\d]{24}$/i.test(id);
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      // Refresh data produk untuk stok terbaru
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
      
      // Update cart dengan stok terbaru
      const adjustedItems = updatedItems.map(item => {
        if (item.quantity > item.stock) {
          if (item.stock === 0) {
            // Hapus item yang stoknya 0
            return null;
          } else {
            // Jika stok tidak cukup, sesuaikan quantity
            return { ...item, quantity: item.stock };
          }
        }
        return item;
      }).filter(item => item !== null); // Hapus item yang null
      
      // Update cart dengan item yang sudah disesuaikan
      refreshAllItems(adjustedItems);
      setAdjustedItems(adjustedItems); // Update state untuk order summary
      
      // Jika cart kosong setelah penyesuaian
      if (adjustedItems.length === 0) {
        setError('Semua produk di keranjang sudah habis stok. Silakan pilih produk lain.');
        setLoading(false);
        return;
      }
      
      // Beritahu user jika ada penyesuaian quantity
      const adjustedItemsCount = adjustedItems.length;
      const originalItemsCount = items.length;
      if (adjustedItemsCount < originalItemsCount) {
        setError('Beberapa produk sudah habis stok dan telah dihapus dari keranjang.');
        setLoading(false);
        return;
      }
      
      // Cek apakah ada quantity yang disesuaikan
      const hasQuantityAdjustment = adjustedItems.some(item => {
        const originalItem = items.find(orig => orig._id === item._id);
        return originalItem && originalItem.quantity !== item.quantity;
      });
      
      if (hasQuantityAdjustment) {
        setError('Quantity beberapa produk telah disesuaikan dengan stok yang tersedia.');
        setLoading(false);
        return;
      }
      
      // Validasi stok sebelum checkout
      const stockValidation = validateStock();
      if (!stockValidation.isValid) {
        setError(`Stok tidak mencukupi untuk produk: ${stockValidation.invalidItems.map(item => item.name).join(', ')}`);
        setLoading(false);
        return;
      }
    
    // Validasi: hanya produk dari database
      const invalidItems = adjustedItems.filter(item => !isObjectId(item._id));
    if (invalidItems.length > 0) {
      setError('Produk "' + invalidItems[0].name + '" belum tersedia di sistem. Tidak bisa diproses checkout.');
      setLoading(false);
      return;
    }
    
      // Buat order untuk setiap item
      const orderPromises = adjustedItems.map(item => {
        const orderData = {
          buyerId: user._id,
          productId: item._id,
          quantity: item.quantity,
          deliveryMethod: formData.deliveryMethod,
          ...(formData.deliveryMethod === 'cod' ? { pickupTime: formData.pickupTime } : {}),
          ...(formData.deliveryMethod === 'delivery' ? { 
            deliveryAddress: formData.address,
            deliveryFee: 10000, // Hardcoded delivery fee
          } : {}),
          notes: formData.notes,
          paymentMethod: 'gopay',
          status: 'processing_payment',
        };
        return api.post('/orders', orderData);
      });
      
      const responses = await Promise.all(orderPromises);
      // Ambil semua orderId dari response
      const orderIds = responses.map(res => res.data._id).filter(Boolean);
      setJustCheckedOut(true);
      clearCart();
      // Pesanan berhasil dibuat
      if (orderIds.length > 0) {
        // Redirect ke halaman sukses
        navigate('/order-success');
        return;
      } else {
        navigate('/order-success');
      }
    } catch (err) {
      console.error('Checkout error:', err);
      if (err.message.includes('Stok tidak mencukupi')) {
        setError(err.message);
      } else {
      setError('Terjadi kesalahan saat checkout. Silakan coba lagi.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    try {
      // Data order real
      const orderId = "ORDER-" + Date.now();
      const grossAmount = getTotalPrice() + deliveryFee;
      const customerName = user?.name || "";
      const customerEmail = user?.email || "";

      // 1. Minta snap token ke backend
      const res = await api.post('/payments/create-transaction', {
        orderId,
        grossAmount,
        customerName,
        customerEmail,
      });
      const snapToken = res.data.token;

      // 2. Panggil Snap Midtrans
      window.snap.pay(snapToken, {
        onSuccess: async function(result) {
          try {
            // Buat order untuk setiap item di keranjang
            for (const item of items) {
              await api.post('/orders', {
                buyerId: user._id,
                productId: item._id,
                quantity: item.quantity,
                deliveryMethod: formData.deliveryMethod,
                pickupTime: formData.pickupTime,
                deliveryAddress: formData.address,
                deliveryFee: deliveryFee,
                notes: formData.notes,
                paymentMethod: 'midtrans',
                status: 'pending'
              });
            }
            clearCart();
            navigate('/order-success');
          } catch (err) {
            alert('Pembayaran berhasil, tapi gagal membuat order: ' + (err.response?.data?.error || err.message));
          }
        },
        onPending: function(result){ alert("Menunggu pembayaran!"); },
        onError: function(result){ alert("Pembayaran gagal!"); },
        onClose: function(){ alert("Kamu menutup popup tanpa menyelesaikan pembayaran"); }
      });
    } catch (err) {
      alert('Gagal memulai pembayaran: ' + (err.response?.data?.error || err.message));
    }
  };


  const deliveryFee = formData.deliveryMethod === 'delivery' ? 10000 : 0;
  const totalAmount = getTotalPrice() + deliveryFee;

  // Fungsi untuk hitung total dari adjustedItems
  const getAdjustedTotalPrice = () => {
    return adjustedItems.reduce((total, item) => {
      return total + ((item.discountPrice || item.price) * item.quantity);
    }, 0);
  };

  const adjustedTotalAmount = getAdjustedTotalPrice() + deliveryFee;

  return (
    <div className="container mx-auto px-2 py-4">

      <h1 className="text-lg font-bold text-gray-800 mb-3">Checkout</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-2 py-2 rounded mb-2 text-xs">
          {error}
        </div>
      )}
      
      <div className="flex flex-col lg:flex-row gap-2">
        {/* Form */}
        <div className="lg:w-2/3">
          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-4 border-2 border-green-100 overflow-y-auto max-h-[80vh]">
            <h2 className="text-base font-semibold mb-2">Informasi Pengiriman</h2>
            
            <div className="space-y-2">
              <div>
                <label className="block text-gray-700 mb-1 text-xs">Nama Penerima</label>
                <input 
                  type="text" 
                  name="name" 
                  value={formData.name} 
                  onChange={handleChange} 
                  className="w-full px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-green-300 text-xs h-8" 
                  required 
                />
              </div>
              
              <div>
                <label className="block text-gray-700 mb-1 text-xs">Nomor Telepon</label>
                <input 
                  type="tel" 
                  name="phone" 
                  value={formData.phone} 
                  onChange={handleChange} 
                  className="w-full px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-green-300 text-xs h-8" 
                  required 
                />
              </div>
              
              <div>
                <label className="block text-gray-700 mb-1 text-xs">Alamat Lengkap</label>
                <textarea 
                  name="address" 
                  value={formData.address} 
                  onChange={handleChange} 
                  className="w-full px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-green-300 text-xs" 
                  rows="2"
                  required={formData.deliveryMethod === 'delivery'}
                />
              </div>
              
              <div>
                <label className="block text-gray-700 mb-1 text-xs">Metode Pengambilan</label>
                <div className="flex space-x-2">
                  <label className="flex items-center text-xs">
                    <input 
                      type="radio" 
                      name="deliveryMethod" 
                      value="cod" 
                      checked={formData.deliveryMethod === 'cod'} 
                      onChange={handleChange} 
                      className="mr-1" 
                    />
                    Ambil Sendiri (COD)
                  </label>
                  <label className="flex items-center text-xs">
                    <input 
                      type="radio" 
                      name="deliveryMethod" 
                      value="delivery" 
                      checked={formData.deliveryMethod === 'delivery'} 
                      onChange={handleChange} 
                      className="mr-1" 
                    />
                    Pengiriman
                  </label>
                </div>
              </div>
              
              {formData.deliveryMethod === 'cod' && (
                <div>
                  <label className="block text-gray-700 mb-1 text-xs">Waktu Pengambilan</label>
                  <select 
                    name="pickupTime" 
                    value={formData.pickupTime} 
                    onChange={handleChange} 
                    className="w-full px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-green-300 text-xs h-8"
                  >
                    <option value="pagi">Pagi (08:00 - 11:00)</option>
                    <option value="siang">Siang (11:00 - 14:00)</option>
                    <option value="sore">Sore (14:00 - 17:00)</option>
                    <option value="malam">Malam (17:00 - 20:00)</option>
                  </select>
                </div>
              )}
              
              <div>
                <label className="block text-gray-700 mb-1 text-xs">Catatan (opsional)</label>
                <textarea 
                  name="notes" 
                  value={formData.notes} 
                  onChange={handleChange} 
                  className="w-full px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-green-300 text-xs" 
                  rows="1"
                />
              </div>
            </div>
            <button
              type="button"
              onClick={handlePayment}
              className="w-full bg-green-500 text-white font-semibold py-2 rounded-lg hover:bg-green-600 transition mt-4 text-xs"
            >
              Bayar dengan Midtrans
            </button>
          </form>
        </div>
        
        {/* Order Summary */}
        <div className="lg:w-1/3">
          <div className="bg-white rounded-lg shadow-md p-4 border-2 border-green-100 sticky top-24">
            <h2 className="text-base font-semibold mb-2">Ringkasan Pesanan</h2>
            
            {/* Pesan jika ada penyesuaian */}
            {adjustedItems.length < items.length && (
              <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-3 py-2 rounded mb-3 text-xs">
                ⚠️ Beberapa produk sudah habis stok dan telah dihapus dari keranjang.
              </div>
            )}
            
            {adjustedItems.some(item => {
              const originalItem = items.find(orig => orig._id === item._id);
              return originalItem && originalItem.quantity !== item.quantity;
            }) && (
              <div className="bg-blue-50 border border-blue-200 text-blue-700 px-3 py-2 rounded mb-3 text-xs">
                ℹ️ Quantity beberapa produk telah disesuaikan dengan stok yang tersedia.
              </div>
            )}
            
            <div className="space-y-2 mb-3">
              {adjustedItems.map((item) => (
                <div key={item._id} className="flex justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-xs">{item.name}</p>
                    <p className="text-xs text-gray-500">{item.quantity} x Rp{(item.discountPrice || item.price).toLocaleString()}</p>
                  </div>
                  <span className="font-medium text-xs">
                    Rp{((item.discountPrice || item.price) * item.quantity).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
            
            <div className="border-t pt-2 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600 text-xs">Subtotal</span>
                <span className="font-medium text-xs">Rp{getAdjustedTotalPrice().toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 text-xs">Biaya Pengiriman</span>
                <span className="font-medium text-xs">Rp{deliveryFee.toLocaleString()}</span>
              </div>
              <div className="border-t pt-2 flex justify-between font-bold text-xs">
                <span>Total</span>
                <span className="text-green-600">Rp{adjustedTotalAmount.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage; 