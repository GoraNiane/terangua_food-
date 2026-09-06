import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  evolution?: string;
  isPositive?: boolean;
  icon: React.ComponentType<{ className?: string }>;
  subtitle?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  evolution,
  isPositive = true,
  icon: Icon,
  subtitle,
}) => {
  return (
    <div className="bg-white p-5 rounded-2xl border border-[#EAEAEA] hover:border-[#0A0A0A] transition-all space-y-3 shadow-soft">
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-wider text-[#8A8A8A] font-bold">
          {title}
        </span>
        <div className="w-8 h-8 rounded-lg bg-[#FAFAFA] border border-[#EAEAEA] flex items-center justify-center text-[#0A0A0A]">
          <Icon className="w-4 h-4" />
        </div>
      </div>

      <div className="flex items-baseline justify-between gap-2">
        <h3 className="font-sans font-black text-xl sm:text-2xl text-[#0A0A0A] tracking-tight">
          {value}
        </h3>

        {evolution && (
          <div className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#F3F3F3] text-[#0A0A0A] border border-[#EAEAEA]">
            {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            <span>{evolution}</span>
          </div>
        )}
      </div>

      {subtitle && (
        <p className="text-[11px] text-[#8A8A8A]">
          {subtitle}
        </p>
      )}
    </div>
  );
};
