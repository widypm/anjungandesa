"use client";

import { Provider } from "react-redux";
import { presistorStore, store } from "./redux/store";
import { PersistGate } from "redux-persist/integration/react";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={presistorStore}>
        {children}
      </PersistGate>
    </Provider>
  );
}
