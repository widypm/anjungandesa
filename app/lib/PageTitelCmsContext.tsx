// components/context/PageTitleContext.tsx
"use client";

import { createContext, useContext, useState, ReactNode } from "react";

const PageTitleContext = createContext<{
  title: string;
  setTitle: (title: string) => void;
}>({
  title: "",
  setTitle: () => {},
});

export function PageTitleProvider({ children }: { children: ReactNode }) {
  const [title, setTitle] = useState("CMS Panel");
  return (
    <PageTitleContext.Provider value={{ title, setTitle }}>
      {children}
    </PageTitleContext.Provider>
  );
}

export const usePageTitle = () => useContext(PageTitleContext);
