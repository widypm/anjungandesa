import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";

type Props = {
  children: React.ReactNode;
  onClick: () => Promise<void>;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "bluebtn"; // baru
  icon?: React.ReactNode;
  load?: boolean;
};

export default function ButtonUi({
  children,
  onClick,
  disabled = false,
  variant = "primary",
  icon,
  load,
}: Props) {
  const [loading, setLoading] = useState(load);
  const pathname = usePathname();

  const handleClick = async () => {
    if (loading) return;
    setLoading(true);
    try {
      await onClick();
    } finally {
      if (!load) {
        setLoading(false);
      }
    }
  };

  const baseClass =
    "flex items-center justify-center gap-2 px-2 py-2 rounded-md font-bold text-sm transition-all duration-300";

  const variantClass =
    variant === "primary"
      ? "bg-btn-gradientprimary text-white font-bold shadow"
      : variant === "bluebtn"
      ? "bg-btn-gradientblue text-white font-bold shadow"
      : "bg-btn-gradientsecondary hover:bg-gray-100 shadow";

  const disabledClass =
    disabled || loading ? "opacity-60 cursor-not-allowed" : "hover:opacity-90";
  useEffect(() => {
    setLoading(false);
  }, [pathname]);
  return (
    <button
      onClick={handleClick}
      disabled={loading || disabled}
      className={`${baseClass} ${variantClass} ${disabledClass}`}
    >
      {loading ? (
        <svg
          className="w-5 h-5 animate-spin text-inherit"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8z"
          />
        </svg>
      ) : (
        icon && <span className="text-sm">{icon}</span>
      )}
      {children}
    </button>
  );
}
