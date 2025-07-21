import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      
      // Tambahkan item ke keranjang dengan validasi stok
      addItem: (product, quantity = 1) => {
        set((state) => {
          const existingItemIndex = state.items.findIndex(
            (item) => item._id === product._id
          );

          if (existingItemIndex !== -1) {
            // Jika item sudah ada, cek stok
            const existingItem = state.items[existingItemIndex];
            const newTotalQuantity = existingItem.quantity + quantity;
            
            if (newTotalQuantity > product.stock) {
              // Tampilkan error atau alert
              alert(`Stok tidak mencukupi! Stok tersedia: ${product.stock}, yang diminta: ${newTotalQuantity}`);
              return state; // Tidak ada perubahan
            }
            
            // Update quantity jika stok mencukupi
            const updatedItems = [...state.items];
            updatedItems[existingItemIndex].quantity = newTotalQuantity;
            return { items: updatedItems };
          } else {
            // Jika item belum ada, cek stok
            if (quantity > product.stock) {
              alert(`Stok tidak mencukupi! Stok tersedia: ${product.stock}, yang diminta: ${quantity}`);
              return state; // Tidak ada perubahan
            }
            
            // Tambahkan ke keranjang jika stok mencukupi
            return { items: [...state.items, { ...product, quantity }] };
          }
        });
      },
      
      // Update quantity item dengan validasi stok
      updateItemQuantity: (itemId, newQuantity) => {
        set((state) => {
          if (newQuantity <= 0) {
            // Hapus item jika quantity 0 atau negatif
            return {
              items: state.items.filter(item => item._id !== itemId)
            };
          }
          
          // Cek stok sebelum update
          const item = state.items.find(item => item._id === itemId);
          if (item && newQuantity > item.stock) {
            alert(`Stok tidak mencukupi! Stok tersedia: ${item.stock}, yang diminta: ${newQuantity}`);
            return state; // Tidak ada perubahan
          }
          
          // Update quantity jika stok mencukupi
          return {
            items: state.items.map(item => 
              item._id === itemId ? { ...item, quantity: newQuantity } : item
            )
          };
        });
      },
      
      // Hapus item dari keranjang
      removeItem: (itemId) => {
        set((state) => ({
          items: state.items.filter(item => item._id !== itemId)
        }));
      },
      
      // Kosongkan keranjang
      clearCart: () => {
        set({ items: [] });
      },
      
      // Hitung total harga
      getTotalPrice: () => {
        return get().items.reduce((total, item) => {
          const price = item.discountPrice || item.price;
          return total + (price * item.quantity);
        }, 0);
      },
      
      // Hitung jumlah item di keranjang
      getItemCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0);
      },
      
      // Cek apakah semua item di keranjang masih tersedia stoknya
      validateStock: () => {
        const state = get();
        const invalidItems = state.items.filter(item => item.quantity > item.stock);
        return {
          isValid: invalidItems.length === 0,
          invalidItems
        };
      },
      
      // Update item dengan data terbaru dari server
      updateItemWithServerData: (itemId, serverData) => {
        set((state) => ({
          items: state.items.map(item => 
            item._id === itemId ? { ...item, ...serverData } : item
          )
        }));
      },
      
      // Refresh semua item dengan data terbaru
      refreshAllItems: (updatedItems) => {
        set({ items: updatedItems });
      }
    }),
    {
      name: 'cart-storage', // nama untuk localStorage key
      getStorage: () => localStorage, // storage yang digunakan
    }
  )
);

export default useCartStore; 