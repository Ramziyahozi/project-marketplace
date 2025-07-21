import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../stores/authStore';
import GoogleMapsPicker from '../components/GoogleMapsPicker';
import api from '../utils/axios';
import ProductForm from '../components/ProductForm';

const SellerDashboardPage = () => {
  const { user, isAuthenticated, logout, updateUser } = useAuthStore();
  const navigate = useNavigate();
  const [showAddModal, setShowAddModal] = useState(false);
  // templete autofill
  const autofillTemplates = {
    'roti': {
      foodStatus: 'Layak konsumsi',
      storage: 'Simpan di suhu ruang, tutup rapat',
      suggestion: 'Sebaiknya dikonsumsi dalam 1 hari setelah pembelian',
      halal: 'Halal',
    },
    'buah': {
      foodStatus: 'Layak konsumsi',
      storage: 'Simpan di kulkas',
      suggestion: 'Sebaiknya dikonsumsi dalam 1 hari setelah pembelian',
      halal: 'Halal',
    },
    'sayuran': {
      foodStatus: 'Layak konsumsi',
      storage: 'Simpan di kulkas',
      suggestion: 'Sebaiknya dikonsumsi dalam 2 hari setelah pembelian',
      halal: 'Halal',
    },
    'minuman': {
      foodStatus: 'Layak konsumsi',
      storage: 'Simpan di kulkas',
      suggestion: 'Sebaiknya dikonsumsi dalam 1 hari setelah pembelian',
      halal: 'Halal',
    },
    'camilan': {
      foodStatus: 'Layak konsumsi',
      storage: 'Simpan di suhu ruang',
      suggestion: 'Sebaiknya dikonsumsi sebelum expired',
      halal: 'Halal',
    },
    'makanan-pokok': {
      foodStatus: 'Layak konsumsi',
      storage: 'Simpan di suhu ruang',
      suggestion: 'Sebaiknya dikonsumsi dalam 1 hari setelah pembelian',
      halal: 'Halal',
    },
  };

  // State produk baru
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    expiredDate: '',
    category: '',
    image: null,
    foodStatus: '',
    storage: '',
    suggestion: '',
    halal: '',
  });
  const [preview, setPreview] = useState('');
  const [addError, setAddError] = useState('');
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editProduct, setEditProduct] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');
        const [orderLoading, setOrderLoading] = useState(false);
      const [orderError, setOrderError] = useState('');
      const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'produk'
      
      // Cek pesanan baru
      useEffect(() => {
        if (orders.length > 0) {
          const newOrders = orders.filter(order => order.status === 'pending');
          if (newOrders.length > 0) {
            console.log(`Anda memiliki ${newOrders.length} pesanan baru yang menunggu diproses.`);
          }
        }
      }, [orders]);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'penjual') {
      navigate('/profile');
      return;
    }
    fetchAllData();
  }, [isAuthenticated, user]);

  const fetchAllData = async () => {
    setLoading(true);
    setError('');
    try {
      const [productRes, orderRes] = await Promise.all([
        api.get(`/products?sellerId=${user._id}`),
        api.get(`/orders?sellerId=${user._id}`)
      ]);
      setProducts(productRes.data);
      setOrders(orderRes.data);
    } catch (err) {
      setError('Gagal memuat data dashboard');
      setProducts([]);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  // Statistik
  const totalProducts = products.length;
  const totalOrders = orders.length;
  const totalSales = orders
    .filter(o => o.status === 'picked_up' || o.status === 'delivered')
    .reduce((sum, o) => sum + ((o.productId?.discountPrice || o.productId?.price || 0) * o.quantity), 0);
  // Pelanggan baru dihilangkan/dibuat 0

  // Hitung diskon otomatis
  function getDiscountPercent(expiredDate) {
    const now = new Date();
    const exp = new Date(expiredDate);
    const diffDays = Math.ceil((exp - now) / (1000 * 60 * 60 * 24));
    if (diffDays < 1) return 60;
    if (diffDays < 2) return 55;
    if (diffDays < 3) return 50;
    if (diffDays < 4) return 45;
    if (diffDays < 5) return 40;
    if (diffDays < 7) return 35;
    return 30;
  }

  // Tambah produk
  const handleAddProduct = async (e) => {
    e.preventDefault();
    setAddError('');
    if (!newProduct.name || !newProduct.price || !newProduct.stock || !newProduct.expiredDate || !newProduct.category) {
      setAddError('Semua field wajib diisi');
      return;
    }
    try {
      const discountPercent = getDiscountPercent(newProduct.expiredDate);
      const price = parseInt(newProduct.price);
      const discountPrice = Math.round(price * (1 - discountPercent / 100));
      const formData = new FormData();
      formData.append('name', newProduct.name);
      formData.append('description', newProduct.description);
      formData.append('price', price);
      formData.append('discountPrice', discountPrice);
      formData.append('originalPrice', price);
      formData.append('stock', parseInt(newProduct.stock));
      formData.append('expiredDate', newProduct.expiredDate);
      formData.append('category', newProduct.category);
      formData.append('isAvailable', true);
      formData.append('sellerId', user._id);
      if (newProduct.image) formData.append('image', newProduct.image);
      formData.append('foodStatus', newProduct.foodStatus || '');
      formData.append('storage', newProduct.storage || '');
      formData.append('suggestion', newProduct.suggestion || '');
      formData.append('halal', newProduct.halal || '');
      await api.post('/products', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setShowAddModal(false);
      setNewProduct({ name: '', description: '', price: '', stock: '', expiredDate: '', category: '', image: null, foodStatus: '', storage: '', suggestion: '', halal: '' });
      setPreview('');
      fetchAllData();
      // Notifikasi produk ditambahkan (dihapus karena fungsi tidak ada)
      console.log(`Produk "${newProduct.name}" berhasil ditambahkan ke toko Anda.`);
    } catch (err) {
      setAddError('Gagal menambah produk');
    }
  };

  // Autofill produk
  const handleAutofill = (name, category) => {
    let template = null;
    if (category && autofillTemplates[category]) {
      template = autofillTemplates[category];
    } else if (name) {
      const lower = name.toLowerCase();
      if (lower.includes('roti')) template = autofillTemplates['roti'];
      else if (lower.includes('buah')) template = autofillTemplates['buah'];
      else if (lower.includes('sayur')) template = autofillTemplates['sayuran'];
      else if (lower.includes('minum')) template = autofillTemplates['minuman'];
      else if (lower.includes('camilan')) template = autofillTemplates['camilan'];
      else if (lower.includes('nasi') || lower.includes('ayam') || lower.includes('bakso')) template = autofillTemplates['makanan-pokok'];
    }
    if (template) {
      setNewProduct((prev) => ({
        ...prev,
        foodStatus: template.foodStatus,
        storage: template.storage,
        suggestion: template.suggestion,
        halal: template.halal,
      }));
    }
  };

  // Input produk
  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'image' && files && files[0]) {
      setNewProduct((f) => ({ ...f, image: files[0] }));
      setPreview(URL.createObjectURL(files[0]));
    } else {
      setNewProduct((f) => ({ ...f, [name]: value }));
      if (name === 'name' || name === 'category') {
        handleAutofill(name === 'name' ? value : newProduct.name, name === 'category' ? value : newProduct.category);
      }
    }
  };

  // Hapus produk
  const handleDeleteProduct = async (_id) => {
    if (!window.confirm('Yakin ingin menghapus produk ini?')) return;
    try {
      await api.delete(`/products/${_id}`);
      fetchAllData();
    } catch (err) {
      alert('Gagal menghapus produk');
    }
  };

  // Edit produk
  const openEditModal = (product) => {
    setEditProduct(product);
    setShowEditModal(true);
  };
  const closeEditModal = () => {
    setShowEditModal(false);
    setEditProduct(null);
    setEditError('');
  };
  const handleEditSubmit = async (formData) => {
    setEditLoading(true);
    setEditError('');
    if (!editProduct) {
      setEditError('Produk tidak valid');
      setEditLoading(false);
      return;
    }
    try {
      const productId = editProduct._id;
      await api.put(`/products/${productId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      closeEditModal();
      fetchAllData();
    } catch (err) {
      setEditError('Gagal update produk');
    } finally {
      setEditLoading(false);
    }
  };

  // Ubah status pesanan
  const handleOrderStatusChange = async (orderId, newStatus) => {
    setOrderLoading(true);
    setOrderError('');
    try {
      await api.put(`/orders/${orderId}/status`, { status: newStatus });
      fetchAllData();
    } catch (err) {
      setOrderError('Gagal update status pesanan');
    } finally {
      setOrderLoading(false);
    }
  };

  // Ubah status pengiriman (khusus delivery)
  const handleDeliveryStatusChange = async (orderId, newStatus) => {
    setOrderLoading(true);
    setOrderError('');
    try {
      await api.put(`/orders/${orderId}/delivery-status`, { deliveryStatus: newStatus });
      fetchAllData();
    } catch (err) {
      setOrderError('Gagal update status pengiriman');
    } finally {
      setOrderLoading(false);
    }
  };

  // Hapus pesanan
  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm('Yakin ingin menghapus pesanan ini?')) return;
    setOrderLoading(true);
    setOrderError('');
    try {
      await api.delete(`/orders/${orderId}`);
      fetchAllData();
    } catch (err) {
      setOrderError('Gagal menghapus pesanan');
    } finally {
      setOrderLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <div className="text-lg font-bold mb-2">{error}</div>
          <button onClick={fetchAllData} className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-6 rounded transition">Coba Lagi</button>
        </div>
      </div>
    );
  }

  if (user?.store && user.store.status !== 'approved') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white rounded-lg shadow p-8 text-center max-w-md mx-auto">
          <div className="text-lg font-bold mb-2 text-green-700">Toko Anda Belum Di-ACC Admin</div>
          <div className="text-gray-700 mb-4">Toko Anda masih menunggu persetujuan admin. Anda akan bisa mulai berjualan setelah toko di-ACC.</div>
          <div className="mb-2"><span className="font-semibold">Status Toko:</span> <span className="text-yellow-700 font-bold uppercase">{user.store.status}</span></div>
          <div className="mb-2"><span className="font-semibold">Nama Toko:</span> {user.store.name}</div>
          <div className="mb-2"><span className="font-semibold">Alamat:</span> {user.store.address}</div>
          <button className="mt-4 bg-gray-200 text-gray-700 font-semibold py-2 px-6 rounded transition" onClick={() => navigate('/profile')}>Kembali ke Profil</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <aside className="w-56 bg-white border-r flex flex-col py-4 px-2">
        <div className="mb-4 flex items-center gap-2">
          <span className="text-green-600 font-bold text-xl">Surplus</span>
          <span className="text-green-800 font-bold text-xl">Food</span>
        </div>
        <nav className="flex-1 space-y-1">
          <button
            className={`block py-1 px-2 rounded-lg text-xs w-full text-left font-semibold ${activeTab === 'dashboard' ? 'bg-green-100 text-green-700' : 'hover:bg-green-50 text-gray-700'}`}
            onClick={() => setActiveTab('dashboard')}
          >
            Dashboard
          </button>
          {/* Hapus menu Produk */}
          <Link to="/store-profile" className="block py-1 px-2 rounded-lg hover:bg-green-50 text-xs">Profil Toko</Link>
          <button
            className="block py-1 px-2 rounded-lg hover:bg-yellow-50 text-yellow-700 font-semibold w-full text-left text-xs"
            onClick={async () => {
              // Switch ke pembeli
              if (user) {
                try {
                  const response = await api.put(`/users/${user._id}`, { ...user, role: 'pembeli', store: undefined });
                  localStorage.setItem('user', JSON.stringify(response.data));
                  updateUser(response.data);
                  navigate('/profile');
                } catch (err) {
                  alert('Gagal switch ke pembeli');
                }
              }
            }}
          >
            Kembali jadi Pembeli
          </button>
        </nav>
        <button className="mt-4 py-1 px-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 text-xs" onClick={() => { logout(); navigate('/'); }}>Logout</button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4">
        {activeTab === 'dashboard' && (
          <>
            <h1 className="text-base font-bold text-green-700 mb-2">Dashboard Penjual</h1>
            {/* Statistik Ringkas */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-4">
              <div className="bg-white rounded-lg shadow p-2 flex flex-col items-center text-xs">
                <div className="text-xl font-bold text-green-600 mb-1">Rp{totalSales.toLocaleString()}</div>
                <div className="text-gray-600">Total Penjualan</div>
              </div>
              <div className="bg-white rounded-lg shadow p-2 flex flex-col items-center text-xs">
                <div className="text-xl font-bold text-green-600 mb-1">{totalOrders}</div>
                <div className="text-gray-600">Total Pesanan</div>
              </div>
              <div className="bg-white rounded-lg shadow p-2 flex flex-col items-center text-xs">
                <div className="text-xl font-bold text-green-600 mb-1">{totalProducts}</div>
                <div className="text-gray-600">Total Produk</div>
              </div>
              {/* Hapus pelanggan baru */}
            </div>

            {/* Grafik Placeholder */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
              <div className="bg-white rounded-lg shadow p-2 text-xs">
                <div className="font-semibold text-gray-700 mb-1">Statistik Penjualan</div>
                <div className="h-24 flex items-center justify-center text-gray-400">[Grafik Penjualan]</div>
              </div>
              <div className="bg-white rounded-lg shadow p-2 text-xs">
                <div className="font-semibold text-gray-700 mb-1">Statistik Pesanan</div>
                <div className="h-24 flex items-center justify-center text-gray-400">[Grafik Pesanan]</div>
              </div>
            </div>
          </>
        )}
        {(activeTab === 'dashboard' || activeTab === 'produk') && (
          <div className="bg-white rounded-xl shadow-sm border-2 border-green-100 p-6 mb-6">
            <div className="flex justify-between items-center mb-1">
              <div className="font-semibold text-gray-700 text-xs">Produk Anda</div>
              <button className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600 text-xs h-7" onClick={() => setShowAddModal(true)}>Tambah Produk</button>
            </div>
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-gray-600 border-b">
                  <th className="py-1">Nama Produk</th>
                  <th className="py-1">Stok</th>
                  <th className="py-1">Harga</th>
                  <th className="py-1">Harga Diskon</th>
                  <th className="py-1">Expired</th>
                  <th className="py-1">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p._id} className="border-b hover:bg-gray-50">
                    <td className="py-1 font-medium flex items-center gap-1">
                      {p.imageUrl && <img src={p.imageUrl} alt={p.name} className="w-7 h-7 object-cover rounded" />}
                      {p.name}
                    </td>
                    <td className="py-1">{p.stock}</td>
                    <td className="py-1">Rp{p.price?.toLocaleString()}</td>
                    <td className="py-1 text-green-600 font-bold">Rp{p.discountPrice?.toLocaleString()}</td>
                    <td className="py-1">{p.expiredDate ? new Date(p.expiredDate).toLocaleDateString('id-ID') : '-'}</td>
                    <td className="py-1">
                      <button className="text-green-600 hover:underline mr-1 text-xs" onClick={() => openEditModal(p)}>Edit</button>
                      <button className="text-red-500 hover:underline text-xs" onClick={() => handleDeleteProduct(p._id)}>Hapus</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {activeTab === 'dashboard' && (
          <div className="bg-white rounded-xl shadow-sm border-2 border-green-100 p-6 mb-6">
            <div className="font-semibold text-gray-700 mb-1 text-xs">Pesanan Terbaru</div>
            {orderError && <div className="bg-red-100 border border-red-400 text-red-700 px-2 py-1 rounded mb-2 text-xs">{orderError}</div>}
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-gray-600 border-b">
                  <th className="py-1">ID Pesanan</th>
                  <th className="py-1">Produk</th>
                  <th className="py-1">Pembeli</th>
                  <th className="py-1">Jumlah</th>
                  <th className="py-1">Status</th>
                  <th className="py-1">Pengiriman</th>
                  <th className="py-1">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o._id} className="border-b hover:bg-gray-50">
                    <td className="py-1">{o._id}</td>
                    <td className="py-1">{o.productId?.name}</td>
                    <td className="py-1">{o.buyerId?.name}</td>
                    <td className="py-1">{o.quantity}</td>
                    <td className="py-1">
                      <select
                        value={o.status}
                        onChange={e => handleOrderStatusChange(o._id, e.target.value)}
                        className={
                          o.status === 'picked_up' || o.status === 'delivered'
                            ? 'text-green-600 font-semibold bg-green-50 rounded'
                            : o.status === 'cancelled'
                            ? 'text-red-600 font-semibold bg-red-50 rounded'
                            : 'text-yellow-600 font-semibold bg-yellow-50 rounded'
                        }
                        disabled={orderLoading || o.status === 'processing_payment'}
                      >
                        <option value="pending">Diproses</option>
                        <option value="picked_up">Selesai</option>
                        <option value="cancelled">Dibatalkan</option>
                      </select>
                      {o.status === 'processing_payment' && (
                        <div className="text-xs text-yellow-600 mt-1">Menunggu verifikasi admin</div>
                      )}
                    </td>
                    <td className="py-1">
                      {o.deliveryMethod === 'delivery' ? (
                        <select
                          value={o.deliveryStatus}
                          onChange={e => handleDeliveryStatusChange(o._id, e.target.value)}
                          className={
                            o.deliveryStatus === 'delivered'
                              ? 'text-green-600 font-semibold bg-green-50 rounded'
                              : o.deliveryStatus === 'on_delivery'
                              ? 'text-blue-600 font-semibold bg-blue-50 rounded'
                              : o.deliveryStatus === 'failed'
                              ? 'text-red-600 font-semibold bg-red-50 rounded'
                              : 'text-yellow-600 font-semibold bg-yellow-50 rounded'
                          }
                          disabled={orderLoading}
                        >
                          <option value="pending">Belum Dikirim</option>
                          <option value="on_delivery">Dalam Pengiriman</option>
                          <option value="delivered">Selesai</option>
                          <option value="failed">Gagal</option>
                        </select>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="py-1">
                      {(o.status === 'cancelled' || o.status === 'picked_up' || o.status === 'delivered') && (
                        <button
                          className="text-red-500 hover:text-red-700 text-lg font-bold px-2"
                          title="Hapus Pesanan"
                          onClick={() => handleDeleteOrder(o._id)}
                          disabled={orderLoading}
                        >
                          ×
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Modal Tambah Produk */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-3 w-full max-w-sm relative text-xs overflow-y-auto max-h-[80vh]">
              <button onClick={() => setShowAddModal(false)} className="absolute top-2 right-2 text-gray-500 hover:text-red-500 text-lg">&times;</button>
              <h2 className="text-base font-bold mb-2">Tambah Produk</h2>
              {addError && <div className="bg-red-100 border border-red-400 text-red-700 px-2 py-1 rounded mb-2 text-xs">{addError}</div>}
              <form onSubmit={handleAddProduct} className="space-y-2">
                <div>
                  <label className="block text-gray-700 mb-1">Nama Produk</label>
                  <input type="text" name="name" className="w-full px-2 py-1 border rounded text-xs h-8" value={newProduct.name} onChange={handleInputChange} required />
                </div>
                <div>
                  <label className="block text-gray-700 mb-1">Deskripsi</label>
                  <textarea name="description" className="w-full px-2 py-1 border rounded text-xs" value={newProduct.description} onChange={handleInputChange} rows={2} />
                </div>
                <div>
                  <label className="block text-gray-700 mb-1">Harga Asli</label>
                  <input type="number" name="price" className="w-full px-2 py-1 border rounded text-xs h-8" value={newProduct.price} onChange={handleInputChange} required min={1} />
                </div>
                <div>
                  <label className="block text-gray-700 mb-1">Stok</label>
                  <input type="number" name="stock" className="w-full px-2 py-1 border rounded text-xs h-8" value={newProduct.stock} onChange={handleInputChange} required min={1} />
                </div>
                <div>
                  <label className="block text-gray-700 mb-1">Tanggal Kedaluwarsa</label>
                  <input type="date" name="expiredDate" className="w-full px-2 py-1 border rounded text-xs h-8" value={newProduct.expiredDate} onChange={handleInputChange} required />
                </div>
                <div>
                  <label className="block text-gray-700 mb-1">Kategori</label>
                  <select name="category" className="w-full px-2 py-1 border rounded text-xs h-8" value={newProduct.category} onChange={handleInputChange} required>
                    <option value="">Pilih Kategori</option>
                    <option value="makanan-pokok">Makanan Pokok</option>
                    <option value="roti">Roti & Kue</option>
                    <option value="buah">Buah Segar</option>
                    <option value="sayuran">Sayuran</option>
                    <option value="minuman">Minuman</option>
                    <option value="camilan">Camilan</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-700 mb-1">Gambar Produk</label>
                  <input type="file" name="image" accept="image/*" onChange={handleInputChange} className="text-xs" />
                  {preview && <img src={preview} alt="Preview" className="w-12 h-12 object-cover rounded mt-2" />}
                </div>
                <div>
                  <label className="block text-gray-700 mb-1">Status Makanan</label>
                  <select name="foodStatus" className="w-full px-2 py-1 border rounded text-xs h-8" value={newProduct.foodStatus} onChange={handleInputChange} required>
                    <option value="">Pilih Status</option>
                    <option value="Layak konsumsi">Layak konsumsi</option>
                    <option value="Segera dikonsumsi">Segera dikonsumsi</option>
                    <option value="Mendekati expired">Mendekati expired</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-700 mb-1">Cara Penyimpanan</label>
                  <input type="text" name="storage" className="w-full px-2 py-1 border rounded text-xs h-8" value={newProduct.storage} onChange={handleInputChange} required />
                </div>
                <div>
                  <label className="block text-gray-700 mb-1">Saran Konsumsi</label>
                  <input type="text" name="suggestion" className="w-full px-2 py-1 border rounded text-xs h-8" value={newProduct.suggestion} onChange={handleInputChange} required />
                </div>
                <div>
                  <label className="block text-gray-700 mb-1">Label Halal/Non-halal</label>
                  <select name="halal" className="w-full px-2 py-1 border rounded text-xs h-8" value={newProduct.halal} onChange={handleInputChange} required>
                    <option value="">Pilih Label</option>
                    <option value="Halal">Halal</option>
                    <option value="Non-halal">Non-halal</option>
                  </select>
                </div>
                <div className="flex gap-2 mt-2">
                  <button type="submit" className="bg-green-500 hover:bg-green-600 text-white font-semibold py-1 px-3 rounded transition w-full text-xs h-8">Simpan</button>
                  <button type="button" className="bg-gray-200 text-gray-700 font-semibold py-1 px-3 rounded transition w-full text-xs h-8" onClick={() => setShowAddModal(false)}>Batal</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal Edit Produk */}
        {showEditModal && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-lg p-8 max-w-lg w-full relative overflow-y-auto max-h-[80vh]">
              <button onClick={closeEditModal} className="absolute top-2 right-2 text-gray-400 hover:text-red-500 text-2xl font-bold">×</button>
              <h2 className="text-xl font-bold mb-4 text-green-700">Edit Produk</h2>
              <ProductForm
                mode="edit"
                initialData={editProduct}
                onSubmit={handleEditSubmit}
                onCancel={closeEditModal}
                loading={editLoading}
                error={editError}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default SellerDashboardPage; 