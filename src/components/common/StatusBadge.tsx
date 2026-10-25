import React from 'react';
import { motion } from 'framer-motion';
import { Bookmark, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { ItemStatus } from '../../types';
import { triggerHaptic } from '../../utils/haptics';

interface StatusBadgeProps {
  status: ItemStatus;
  onChange?: (nextStatus: ItemStatus) => void;
  size?: 'sm' | 'md';
  interactive?: boolean;
}

const STATUS_CONFIG: Record<ItemStatus, {
  label: string;
  icon: React.ElementType;
  bg: string;
  text: string;
  border: string;
  next: ItemStatus;
}> = {
  want: {
    label: 'Want',
    icon: Bookmark,
    bg: 'bg-cyan-500/10',
    text: 'text-cyan-400',
    border: 'border-cyan-500/30',
    next: 'in_progress'
  },
  in_progress: {
    label: 'In Progress',
    icon: Clock,
    bg: 'bg-amber-500/10',
    text: 'text-amber-400',
    border: 'border-amber-500/30',
    next: 'done'
  },
  done: {
    label: 'Done',
    icon: CheckCircle2,
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-400',
    border: 'border-emerald-500/30',
    next: 'dropped'
  },
  dropped: {
    label: 'Dropped',
    icon: XCircle,
    bg: 'bg-rose-500/10',
    text: 'text-rose-400',
    border: 'border-rose-500/30',
    next: 'want'
  }
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  onChange,
  size = 'sm',
  interactive = true
}) => {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.want;
  const Icon = config.icon;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!interactive || !onChange) return;
    triggerHaptic('selection');
    onChange(config.next);
  };

  return (
    <motion.button
      type="button"
      onClick={handleClick}
      whileTap={interactive ? { scale: 0.94 } : undefined}
      layout
      transition={{ type: 'spring', stiffness: 500, damping: 25 }}
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-sans font-medium transition-colors ${config.bg} ${config.text} ${config.border} ${
        size === 'sm' ? 'text-xs' : 'text-sm px-3 py-1'
      } ${interactive ? 'cursor-pointer hover:brightness-125' : 'cursor-default'}`}
    >
      <Icon className={size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} strokeWidth={2} />
      <span>{config.label}</span>
    </motion.button>
  );
};
