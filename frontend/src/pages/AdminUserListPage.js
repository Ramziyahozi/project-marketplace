import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/axios';
import useAuthStore from '../stores/authStore';

const AdminUserListPage = () => {
  const { user, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [search, setSearch] = useState('');
  const [editUser, setEditUser] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', email: '', role: '', phone: '' });
  const [editError, setEditError] = useState('');
  const [editLoading, setEditLoading] = useState(false);
  const [detailUser, setDetailUser] = useState(null);
  const [pendingOrders, setPendingOrders] = useState([]);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      navigate('/');
      return;
    }
    fetchUsers();
    fetchPendingOrders();
  }, [isAuthenticated, user]);

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/users');
      setUsers(res.data);
    } catch (err) {
      setError('Gagal memuat data user');
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingOrders = async () => {
    try {
      const res = await api.get('/orders?status=processing_payment');
      setPendingOrders(res.data);
    } catch (err) {
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Yakin ingin menghapus user ini?')) return;
    try {
      const userToDelete = users.find(u => u._id === id);
      await api.delete(`/users/${id}`);
      setSuccess(`User "${userToDelete?.name || 'Unknown'}" berhasil dihapus`);
      setUsers(users.filter(u => u._id !== id));
    } catch (err) {
      setError('Gagal menghapus user');
    }
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  const filteredUsers = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  // Edit user
  const openEditModal = (u) => {
    setEditUser(u);
    setEditForm({
      name: u.name || '',
      email: u.email || '',
      role: u.role || '',
      phone: u.phone || '',
    });
    setEditError('');
  };
  const closeEditModal = () => {
    setEditUser(null);
    setEditForm({ name: '', email: '', role: '', phone: '' });
    setEditError('');
  };
  const handleEditFormChange = (e) => {
    setEditForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    setEditError('');
    try {
      const res = await api.put(`/users/${editUser._id}`, {
        ...editUser,
        name: editForm.name,
        email: editForm.email,
        role: editForm.role,
        phone: editForm.phone,
      });
      setUsers(users.map(u => u._id === editUser._id ? res.data : u));
      setSuccess(`User "${editForm.name}" berhasil diupdate`);
      closeEditModal();
    } catch (err) {
      setEditError('Gagal update user');
    } finally {
      setEditLoading(false);
    }
  };


  const handleAccSeller = async (u) => {
    if (!window.confirm('ACC user ini menjadi penjual?')) return;
    try {
      const res = await api.put(`/users/${u._id}`, {
        ...u,
        role: 'penjual',
      });
      setUsers(users.map(x => x._id === u._id ? res.data : x));
      setSuccess(`User "${u.name}" berhasil di-ACC sebagai penjual`);
    } catch (err) {
      setError('Gagal ACC user');
    }
  };

  // ACC toko user
  const handleAccStore = async (u) => {
    if (!window.confirm('ACC toko user ini?')) return;
    try {
      const res = await api.put(`/users/${u._id}`, {
        ...u,
        store: { ...u.store, status: 'approved' },
        role: 'penjual',
      });
      setUsers(users.map(x => x._id === u._id ? res.data : x));
      setSuccess('Toko berhasil di-ACC');
      
      const userNotifications = JSON.parse(localStorage.getItem('userNotifications') || '{}');
      if (!userNotifications[u._id]) {
        userNotifications[u._id] = [];
      }
      userNotifications[u._id].push({
        id: Date.now(),
        type: 'store_approved',
        title: 'Toko Anda Telah Di-ACC!',
        message: `Selamat! Toko "${u.store.name}" Anda telah disetujui oleh admin. Sekarang Anda bisa mulai berjualan.`,
        read: false,
        createdAt: new Date().toISOString()
      });
      localStorage.setItem('userNotifications', JSON.stringify(userNotifications));
      
      setSuccess(`Toko "${u.store.name}" berhasil di-ACC! User akan mendapat notifikasi.`);
      
    } catch (err) {
      setError('Gagal ACC toko');
    }
  };

  const handleConfirmOrder = async (orderId) => {
    try {
      await api.put(`/orders/${orderId}`, { status: 'picked_up' });
      setPendingOrders(pendingOrders.filter(o => o._id !== orderId));
    } catch (err) {
      alert('Gagal konfirmasi pesanan');
    }
  };

  const handleRejectOrder = async (orderId) => {
    try {
      await api.put(`/orders/${orderId}`, { status: 'cancelled' });
      setPendingOrders(pendingOrders.filter(o => o._id !== orderId));
    } catch (err) {
      alert('Gagal menolak pesanan');
    }
  };

  const openDetailModal = (u) => setDetailUser(u);
  const closeDetailModal = () => setDetailUser(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-green-900 flex flex-col items-center py-8 px-2">
      {/* Dashboard */}
      <header className="w-full max-w-5xl mb-10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white/95 rounded-2xl shadow-lg p-6 border-b-4 border-green-400">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2a4 4 0 014-4h4m0 0V7a4 4 0 00-8 0v4m8 0a4 4 0 01-8 0" /></svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-green-700 mb-1">Dashboard Admin</h1>
              <p className="text-gray-600 text-sm">Kelola pesanan & pengguna marketplace</p>
            </div>
          </div>
        </div>
      </header>
      {/* Manajemen User */}
      <section className="w-full max-w-5xl bg-white/95 rounded-2xl shadow-lg p-8">
        <div className="flex items-center mb-6">
          <svg className="w-7 h-7 mr-2 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m9-4a4 4 0 10-8 0 4 4 0 008 0zm6 4v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5a2 2 0 012-2h12a2 2 0 012 2z" /></svg>
          <h1 className="text-2xl font-bold text-green-700">Manajemen User</h1>
        </div>
        <div className="mb-4 flex gap-2">
          <input
            type="text"
            placeholder="Cari nama atau email..."
            className="px-3 py-2 border rounded w-full"
            value={search}
            onChange={handleSearchChange}
          />
        </div>
        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4">{error}</div>}
        {success && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded mb-4">{success}</div>}
        {loading ? (
          <div className="text-center py-8 text-gray-700">Memuat data...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left rounded-xl overflow-hidden">
              <thead>
                <tr className="text-gray-600 border-b bg-green-50">
                  <th className="py-2">Nama</th>
                  <th className="py-2">Email</th>
                  <th className="py-2">Role</th>
                  <th className="py-2">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => (
                  <tr key={u._id} className="border-b hover:bg-green-50/60 transition">
                    <td className="py-2 flex items-center gap-3">
                      {u.profileImage ? (
                        <img src={u.profileImage} alt={u.name} className="w-10 h-10 rounded-full object-cover border-2 border-green-400" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 border-2 border-gray-300">
                          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                        </div>
                      )}
                      <button className="text-green-700 hover:underline font-semibold" onClick={() => openDetailModal(u)}>{u.name}</button>
                    </td>
                    <td className="py-2">{u.email}</td>
                    <td className="py-2">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${u.role === 'admin' ? 'bg-red-100 text-red-700' : u.role === 'penjual' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>{u.role}</span>
                    </td>
                    <td className="py-2">
                      <button className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded mr-2 text-xs" onClick={() => openEditModal(u)}>Edit</button>
                      <button className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs" onClick={() => handleDelete(u._id)}>Hapus</button>
                      {/* Tombol Verifikasi Toko hanya untuk user yang sudah membuat toko dan status pending */}
                      {u.store &&
                        u.store.status === 'pending' &&
                        u.role !== 'admin' &&
                        u.store.name && u.store.address && u.store.category && u.store.phone && (
                          <button
                            className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-xs ml-2"
                            onClick={() => handleAccStore(u)}
                          >
                            Verifikasi Toko
                          </button>
                        )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
      {editUser && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-bold mb-4">Edit User</h2>
            <form onSubmit={handleEditSubmit} className="space-y-3">
              <div>
                <label className="block text-gray-700 mb-1">Nama</label>
                <input type="text" name="name" className="w-full px-3 py-2 border rounded" value={editForm.name} onChange={handleEditFormChange} required />
              </div>
              <div>
                <label className="block text-gray-700 mb-1">Email</label>
                <input type="email" name="email" className="w-full px-3 py-2 border rounded" value={editForm.email} onChange={handleEditFormChange} required />
              </div>
              <div>
                <label className="block text-gray-700 mb-1">Role</label>
                <select name="role" className="w-full px-3 py-2 border rounded" value={editForm.role} onChange={handleEditFormChange} required>
                  <option value="">Pilih Role</option>
                  <option value="pembeli">Pembeli</option>
                  <option value="penjual">Penjual</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-700 mb-1">Nomor HP</label>
                <input type="text" name="phone" className="w-full px-3 py-2 border rounded" value={editForm.phone} onChange={handleEditFormChange} />
              </div>
              {editError && <div className="text-red-500 text-sm mb-2">{editError}</div>}
              <div className="flex gap-2 mt-2">
                <button type="submit" className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-6 rounded transition" disabled={editLoading}>{editLoading ? 'Menyimpan...' : 'Simpan'}</button>
                <button type="button" className="bg-gray-200 text-gray-700 font-semibold py-2 px-6 rounded transition" onClick={closeEditModal} disabled={editLoading}>Batal</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {detailUser && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white/95 rounded-lg shadow-lg p-6 w-full max-w-md relative">
            <button onClick={closeDetailModal} className="absolute top-2 right-2 text-gray-500 hover:text-red-500 text-xl">&times;</button>
            <div className="flex flex-col items-center mb-4">
              {detailUser.profileImage ? (
                <img src={detailUser.profileImage} alt={detailUser.name} className="w-20 h-20 rounded-full object-cover border-4 border-green-400 mb-2" />
              ) : (
                <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 border-4 border-gray-300 mb-2">
                  <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                </div>
              )}
              <h2 className="text-lg font-bold text-green-700 mb-1">{detailUser.name}</h2>
              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${detailUser.role === 'admin' ? 'bg-gray-200 text-gray-700' : detailUser.role === 'penjual' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>{detailUser.role || '-'}</span>
            </div>
            <div className="space-y-2">
              <div><span className="font-semibold text-gray-700">Email:</span> {detailUser.email}</div>
              <div><span className="font-semibold text-gray-700">Nomor HP:</span> {detailUser.phone || '-'}</div>
              <div><span className="font-semibold text-gray-700">Alamat:</span> {detailUser.address || '-'}</div>
              <div><span className="font-semibold text-gray-700">Tanggal Daftar:</span> {detailUser.createdAt ? new Date(detailUser.createdAt).toLocaleString('id-ID') : '-'}</div>
              <div><span className="font-semibold text-gray-700">Status:</span> {detailUser.status || 'Aktif'}</div>
              {detailUser.store && (
                <div className="mt-3 p-3 bg-green-50 rounded border border-green-200">
                  <div className="font-semibold text-green-700 mb-1">Data Toko</div>
                  {detailUser.store.photo && <img src={detailUser.store.photo} alt="Foto Toko" className="w-24 h-24 object-cover rounded mb-2" />}
                  <div><span className="font-semibold text-gray-700">Nama Toko:</span> {detailUser.store.name}</div>
                  <div><span className="font-semibold text-gray-700">Alamat Toko:</span> {detailUser.store.address}</div>
                  {detailUser.store.category && <div><span className="font-semibold text-gray-700">Kategori:</span> {detailUser.store.category}</div>}
                  {detailUser.store.phone && <div><span className="font-semibold text-gray-700">Nomor HP Toko:</span> {detailUser.store.phone}</div>}
                  {detailUser.store.description && <div><span className="font-semibold text-gray-700">Deskripsi:</span> {detailUser.store.description}</div>}
                  {detailUser.store.status && <div><span className={`font-semibold px-2 py-1 rounded-full text-xs ml-1 ${detailUser.store.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : detailUser.store.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>{detailUser.store.status}</span></div>}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUserListPage; 
