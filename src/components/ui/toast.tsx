// Simple toast notification component

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

export interface ToastProps {
  message: string;
  type?: "success" | "error" | "info";
  duration?: number;
  onClose?: () => void;
  show: boolean;
}

export function Toast({ message, type = "success", duration = 3000, onClose, show }: ToastProps) {
  const [visible, setVisible] = useState(show);

  useEffect(() => {
    setVisible(show);
  }, [show]);

  useEffect(() => {
    if (visible && duration > 0) {
      const timer = setTimeout(() => {
        setVisible(false);
        onClose?.();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible, duration, onClose]);

  const handleClose = () => {
    setVisible(false);
    onClose?.();
  };

  if (!visible) return null;

  const typeStyles = {
    success: "bg-green-100 text-green-800 border-green-300",
    error: "bg-red-100 text-red-800 border-red-300",
    info: "bg-blue-100 text-blue-800 border-blue-300",
  };

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-sm mx-auto">
      <div
        className={`p-3 border rounded-lg shadow-lg transition-all duration-300 ${
          typeStyles[type]
        } ${visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"}`}
      >
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-medium flex-1">{message}</span>
          <Button onClick={handleClose} variant="ghost" size="sm" className="h-6 w-6 p-0 hover:bg-transparent">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
