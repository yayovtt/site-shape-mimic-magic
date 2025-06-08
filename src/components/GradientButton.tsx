
import React from 'react';
import { LucideIcon } from 'lucide-react';

interface GradientButtonProps {
  title: string;
  icon: LucideIcon;
  gradient: string;
  onClick: () => void;
  className?: string;
}

export const GradientButton = ({ title, icon: Icon, gradient, onClick, className = "" }: GradientButtonProps) => {
  return (
    <button
      onClick={onClick}
      className={`
        relative overflow-hidden rounded-2xl px-8 py-4 min-w-[280px] h-16
        bg-gradient-to-r ${gradient}
        text-white font-medium text-lg
        transform transition-all duration-200 hover:scale-105 hover:shadow-lg
        flex items-center justify-center gap-3
        ${className}
      `}
    >
      <Icon className="w-6 h-6" />
      <span>{title}</span>
    </button>
  );
};
