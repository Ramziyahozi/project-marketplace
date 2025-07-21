import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/axios';
import useAuthStore from '../stores/authStore';
import GoogleMapsPicker from '../components/GoogleMapsPicker';

const ProfileSetupPage = () => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [location, setLocation] = useState(null); // lat/lng
  const [role, setRole] = useState('pembeli');
  const [profileImage, setProfileImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  const [showMap, setShowMap] = useState(false);
  
  const navigate = useNavigate();
  
  useEffect(() => {
    // Ambil user dari localStorage
    const userData = localStorage.getItem('user');
    if (!userData) {
      // Kalau user belum login, arahkan ke login
      navigate('/login');
      return;
    }
    
    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);
    
    // Isi form otomatis kalau user sudah ada datanya
    if (parsedUser.name) setName(parsedUser.name);
    if (parsedUser.phone) setPhone(parsedUser.phone);
    if (parsedUser.address) setAddress(parsedUser.address);
    if (parsedUser.location) setLocation(parsedUser.location);
    if (parsedUser.profileImage) setPreview(parsedUser.profileImage);
  }, [navigate]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setProfileImage(file);
    if (file) {
      setPreview(URL.createObjectURL(file));
    } else {
      setPreview(null);
    }
  };

  const handleLocationSelect = (locationData) => {
    setAddress(locationData.address);
    setLocation(locationData.location);
  };

  const toggleMapView = () => {
    setShowMap(!showMap);
  };

  // Upload foto ke Cloudinary
  async function uploadProfileImage(file) {
    const formData = new FormData();
    formData.append('image', file);
    const res = await api.post('/users/upload-profile-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data.url;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    if (!user) {
      setError('Tidak ada data user');
      setLoading(false);
      return;
    }
    
    try {
      let profileImageUrl = user.profileImage;
      if (profileImage && typeof profileImage !== 'string') {
        profileImageUrl = await uploadProfileImage(profileImage);
      }
      // Simpan user baru
      const updatedUserData = {
        name,
        phone,
        address,
        location,
        profileImage: profileImageUrl,
      };
      
      const response = await api.put(`/users/${user._id}`, updatedUserData);
      
      // Simpan user ke localStorage
      localStorage.setItem('user', JSON.stringify(response.data));
      
      setLoading(false);
      
  
      
      // Kalau role penjual, ke dashboard penjual
      if (response.data.role === 'penjual') {
        navigate('/seller-dashboard');
      } else {
        navigate('/');
      }
      
    } catch (err) {
      console.error('Profile update error:', err);
      setError('Terjadi kesalahan saat menyimpan profil');
      setLoading(false);
    }
  };

  // Avatar default
  const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'User')}&background=random`;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-green-100 via-lime-50 to-yellow-100 p-4">
      <div className="max-w-xl mx-auto bg-white rounded-xl shadow-lg p-8 border-2 border-green-100">
        <h2 className="text-2xl font-bold text-green-600 mb-2 text-center">Lengkapi Profil Anda</h2>
        <p className="text-gray-500 mb-6 text-center">Isi data diri untuk mulai menggunakan SurplusFood</p>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col items-center">
            <label htmlFor="profileImage" className="cursor-pointer">
              <img
                src={preview || defaultAvatar}
                alt="Avatar"
                className="w-24 h-24 rounded-full object-cover border-2 border-green-300 shadow mb-2"
              />
              <span className="text-xs text-gray-500 hover:underline">{profileImage ? 'Ganti Foto' : 'Upload Foto (opsional)'}</span>
            </label>
            <input
              id="profileImage"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-1">Nama Lengkap</label>
            <input type="text" className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-300" value={name} onChange={e => setName(e.target.value)} required />
          </div>
          <div>
            <label className="block text-gray-700 mb-1">Nomor HP</label>
            <input type="tel" className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-300" value={phone} onChange={e => setPhone(e.target.value)} required />
          </div>
          <div>
            <label className="block text-gray-700 mb-1">
              Alamat
              <button 
                type="button" 
                onClick={toggleMapView}
                className="ml-2 text-xs text-green-600 hover:text-green-800 underline"
              >
                {showMap ? 'Sembunyikan Peta' : 'Pilih dari Peta'}
              </button>
            </label>
            <input 
              type="text" 
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-300" 
              value={address} 
              onChange={e => setAddress(e.target.value)} 
              required 
            />
            
            {showMap && (
              <div className="mt-3">
                <GoogleMapsPicker 
                  onLocationSelect={handleLocationSelect} 
                  initialAddress={address}
                  initialLocation={location}
                />
              </div>
            )}
          </div>
          <button 
            type="submit" 
            className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 rounded transition"
            disabled={loading}
          >
            {loading ? 'Menyimpan...' : 'Simpan Profil'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfileSetupPage; 