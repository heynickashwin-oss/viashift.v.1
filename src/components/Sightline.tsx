import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { SightlineParticles } from './SightlineParticles';

export interface SightlineProps {
  line1: string;
  metric: string;
  line2: string;
  companyName?: string;
  companyLogo?: string;
  stakeholderType: 'finance' | 'ops' | 'sales' | 'all';
  onContinue: () => void;
  autoAdvance?: boolean;
  autoAdvanceDuration?: number;
}

const stakeholderConfig = {
  finance: { icon: '💰', label: 'Finance View', color: '#00D4E5' },
  ops: { icon: '⚙️', label: 'Operations View', color: '#00BFA6' },
  sales: { icon: '📈', label: 'Sales View', color: '#FF6B6B' },
  all: { icon: '🎯', label: 'Overview', color: '#F0F4F8' },
};

const interpolate = (text: string, companyName?: string) => {
  if (!companyName) return text.replace(/\[company\]/gi, 'your company');
  return text.replace(/\[company\]/gi, companyName);
};

export const Sightline = ({
  line1,
  metric,
  line2,
  companyName,
  companyLogo,
  stakeholderType,
  onContinue,
  autoAdvance = true,
  autoAdvanceDuration = 5000,
}: SightlineProps) => {
  const [contentRevealed, setContentRevealed] = useState(false);

  const interpolatedLine1 = interpolate(line1, companyName);
  const interpolatedLine2 = interpolate(line2, companyName);

  useEffect(() => {
    const timer = setTimeout(() => {
      setContentRevealed(true);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (autoAdvance) {
      const timer = setTimeout(() => {
        onContinue();
      }, autoAdvanceDuration);

      return () => clearTimeout(timer);
    }
  }, [autoAdvance, autoAdvanceDuration, onContinue]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (contentRevealed && (e.key === 'Enter' || e.key === ' ' || e.key === 'Escape')) {
        e.preventDefault();
        onContinue();
      }
    };

    if (contentRevealed) {
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [contentRevealed, onContinue]);

  const handleClick = () => {
    if (contentRevealed) {
      onContinue();
    }
  };

  return (
    <div
      className={`fixed inset-0 bg-[#0A0E14] ${contentRevealed ? 'cursor-pointer' : ''}`}
      onClick={handleClick}
    >
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at 50% 30%, rgba(0, 212, 229, 0.03) 0%, transparent 60%)',
        }}
      />

      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at center, transparent 40%, rgba(0, 0, 0, 0.4) 100%)',
        }}
      />

      <SightlineParticles />

      <div className="absolute top-6 right-6 flex items-center gap-2 text-xs opacity-30 z-10">
        <span>{stakeholderConfig[stakeholderType].icon}</span>
        <span style={{ color: stakeholderConfig[stakeholderType].color }}>
          {stakeholderConfig[stakeholderType].label}
        </span>
      </div>

      <motion.div
        className="relative z-10 flex flex-col items-center justify-center min-h-screen px-8"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: {},
          visible: {
            transition: {
              staggerChildren: 0.5,
              delayChildren: 0.4,
            },
          },
        }}
      >
        <motion.p
          className="text-lg md:text-xl lg:text-2xl xl:text-3xl font-light text-[#F0F4F8] opacity-80 text-center mb-4 max-w-4xl"
          style={{
            fontFamily: 'Inter, sans-serif',
            letterSpacing: '0.02em',
          }}
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: {
              opacity: 0.8,
              y: 0,
              transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
            },
          }}
        >
          {interpolatedLine1}
        </motion.p>

        <motion.h1
          className="text-5xl md:text-7xl lg:text-8xl xl:text-9xl font-bold text-[#00D4E5] text-center my-6"
          style={{
            fontFamily: 'JetBrains Mono, monospace',
            letterSpacing: '-0.02em',
            textShadow: '0 0 60px rgba(0, 212, 229, 0.3)',
          }}
          variants={{
            hidden: { opacity: 0, scale: 0.9 },
            visible: {
              opacity: 1,
              scale: 1,
              transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
            },
          }}
        >
          {metric}
        </motion.h1>

        <motion.p
          className="text-lg md:text-xl lg:text-2xl xl:text-3xl font-light text-[#F0F4F8] opacity-80 text-center mt-4 max-w-4xl"
          style={{
            fontFamily: 'Inter, sans-serif',
            letterSpacing: '0.02em',
          }}
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: {
              opacity: 0.8,
              y: 0,
              transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
            },
          }}
        >
          {interpolatedLine2}
        </motion.p>
      </motion.div>

      <motion.button
        onClick={(e) => {
          e.stopPropagation();
          onContinue();
        }}
        className="absolute bottom-24 left-1/2 -translate-x-1/2 flex items-center gap-2 text-sm text-[#F0F4F8] opacity-60 hover:opacity-100 transition-opacity duration-300 cursor-pointer z-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.6 }}
        transition={{ delay: 3, duration: 0.4 }}
      >
        <span>Continue</span>
        <svg
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </motion.button>

      <button
        onClick={(e) => {
          e.stopPropagation();
          onContinue();
        }}
        className="absolute bottom-8 right-8 text-xs text-[#6B7A8C] opacity-40 hover:opacity-70 transition-opacity duration-200 z-20"
      >
        Skip
      </button>

      {companyLogo && (
        <img
          src={companyLogo}
          alt=""
          className="absolute bottom-8 left-8 h-8 w-auto opacity-30 object-contain z-10"
        />
      )}
    </div>
  );
};
