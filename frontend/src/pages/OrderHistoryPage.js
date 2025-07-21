import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/axios';
import useAuthStore from '../stores/authStore';

const OrderHistoryPage = () => {
  const { user, isAuthenticated } = useAuthStore();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    const fetchOrders = async () => {
      if (!isAuthenticated || !user) return;
      
      setLoading(true);
      try {
        const response = await api.get(`/orders?buyerId=${user._id}`);
        setOrders(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError('Gagal memuat riwayat pesanan. Silakan coba lagi.');
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [isAuthenticated, user]);

  // Filter orders based on active tab
  const filteredOrders = orders.filter(order => {
    if (activeTab === 'all') return true;
    return order.status === activeTab;
  });

  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('id-ID', options);
  };

  // Get status badge color
  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'picked_up':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'expired':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  // Get delivery status badge color
  const getDeliveryStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'on_delivery':
        return 'bg-blue-100 text-blue-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Translate status to Indonesian
  const translateStatus = (status) => {
    const statusMap = {
      pending: 'Menunggu',
      picked_up: 'Diambil',
      cancelled: 'Dibatalkan',
      expired: 'Kedaluwarsa',
      on_delivery: 'Sedang Dikirim',
      delivered: 'Terkirim',
      failed: 'Gagal'
    };
    return statusMap[status] || status;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Riwayat Pesanan</h1>
      
      {/* Tabs */}
      <div className="mb-6 border-b">
        <div className="flex space-x-6 overflow-x-auto">
          <button
            className={`pb-2 px-1 ${activeTab === 'all' ? 'border-b-2 border-green-500 text-green-600 font-medium' : 'text-gray-500'}`}
            onClick={() => setActiveTab('all')}
          >
            Semua
          </button>
          <button
            className={`pb-2 px-1 ${activeTab === 'pending' ? 'border-b-2 border-green-500 text-green-600 font-medium' : 'text-gray-500'}`}
            onClick={() => setActiveTab('pending')}
          >
            Menunggu
          </button>
          <button
            className={`pb-2 px-1 ${activeTab === 'picked_up' ? 'border-b-2 border-green-500 text-green-600 font-medium' : 'text-gray-500'}`}
            onClick={() => setActiveTab('picked_up')}
          >
            Diambil
          </button>
          <button
            className={`pb-2 px-1 ${activeTab === 'cancelled' ? 'border-b-2 border-green-500 text-green-600 font-medium' : 'text-gray-500'}`}
            onClick={() => setActiveTab('cancelled')}
          >
            Dibatalkan
          </button>
        </div>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="text-6xl mb-4">📋</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Tidak Ada Pesanan</h2>
          <p className="text-gray-600 mb-6">Anda belum memiliki pesanan apapun.</p>
          <Link
            to="/products"
            className="inline-block bg-green-500 text-white font-medium px-6 py-3 rounded-lg hover:bg-green-600 transition"
          >
            Mulai Belanja
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredOrders.map((order) => (
            <div key={order._id} className="bg-white rounded-lg shadow-md overflow-hidden border-2 border-green-100">
              <div className="p-4 border-b flex justify-between items-center">
                <div>
                  <span className="text-sm text-gray-500">ID Pesanan: {order._id}</span>
                  <p className="text-sm text-gray-500">{formatDate(order.createdAt)}</p>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(order.status)}`}>
                  {translateStatus(order.status)}
                </div>
              </div>
              
              <div className="p-4">
                <div className="flex flex-col sm:flex-row">
                  <div className="sm:w-24 h-24 mb-4 sm:mb-0">
                    <img 
                      src={order.productId?.imageUrl || 'https://via.placeholder.com/150'} 
                      alt={order.productId?.name} 
                      className="w-full h-full object-cover rounded"
                    />
                  </div>
                  
                  <div className="sm:ml-4 flex-1">
                    <h3 className="font-medium text-gray-800">{order.productId?.name}</h3>
                    <p className="text-sm text-gray-500 mb-2">Penjual: {order.productId?.sellerId?.name}</p>
                    <p className="text-sm">Jumlah: {order.quantity}</p>
                    
                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                        Metode: {order.deliveryMethod === 'cod' ? 'Ambil Sendiri' : 'Pengiriman'}
                      </span>
                      
                      {order.deliveryMethod === 'cod' && (
                        <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                          Waktu: {order.pickupTime === 'pagi' ? 'Pagi (08:00 - 11:00)' : 
                                  order.pickupTime === 'siang' ? 'Siang (11:00 - 14:00)' : 
                                  order.pickupTime === 'sore' ? 'Sore (14:00 - 17:00)' : 
                                  'Malam (17:00 - 20:00)'}
                        </span>
                      )}
                      
                      {order.deliveryMethod === 'delivery' && (
                        <span className={`px-2 py-1 rounded text-xs ${getDeliveryStatusBadge(order.deliveryStatus)}`}>
                          Pengiriman: {translateStatus(order.deliveryStatus)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-gray-50 border-t">
                <Link 
                  to={`/order-receipt?ids=${order._id}`}
                  className="text-green-600 hover:text-green-700 text-sm font-medium"
                >
                  Lihat Detail
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderHistoryPage; 