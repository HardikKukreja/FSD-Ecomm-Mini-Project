import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useWishlistStore = create(
  persist(
    (set, get) => ({
      items: [],
      toggle: (product) => {
        const has = get().items.find((i) => i._id === product._id);
        set({ items: has ? get().items.filter((i) => i._id !== product._id) : [...get().items, product] });
      },
      has: (id) => !!get().items.find((i) => i._id === id),
    }),
    { name: 'wishlist-storage' }
  )
);

