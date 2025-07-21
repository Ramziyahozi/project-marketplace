import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../stores/authStore';
import GoogleMapsPicker from '../components/GoogleMapsPicker';
import api from '../utils/axios';

const ProfilePage = () => {
  const { user, isAuthenticated, updateProfile, isHydrated } = useAuthStore();
  const navigate = useNavigate();
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    location: null, // lat/lng
    profileImage: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showMap, setShowMap] = useState(false);
  const [showStoreForm, setShowStoreForm] = useState(false);
  const [storeForm, setStoreForm] = useState({ name: '', address: '', location: null, description: '', category: '', phone: '', photo: null });
  const [storePreview, setStorePreview] = useState('');
  const [storeError, setStoreError] = useState('');
  const [avatarPreview, setAvatarPreview] = useState('');
  const categories = [
    { id: 'makanan-pokok', name: 'Makanan Pokok' },
    { id: 'roti', name: 'Roti & Kue' },
    { id: 'buah', name: 'Buah Segar' },
    { id: 'sayuran', name: 'Sayuran' },
    { id: 'minuman', name: 'Minuman' },
    { id: 'camilan', name: 'Camilan' },
  ];

  async function uploadProfileImage(file) {
    const formData = new FormData();
    formData.append('image', file);
    const res = await api.post('/users/upload-profile-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data.url;
  }

  useEffect(() => {
    if (!isHydrated) return;
    const storedUser = JSON.parse(localStorage.getItem('user') || 'null');
    if (!isAuthenticated || !storedUser) {
      navigate('/login');
      return;
    }
    if (storedUser.role === 'admin') {
      navigate('/admin/users');
      return;
    }
    setForm({
      name: storedUser.name || '',
      email: storedUser.email || '',
      phone: storedUser.phone || '',
      address: storedUser.address || '',
      location: storedUser.location || null,
      profileImage: storedUser.profileImage || null,
    });
    setAvatarPreview(storedUser.profileImage || '');
  }, [isHydrated, isAuthenticated, user, navigate]);

  if (!isHydrated) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  const handleEdit = () => {
    setEditMode(true);
    setSuccess('');
    setError('');
    setAvatarPreview(form.profileImage || '');
  };

  const handleCancel = () => {
    setEditMode(false);
    setForm({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      address: user.address || '',
      location: user.location || null,
      profileImage: user.profileImage || null,
    });
    setError('');
    setSuccess('');
    setShowMap(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      let profileImageUrl = form.profileImage;
      if (form.profileImage && typeof form.profileImage !== 'string') {
        profileImageUrl = await uploadProfileImage(form.profileImage);
      }
      // Siapkan payload update
      const payload = {
        ...user,
        ...form,
        profileImage: profileImageUrl,
      };
      if (user.store) {
        payload.store = user.store;
      } else {
        delete payload.store;
      }
      const result = await updateProfile(user._id, payload);
      if (result && typeof result === 'object') {
        localStorage.setItem('user', JSON.stringify(result));
        setSuccess('Profil berhasil diperbarui');
        
        // Notifikasi profil diperbarui (dihapus karena fungsi tidak ada)
        console.log('Profil Anda berhasil diperbarui.');
        
        setEditMode(false);
        setShowMap(false);
      } else if (result) {
        setSuccess('Profil berhasil diperbarui');
        
        // Notifikasi profil diperbarui (dihapus karena fungsi tidak ada)
        console.log('Profil Anda berhasil diperbarui.');
        
        setEditMode(false);
        setShowMap(false);
      } else {
        setError('Gagal memperbarui profil');
      }
    } catch (err) {
      setError('Terjadi kesalahan saat menyimpan profil');
    } finally {
      setLoading(false);
    }
  };

  const handleLocationSelect = (locationData) => {
    setForm(prev => ({
      ...prev,
      address: locationData.address,
      location: locationData.location
    }));
  };

  const toggleMapView = () => {
    setShowMap(!showMap);
  };

  const handleStoreFormChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'photo' && files && files[0]) {
      setStoreForm((prev) => ({ ...prev, photo: files[0] }));
      setStorePreview(URL.createObjectURL(files[0]));
    } else {
      setStoreForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleStoreLocationSelect = (locationData) => {
    setStoreForm((prev) => ({ ...prev, address: locationData.address, location: locationData.location }));
  };

  const handleCreateStore = async (e) => {
    e.preventDefault();
    setStoreError('');
    if (!storeForm.name || !storeForm.address || !storeForm.category || !storeForm.phone) {
      setStoreError('Nama, alamat, kategori, dan nomor HP toko wajib diisi');
      return;
    }
    setLoading(true);
    try {
      // Upload foto toko ke Cloudinary jika ada
      let photoUrl = '';
      if (storeForm.photo && typeof storeForm.photo !== 'string') {
        photoUrl = await uploadProfileImage(storeForm.photo); // Changed to uploadProfileImage
      }
      
      // Update user: role: 'penjual', store: {...}
      const response = await api.put(`/users/${user._id}`, {
        ...user,
        // role: 'penjual', // JANGAN diubah di sini!
        store: {
          name: storeForm.name,
          address: storeForm.address,
          location: storeForm.location,
          description: storeForm.description,
          category: storeForm.category,
          phone: storeForm.phone,
          photo: photoUrl,
          status: 'pending',
        }
      });
      localStorage.setItem('user', JSON.stringify(response.data));
      setSuccess('Toko berhasil dibuat!');
      setShowStoreForm(false);
      window.location.reload();

      // Notifikasi toko berhasil dibuat (dihapus karena fungsi tidak ada)
      console.log(`Toko "${storeForm.name}" Anda telah dibuat dan sedang menunggu persetujuan admin.`);
      
      setError(''); // Clear error
      setSuccess('Toko berhasil dibuat! Menunggu approval admin.');
      setTimeout(() => {
        navigate('/seller-dashboard');
      }, 2000);
    } catch (err) {
      setStoreError('Gagal membuat toko');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Profil Saya</h1>
            <p className="text-gray-600">Kelola informasi profil dan toko Anda</p>
          </div>

          {/* Store Status Card */}
          {user?.role === 'penjual' && user?.store ? (
            <div className="bg-white rounded-xl shadow-sm border-2 border-green-100 p-6 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                              <div>
              <h3 className="text-lg font-semibold text-gray-800">Status Toko</h3>
              <p className="text-gray-600">Toko: <span className="font-medium">{user.store.name}</span></p>
              <p className="text-gray-600">Alamat: {user.store.address}</p>
              <p className="text-green-600 text-sm mt-1">Toko Anda sudah aktif! Anda bisa mulai berjualan.</p>
            </div>
                </div>
                <div className="flex gap-2">
                  <button
                    className="bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-lg transition"
                    onClick={() => navigate('/seller-dashboard')}
                  >
                    Dashboard Toko
                  </button>
                  <button
                    className="bg-gray-100 text-gray-700 font-medium py-2 px-4 rounded-lg hover:bg-gray-200 transition"
                    onClick={async () => {
                      setLoading(true);
                      try {
                        const response = await api.put(`/users/${user._id}`, {
                          ...user,
                          role: 'pembeli',
                          // Jangan hapus data toko, hanya ubah role
                        });
                        localStorage.setItem('user', JSON.stringify(response.data));
                        setSuccess('Berhasil kembali menjadi pembeli');
                        window.location.reload();
                      } catch (err) {
                        setError('Gagal switch ke pembeli');
                      } finally {
                        setLoading(false);
                      }
                    }}
                    disabled={loading}
                  >
                    Kembali jadi Pembeli
                  </button>
                </div>
              </div>
            </div>
          ) :
  // Jika user sudah punya data toko lengkap tapi belum aktif sebagai penjual
  (user?.role !== 'penjual' && user?.store && user.store.name && user.store.address && user.store.category && user.store.phone ? (
    <div className="bg-white rounded-xl shadow-sm border-2 border-green-100 p-6 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
                      <div>
              <h3 className="text-lg font-semibold text-gray-800">Toko Tersimpan</h3>
              <p className="text-gray-600">Toko: <span className="font-medium">{user.store.name}</span></p>
              <p className="text-gray-600">Alamat: {user.store.address}</p>
              <p className="text-blue-600 text-sm mt-1">Anda sudah punya toko! Klik "Aktifkan Toko" untuk mulai berjualan.</p>
            </div>
        </div>
        <button
          className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition"
          onClick={async () => {
            setLoading(true);
            try {
              const response = await api.put(`/users/${user._id}`, {
                ...user,
                role: 'penjual',
              });
              // Update localStorage HANYA jika backend sukses
              localStorage.setItem('user', JSON.stringify(response.data));
              useAuthStore.getState().setUser(response.data); // update state user di zustand
              setSuccess('Berhasil mengaktifkan toko! Sekarang Anda bisa mulai berjualan.');
              // Notifikasi toko diaktifkan (dihapus karena fungsi tidak ada)
              console.log(`Toko "${user.store.name}" Anda telah diaktifkan kembali. Selamat berjualan!`);
              setTimeout(() => {
                window.location.reload();
              }, 2000);
            } catch (err) {
              // Tidak perlu setError di sini, cukup diamkan
            } finally {
              setLoading(false);
            }
          }}
          disabled={loading}
        >
          Aktifkan Toko
        </button>
      </div>
    </div>
  ) : (
    // Jika user belum punya data toko lengkap, hanya tampilkan tombol Buat Toko
    <div className="bg-white rounded-xl shadow-sm border-2 border-green-100 p-6 mb-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Mulai Berjualan</h3>
        <p className="text-gray-600 mb-4">Buat toko Anda sendiri dan mulai berjualan di SurplusFood</p>
        <p className="text-green-600 text-sm mb-4">Belum punya toko? Buat toko baru untuk mulai berjualan!</p>
        <button
          className="bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-6 rounded-lg transition"
          onClick={() => navigate('/create-store')}
        >
          Buat Toko
        </button>
      </div>
    </div>
  ))}

          {/* Main Profile Card */}
          <div className="bg-white rounded-xl shadow-sm border-2 border-green-100 overflow-hidden">
            {/* Profile Header */}
            <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 text-white">
              <div className="flex items-center gap-4">
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt="Avatar"
                    className="w-20 h-20 rounded-full object-cover border-4 border-white/20 shadow-lg"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full border-4 border-white/20 shadow-lg bg-white/10 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                )}
                <div>
                  <h2 className="text-2xl font-bold">{user?.name || 'User'}</h2>
                  <p className="text-green-100">{user?.email}</p>
                </div>
              </div>
            </div>

            {/* Profile Content */}
            <div className="p-6">
              {success && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
                  {success}
                </div>
              )}

              {editMode ? (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="flex flex-col items-center">
                    <label htmlFor="profileImage" className="cursor-pointer group">
                      <div className="relative">
                        <img
                          src={avatarPreview || `https://ui-avatars.com/api/?name=${encodeURIComponent(form.name || 'User')}&background=random`}
            alt="Avatar"
                          className="w-24 h-24 rounded-full object-cover border-4 border-green-200 shadow-lg group-hover:opacity-80 transition"
                        />
                        <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                          <span className="text-white text-sm font-medium">Ganti Foto</span>
                        </div>
                      </div>
                    </label>
              <input
                id="profileImage"
                type="file"
                accept="image/*"
                className="hidden"
                      onChange={e => {
                        const file = e.target.files[0];
                        setForm(f => ({ ...f, profileImage: file }));
                        if (file) setAvatarPreview(URL.createObjectURL(file));
                      }}
                    />
        </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                      <label className="block text-gray-700 mb-2 font-medium">Nama Lengkap</label>
                      <input 
                        type="text" 
                        name="name" 
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" 
                        value={form.name} 
                        onChange={e => setForm(f => ({ ...f, name: e.target.value }))} 
                        required 
                      />
            </div>
            <div>
                      <label className="block text-gray-700 mb-2 font-medium">Email</label>
                      <input 
                        type="email" 
                        name="email" 
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" 
                        value={form.email} 
                        onChange={e => setForm(f => ({ ...f, email: e.target.value }))} 
                        required 
                      />
            </div>
            <div>
                      <label className="block text-gray-700 mb-2 font-medium">Nomor HP</label>
                      <input 
                        type="tel" 
                        name="phone" 
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" 
                        value={form.phone} 
                        onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} 
                        required 
                      />
            </div>
            <div>
                      <label className="block text-gray-700 mb-2 font-medium">
                Alamat
                <button 
                  type="button" 
                  onClick={toggleMapView}
                          className="ml-2 text-sm text-green-600 hover:text-green-800 underline"
                >
                  {showMap ? 'Sembunyikan Peta' : 'Pilih dari Peta'}
                </button>
              </label>
              <input 
                type="text" 
                name="address" 
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" 
                value={form.address} 
                        onChange={e => setForm(f => ({ ...f, address: e.target.value }))} 
                required 
              />
                    </div>
                  </div>
              
              {showMap && (
                    <div className="border border-gray-200 rounded-lg p-4">
                  <GoogleMapsPicker 
                    onLocationSelect={handleLocationSelect} 
                    initialAddress={form.address}
                    initialLocation={form.location}
                  />
                </div>
              )}

                  <div className="flex gap-4 pt-4">
                    <button 
                      type="submit" 
                      className="flex-1 bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg transition" 
                      disabled={loading}
                    >
                      {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
                    </button>
                    <button 
                      type="button" 
                      className="flex-1 bg-gray-100 text-gray-700 font-semibold py-3 px-6 rounded-lg hover:bg-gray-200 transition" 
                      onClick={handleCancel} 
                      disabled={loading}
                    >
                      Batal
                    </button>
            </div>
          </form>
        ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                      <label className="block text-gray-500 text-sm font-medium mb-1">Email</label>
                      <p className="text-gray-800 font-medium">{user?.email}</p>
            </div>
            <div>
                      <label className="block text-gray-500 text-sm font-medium mb-1">Nama Lengkap</label>
                      <p className="text-gray-800 font-medium">{user?.name}</p>
            </div>
            <div>
                      <label className="block text-gray-500 text-sm font-medium mb-1">Nomor HP</label>
                      <p className="text-gray-800 font-medium">{user?.phone || '-'}</p>
            </div>
            <div>
                      <label className="block text-gray-500 text-sm font-medium mb-1">Alamat</label>
                      <p className="text-gray-800 font-medium">{user?.address || '-'}</p>
              {user?.location && (
                <button 
                  onClick={toggleMapView} 
                          className="text-sm text-green-600 hover:text-green-800 underline mt-1"
                >
                  {showMap ? 'Sembunyikan Peta' : 'Lihat di Peta'}
                </button>
              )}
                    </div>
                  </div>

              {showMap && user?.location && (
                    <div className="border border-gray-200 rounded-lg p-4">
                  <GoogleMapsPicker 
                    onLocationSelect={() => {}} 
                    initialAddress={user.address}
                    initialLocation={user.location}
                  />
                    </div>
                  )}

                  <div className="pt-4">
                    <button 
                      onClick={handleEdit} 
                      className="bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg transition"
                    >
                      Edit Profil
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage; 