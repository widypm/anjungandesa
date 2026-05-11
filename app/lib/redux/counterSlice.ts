// lib/slices/counterSlice.ts
import { PayloadAction, createSlice } from "@reduxjs/toolkit";

const initialState = {
  value: {},
};

export const counterSlice = createSlice({
  name: "local",
  initialState,
  reducers: {
    setLocal: (state, action: PayloadAction<any>) => {
      state.value = action.payload;
    },
  },
});

export const { setLocal } = counterSlice.actions;
export default counterSlice.reducer;
