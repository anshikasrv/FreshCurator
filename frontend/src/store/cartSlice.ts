import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
}

interface CartState {
  items: CartItem[];
  totalAmount: number;
}

const initialState: CartState = {
  items: [],
  totalAmount: 0,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<CartItem>) => {
      const existingItem = state.items.find(item => item.id === action.payload.id);
      if (existingItem) {
        existingItem.quantity += action.payload.quantity;
      } else {
        state.items.push(action.payload);
      }
      state.totalAmount += action.payload.price * action.payload.quantity;
    },
    removeFromCart: (state, action: PayloadAction<string>) => {
      const existingItemIndex = state.items.findIndex(item => item.id === action.payload);
      if (existingItemIndex >= 0) {
        const item = state.items[existingItemIndex];
        state.totalAmount -= item.price * item.quantity;
        state.items.splice(existingItemIndex, 1);
      }
    },
    clearCart: (state) => {
      state.items = [];
      state.totalAmount = 0;
    }
  },
});

export const { addToCart, removeFromCart, clearCart } = cartSlice.actions;

export default cartSlice.reducer;
