import React from "react";
import { LucideIcon } from "lucide-react";

interface TabButtonProps {
  label: string;
  icon: LucideIcon;
  isActive: boolean;
  onClick: () => void;
  showFullLabel?: boolean;
}

export const TabButton: React.FC<TabButtonProps> = ({ label, icon: Icon, isActive, onClick, showFullLabel = true }) => {
  return (
    <button
      onClick={onClick}
      className={`px-3 sm:px-4 py-2 border-b-2 font-medium text-xs sm:text-sm transition-colors whitespace-nowrap ${
        isActive ? "border-blue-500 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"
      }`}
    >
      <Icon className="w-4 h-4 inline mr-1 sm:mr-2" />
      {showFullLabel ? (
        label
      ) : (
        <>
          <span className="hidden sm:inline">{label.split(" ")[0]} </span>
          {label.split(" ").slice(1).join(" ")}
        </>
      )}
    </button>
  );
};

TabButton.displayName = "TabButton";
