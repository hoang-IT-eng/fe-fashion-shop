import { create } from 'zustand';

interface AuthState {
  isAuthenticated: boolean;
  user: { email: string; role: 'user' | 'admin' } | null;
  login: (email: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  user: null,
  login: (email) => set({
    isAuthenticated: true,
    // Mẹo nhỏ: Cứ gõ email có chữ 'admin' thì cấp quyền admin để lát test trang CRUD
    user: { email, role: email.includes('admin') ? 'admin' : 'user' }
  }),
  logout: () => set({ isAuthenticated: false, user: null }),
}));