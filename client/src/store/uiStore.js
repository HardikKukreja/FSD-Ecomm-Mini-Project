import { create } from 'zustand';

export const useUIStore = create((set) => ({
  cartOpen: false,
  setCartOpen: (v) => set({ cartOpen: v }),
  mobileMenuOpen: false,
  setMobileMenuOpen: (v) => set({ mobileMenuOpen: v }),
}));

