import React, { useState } from 'react';
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

const CreateStorePage = () => {
  const { user, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    address: '',
    location: null,
    category: '',
    phone: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPendingModal, setShowPendingModal] = useState(false);

  // Validasi sudah ditangani di ProtectedCreateStoreRoute
  // Tidak perlu validasi lagi di sini

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleLocationSelect = (locationData) => {
    setForm((f) => ({ ...f, address: locationData.address, location: locationData.location }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.name || !form.address || !form.category || !form.phone) {
      setError('Nama, alamat, kategori, dan nomor HP toko wajib diisi');
      return;
    }
    setLoading(true);
    try {
      // Update user: hanya update store, role tetap
      const response = await api.put(`/users/${user._id}`, {
        ...user,
        // role: 'penjual', // JANGAN diubah di sini!
        store: {
          name: form.name,
          address: form.address,
          location: form.location,
          description: form.description,
          category: form.category,
          phone: form.phone,
          status: 'pending', // <-- status pending saat buat toko
        }
      });
      localStorage.setItem('user', JSON.stringify(response.data));
      setLoading(false);
      
      // Notifikasi toko berhasil dibuat (dihapus karena fungsi tidak ada)
      console.log(`Toko "${form.name}" Anda telah dibuat dan sedang menunggu persetujuan admin.`);
      
      setError(''); // Clear error
      setSuccess('Toko berhasil dibuat! Menunggu approval admin.');
      setShowPendingModal(true); // Tampilkan modal menunggu verifikasi
    } catch (err) {
      setError(err?.response?.data?.error || 'Gagal membuat toko');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-green-100 via-lime-50 to-yellow-100 p-4">
      <div className="w-full max-w-lg bg-white/90 rounded-xl shadow-lg p-8">
        {/* Modal menunggu verifikasi admin */}
        {showPendingModal && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-lg p-8 max-w-sm w-full text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-yellow-100 rounded-full flex items-center justify-center">
                <svg className="w-10 h-10 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01" /></svg>
              </div>
              <h2 className="text-xl font-bold text-yellow-700 mb-2">Menunggu Verifikasi Admin</h2>
              <p className="text-gray-600 mb-4">Toko Anda sedang menunggu persetujuan admin. Anda akan mendapat notifikasi setelah toko di-ACC.</p>
              <button onClick={() => { setShowPendingModal(false); navigate('/profile'); }} className="bg-green-500 hover:bg-green-600 text-white font-semibold px-6 py-3 rounded-lg transition">OK</button>
            </div>
          </div>
        )}
        <div className="flex flex-col items-center mb-6">
          <img src="https://img.freepik.com/free-vector/store-building-concept-illustration_114360-1121.jpg?w=200" alt="Ilustrasi Toko" className="w-24 h-24 mb-2" />
          <h2 className="text-2xl font-bold text-green-600 mb-1 text-center">Buat Toko Anda</h2>
          <p className="text-gray-500 text-center">Isi data toko untuk mulai berjualan di SurplusFood</p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-3 text-center">
            <p className="text-blue-700 text-sm">
               <strong>Info:</strong> Setiap user hanya bisa memiliki 1 toko. 
              Jika sudah punya toko, Anda akan diarahkan ke halaman profil.
            </p>
          </div>
        </div>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>
        )}
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">{success}</div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 mb-1">Nama Toko</label>
            <input type="text" name="name" className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-300" value={form.name} onChange={handleChange} required />
          </div>
          <div>
            <label className="block text-gray-700 mb-1">Alamat Toko</label>
            <input type="text" name="address" className="w-full px-3 py-2 border rounded mb-2" value={form.address} onChange={handleChange} required />
            <GoogleMapsPicker onLocationSelect={handleLocationSelect} initialAddress={form.address} initialLocation={form.location} />
          </div>
          <div>
            <label className="block text-gray-700 mb-1">Kategori Toko</label>
            <select name="category" className="w-full px-3 py-2 border rounded" value={form.category} onChange={handleChange} required>
              <option value="">Pilih Kategori</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-gray-700 mb-1">Nomor HP Toko</label>
            <input type="text" name="phone" className="w-full px-3 py-2 border rounded" value={form.phone} onChange={handleChange} required />
          </div>
          <div className="flex gap-2 mt-4">
            <button type="submit" className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-6 rounded transition w-full" disabled={loading}>{loading ? 'Menyimpan...' : 'Simpan Toko'}</button>
            <button type="button" className="bg-gray-200 text-gray-700 font-semibold py-2 px-6 rounded transition w-full" onClick={() => navigate('/profile')} disabled={loading}>Batal</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateStorePage; 