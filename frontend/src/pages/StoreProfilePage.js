import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../stores/authStore';
import api from '../utils/axios';
import GoogleMapsPicker from '../components/GoogleMapsPicker';

const categories = [
  { id: 'makanan-pokok', name: 'Makanan Pokok' },
  { id: 'roti', name: 'Roti & Kue' },
  { id: 'minuman', name: 'Minuman' },
  { id: 'camilan', name: 'Camilan' },
];

const StoreProfilePage = () => {
  const { user, isAuthenticated, updateUser } = useAuthStore();
  const navigate = useNavigate();
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({
    name: '',
    address: '',
    location: null,
    description: '',
    category: '',
    phone: '',
    photo: null,
  });
  const [preview, setPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'penjual' || !user?.store) {
      navigate('/profile');
      return;
    }
    
    setForm({
      name: user.store.name || '',
      address: user.store.address || '',
      location: user.store.location || null,
      description: user.store.description || '',
      category: user.store.category || '',
      phone: user.store.phone || '',
      photo: user.store.photo || null,
    });
    setPreview(user.store.photo || '');
  }, [isAuthenticated, user, navigate]);

  // Tambahkan fungsi upload ke Cloudinary
  async function uploadStorePhoto(file) {
    const formData = new FormData();
    formData.append('image', file);
    const res = await api.post('/users/upload-profile-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data.url;
  }

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'photo' && files && files[0]) {
      setForm((prev) => ({ ...prev, photo: files[0] }));
      setPreview(URL.createObjectURL(files[0]));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleLocationSelect = (locationData) => {
    setForm((prev) => ({ ...prev, address: locationData.address, location: locationData.location }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    
    try {
      // Upload foto toko ke Cloudinary jika ada
      let photoUrl = form.photo;
      if (form.photo && typeof form.photo !== 'string') {
        photoUrl = await uploadStorePhoto(form.photo);
      }
      
      const updatedStore = {
        name: form.name,
        address: form.address,
        location: form.location,
        description: form.description,
        category: form.category,
        phone: form.phone,
        photo: photoUrl,
      };
      
      await api.put(`/users/${user._id}`, {
        ...user,
        store: updatedStore
      });
      
      // Fetch ulang data user terbaru dari backend
      const freshUser = await api.get(`/users/${user._id}`);
      localStorage.setItem('user', JSON.stringify(freshUser.data));
      updateUser(freshUser.data);
      setPreview(freshUser.data.store.photo || '');
      setSuccess('Profil toko berhasil diperbarui');
      setEditMode(false);
    } catch (err) {
      setError('Gagal memperbarui profil toko');
    } finally {
      setLoading(false);
    }
  };

  if (!user?.store) {
    return (
      <div className="container mx-auto px-4 py-8 min-h-screen">
        <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="text-6xl mb-4">🏪</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Toko Tidak Ditemukan</h2>
          <p className="text-gray-600 mb-6">Anda belum memiliki toko atau toko tidak ditemukan.</p>
          <button
            onClick={() => navigate('/create-store')}
            className="bg-green-500 text-white font-medium px-6 py-3 rounded-lg hover:bg-green-600 transition"
          >
            Buat Toko
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg p-8 border-2 border-green-100">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-green-700">Profil Toko</h1>
          <button
            onClick={() => setEditMode(!editMode)}
            className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded transition text-sm"
          >
            {editMode ? 'Batal Edit' : 'Edit Toko'}
          </button>
        </div>
        
        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}
        {success && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">{success}</div>}
        
        {editMode ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-700 mb-1">Nama Toko</label>
              <input 
                type="text" 
                name="name" 
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-300" 
                value={form.name} 
                onChange={handleChange} 
                required 
              />
            </div>
            
            <div>
              <label className="block text-gray-700 mb-1">Alamat Toko</label>
              <input 
                type="text" 
                name="address" 
                className="w-full px-3 py-2 border rounded mb-2 focus:outline-none focus:ring-2 focus:ring-green-300" 
                value={form.address} 
                onChange={handleChange} 
                required 
              />
              <GoogleMapsPicker 
                onLocationSelect={handleLocationSelect} 
                initialAddress={form.address}
                initialLocation={form.location}
              />
            </div>
            
            <div>
              <label className="block text-gray-700 mb-1">Kategori Toko</label>
              <select 
                name="category" 
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-300" 
                value={form.category} 
                onChange={handleChange} 
                required
              >
                <option value="">Pilih Kategori</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-gray-700 mb-1">Nomor HP Toko</label>
              <input 
                type="text" 
                name="phone" 
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-300" 
                value={form.phone} 
                onChange={handleChange} 
                required 
              />
            </div>
            
            <div className="flex gap-2">
              <button 
                type="submit" 
                className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-6 rounded transition" 
                disabled={loading}
              >
                {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
              </button>
              <button 
                type="button" 
                className="bg-gray-200 text-gray-700 font-semibold py-2 px-6 rounded transition" 
                onClick={() => setEditMode(false)}
                disabled={loading}
              >
                Batal
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-col items-center mb-6">
              {preview ? (
                <img
                  src={preview}
                  alt="Foto Toko"
                  className="w-32 h-32 rounded-lg object-cover border-2 border-green-300 shadow mb-4"
                />
              ) : (
                <div className="w-32 h-32 rounded-lg border-2 border-green-300 shadow mb-4 flex items-center justify-center bg-gray-100 text-gray-400">
                  <span className="text-4xl">🏪</span>
                </div>
              )}
              <h2 className="text-xl font-bold text-gray-800">{user.store.name}</h2>
            </div>
            <div>
              <div className="text-gray-600 text-sm mb-1">Nama Toko</div>
              <div className="font-medium text-gray-800">{user.store.name}</div>
            </div>
            
            <div>
              <div className="text-gray-600 text-sm mb-1">Alamat Toko</div>
              <div className="font-medium text-gray-800">{user.store.address}</div>
            </div>
            
            <div>
              <div className="text-gray-600 text-sm mb-1">Kategori</div>
              <div className="font-medium text-gray-800">
                {categories.find(cat => cat.id === user.store.category)?.name || user.store.category || '-'}
              </div>
            </div>
            
            <div>
              <div className="text-gray-600 text-sm mb-1">Nomor HP</div>
              <div className="font-medium text-gray-800">{user.store.phone || '-'}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StoreProfilePage; 