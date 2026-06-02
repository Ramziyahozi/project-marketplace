/**
 * Utility functions untuk penanganan produk, terutama untuk expired products
 */

/**
 * Mengecek apakah produk sudah kadaluarsa
 * @param {Date|string} expiredDate - Tanggal kadaluarsa produk
 * @returns {boolean} true jika produk sudah expired
 */
export const isProductExpired = (expiredDate) => {
  if (!expiredDate) return false;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Set ke awal hari
  
  const expired = new Date(expiredDate);
  expired.setHours(0, 0, 0, 0);
  
  return expired < today;
};

/**
 * Mengecek apakah produk akan segera expired (dalam 3 hari ke depan)
 * @param {Date|string} expiredDate - Tanggal kadaluarsa produk
 * @returns {boolean} true jika produk akan segera expired
 */
export const isProductExpiringSoon = (expiredDate) => {
  if (!expiredDate) return false;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const expired = new Date(expiredDate);
  expired.setHours(0, 0, 0, 0);
  
  const threeDaysLater = new Date(today);
  threeDaysLater.setDate(threeDaysLater.getDate() + 3);
  
  return expired <= threeDaysLater && expired >= today;
};

/**
 * Mendapatkan jumlah hari tersisa sampai produk expired
 * @param {Date|string} expiredDate - Tanggal kadaluarsa produk
 * @returns {number} Jumlah hari tersisa (negative jika sudah expired)
 */
export const getDaysUntilExpired = (expiredDate) => {
  if (!expiredDate) return null;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const expired = new Date(expiredDate);
  expired.setHours(0, 0, 0, 0);
  
  const diffTime = expired - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
};

/**
 * Mendapatkan status expired produk dalam format text
 * @param {Date|string} expiredDate - Tanggal kadaluarsa produk
 * @returns {string} Status expired dalam format text
 */
export const getExpiredStatus = (expiredDate) => {
  const daysLeft = getDaysUntilExpired(expiredDate);
  
  if (daysLeft < 0) {
    return `Sudah kadaluarsa ${Math.abs(daysLeft)} hari yang lalu`;
  }
  
  if (daysLeft === 0) {
    return 'Kedaluwarsa hari ini';
  }
  
  if (daysLeft === 1) {
    return 'Kedaluwarsa besok';
  }
  
  if (daysLeft <= 3) {
    return `Kedaluwarsa dalam ${daysLeft} hari`;
  }
  
  return `Kedaluwarsa ${new Date(expiredDate).toLocaleDateString('id-ID')}`;
};

/**
 * Format tanggal dalam bahasa Indonesia
 * @param {Date|string} date - Tanggal yang akan diformat
 * @returns {string} Tanggal dalam format Indonesia
 */
export const formatDateIndonesia = (date) => {
  if (!date) return '-';
  
  return new Date(date).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};
