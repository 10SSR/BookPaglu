import React, { useState, useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Book, Film, Music, Gamepad2 } from 'lucide-react';
import { MediaType } from '../../types';

interface Cover3DProps {
  coverUrl?: string;
  title: string;
  dominantColor?: string;
  mediaType: MediaType;
  aspectRatio?: 'book' | 'poster' | 'square';
  className?: string;
  glow?: boolean;
  priority?: boolean;
  layoutId?: string;
  interactive?: boolean;
}

export const Cover3D: React.FC<Cover3DProps> = ({
  coverUrl,
  title,
  dominantColor = '#8b5cf6',
  mediaType,
  aspectRatio = 'poster',
  className = '',
  glow = true,
  layoutId,
  interactive = true
}) => {
  const [imageError, setImageError] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Motion values for smooth 3D tilt
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 350, damping: 25 });
  const mouseYSpring = useSpring(y, { stiffness: 350, damping: 25 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ['10deg', '-10deg']);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ['-10deg', '10deg']);
  const shineOpacity = useTransform(mouseYSpring, [-0.5, 0, 0.5], [0.35, 0, 0.35]);

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!interactive || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;

    x.set(xPct);
    y.set(yPct);
  };

  const handlePointerLeave = () => {
    if (!interactive) return;
    x.set(0);
    y.set(0);
  };

  // Aspect ratio classes
  const aspectClass = 
    aspectRatio === 'square' 
      ? 'aspect-square' 
      : aspectRatio === 'book'
      ? 'aspect-[2/3]'
      : 'aspect-[2/3]'; // standard cinematic poster

  const MediaIcon = {
    book: Book,
    movie: Film,
    music: Music,
    game: Gamepad2
  }[mediaType];

  return (
    <div 
      className={`relative select-none perspective-1000 ${className}`}
      style={{ perspective: '1000px' }}
    >
      {/* Dynamic Dominant Glow Backdrop */}
      {glow && (
        <div 
          className="absolute inset-0 rounded-2xl blur-xl opacity-35 transition-opacity duration-500 group-hover:opacity-75 -z-10"
          style={{ backgroundColor: dominantColor }}
        />
      )}

      <motion.div
        ref={cardRef}
        layoutId={layoutId}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        style={{
          rotateX: interactive ? rotateX : 0,
          rotateY: interactive ? rotateY : 0,
          transformStyle: 'preserve-3d',
        }}
        className={`relative overflow-hidden rounded-2xl bg-ink-900 border border-white/10 shadow-card-3d transition-shadow duration-300 ${aspectClass}`}
      >
        {coverUrl && !imageError ? (
          <img
            src={coverUrl}
            alt={title}
            onError={() => setImageError(true)}
            className="w-full h-full object-cover rounded-2xl transform transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          /* Gradient Fallback */
          <div 
            className="w-full h-full flex flex-col items-center justify-between p-4 text-center rounded-2xl relative overflow-hidden"
            style={{
              background: `linear-gradient(135deg, ${dominantColor}55 0%, #0b0d13 100%)`
            }}
          >
            <div className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center self-start">
              <MediaIcon className="w-4 h-4 text-white/90" />
            </div>
            
            <p className="font-serif text-sm font-semibold text-white/95 line-clamp-3 leading-snug px-1">
              {title}
            </p>

            <span className="text-[10px] font-mono tracking-widest uppercase text-white/50 pb-1">
              {mediaType}
            </span>
          </div>
        )}

        {/* Dynamic Specular Glare Shine Effect */}
        {interactive && (
          <motion.div
            style={{
              opacity: shineOpacity,
              background: 'linear-gradient(105deg, transparent 20%, rgba(255,255,255,0.4) 50%, transparent 80%)'
            }}
            className="pointer-events-none absolute inset-0 z-10 transition-opacity duration-200"
          />
        )}

        {/* Subtle border highlight */}
        <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/10" />
      </motion.div>
    </div>
  );
};
