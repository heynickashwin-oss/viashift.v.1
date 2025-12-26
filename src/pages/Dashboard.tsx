import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Eye, Users, DollarSign, Clock, Target, ThumbsUp, ThumbsDown, MessageSquare, Activity, User, AlertTriangle, Check, Star, ChevronDown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import logo from '../assets/logo.svg';
import { UserMenu } from '../components/ui/UserMenu';
import { 
  useAlignmentSummary, 
  ALIGNMENT_STATUS_CONFIG,
} from '../hooks/useAlignmentData';

// ============================================
// TYPES
// ============================================

interface ShiftEngagement {
  views: number;
  clicks: number;
  thumbsUp: number;
  thumbsDown: number;
  comments: number;
  edits: number;
  suggestions: number;
  lastActivity?: string;
  advocateLastSeen?: string;
  advocateViews: number;
}

interface Shift {
  id: string;
  company_input: string;
  created_at: string;
  view_count: number;
  shared_at?: string;
  logo_url?: string;
  engagement?: ShiftEngagement;
  is_favorite?: boolean;
}

type StakeholderType = 'all' | 'finance' | 'ops' | 'sales';

// ============================================
// ACTIVITY STATE SYSTEM
// ============================================

type ActivityState = 'hot' | 'active' | 'quiet' | 'stale' | 'awaiting';

const getActivityState = (engagement?: ShiftEngagement): ActivityState => {
  const hasActivity = engagement && (engagement.clicks > 0 || engagement.thumbsUp > 0 || engagement.thumbsDown > 0 || engagement.comments > 0);
  
  if (!hasActivity || !engagement?.lastActivity) return 'awaiting';
  
  const hoursSince = (Date.now() - new Date(engagement.lastActivity).getTime()) / (1000 * 60 * 60);
  
  if (hoursSince < 4) return 'hot';
  if (hoursSince < 24) return 'active';
  if (hoursSince < 168) return 'quiet'; // 7 days
  return 'stale';
};

const activityConfig: Record<ActivityState, { label: string; color: string; bgColor: string; glow: boolean }> = {
  hot: { label: 'Hot', color: '#F97316', bgColor: 'rgba(249, 115, 22, 0.15)', glow: true },
  active: { label: 'Active', color: '#00D4E5', bgColor: 'rgba(0, 212, 229, 0.15)', glow: true },
  quiet: { label: 'Quiet', color: '#6B7A8C', bgColor: 'rgba(107, 122, 140, 0.15)', glow: false },
  stale: { label: 'Stale', color: '#4A5568', bgColor: 'rgba(74, 85, 104, 0.15)', glow: false },
  awaiting: { label: 'No views', color: '#4A5568', bgColor: 'rgba(74, 85, 104, 0.10)', glow: false },
};

// ============================================
// ADVOCATE STATUS
// ============================================

type AdvocateStatus = 'recent' | 'seen' | 'waiting';

const getAdvocateStatus = (engagement?: ShiftEngagement): AdvocateStatus => {
  if (!engagement?.advocateLastSeen) return 'waiting';
  
  const hoursSince = (Date.now() - new Date(engagement.advocateLastSeen).getTime()) / (1000 * 60 * 60);
  
  if (hoursSince < 24) return 'recent';
  return 'seen';
};

const formatAdvocateTime = (dateString?: string): string => {
  if (!dateString) return 'Not viewed';
  
  const hoursSince = (Date.now() - new Date(dateString).getTime()) / (1000 * 60 * 60);
  
  if (hoursSince < 1) return 'Seen just now';
  if (hoursSince < 24) return `Seen ${Math.floor(hoursSince)}h ago`;
  if (hoursSince < 168) return `Seen ${Math.floor(hoursSince / 24)}d ago`;
  return `Seen ${Math.floor(hoursSince / 168)}w ago`;
};

// ============================================
// STAKEHOLDER CONFIG
// ============================================

const stakeholderConfig: Record<StakeholderType, { icon: typeof DollarSign; label: string; color: string }> = {
  all: { icon: Target, label: 'General', color: '#00D4E5' },
  finance: { icon: DollarSign, label: 'Finance', color: '#4ADE80' },
  ops: { icon: Clock, label: 'Operations', color: '#F59E0B' },
  sales: { icon: Users, label: 'Sales', color: '#8B5CF6' },
};

// ============================================
// LOADING SKELETON
// ============================================

const LoadingSkeleton = () => (
  <div
    className="rounded-xl p-6 animate-pulse"
    style={{ background: '#12161C', border: '1px solid #1E2530' }}
  >
    <div style={{ height: '120px', background: '#1E2530', borderRadius: '8px', marginBottom: '16px' }} />
    <div style={{ height: '20px', background: '#1E2530', borderRadius: '4px', marginBottom: '8px', width: '75%' }} />
    <div style={{ height: '16px', background: '#1E2530', borderRadius: '4px', width: '50%' }} />
  </div>
);

// ============================================
// SHIFT CARD (WITH ALIGNMENT INTEGRATION)
// ============================================

const ShiftCard = ({ shift, onSelect, onToggleFavorite }: { 
  shift: Shift; 
  onSelect: (stakeholder: StakeholderType) => void;
  onToggleFavorite: (shiftId: string, e: React.MouseEvent) => void;
}) => {
  const [showStakeholders, setShowStakeholders] = useState(false);
  const navigate = useNavigate();
  
  // NEW: Alignment data hook
  const alignmentSummary = useAlignmentSummary(shift.id);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const handleCardClick = () => {
    navigate(`/shift/${shift.id}`);
  };

  const handleStakeholderClick = (e: React.MouseEvent, stakeholder: StakeholderType) => {
    e.stopPropagation();
    onSelect(stakeholder);
  };

  const engagement = shift.engagement;
  const activityState = getActivityState(engagement);
  const config = activityConfig[activityState];
  const hasEngagement = activityState !== 'awaiting';
  const totalReactions = (engagement?.thumbsUp || 0) + (engagement?.thumbsDown || 0);
  const totalActivity = (engagement?.clicks || 0);
  
  const advocateStatus = getAdvocateStatus(engagement);
  const advocateTime = formatAdvocateTime(engagement?.advocateLastSeen);

  // NEW: Alignment status
  const alignmentConfig = ALIGNMENT_STATUS_CONFIG[alignmentSummary.status];
  const hasAlignmentData = alignmentSummary.viewers > 0 && !alignmentSummary.loading;

  return (
    <div
      className="relative rounded-xl overflow-hidden transition-all"
      style={{ 
        background: '#12161C', 
        border: config.glow ? `1px solid ${config.color}` : '1px solid #1E2530',
        boxShadow: config.glow ? `0 0 20px ${config.color}25` : 'none',
      }}
    >
      {/* Persistent top bar - not covered by overlay */}
      <div 
        className="flex items-center justify-between px-4 py-2"
        style={{ borderBottom: '1px solid #1E2530' }}
      >
        <button
          onClick={(e) => onToggleFavorite(shift.id, e)}
          className="p-1.5 rounded-full transition-all hover:scale-110"
          style={{ 
            background: shift.is_favorite ? 'rgba(250, 204, 21, 0.15)' : 'transparent',
          }}
        >
          <Star 
            size={16} 
            fill={shift.is_favorite ? '#FACC15' : 'none'}
            style={{ color: shift.is_favorite ? '#FACC15' : '#4A5568' }}
          />
        </button>
        
        {/* Activity state indicator */}
        <div 
          className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium"
          style={{ background: config.bgColor, color: config.color }}
        >
          {(activityState === 'hot' || activityState === 'active') && <Activity size={12} />}
          {config.label}
        </div>
      </div>

      {/* Content area - triggers hover overlay */}
      <div
        className="relative p-6 pt-4 cursor-pointer"
        onClick={handleCardClick}
        onMouseEnter={() => setShowStakeholders(true)}
        onMouseLeave={() => setShowStakeholders(false)}
      >
        {/* Logo / Avatar */}
        <div
          className="mb-4 rounded-lg flex items-center justify-center overflow-hidden"
          style={{
            height: '120px',
            background: shift.logo_url ? '#12161C' : 'linear-gradient(135deg, #1E2530 0%, #12161C 100%)',
            border: '1px solid #1E2530',
          }}
        >
        {shift.logo_url ? (
          <img
            src={shift.logo_url}
            alt={shift.company_input}
            style={{ maxWidth: '60%', maxHeight: '60%', objectFit: 'contain' }}
          />
        ) : (
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #00D4E5 0%, #00BFA6 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '28px',
              fontWeight: 700,
              color: '#0A0E14',
            }}
          >
            {shift.company_input.charAt(0).toUpperCase()}
          </div>
        )}
      </div>

      {/* Info */}
      <h3 className="text-lg font-semibold mb-2" style={{ color: '#F5F5F5' }}>
        {shift.company_input}
      </h3>
      
      {/* Date row */}
      <div className="text-sm mb-3" style={{ color: '#6B7A8C' }}>
        {formatDate(shift.created_at)}
      </div>

      {/* ============================================ */}
      {/* NEW: Alignment Status Section               */}
      {/* ============================================ */}
      {hasAlignmentData && (
        <div 
          className="mb-3 p-3 rounded-lg"
          style={{ background: '#0A0E14', border: '1px solid #1E2530' }}
        >
          {/* Status badge + critical gaps */}
          <div className="flex items-center justify-between mb-2">
            <div 
              className="flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium"
              style={{ background: alignmentConfig.bgColor, color: alignmentConfig.color }}
              title={alignmentConfig.description}
            >
              {alignmentSummary.status === 'ready' && <Check size={12} />}
              {alignmentSummary.status === 'contested' && <AlertTriangle size={12} />}
              {alignmentSummary.status === 'champion' && <Users size={12} />}
              {alignmentSummary.status === 'lukewarm_consensus' && <Target size={12} />}
              {alignmentConfig.label}
            </div>
            
            {/* Critical gaps alert */}
            {alignmentSummary.criticalGaps > 0 && (
              <div 
                className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium"
                style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#EF4444' }}
                title="High-value stakeholders who viewed but didn't engage"
              >
                <AlertTriangle size={12} />
                {alignmentSummary.criticalGaps} gap{alignmentSummary.criticalGaps !== 1 ? 's' : ''}
              </div>
            )}
          </div>
          
          {/* Engagement/Alignment bars */}
          <div className="flex gap-4 text-xs">
            <div className="flex items-center gap-2 flex-1">
              <span style={{ color: '#6B7A8C' }}>Engagement</span>
              <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: '#1E2530' }}>
                <div 
                  className="h-full rounded-full transition-all"
                  style={{ 
                    width: `${alignmentSummary.depth * 100}%`, 
                    background: alignmentConfig.color,
                  }}
                />
              </div>
              <span style={{ color: alignmentConfig.color, fontFamily: 'monospace', minWidth: '32px' }}>
                {Math.round(alignmentSummary.depth * 100)}%
              </span>
            </div>
            <div className="flex items-center gap-2 flex-1">
              <span style={{ color: '#6B7A8C' }}>Alignment</span>
              <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: '#1E2530' }}>
                <div 
                  className="h-full rounded-full transition-all"
                  style={{ 
                    width: `${alignmentSummary.width * 100}%`, 
                    background: alignmentConfig.color,
                  }}
                />
              </div>
              <span style={{ color: alignmentConfig.color, fontFamily: 'monospace', minWidth: '32px' }}>
                {Math.round(alignmentSummary.width * 100)}%
              </span>
            </div>
          </div>
        </div>
      )}
      {/* ============================================ */}
      {/* END: Alignment Status Section               */}
      {/* ============================================ */}

      {/* Engagement metrics */}
      <div 
        className="flex items-center gap-3 pt-3 text-xs"
        style={{ borderTop: '1px solid #1E2530', color: '#6B7A8C' }}
      >
        <div className="flex items-center gap-1">
          <Eye size={14} />
          <span>{totalActivity}</span>
        </div>
        
        {totalReactions > 0 && (
          <div className="flex items-center gap-2">
            {(engagement?.thumbsUp || 0) > 0 && (
              <div className="flex items-center gap-1" style={{ color: '#4ADE80' }}>
                <ThumbsUp size={14} />
                <span>{engagement?.thumbsUp}</span>
              </div>
            )}
            {(engagement?.thumbsDown || 0) > 0 && (
              <div className="flex items-center gap-1" style={{ color: '#EF4444' }}>
                <ThumbsDown size={14} />
                <span>{engagement?.thumbsDown}</span>
              </div>
            )}
          </div>
        )}
        
        {(engagement?.comments || 0) > 0 && (
          <div className="flex items-center gap-1">
            <MessageSquare size={14} />
            <span>{engagement?.comments}</span>
          </div>
        )}
        
        {!hasEngagement && (
          <span style={{ color: '#4A5568' }}>No activity yet</span>
        )}
      </div>

      {/* Advocate status row */}
      <div 
        className="flex items-center justify-between mt-2 pt-2 text-xs"
        style={{ borderTop: '1px solid #1E2530' }}
      >
        <div className="flex items-center gap-1.5">
          <User size={12} style={{ color: '#6B7A8C' }} />
          <span style={{ color: '#6B7A8C' }}>Advocate:</span>
          <span style={{ 
            color: advocateStatus === 'recent' ? '#4ADE80' : 
                   advocateStatus === 'seen' ? '#6B7A8C' : '#F59E0B' 
          }}>
            {advocateTime}
          </span>
        </div>
        {advocateStatus === 'recent' && <Check size={14} style={{ color: '#4ADE80' }} />}
        {advocateStatus === 'waiting' && <AlertTriangle size={14} style={{ color: '#F59E0B' }} />}
      </div>

        {/* Stakeholder picker overlay - only covers content area */}
        {showStakeholders && (
          <div
            className="absolute inset-0 rounded-b-xl flex flex-col items-center justify-center gap-3 backdrop-blur-sm"
            style={{ background: 'rgba(10, 14, 20, 0.95)', border: '1px solid #00D4E5', borderTop: 'none' }}
          >
            <p className="text-xs font-medium mb-2" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
              Choose perspective for {shift.company_input}
            </p>
            <div className="grid grid-cols-2 gap-2 w-full px-4">
              {(Object.entries(stakeholderConfig) as [StakeholderType, typeof stakeholderConfig.all][]).map(([key, cfg]) => {
                const Icon = cfg.icon;
                return (
                  <button
                    key={key}
                    onClick={(e) => handleStakeholderClick(e, key)}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs font-medium transition-all"
                    style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      color: 'rgba(255, 255, 255, 0.8)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = `${cfg.color}20`;
                      e.currentTarget.style.borderColor = `${cfg.color}50`;
                      e.currentTarget.style.color = cfg.color;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                      e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)';
                    }}
                  >
                    <Icon size={14} />
                    {cfg.label}
                  </button>
                );
              })}
            </div>
            <button
              onClick={handleCardClick}
              className="mt-2 text-xs underline"
              style={{ color: 'rgba(255, 255, 255, 0.5)' }}
            >
              Open without sightline
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================
// DASHBOARD
// ============================================

export const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);
  const [limits, setLimits] = useState<{ tier: string; limit: number; used: number } | null>(null);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'alphabetical' | 'most_active' | 'last_activity'>('newest');

  // Sort shifts based on selected option
  const sortedShifts = useMemo(() => {
    const sorted = [...shifts];
    switch (sortBy) {
      case 'newest':
        return sorted.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      case 'oldest':
        return sorted.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
      case 'alphabetical':
        return sorted.sort((a, b) => a.company_input.localeCompare(b.company_input));
      case 'most_active':
        return sorted.sort((a, b) => {
          const aActivity = (a.engagement?.clicks || 0) + (a.engagement?.thumbsUp || 0) + (a.engagement?.thumbsDown || 0);
          const bActivity = (b.engagement?.clicks || 0) + (b.engagement?.thumbsUp || 0) + (b.engagement?.thumbsDown || 0);
          return bActivity - aActivity;
        });
      case 'last_activity':
        return sorted.sort((a, b) => {
          const aTime = a.engagement?.lastActivity ? new Date(a.engagement.lastActivity).getTime() : 0;
          const bTime = b.engagement?.lastActivity ? new Date(b.engagement.lastActivity).getTime() : 0;
          return bTime - aTime;
        });
      default:
        return sorted;
    }
  }, [shifts, sortBy]);

  // Separate favorites to top
  const displayShifts = useMemo(() => {
    const favorites = sortedShifts.filter(s => s.is_favorite);
    const others = sortedShifts.filter(s => !s.is_favorite);
    return [...favorites, ...others];
  }, [sortedShifts]);

  useEffect(() => {
    if (user) {
      loadShifts();
    }
  }, [user]);

  const loadShifts = async () => {
    if (!user) return;

    try {
      // Fetch shifts
      const { data: shiftsData, error: shiftsError } = await supabase
        .from('shifts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (shiftsError) throw shiftsError;

      // Fetch engagement data from node_interactions
      const engagementMap: Record<string, ShiftEngagement> = {};
      
      if (shiftsData && shiftsData.length > 0) {
        const shiftIds = shiftsData.map(s => s.id);
        
        const { data: interactions, error: interactionsError } = await supabase
          .from('node_interactions')
          .select('*')
          .in('shift_id', shiftIds);

        if (!interactionsError && interactions) {
          // Aggregate interactions by shift
          interactions.forEach(interaction => {
            if (!engagementMap[interaction.shift_id]) {
              engagementMap[interaction.shift_id] = {
                views: 0,
                clicks: 0,
                thumbsUp: 0,
                thumbsDown: 0,
                comments: 0,
                edits: 0,
                suggestions: 0,
                advocateViews: 0,
              };
            }
            
            const eng = engagementMap[interaction.shift_id];
            
            switch (interaction.interaction_type) {
              case 'view': eng.views++; break;
              case 'click': eng.clicks++; break;
              case 'thumbs_up': eng.thumbsUp++; break;
              case 'thumbs_down': eng.thumbsDown++; break;
              case 'comment': eng.comments++; break;
              case 'edit': eng.edits++; break;
              case 'suggestion': eng.suggestions++; break;
            }
            
            // Track most recent activity
            if (!eng.lastActivity || new Date(interaction.created_at) > new Date(eng.lastActivity)) {
              eng.lastActivity = interaction.created_at;
            }
            
            // Track advocate (champion) activity
            if (interaction.viewer_type === 'champion') {
              eng.advocateViews++;
              if (!eng.advocateLastSeen || new Date(interaction.created_at) > new Date(eng.advocateLastSeen)) {
                eng.advocateLastSeen = interaction.created_at;
              }
            }
          });
        }
      }

      // Merge engagement into shifts
      const shiftsWithEngagement = (shiftsData || []).map(shift => ({
        ...shift,
        engagement: engagementMap[shift.id] || undefined,
      }));

      setShifts(shiftsWithEngagement);

      // Check usage limits
      const { data: profile } = await supabase
        .from('profiles')
        .select('tier')
        .eq('id', user.id)
        .single();

      const tier = profile?.tier || 'free';

      const { data: tierLimits } = await supabase
        .from('tier_limits')
        .select('shifts_per_month')
        .eq('tier', tier)
        .single();

      const limit = tierLimits?.shifts_per_month || 3;
      const used = shiftsData?.length || 0;
      setLimits({ tier, limit, used });
    } catch (error) {
      console.error('Error loading shifts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleShiftSelect = (shiftId: string, stakeholder: StakeholderType) => {
    navigate(`/shift/${shiftId}?stakeholder=${stakeholder}`);
  };

  const toggleFavorite = async (shiftId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const shift = shifts.find(s => s.id === shiftId);
    if (!shift) return;

    const newValue = !shift.is_favorite;
    
    // Optimistic update
    setShifts(prev => prev.map(s => 
      s.id === shiftId ? { ...s, is_favorite: newValue } : s
    ));

    // Persist to DB
    const { error } = await supabase
      .from('shifts')
      .update({ is_favorite: newValue })
      .eq('id', shiftId);

    if (error) {
      // Revert on error
      setShifts(prev => prev.map(s => 
        s.id === shiftId ? { ...s, is_favorite: !newValue } : s
      ));
      console.error('Error updating favorite:', error);
    }
  };

  if (loading) {
    return (
      <div
        className="min-h-screen"
        style={{
          background: 'linear-gradient(to bottom, #0A0E14 0%, #080B0F 100%)',
          fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
        }}
      >
        <header className="border-b" style={{ borderColor: '#1E2530' }}>
          <div className="max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <img src={logo} alt="viashift" style={{ height: '32px', width: 'auto' }} />
              <span className="text-xl font-bold tracking-tight" style={{ color: '#F5F5F5' }}>
                viashift
              </span>
            </div>
            <div className="flex items-center gap-4">
              <UserMenu />
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-6 py-12">
          <div className="mb-8">
            <h1 className="text-3xl font-bold" style={{ color: '#F5F5F5' }}>Your Shifts</h1>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => <LoadingSkeleton key={i} />)}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen"
      style={{
        background: 'linear-gradient(to bottom, #0A0E14 0%, #080B0F 100%)',
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
      }}
    >
      <header className="border-b" style={{ borderColor: '#1E2530' }}>
        <div className="max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img src={logo} alt="viashift" style={{ height: '32px', width: 'auto' }} />
            <span className="text-xl font-bold tracking-tight" style={{ color: '#F5F5F5' }}>
              viashift
            </span>
          </div>
          <div className="flex items-center gap-4">
            {limits && limits.limit !== -1 && limits.used >= limits.limit ? (
              <div className="flex items-center gap-3">
                <span className="text-sm" style={{ color: '#6B7A8C' }}>
                  {limits.used}/{limits.limit} Shifts
                </span>
                <button
                  className="px-5 py-2.5 rounded-lg flex items-center gap-2"
                  style={{ background: '#1E2530', color: '#6B7A8C', fontWeight: 600, cursor: 'not-allowed' }}
                  disabled
                >
                  <Plus size={20} />
                  Upgrade to Create More
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                {limits && limits.limit !== -1 && (
                  <span className="text-sm" style={{ color: '#6B7A8C' }}>
                    {limits.used}/{limits.limit} Shifts
                  </span>
                )}
                <button
                  onClick={() => navigate('/create')}
                  className="px-5 py-2.5 rounded-lg flex items-center gap-2 transition-all"
                  style={{ background: '#00D4E5', color: '#0A0E14', fontWeight: 600 }}
                  onMouseEnter={(e) => { e.currentTarget.style.filter = 'brightness(1.1)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.filter = 'brightness(1)'; }}
                >
                  <Plus size={20} />
                  Create New Shift
                </button>
              </div>
            )}
            <UserMenu />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {shifts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <h2 className="text-2xl font-bold mb-4" style={{ color: '#F5F5F5' }}>No shifts yet</h2>
            <p className="text-center mb-8" style={{ color: '#6B7A8C', maxWidth: '400px' }}>
              Create your first shift to visualize data flow transformations for your prospects.
            </p>
            <button
              onClick={() => navigate('/create')}
              className="px-6 py-3 rounded-lg flex items-center gap-2 transition-all"
              style={{ background: '#00D4E5', color: '#0A0E14', fontWeight: 600 }}
              onMouseEnter={(e) => { e.currentTarget.style.filter = 'brightness(1.1)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.filter = 'brightness(1)'; }}
            >
              <Plus size={20} />
              Create Your First Shift
            </button>
          </div>
        ) : (
          <>
            <div className="mb-8 flex items-end justify-between">
              <div>
                <h1 className="text-3xl font-bold" style={{ color: '#F5F5F5' }}>Your Shifts</h1>
                <p className="mt-2" style={{ color: '#6B7A8C' }}>
                  {shifts.length} {shifts.length === 1 ? 'shift' : 'shifts'} • Hover to choose perspective
                </p>
              </div>
              {/* Sort dropdown */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                  className="appearance-none px-4 py-2 pr-8 rounded-lg text-sm font-medium cursor-pointer"
                  style={{ 
                    background: '#1E2530', 
                    border: '1px solid #2A3441', 
                    color: '#F5F5F5',
                    outline: 'none',
                  }}
                >
                  <option value="newest">Newest first</option>
                  <option value="oldest">Oldest first</option>
                  <option value="alphabetical">A-Z</option>
                  <option value="most_active">Most active</option>
                  <option value="last_activity">Recent activity</option>
                </select>
                <ChevronDown 
                  size={16} 
                  className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none"
                  style={{ color: '#6B7A8C' }}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayShifts.map((shift) => (
                <ShiftCard
                  key={shift.id}
                  shift={shift}
                  onSelect={(stakeholder) => handleShiftSelect(shift.id, stakeholder)}
                  onToggleFavorite={toggleFavorite}
                />
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default Dashboard;