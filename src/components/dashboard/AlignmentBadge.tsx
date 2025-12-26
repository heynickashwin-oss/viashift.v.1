/**
 * AlignmentBadge.tsx
 * 
 * Compact badge showing shift alignment status.
 * Use in dashboard cards for at-a-glance alignment health.
 */

import { 
  useAlignmentSummary, 
  ALIGNMENT_STATUS_CONFIG,
  ShiftAlignmentStatus,
} from '../../hooks/useAlignmentData';
import { AlertTriangle, CheckCircle, Users, Target, HelpCircle } from 'lucide-react';

// ============================================
// PROPS
// ============================================

interface AlignmentBadgeProps {
  shiftId: string;
  compact?: boolean;  // Just show icon + status
  showGaps?: boolean; // Show critical gap count
}

// ============================================
// STATUS ICONS
// ============================================

const StatusIcon = ({ status }: { status: ShiftAlignmentStatus }) => {
  const size = 14;
  
  switch (status) {
    case 'ready':
      return <CheckCircle size={size} />;
    case 'contested':
      return <AlertTriangle size={size} />;
    case 'champion':
      return <Users size={size} />;
    case 'lukewarm_consensus':
      return <Target size={size} />;
    default:
      return <HelpCircle size={size} />;
  }
};

// ============================================
// COMPONENT
// ============================================

export function AlignmentBadge({ shiftId, compact = false, showGaps = true }: AlignmentBadgeProps) {
  const summary = useAlignmentSummary(shiftId);
  
  if (summary.loading) {
    return (
      <div 
        className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs animate-pulse"
        style={{ background: 'rgba(107, 114, 128, 0.15)', color: '#6B7280' }}
      >
        <span className="w-3 h-3 rounded-full" style={{ background: '#6B7280' }} />
        <span>...</span>
      </div>
    );
  }

  const config = ALIGNMENT_STATUS_CONFIG[summary.status];
  
  if (compact) {
    return (
      <div 
        className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium"
        style={{ background: config.bgColor, color: config.color }}
        title={config.description}
      >
        <StatusIcon status={summary.status} />
        {config.label}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Status badge */}
      <div 
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
        style={{ background: config.bgColor, color: config.color }}
        title={config.description}
      >
        <StatusIcon status={summary.status} />
        {config.label}
      </div>
      
      {/* Metrics row */}
      <div className="flex items-center gap-3 text-xs" style={{ color: '#6B7A8C' }}>
        <span title="Unique viewers">{summary.viewers} viewers</span>
        <span title="Total reactions">{summary.reactions} reactions</span>
        {showGaps && summary.criticalGaps > 0 && (
          <span 
            className="flex items-center gap-1"
            style={{ color: '#EF4444' }}
            title="Critical gaps - high-value stakeholders not engaged"
          >
            <AlertTriangle size={12} />
            {summary.criticalGaps} gap{summary.criticalGaps !== 1 ? 's' : ''}
          </span>
        )}
      </div>
      
      {/* Depth/Width mini bars */}
      <div className="flex gap-4 text-xs">
        <div className="flex items-center gap-2">
          <span style={{ color: '#6B7A8C' }}>Depth</span>
          <div className="flex items-center gap-0.5">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="w-1.5 h-3 rounded-sm"
                style={{
                  background: i < Math.round(summary.depth * 5) ? config.color : '#1E2530',
                }}
              />
            ))}
          </div>
          <span style={{ color: config.color }}>{Math.round(summary.depth * 100)}%</span>
        </div>
        <div className="flex items-center gap-2">
          <span style={{ color: '#6B7A8C' }}>Width</span>
          <div className="flex items-center gap-0.5">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="w-1.5 h-3 rounded-sm"
                style={{
                  background: i < Math.round(summary.width * 5) ? config.color : '#1E2530',
                }}
              />
            ))}
          </div>
          <span style={{ color: config.color }}>{Math.round(summary.width * 100)}%</span>
        </div>
      </div>
    </div>
  );
}

// ============================================
// SIMPLE STATUS DOT
// ============================================

interface AlignmentDotProps {
  shiftId: string;
  size?: number;
}

export function AlignmentDot({ shiftId, size = 8 }: AlignmentDotProps) {
  const summary = useAlignmentSummary(shiftId);
  const config = ALIGNMENT_STATUS_CONFIG[summary.status];
  
  return (
    <div
      className="rounded-full"
      style={{
        width: size,
        height: size,
        background: config.color,
        boxShadow: summary.status === 'ready' || summary.status === 'contested' 
          ? `0 0 ${size}px ${config.color}40` 
          : 'none',
      }}
      title={`${config.label}: ${config.description}`}
    />
  );
}

export default AlignmentBadge;