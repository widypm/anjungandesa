"use client";
import { useEffect } from "react";

export interface ToastProps {
  message: string;
  type?: "success" | "error" | "info";
  position?:
    | "top-left"
    | "top-center"
    | "top-right"
    | "bottom-left"
    | "bottom-center"
    | "bottom-right";
  duration?: number; // default 3000ms
  onClose: () => void;
}

export default function Toast({
  message,
  type = "info",
  position = "top-right",
  duration = 3000,
  onClose,
}: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);
  const isTop = position.startsWith("top");
  const bgColor =
    type === "success"
      ? "bg-green-500"
      : type === "error"
      ? "bg-red-500"
      : "bg-blue-500";

  const progressColor =
    type === "success"
      ? "bg-green-300"
      : type === "error"
      ? "bg-red-300"
      : "bg-blue-300";

  const positionClasses: Record<string, string> = {
    "top-left": "top-6 left-6",
    "top-center": "top-6 left-1/2 -translate-x-1/2",
    "top-right": "top-6 right-6",
    "bottom-left": "bottom-20 left-6",
    "bottom-center": "bottom-20 left-1/2 -translate-x-1/2",
    "bottom-right": "bottom-20 right-6",
  };

  return (
    <div
      className={`fixed px-4 py-3 text-white rounded-lg shadow-lg ${bgColor}
    ${positionClasses[position]} w-auto min-w-[220px]
    ${isTop ? "animate-fade-in-top" : "animate-fade-in-bottom"}
  `}
    >
      <div>{message}</div>

      {/* Progress Bar */}
      <div className="relative w-full h-1 bg-white/30 mt-2 overflow-hidden rounded">
        <div
          className={`absolute left-0 top-0 h-full ${progressColor}`}
          style={{
            animation: `toast-progress ${duration}ms linear forwards`,
          }}
        ></div>
      </div>

      {/* CSS Animation */}
      <style jsx>{`
        @keyframes fade-in-top {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fade-in-bottom {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in-top {
          animation: fade-in-top 0.3s ease-out;
        }

        .animate-fade-in-bottom {
          animation: fade-in-bottom 0.3s ease-out;
        }

        @keyframes toast-progress {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
      `}</style>
    </div>
  );
}
