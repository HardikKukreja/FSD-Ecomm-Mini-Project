import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      coupon: null,
      discount: 0,
      addItem: (product, qty = 1) => {
        const items = get().items;
        const existing = items.find((i) => i.product._id === product._id);
        if (existing) {
          set({ items: items.map((i) => i.product._id === product._id ? { ...i, qty: i.qty + qty } : i) });
        } else {
          set({ items: [...items, { product, qty }] });
        }
      },
      removeItem: (productId) => set({ items: get().items.filter((i) => i.product._id !== productId) }),
      updateQty: (productId, qty) => set({ items: get().items.map((i) => i.product._id === productId ? { ...i, qty } : i) }),
      clearCart: () => set({ items: [], coupon: null, discount: 0 }),
      setCoupon: (coupon, discount) => set({ coupon, discount }),
      removeCoupon: () => set({ coupon: null, discount: 0 }),
      subtotal: () => get().items.reduce((s, i) => s + (i.product.discountPrice || i.product.price) * i.qty, 0),
      total: () => Math.max(0, get().items.reduce((s, i) => s + (i.product.discountPrice || i.product.price) * i.qty, 0) - get().discount),
      count: () => get().items.reduce((s, i) => s + i.qty, 0),
    }),
    { name: 'cart-storage' }
  )
);

