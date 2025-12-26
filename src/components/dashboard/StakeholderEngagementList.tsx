/**
 * StakeholderEngagementList.tsx
 * 
 * Shows individual stakeholder engagement breakdown.
 * Enterprise tier feature.
 */

import { User, AlertTriangle, ThumbsUp, Eye, Clock } from 'lucide-react';
import {
  StakeholderEngagement,
  ENGAGEMENT_LEVEL_CONFIG,
  LINK_TYPE_CONFIG,
  LinkType,
  EngagementLevel,
} from '../../hooks/useAlignmentData';

// ============================================
// PROPS
// ============================================

interface StakeholderEngagementListProps {
  stakeholders: StakeholderEngagement[];
  showDetails?: boolean;  // Show nodes interacted, duration, etc.
}

// ============================================
// ENGAGEMENT BAR
// ============================================

function EngagementBar({ depth, level }: { depth: number; level: EngagementLevel }) {
  const config = ENGAGEMENT_LEVEL_CONFIG[level];
  const bars = 10;
  const filled = Math.round(depth * bars);

  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-0.5">
        {[...Array(bars)].map((_, i) => (
          <div
            key={i}
            className="w-1 h-4 rounded-sm"
            style={{
              background: i < filled ? config.color : '#1E2530',
            }}
          />
        ))}
      </div>
      <span className="text-xs font-mono" style={{ color: config.color }}>
        {(depth * 100).toFixed(0)}%
      </span>
    </div>
  );
}

// ============================================
// COMPONENT
// ============================================

export function StakeholderEngagementList({ 
  stakeholders, 
  showDetails = true,
}: StakeholderEngagementListProps) {
  if (stakeholders.length === 0) {
    return (
      <div
        className="rounded-xl p-6 text-center"
        style={{ background: '#12161C', border: '1px solid #1E2530' }}
      >
        <User size={32} className="mx-auto mb-3" style={{ color: '#6B7A8C' }} />
        <p className="text-sm" style={{ color: '#6B7A8C' }}>
          No stakeholders have viewed this shift yet
        </p>
      </div>
    );
  }

  const formatDuration = (seconds: number): string => {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    return `${Math.floor(seconds / 3600)}h`;
  };

  const formatTimeAgo = (dateString: string): string => {
    const now = new Date();
    const date = new Date(dateString);
    const hours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    if (hours < 168) return `${Math.floor(hours / 24)}d ago`;
    return `${Math.floor(hours / 168)}w ago`;
  };

  return (
    <div className="space-y-2">
      {stakeholders.map((stakeholder) => {
        const typeConfig = LINK_TYPE_CONFIG[stakeholder.link_type as LinkType] || LINK_TYPE_CONFIG.all;
        const levelConfig = ENGAGEMENT_LEVEL_CONFIG[stakeholder.engagement_level];

        return (
          <div
            key={stakeholder.stakeholder_id}
            className="rounded-xl p-4 transition-all hover:brightness-105"
            style={{ 
              background: '#12161C', 
              border: stakeholder.is_critical_gap 
                ? '1px solid rgba(239, 68, 68, 0.3)' 
                : '1px solid #1E2530',
            }}
          >
            <div className="flex items-start justify-between">
              {/* Left: Avatar + Info */}
              <div className="flex items-start gap-3">
                {/* Avatar */}
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: `${typeConfig.color}20` }}
                >
                  <User size={18} style={{ color: typeConfig.color }} />
                </div>

                {/* Info */}
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium" style={{ color: '#F5F5F5' }}>
                      {stakeholder.name || stakeholder.email || 'Anonymous viewer'}
                    </span>
                    <span
                      className="text-xs px-1.5 py-0.5 rounded"
                      style={{ background: `${typeConfig.color}20`, color: typeConfig.color }}
                    >
                      {typeConfig.shortLabel}
                    </span>
                    {stakeholder.is_critical_gap && (
                      <span
                        className="flex items-center gap-1 text-xs px-1.5 py-0.5 rounded"
                        style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#EF4444' }}
                      >
                        <AlertTriangle size={10} />
                        Gap
                      </span>
                    )}
                  </div>

                  {/* Engagement level badge */}
                  <span
                    className="text-xs px-2 py-0.5 rounded-full"
                    style={{ background: levelConfig.bgColor, color: levelConfig.color }}
                  >
                    {levelConfig.label}
                  </span>

                  {/* Gap reason */}
                  {stakeholder.is_critical_gap && stakeholder.gap_reason && (
                    <p className="mt-1 text-xs" style={{ color: '#EF4444' }}>
                      {stakeholder.gap_reason}
                    </p>
                  )}
                </div>
              </div>

              {/* Right: Engagement bar */}
              <div className="text-right">
                <EngagementBar 
                  depth={stakeholder.engagement_depth} 
                  level={stakeholder.engagement_level} 
                />
              </div>
            </div>

            {/* Details row */}
            {showDetails && (
              <div 
                className="mt-3 pt-3 flex items-center gap-4 text-xs"
                style={{ borderTop: '1px solid #1E2530', color: '#6B7A8C' }}
              >
                <span className="flex items-center gap-1" title="Views">
                  <Eye size={12} />
                  {stakeholder.view_count} view{stakeholder.view_count !== 1 ? 's' : ''}
                </span>
                <span className="flex items-center gap-1" title="Time spent">
                  <Clock size={12} />
                  {formatDuration(stakeholder.total_duration_seconds)}
                </span>
                <span title="Nodes interacted">
                  {stakeholder.nodes_interacted} nodes explored
                </span>
                {stakeholder.nodes_reacted > 0 && (
                  <span className="flex items-center gap-1" style={{ color: '#4ADE80' }} title="Reactions">
                    <ThumbsUp size={12} />
                    {stakeholder.nodes_reacted} reaction{stakeholder.nodes_reacted !== 1 ? 's' : ''}
                  </span>
                )}
                <span className="ml-auto" title="Last seen">
                  {formatTimeAgo(stakeholder.last_viewed_at)}
                </span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ============================================
// COMPACT VERSION (for dashboard card)
// ============================================

interface StakeholderEngagementCompactProps {
  stakeholders: StakeholderEngagement[];
  maxDisplay?: number;
}

export function StakeholderEngagementCompact({ 
  stakeholders, 
  maxDisplay = 4,
}: StakeholderEngagementCompactProps) {
  const displayStakeholders = stakeholders.slice(0, maxDisplay);
  const remainingCount = stakeholders.length - maxDisplay;

  return (
    <div className="flex items-center">
      {/* Stacked avatars */}
      <div className="flex -space-x-2">
        {displayStakeholders.map((s, i) => {
          const typeConfig = LINK_TYPE_CONFIG[s.link_type as LinkType] || LINK_TYPE_CONFIG.all;
          const levelConfig = ENGAGEMENT_LEVEL_CONFIG[s.engagement_level];
          
          return (
            <div
              key={s.stakeholder_id}
              className="w-8 h-8 rounded-full flex items-center justify-center ring-2 ring-[#0A0E14]"
              style={{ 
                background: `${typeConfig.color}30`,
                zIndex: maxDisplay - i,
              }}
              title={`${s.name || 'Unknown'} (${typeConfig.shortLabel}) - ${levelConfig.label}`}
            >
              <User size={14} style={{ color: typeConfig.color }} />
            </div>
          );
        })}
        {remainingCount > 0 && (
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center ring-2 ring-[#0A0E14] text-xs font-medium"
            style={{ background: '#1E2530', color: '#6B7A8C' }}
          >
            +{remainingCount}
          </div>
        )}
      </div>

      {/* Summary text */}
      <span className="ml-3 text-xs" style={{ color: '#6B7A8C' }}>
        {stakeholders.length} stakeholder{stakeholders.length !== 1 ? 's' : ''}
      </span>
    </div>
  );
}

export default StakeholderEngagementList;