/**
 * CriticalGapsAlert.tsx
 * 
 * Alert banner showing critical alignment gaps.
 * Highlights high-value stakeholders who viewed but didn't engage.
 */

import { AlertTriangle, User, Send, X } from 'lucide-react';
import { 
  CriticalGap, 
  ENGAGEMENT_LEVEL_CONFIG,
  LINK_TYPE_CONFIG,
  LinkType,
} from '../../hooks/useAlignmentData';

// ============================================
// PROPS
// ============================================

interface CriticalGapsAlertProps {
  gaps: CriticalGap[];
  onSendReminder?: (gap: CriticalGap) => void;
  onDismiss?: () => void;
  maxDisplay?: number;
}

// ============================================
// COMPONENT
// ============================================

export function CriticalGapsAlert({ 
  gaps, 
  onSendReminder, 
  onDismiss,
  maxDisplay = 3,
}: CriticalGapsAlertProps) {
  if (gaps.length === 0) return null;

  const displayGaps = gaps.slice(0, maxDisplay);
  const remainingCount = gaps.length - maxDisplay;

  return (
    <div
      className="rounded-xl p-4"
      style={{
        background: 'rgba(239, 68, 68, 0.08)',
        border: '1px solid rgba(239, 68, 68, 0.2)',
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(239, 68, 68, 0.15)' }}
          >
            <AlertTriangle size={16} style={{ color: '#EF4444' }} />
          </div>
          <div>
            <h3 className="text-sm font-semibold" style={{ color: '#F5F5F5' }}>
              Critical Alignment Gap{gaps.length !== 1 ? 's' : ''}
            </h3>
            <p className="text-xs" style={{ color: '#6B7A8C' }}>
              {gaps.length} high-value stakeholder{gaps.length !== 1 ? 's' : ''} viewed but didn't engage
            </p>
          </div>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="p-1 rounded hover:bg-white/5 transition-colors"
            style={{ color: '#6B7A8C' }}
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Gap list */}
      <div className="space-y-2">
        {displayGaps.map((gap) => {
          const typeConfig = LINK_TYPE_CONFIG[gap.stakeholder_type as LinkType] || LINK_TYPE_CONFIG.all;
          const levelConfig = ENGAGEMENT_LEVEL_CONFIG[gap.engagement_level];
          
          return (
            <div
              key={gap.stakeholder_id}
              className="flex items-center justify-between p-3 rounded-lg"
              style={{ background: '#12161C' }}
            >
              <div className="flex items-center gap-3">
                {/* Avatar */}
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center"
                  style={{ background: `${typeConfig.color}20` }}
                >
                  <User size={16} style={{ color: typeConfig.color }} />
                </div>
                
                {/* Info */}
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium" style={{ color: '#F5F5F5' }}>
                      {gap.name || gap.email || 'Unknown viewer'}
                    </span>
                    <span
                      className="text-xs px-1.5 py-0.5 rounded"
                      style={{ background: `${typeConfig.color}20`, color: typeConfig.color }}
                    >
                      {typeConfig.shortLabel}
                    </span>
                  </div>
                  <p className="text-xs" style={{ color: '#6B7A8C' }}>
                    {gap.gap_reason || levelConfig.label}
                  </p>
                </div>
              </div>

              {/* Action */}
              {onSendReminder && (
                <button
                  onClick={() => onSendReminder(gap)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:brightness-110"
                  style={{ background: typeConfig.color, color: '#0A0E14' }}
                >
                  <Send size={12} />
                  Send {typeConfig.shortLabel} Link
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Show more */}
      {remainingCount > 0 && (
        <p className="mt-3 text-xs text-center" style={{ color: '#6B7A8C' }}>
          +{remainingCount} more gap{remainingCount !== 1 ? 's' : ''}
        </p>
      )}

      {/* Recommendation */}
      <div
        className="mt-3 p-3 rounded-lg flex items-start gap-2"
        style={{ background: '#1E2530' }}
      >
        <span className="text-base">💡</span>
        <p className="text-xs" style={{ color: '#A0AEC0' }}>
          <strong style={{ color: '#F5F5F5' }}>Recommendation:</strong>{' '}
          Send stakeholder-specific links with tailored messaging. 
          Finance leads respond best to ROI metrics, while Tech leads want implementation details.
        </p>
      </div>
    </div>
  );
}

// ============================================
// COMPACT VERSION (for card)
// ============================================

interface CriticalGapsCompactProps {
  count: number;
  onClick?: () => void;
}

export function CriticalGapsCompact({ count, onClick }: CriticalGapsCompactProps) {
  if (count === 0) return null;

  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium transition-all hover:brightness-110"
      style={{ 
        background: 'rgba(239, 68, 68, 0.15)', 
        color: '#EF4444',
        border: '1px solid rgba(239, 68, 68, 0.3)',
      }}
    >
      <AlertTriangle size={12} />
      {count} gap{count !== 1 ? 's' : ''}
    </button>
  );
}

export default CriticalGapsAlert;