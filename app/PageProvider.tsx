"use client";

import { PageContext } from "./PageContext";

export default function PageProvider({ value, children }: any) {
  return <PageContext.Provider value={value}>{children}</PageContext.Provider>;
}
