"use client";

import { createContext, useContext } from "react";

export const PageContext = createContext<any>(null);

export function usePageData() {
  return useContext(PageContext);
}
