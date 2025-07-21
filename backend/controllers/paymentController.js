const midtransClient = require('midtrans-client');

exports.createTransaction = async (req, res) => {
  try {
    const { orderId, grossAmount, customerName, customerEmail } = req.body;

    // Inisialisasi Snap
    let snap = new midtransClient.Snap({
      isProduction: false, // Ganti true jika sudah production
      serverKey: process.env.MIDTRANS_SERVER_KEY,
    });

    // Parameter transaksi
    let parameter = {
      transaction_details: {
        order_id: orderId,
        gross_amount: grossAmount,
      },
      customer_details: {
        first_name: customerName,
        email: customerEmail,
      },
    };

    // Create transaction & get snap token
    const transaction = await snap.createTransaction(parameter);
    res.json({ token: transaction.token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}; 