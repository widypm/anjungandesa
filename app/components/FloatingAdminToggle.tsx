"use client";

import { useEffect, useState } from "react";

export default function FloatingAdminToggle() {
  const [mounted, setMounted] = useState(false);
  const [pathname, setPathname] = useState("/");

  useEffect(() => {
    setMounted(true);
    setPathname(window.location.pathname || "/");
  }, []);

  if (!mounted) {
    return null;
  }

  const isCmsPage = pathname.startsWith("/cms");
  const targetHref = isCmsPage ? "/" : "/cms/login";

  return (
    <a
      href={targetHref}
      className="fixed bottom-4 left-4 z-50 rounded-full border border-white/30 bg-black/65 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white shadow-lg backdrop-blur-md transition hover:bg-black/80"
    >
      {isCmsPage ? "Home" : "Admin"}
    </a>
  );
}
