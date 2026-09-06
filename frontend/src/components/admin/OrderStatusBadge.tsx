import React from 'react';
import { OrderStatus } from '../../types';

interface OrderStatusBadgeProps {
  status: OrderStatus;
  size?: 'sm' | 'md';
}

export const OrderStatusBadge: React.FC<OrderStatusBadgeProps> = ({ status, size = 'sm' }) => {
  const configs: Record<OrderStatus, { label: string; bg: string; text: string; border: string; dot: string }> = {
    PENDING: {
      label: 'Reçue',
      bg: 'bg-[#0A0A0A]',
      text: 'text-white',
      border: 'border-[#0A0A0A]',
      dot: 'bg-white animate-ping',
    },
    CONFIRMED: {
      label: 'Acceptée',
      bg: 'bg-[#222222]',
      text: 'text-white',
      border: 'border-[#222222]',
      dot: 'bg-white',
    },
    PREPARING: {
      label: 'En préparation',
      bg: 'bg-[#333333]',
      text: 'text-white',
      border: 'border-[#333333]',
      dot: 'bg-white animate-pulse',
    },
    READY: {
      label: 'Prête',
      bg: 'bg-[#EAEAEA]',
      text: 'text-[#0A0A0A]',
      border: 'border-[#D5D5D5]',
      dot: 'bg-[#0A0A0A]',
    },
    SERVED: {
      label: 'Servie',
      bg: 'bg-[#F5F5F5]',
      text: 'text-[#666666]',
      border: 'border-[#EAEAEA]',
      dot: 'bg-[#888888]',
    },
    CANCELLED: {
      label: 'Annulée',
      bg: 'bg-red-50',
      text: 'text-red-600',
      border: 'border-red-200',
      dot: 'bg-red-500',
    },
  };

  const current = configs[status] || configs.PENDING;
  const sizeClasses = size === 'sm' ? 'text-[10px] px-2 py-0.5' : 'text-xs px-2.5 py-1';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-bold uppercase tracking-wider border ${current.bg} ${current.text} ${current.border} ${sizeClasses}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${current.dot}`} />
      <span>{current.label}</span>
    </span>
  );
};
