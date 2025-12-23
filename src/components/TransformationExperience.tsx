/**
 * TransformationExperience - v3.4
 * 
 * Dual-layer visualization with ghost comparison
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { Share2, Eye } from 'lucide-react';
import { SankeyFlowV3, FlowState } from './sankeyflowv3';
import { BrandConfig, DEFAULT_BRAND, resolveTheme } from './branding/brandUtils';
import { UserMenu } from './ui/UserMenu';

export interface TransformationStory {
  id: string;
  title: string;
  subtitle?: string;
  before: FlowState;
  after: FlowState;
  stageLabels?: string[];
}

export interface TransformationExperienceProps {
  story: TransformationStory;
  initialBrand?: BrandConfig;
  onShare?: () => void;
  onConfigure?: () => void;
  onExport?: () => void;
  readOnly?: boolean;
  showCTA?: boolean;
  previewMode?: 'seller' | 'champion';
  onPreviewModeChange?: (mode: 'seller' | 'champion') => void;
}

export const TransformationExperience = ({
  story,
  initialBrand,
  onShare,
  onConfigure,
  onExport,
  readOnly = false,
  showCTA = false,
  previewMode = 'seller',
  onPreviewModeChange,
}: TransformationExperienceProps) => {
  const [variant, setVariant] = useState<'before' | 'after'>('before');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionPhase, setTransitionPhase] = useState<'idle' | 'anticipation' | 'shifting' | 'revealing'>('idle');
  const [brand] = useState<BrandConfig>(initialBrand || DEFAULT_BRAND);

  const [isHovered, setIsHovered] = useState(false);
  const [powerLevel, setPowerLevel] = useState(0);
  const [isButtonReady, setIsButtonReady] = useState(false);
  const [ripples, setRipples] = useState<Array<{ x: number; y: number; id: number }>>([]);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [showCTAButton, setShowCTAButton] = useState(false);

  const theme = resolveTheme(brand);
  const isBefore = variant === 'before';
  const insight = story.after.insight;

  const TIMING = {
    ANTICIPATION: 600,
    STATE_FLIP: 1000,
    TOTAL: 4000,
  };

  const handleTransform = useCallback((e?: React.MouseEvent<HTMLButtonElement>) => {
    if (!isButtonReady || isTransitioning) return;

    if (e && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const rippleId = Date.now();
      setRipples(prev => [...prev, { x, y, id: rippleId }]);
      setTimeout(() => {
        setRipples(prev => prev.filter(r => r.id !== rippleId));
      }, 600);
    }

    setIsTransitioning(true);
    setTransitionPhase('anticipation');

    setTimeout(() => {
      setTransitionPhase('shifting');
    }, TIMING.ANTICIPATION);

    setTimeout(() => {
      setVariant(v => v === 'before' ? 'after' : 'before');
      setTransitionPhase('revealing');
    }, TIMING.ANTICIPATION + TIMING.STATE_FLIP);

    setTimeout(() => {
      setIsTransitioning(false);
      setTransitionPhase('idle');
    }, TIMING.TOTAL);
  }, [isButtonReady, isTransitioning, TIMING]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !readOnly) {
        e.preventDefault();
        handleTransform();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleTransform, readOnly]);

  useEffect(() => {
    if (showCTA) {
      const timer = setTimeout(() => {
        setShowCTAButton(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showCTA]);

  useEffect(() => {
    if (isBefore && !isButtonReady && !readOnly) {
      const startTime = Date.now();
      const duration = 8000;

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        const eased = progress < 0.5
          ? 2 * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 2) / 2;

        setPowerLevel(eased * 100);

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          setIsButtonReady(true);
        }
      };

      requestAnimationFrame(animate);
    }
  }, [isBefore, isButtonReady, readOnly]);

  useEffect(() => {
    if (!isBefore) {
      setIsButtonReady(true);
      setPowerLevel(100);
    } else if (!readOnly) {
      setIsButtonReady(false);
      setPowerLevel(0);
    }
  }, [isBefore, readOnly]);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#0A0A0A]">
      {/* Dual-layer visualization for comparison */}
      <div className="relative w-full h-full">
        {/* Before state layer */}
        <div 
          className="absolute inset-0"
          style={{
            opacity: variant === 'before' ? 1 : 0.08,
            zIndex: variant === 'before' ? 10 : 0,
            transition: 'opacity 0.8s ease-out',
            pointerEvents: variant === 'before' ? 'auto' : 'none',
            filter: variant === 'before' && transitionPhase === 'anticipation'
              ? 'brightness(0.7) blur(1px)'
              : 'brightness(1) blur(0)',
          }}
        >
          <SankeyFlowV3
            state={story.before}
            stageLabels={story.stageLabels}
            variant="before"
            brand={brand}
            animated={variant === 'before'}
            transitionPhase={variant === 'before' ? transitionPhase : 'idle'}
            hideUI={variant !== 'before'}
          />
        </div>
        
        {/* After state layer */}
        <div 
          className="absolute inset-0"
          style={{
            opacity: variant === 'after' ? 1 : 0.08,
            zIndex: variant === 'after' ? 10 : 0,
            transition: 'opacity 0.8s ease-out',
            pointerEvents: variant === 'after' ? 'auto' : 'none',
            filter: variant === 'after' && transitionPhase === 'anticipation'
              ? 'brightness(0.7) blur(1px)'
              : 'brightness(1) blur(0)',
          }}
        >
          <SankeyFlowV3
            state={story.after}
            stageLabels={story.stageLabels}
            variant="after"
            brand={brand}
            animated={variant === 'after'}
            transitionPhase={variant === 'after' ? transitionPhase : 'idle'}
            hideUI={variant !== 'after'}
          />
        </div>
      </div>

      {/* Toolbar - Top Right */}
      <div className="absolute top-6 right-6 z-30 flex items-center gap-3">
        {/* Preview Mode Toggle */}
        {onPreviewModeChange && (
          <button
            onClick={() => onPreviewModeChange(previewMode === 'seller' ? 'champion' : 'seller')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
            style={{
              background: previewMode === 'champion' ? 'rgba(0, 212, 229, 0.15)' : 'rgba(255, 255, 255, 0.08)',
              border: `1px solid ${previewMode === 'champion' ? 'rgba(0, 212, 229, 0.4)' : 'rgba(255, 255, 255, 0.15)'}`,
              color: previewMode === 'champion' ? '#00D4E5' : 'rgba(255, 255, 255, 0.9)',
            }}
          >
            <Eye size={16} />
            {previewMode === 'seller' ? 'Preview as Champion' : 'Seller View'}
          </button>
        )}

        {onConfigure && (
          <button
            onClick={onConfigure}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: 'rgba(255, 255, 255, 0.9)',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
            Configure
          </button>
        )}
        
        {onShare && (
          <button
            onClick={onShare}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: 'rgba(255, 255, 255, 0.9)',
            }}
          >
            <Share2 size={16} />
            Share
          </button>
        )}
        
        {!readOnly && <UserMenu />}
      </div>

      {/* Action Zone - Bottom Center */}
      <div
        className="absolute left-1/2 z-30"
        style={{
          bottom: '80px',
          transform: 'translateX(-50%)',
        }}
      >
        <div
          className="flex items-center gap-6 rounded-2xl backdrop-blur-xl"
          style={{
            padding: '16px 24px',
            minWidth: '400px',
            background: isBefore
              ? 'rgba(0, 0, 0, 0.6)'
              : `linear-gradient(135deg, rgba(0, 212, 229, 0.1) 0%, rgba(0, 191, 166, 0.1) 100%)`,
            border: `1px solid ${isBefore ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 212, 229, 0.2)'}`,
            boxShadow: isBefore
              ? 'none'
              : `0 0 40px rgba(0, 212, 229, 0.15)`,
            opacity: !isBefore && (transitionPhase === 'shifting' || transitionPhase === 'anticipation') ? 0 : 1,
            transition: 'background 0.6s ease-out, border 0.6s ease-out, box-shadow 0.6s ease-out, opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1) 1.6s',
          }}
        >
          <div className="max-w-md">
            {isBefore ? (
              <p className="text-sm" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                <span style={{ color: '#FFD93D' }}>💡</span>
                {' '}
                <span>What could your process unlock?</span>
              </p>
            ) : (
              <p className="text-sm" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                <span style={{ color: '#4ADE80' }}>💡</span>
                {' '}
                <span>{insight}</span>
              </p>
            )}
          </div>

          <button
            ref={buttonRef}
            onClick={handleTransform}
            disabled={isTransitioning}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="relative flex items-center gap-2.5 px-8 py-3.5 rounded-full text-sm font-semibold overflow-hidden whitespace-nowrap"
            style={{
              background: isBefore
                ? (() => {
                    const power = powerLevel / 100;
                    if (transitionPhase === 'anticipation') {
                      return 'rgba(0, 212, 229, 0.4)';
                    }
                    return `linear-gradient(90deg, rgba(0, 212, 229, ${0.1 + power * 0.2}) 0%, rgba(0, 212, 229, ${0.15 + power * 0.25}) ${power * 100}%, rgba(255, 255, 255, 0.05) ${power * 100}%, rgba(255, 255, 255, 0.05) 100%)`;
                  })()
                : (isHovered
                    ? 'rgba(255, 255, 255, 0.12)'
                    : 'rgba(255, 255, 255, 0.1)'),
              color: isBefore
                ? `rgba(255, 255, 255, ${0.4 + (powerLevel / 100) * 0.5})`
                : (isHovered ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.8)'),
              border: isBefore
                ? `1px solid rgba(0, 212, 229, ${0.2 + (powerLevel / 100) * 0.3})`
                : (isHovered ? '1px solid rgba(255, 255, 255, 0.25)' : '1px solid rgba(255, 255, 255, 0.2)'),
              boxShadow: isBefore
                ? (transitionPhase === 'anticipation'
                    ? '0 0 40px rgba(0, 212, 229, 0.5)'
                    : `0 0 ${(powerLevel / 100) * 30}px rgba(0, 212, 229, ${(powerLevel / 100) * 0.3})`)
                : (isHovered ? '0 4px 20px rgba(255, 255, 255, 0.1)' : 'none'),
              transform: transitionPhase === 'anticipation'
                ? 'scale(0.98)'
                : `scale(${1 + (powerLevel / 100) * 0.02})`,
              cursor: isButtonReady ? 'pointer' : 'default',
              transition: transitionPhase === 'anticipation'
                ? 'all 0.2s ease-out'
                : 'transform 0.3s ease-out, color 0.3s ease-out, box-shadow 0.3s ease-out',
            }}
          >
            {ripples.map(ripple => (
              <span
                key={ripple.id}
                className="absolute rounded-full pointer-events-none"
                style={{
                  left: ripple.x,
                  top: ripple.y,
                  width: 10,
                  height: 10,
                  marginLeft: -5,
                  marginTop: -5,
                  background: isBefore ? 'rgba(255, 255, 255, 0.4)' : theme.colors.primary,
                  animation: 'ripple 0.6s ease-out forwards',
                }}
              />
            ))}

            {isBefore && isHovered && (
              <span
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                  animation: 'shimmer 1.5s infinite',
                }}
              />
            )}

            {isBefore && (
              <span
                className="absolute inset-0 rounded-full pointer-events-none transition-opacity duration-300"
                style={{
                  opacity: isHovered ? 1 : 0,
                  boxShadow: `inset 0 0 20px ${theme.colors.primary}40`,
                }}
              />
            )}

            <span className="relative z-10">
              {isBefore ? 'See the Shift' : 'View Current State'}
            </span>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              className="relative z-10 transition-transform duration-300"
              style={{
                transform: isBefore
                  ? (isHovered ? 'translateX(4px)' : 'translateX(0)')
                  : 'rotate(180deg)',
              }}
            >
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </button>
        </div>
      </div>

    {showCTA && showCTAButton && (
        
          <a href="/"
          className="fixed bottom-8 left-8 z-40 flex items-center gap-2.5 px-6 py-3.5 rounded-full text-sm font-semibold transition-all hover:scale-105"
          style={{
            background: 'linear-gradient(135deg, #00D4E5, #00BFA6)',
            color: '#0A0A0A',
            boxShadow: '0 8px 32px rgba(0, 212, 229, 0.4)',
            opacity: showCTAButton ? 1 : 0,
            transform: showCTAButton ? 'translateY(0)' : 'translateY(20px)',
            transition: 'all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}
        >
          Make your own
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </a>
      )}

      <style>{`
        @keyframes ripple {
          0% {
            transform: scale(1);
            opacity: 0.6;
          }
          100% {
            transform: scale(40);
            opacity: 0;
          }
        }

        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  );
};

export default TransformationExperience;