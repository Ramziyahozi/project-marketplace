import React, { useEffect, useState } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import api from '../utils/axios';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const OrderReceiptPage = () => {
  const query = useQuery();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const ids = query.get('ids');
    if (!ids) {
      setError('Tidak ada data pesanan.');
      setLoading(false);
      return;
    }
    const orderIds = ids.split(',');
    let isMounted = true;
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const results = await Promise.all(orderIds.map(id => 
          api.get(`/orders/${id}`).then(res => res.data).catch(() => null)
        ));
        const validOrders = results.filter(Boolean);
        if (isMounted) {
          setOrders(validOrders);
          if (validOrders.length === 0) {
            setError('Gagal memuat detail pesanan.');
          } else {
            setError('');
          }
        }
      } catch (err) {
        if (isMounted) {
          setError('Gagal memuat detail pesanan.');
          setOrders([]);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchOrders();
    return () => { isMounted = false; };
  }, [query.get('ids')]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (error || orders.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12 min-h-screen flex items-center justify-center">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-8 text-center">
          <h2 className="text-xl font-bold text-gray-800 mb-2">Receipt Tidak Ditemukan</h2>
          <p className="text-gray-600 mb-6">{error || 'Tidak ada data pesanan.'}</p>
          <Link to="/order-history" className="inline-block bg-green-500 text-white font-medium px-6 py-3 rounded-lg hover:bg-green-600 transition">Lihat Riwayat Pesanan</Link>
        </div>
      </div>
    );
  }

  // Gabung info pesanan
  const orderData = orders[0] || {};
  const order = orderData.order || {};
  const orderDetails = orderData.orderDetails || [];

  // Helper functions untuk layout baru
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', { month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric' });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing_payment':
        return 'bg-blue-100 text-blue-800';
      case 'picked_up':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const translateStatus = (status) => {
    switch (status) {
      case 'pending':
        return 'Menunggu';
      case 'processing_payment':
        return 'Sedang Diproses';
      case 'picked_up':
        return 'Diambil';
      case 'cancelled':
        return 'Dibatalkan';
      default:
        return status;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg border-2 border-green-100 p-8">
        {/* Logo & Judul */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg">S</span>
            </div>
            <span className="text-2xl font-bold text-green-700">SurplusFood</span>
          </div>
          <span className="text-lg font-semibold text-gray-700">Struk Pesanan</span>
        </div>
        {/* Info Pesanan */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm text-gray-500">ID Pesanan:</span>
            <span className="font-mono text-sm text-gray-700">{order?._id}</span>
          </div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm text-gray-500">Tanggal Pesan:</span>
            <span className="text-sm text-gray-700">{formatDate(order?.createdAt)}</span>
          </div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm text-gray-500">Status:</span>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(order?.status)}`}>{translateStatus(order?.status)}</span>
          </div>
        </div>
        {/* Info Pembeli & Pengiriman */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <div className="font-semibold text-gray-700 mb-1">Pembeli</div>
            <div className="text-sm text-gray-700">{order?.buyerId?.name}</div>
            <div className="text-sm text-gray-500">{order?.buyerId?.phone || '-'}</div>
          </div>
          <div>
            <div className="font-semibold text-gray-700 mb-1">Pengiriman</div>
            <div className="text-sm text-gray-700">{order?.deliveryMethod === 'cod' ? 'Ambil Sendiri' : 'Pengiriman'}</div>
            {order?.deliveryMethod === 'cod' ? (
              <div className="text-sm text-gray-500">Waktu: {order?.pickupTime === 'pagi' ? 'Pagi (08:00 - 11:00)' : order?.pickupTime === 'siang' ? 'Siang (11:00 - 14:00)' : order?.pickupTime === 'sore' ? 'Sore (14:00 - 17:00)' : 'Malam (17:00 - 20:00)'}</div>
            ) : (
              <>
                <div className="text-sm text-gray-500">Alamat: {order?.deliveryAddress}</div>
                <div className="text-sm text-gray-500">Ongkir: Rp{(order?.deliveryFee || 0).toLocaleString()}</div>
                <div className="text-sm text-gray-500">Status Pengiriman: <span className="font-semibold">{order?.deliveryStatus === 'pending' ? 'Belum Dikirim' : order?.deliveryStatus === 'on_delivery' ? 'Dalam Pengiriman' : order?.deliveryStatus === 'delivered' ? 'Selesai' : order?.deliveryStatus === 'failed' ? 'Gagal' : '-'}</span></div>
                {order?.tracking && order.tracking.length > 0 && (
                  <div className="mt-1 text-xs text-gray-600">
                    <div className="font-semibold text-gray-700 mb-1">Riwayat Pengiriman:</div>
                    <ul className="list-disc ml-4">
                      {order.tracking.map((t, idx) => (
                        <li key={idx}>{t.status === 'on_delivery' ? 'Dalam Pengiriman' : t.status === 'delivered' ? 'Selesai' : t.status === 'failed' ? 'Gagal' : t.status} - {new Date(t.time).toLocaleString('id-ID')}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
        {/* Tabel Produk */}
        <div className="mb-4">
          <div className="font-semibold text-gray-700 mb-2">Produk</div>
          <table className="w-full text-sm border rounded overflow-hidden">
            <thead>
              <tr className="bg-gray-100 text-gray-700">
                <th className="py-2 px-2 text-left">Nama Produk</th>
                <th className="py-2 px-2 text-center">Qty</th>
                <th className="py-2 px-2 text-right">Harga</th>
                <th className="py-2 px-2 text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {orderDetails.length > 0 ? orderDetails.map((detail) => (
                <tr className="border-b" key={detail._id}>
                  <td className="py-2 px-2">{detail.productName}</td>
                  <td className="py-2 px-2 text-center">{detail.quantity}</td>
                  <td className="py-2 px-2 text-right">Rp{(detail.discountPrice || detail.unitPrice)?.toLocaleString()}</td>
                  <td className="py-2 px-2 text-right">Rp{detail.totalPrice?.toLocaleString()}</td>
              </tr>
              )) : (
                <tr><td colSpan={4} className="text-center py-2">Tidak ada produk</td></tr>
              )}
            </tbody>
          </table>
        </div>
        {/* Ringkasan Pembayaran */}
        <div className="mb-4">
          <div className="font-semibold text-gray-700 mb-2">Ringkasan Pembayaran</div>
          <div className="flex justify-between text-sm mb-1">
            <span>Total Harga Produk</span>
            <span>Rp{orderDetails.reduce((sum, d) => sum + (d.totalPrice || 0), 0).toLocaleString()}</span>
          </div>
          {order?.deliveryMethod === 'delivery' && (
            <div className="flex justify-between text-sm mb-1">
              <span>Biaya Pengiriman</span>
              <span>Rp{(order?.deliveryFee || 0).toLocaleString()}</span>
            </div>
          )}
          <div className="flex justify-between text-base font-bold border-t pt-2">
            <span>Total Bayar</span>
            <span className="text-green-600">Rp{(orderDetails.reduce((sum, d) => sum + (d.totalPrice || 0), 0) + (order?.deliveryFee || 0)).toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm mt-2">
            <span>Metode Pembayaran</span>
            <span className="font-semibold">
              {order?.paymentMethod === 'gopay' && 'GoPay'}
              {order?.paymentMethod === 'shopeepay' && 'ShopeePay'}
              {order?.paymentMethod === 'bank' && 'Transfer Bank'}
            </span>
          </div>
        </div>
        {/* Info Penjual */}
        <div className="mb-6">
          <div className="font-semibold text-gray-700 mb-1">Penjual</div>
          <div className="text-sm text-gray-700">{orderDetails[0]?.sellerName || '-'}</div>
        </div>
        {/* Catatan */}
        {order?.notes && (
          <div className="mb-6">
            <div className="font-semibold text-gray-700 mb-1">Catatan</div>
            <div className="text-sm text-gray-700">{order.notes}</div>
          </div>
        )}
        {/* Tombol Aksi */}
        <div className="flex gap-4 mt-8">
          <button
            onClick={() => window.print()}
            className="flex-1 bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded-lg transition"
          >
            Cetak Struk
          </button>
          <button
            onClick={() => navigate('/order-history')}
            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 rounded-lg transition"
          >
            Kembali ke Riwayat
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderReceiptPage; 