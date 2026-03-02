import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  user: localStorage.getItem('username') || null,
  role: localStorage.getItem('role') || 'РУК',
  token: localStorage.getItem('token') || null,

  setAuth: (token, role, username) => {
    localStorage.setItem('token', token);
    localStorage.setItem('role', role);
    localStorage.setItem('username', username);
    set({ token, role, user: username });
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('username');
    set({ token: null, role: 'РУК', user: null });
  }
}));