import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star } from 'lucide-react';
import { triggerHaptic } from '../../utils/haptics';

interface HalfStarRatingProps {
  value?: number; // 0.0 to 5.0
  onChange?: (rating: number) => void;
  size?: 'sm' | 'md' | 'lg';
  readonly?: boolean;
}

export const HalfStarRating: React.FC<HalfStarRatingProps> = ({
  value = 0,
  onChange,
  size = 'md',
  readonly = false
}) => {
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [sparkleIndex, setSparkleIndex] = useState<number | null>(null);

  const displayRating = hoverRating !== null ? hoverRating : value;

  const starSizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  }[size];

  const handleMouseMove = (starIndex: number, e: React.MouseEvent<HTMLDivElement>) => {
    if (readonly) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const isLeftHalf = x < rect.width / 2;
    const computed = starIndex + (isLeftHalf ? 0.5 : 1.0);
    setHoverRating(computed);
  };

  const handleClick = (starIndex: number, e: React.MouseEvent<HTMLDivElement>) => {
    if (readonly || !onChange) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const isLeftHalf = x < rect.width / 2;
    const selected = starIndex + (isLeftHalf ? 0.5 : 1.0);

    triggerHaptic(selected === 5 ? 'heavy' : 'medium');
    setSparkleIndex(starIndex);
    setTimeout(() => setSparkleIndex(null), 600);

    onChange(selected);
  };

  return (
    <div 
      className="inline-flex items-center gap-1 select-none"
      onMouseLeave={() => !readonly && setHoverRating(null)}
    >
      {[0, 1, 2, 3, 4].map((starIdx) => {
        const fillLevel = Math.max(0, Math.min(1, displayRating - starIdx));
        const isHovered = hoverRating !== null && hoverRating >= starIdx + 0.5;

        return (
          <div
            key={starIdx}
            className={`relative cursor-${readonly ? 'default' : 'pointer'} p-0.5`}
            onMouseMove={(e) => handleMouseMove(starIdx, e)}
            onClick={(e) => handleClick(starIdx, e)}
          >
            {/* Sparkle Burst */}
            <AnimatePresence>
              {sparkleIndex === starIdx && (
                <motion.div
                  initial={{ scale: 0.5, opacity: 1 }}
                  animate={{ scale: 1.8, opacity: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                  className="pointer-events-none absolute inset-0 -m-2 rounded-full border-2 border-brand-amber/80 blur-[1px]"
                />
              )}
            </AnimatePresence>

            <motion.div
              animate={{
                scale: isHovered ? 1.25 : 1,
                rotate: isHovered ? [0, -6, 6, 0] : 0
              }}
              transition={{ type: 'spring', stiffness: 400, damping: 15 }}
              className="relative"
            >
              {/* Star Background Track */}
              <Star 
                className={`${starSizes} text-ink-700/60 transition-colors duration-150`} 
                strokeWidth={1.5}
              />

              {/* Star Partial or Full Fill Mask */}
              {fillLevel > 0 && (
                <div
                  className="absolute inset-0 overflow-hidden"
                  style={{ width: `${fillLevel * 100}%` }}
                >
                  <Star 
                    className={`${starSizes} text-brand-gold fill-brand-gold drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]`}
                    strokeWidth={1.5}
                  />
                </div>
              )}
            </motion.div>
          </div>
        );
      })}

      {displayRating > 0 && (
        <motion.span 
          key={displayRating}
          initial={{ opacity: 0, y: 3 }}
          animate={{ opacity: 1, y: 0 }}
          className="ml-2 font-mono text-xs font-semibold text-brand-gold tracking-tight"
        >
          {displayRating.toFixed(1)}
        </motion.span>
      )}
    </div>
  );
};
