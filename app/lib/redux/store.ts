// lib/store.ts
import { configureStore } from "@reduxjs/toolkit";
import counterReducer, { counterSlice } from "./counterSlice"; // Example slice
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
import storage from "redux-persist/lib/storage";

const persistConfig = {
  key: "dips-wdy",
  storage,
};
const persistedReducer = persistReducer(persistConfig, counterReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }),
});

export const presistorStore = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
