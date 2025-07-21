import React, { useState, useEffect } from 'react';
import GoogleMapsPicker from './GoogleMapsPicker';

const categoryOptions = [
  { value: 'makanan-pokok', label: 'Makanan Pokok' },
  { value: 'roti', label: 'Roti & Kue' },
  { value: 'minuman', label: 'Minuman' },
  { value: 'camilan', label: 'Camilan' },
];
const statusOptions = [
  'Layak konsumsi',
  'Segera dikonsumsi',
  'Mendekati expired',
];
const halalOptions = [
  { value: 'Halal', label: 'Halal' },
  { value: 'Non-halal', label: 'Non-halal' },
];

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

const defaultState = {
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
};

export default function ProductForm({ mode = 'add', initialData = {}, onSubmit, onCancel, loading, error }) {
  const [form, setForm] = useState({ ...defaultState, ...initialData });
  const [preview, setPreview] = useState(initialData.imageUrl || '');

  useEffect(() => {
    setForm({ ...defaultState, ...initialData });
    setPreview(initialData.imageUrl || '');
  }, [initialData]);

  // Autofill
  useEffect(() => {
    let template = null;
    if (form.category && autofillTemplates[form.category]) {
      template = autofillTemplates[form.category];
    } else if (form.name) {
      const lower = form.name.toLowerCase();
      if (lower.includes('roti')) template = autofillTemplates['roti'];
      else if (lower.includes('buah')) template = autofillTemplates['buah'];
      else if (lower.includes('sayur')) template = autofillTemplates['sayuran'];
      else if (lower.includes('minum')) template = autofillTemplates['minuman'];
      else if (lower.includes('camilan')) template = autofillTemplates['camilan'];
      else if (lower.includes('nasi') || lower.includes('ayam') || lower.includes('bakso')) template = autofillTemplates['makanan-pokok'];
    }
    if (template) {
      setForm((prev) => ({
        ...prev,
        foodStatus: template.foodStatus,
        storage: template.storage,
        suggestion: template.suggestion,
        halal: template.halal,
      }));
    }
    // eslint-disable-next-line
  }, [form.category]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'image' && files && files[0]) {
      setForm((f) => ({ ...f, image: files[0] }));
      setPreview(URL.createObjectURL(files[0]));
    } else {
      setForm((f) => ({ ...f, [name]: value }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.price || !form.stock || !form.expiredDate || !form.category) {
      alert('Semua field wajib diisi');
      return;
    }
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2 text-xs">
      <div>
        <label className="block text-gray-700 mb-1">Nama Produk</label>
        <input type="text" name="name" className="w-full px-2 py-1 border rounded h-8" value={form.name} onChange={handleChange} required />
      </div>
      <div>
        <label className="block text-gray-700 mb-1">Deskripsi</label>
        <textarea name="description" className="w-full px-2 py-1 border rounded" value={form.description} onChange={handleChange} rows={2} />
      </div>
      <div>
        <label className="block text-gray-700 mb-1">Harga Asli</label>
        <input type="number" name="price" className="w-full px-2 py-1 border rounded h-8" value={form.price} onChange={handleChange} required min={1} />
      </div>
      <div>
        <label className="block text-gray-700 mb-1">Stok</label>
        <input type="number" name="stock" className="w-full px-2 py-1 border rounded h-8" value={form.stock} onChange={handleChange} required min={1} />
      </div>
      <div>
        <label className="block text-gray-700 mb-1">Tanggal Kedaluwarsa</label>
        <input type="date" name="expiredDate" className="w-full px-2 py-1 border rounded h-8" value={form.expiredDate} onChange={handleChange} required />
      </div>
      <div>
        <label className="block text-gray-700 mb-1">Kategori</label>
        <select name="category" className="w-full px-2 py-1 border rounded h-8" value={form.category} onChange={handleChange} required>
          <option value="">Pilih Kategori</option>
          {categoryOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-gray-700 mb-1">Gambar Produk</label>
        <input type="file" name="image" accept="image/*" onChange={handleChange} className="text-xs" />
        {preview && <img src={preview} alt="Preview" className="w-12 h-12 object-cover rounded mt-2" />}
      </div>
      <div>
        <label className="block text-gray-700 mb-1">Status Makanan</label>
        <select name="foodStatus" className="w-full px-2 py-1 border rounded h-8" value={form.foodStatus} onChange={handleChange} required>
          <option value="">Pilih Status</option>
          {statusOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-gray-700 mb-1">Cara Penyimpanan</label>
        <input type="text" name="storage" className="w-full px-2 py-1 border rounded h-8" value={form.storage} onChange={handleChange} required />
      </div>
      <div>
        <label className="block text-gray-700 mb-1">Saran Konsumsi</label>
        <input type="text" name="suggestion" className="w-full px-2 py-1 border rounded h-8" value={form.suggestion} onChange={handleChange} required />
      </div>
      <div>
        <label className="block text-gray-700 mb-1">Label Halal/Non-halal</label>
        <select name="halal" className="w-full px-2 py-1 border rounded h-8" value={form.halal} onChange={handleChange} required>
          <option value="">Pilih Label</option>
          {halalOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
      </div>
      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-2 py-1 rounded mb-2 text-xs">{error}</div>}
      <div className="flex gap-2 mt-2">
        <button type="submit" className="bg-green-500 hover:bg-green-600 text-white font-semibold py-1 px-3 rounded transition w-full h-8" disabled={loading}>{loading ? (mode === 'add' ? 'Menyimpan...' : 'Menyimpan...') : (mode === 'add' ? 'Simpan' : 'Simpan Perubahan')}</button>
        <button type="button" className="bg-gray-200 text-gray-700 font-semibold py-1 px-3 rounded transition w-full h-8" onClick={onCancel} disabled={loading}>Batal</button>
      </div>
    </form>
  );
} 