import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../utils/axios';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      isHydrated: false,
      error: null,

      
      // Login
      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          // POST ke backend /users/login
          const response = await api.post('/users/login', { email, password });
          const user = response.data;
          set({ 
            user, 
            isAuthenticated: true, 
            isLoading: false 
          });
          localStorage.setItem('user', JSON.stringify(user));

          return true;
        } catch (err) {
          set({ 
            error: err?.response?.data?.error || 'Login gagal', 
            isLoading: false 
          });
          return false;
        }
      },
      
      // Register
      register: async (userData) => {
        set({ isLoading: true, error: null });
        try {
          // Cek apakah email sudah terdaftar
          const checkEmail = await api.get(`/users?email=${userData.email}`);
          
          if (checkEmail.data.length > 0) {
            set({ error: 'Email sudah terdaftar', isLoading: false });
            return false;
          }
          
          // Buat user baru
          const response = await api.post('/users', userData);
          
          set({ 
            user: response.data, 
            isAuthenticated: true, 
            isLoading: false 
          });
          localStorage.setItem('user', JSON.stringify(response.data));
          

          
          return true;
        } catch (err) {
          console.error('Register error:', err);
          set({ 
            error: 'Terjadi kesalahan saat mendaftar', 
            isLoading: false 
          });
          return false;
        }
      },
      
      // Update profil
      updateProfile: async (userId, profileData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.put(`/users/${userId}`, profileData);
          set({ user: response.data, isLoading: false });
          localStorage.setItem('user', JSON.stringify(response.data));
          return response.data;
        } catch (err) {
          console.error('Profile update error:', err);
          set({ 
            error: 'Terjadi kesalahan saat menyimpan profil', 
            isLoading: false 
          });
          return false;
        }
      },
      
      // Logout
      logout: () => {
        localStorage.removeItem('user');
        set({ 
          user: null, 
          isAuthenticated: false
        });
      },
      
      // Cek status autentikasi
      checkAuth: () => {
        const user = JSON.parse(localStorage.getItem('user') || 'null');
        if (user) {
          set({ user, isAuthenticated: true });
        }
      },
      
      // Update user data
      updateUser: (userData) => {
        localStorage.setItem('user', JSON.stringify({
          ...JSON.parse(localStorage.getItem('user') || '{}'),
          ...userData,
        }));
        
        set((state) => ({
          user: { ...state.user, ...userData },
        }));
      },
      
      // Set user (update state dan localStorage)
      setUser: (userData) => {
        localStorage.setItem('user', JSON.stringify(userData));
        set({ user: userData, isAuthenticated: !!userData });
      },
      

    }),
    {
      name: 'auth-storage', // nama untuk localStorage
      getStorage: () => localStorage, // storage yang digunakan
      
      // Fungsi ini akan dijalankan saat hydrate dari storage
      onRehydrateStorage: () => (state) => {
        // Check if user exists in localStorage
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          try {
            const user = JSON.parse(storedUser);
            state.user = user;
            state.isAuthenticated = true;
            

          } catch (e) {
            console.error('Failed to parse user from localStorage', e);
          }
        }
        state.isHydrated = true;
      }
    }
  )
);

export default useAuthStore; 