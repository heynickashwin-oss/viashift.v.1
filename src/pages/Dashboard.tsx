import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Eye, Users, DollarSign, Clock, Target, ThumbsUp, ThumbsDown, MessageSquare, Activity } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import logo from '../assets/logo.svg';
import { UserMenu } from '../components/ui/UserMenu';

interface ShiftEngagement {
  views: number;
  clicks: number;
  thumbsUp: number;
  thumbsDown: number;
  comments: number;
  edits: number;
  suggestions: number;
  lastActivity?: string;
}

interface Shift {
  id: string;
  company_input: string;
  created_at: string;
  view_count: number;
  shared_at?: string;
  logo_url?: string;
  engagement?: ShiftEngagement;
}

type StakeholderType = 'all' | 'finance' | 'ops' | 'sales';

const stakeholderConfig: Record<StakeholderType, { icon: typeof DollarSign; label: string; color: string }> = {
  all: { icon: Target, label: 'General', color: '#00D4E5' },
  finance: { icon: DollarSign, label: 'Finance', color: '#4ADE80' },
  ops: { icon: Clock, label: 'Operations', color: '#F59E0B' },
  sales: { icon: Users, label: 'Sales', color: '#8B5CF6' },
};

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

// Check if activity is recent (within last 24 hours)
const isRecentActivity = (dateString?: string): boolean => {
  if (!dateString) return false;
  const activityDate = new Date(dateString);
  const now = new Date();
  const hoursDiff = (now.getTime() - activityDate.getTime()) / (1000 * 60 * 60);
  return hoursDiff < 24;
};

const ShiftCard = ({ shift, onSelect }: { shift: Shift; onSelect: (stakeholder: StakeholderType) => void }) => {
  const [showStakeholders, setShowStakeholders] = useState(false);
  const navigate = useNavigate();

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
  const hasEngagement = engagement && (engagement.clicks > 0 || engagement.thumbsUp > 0 || engagement.thumbsDown > 0 || engagement.comments > 0);
  const hasRecentActivity = isRecentActivity(engagement?.lastActivity);
  const totalReactions = (engagement?.thumbsUp || 0) + (engagement?.thumbsDown || 0);
  const totalActivity = (engagement?.clicks || 0);

  return (
    <div
      className="relative rounded-xl p-6 cursor-pointer transition-all"
      style={{ 
        background: '#12161C', 
        border: hasRecentActivity ? '1px solid #00D4E5' : '1px solid #1E2530',
        boxShadow: hasRecentActivity ? '0 0 20px rgba(0, 212, 229, 0.15)' : 'none',
      }}
      onClick={handleCardClick}
      onMouseEnter={() => setShowStakeholders(true)}
      onMouseLeave={() => setShowStakeholders(false)}
    >
      {/* Recent activity indicator */}
      {hasRecentActivity && (
        <div 
          className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium"
          style={{ background: 'rgba(0, 212, 229, 0.15)', color: '#00D4E5' }}
        >
          <Activity size={12} />
          Active
        </div>
      )}

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

      {/* Stakeholder picker overlay */}
      {showStakeholders && (
        <div
          className="absolute inset-0 rounded-xl flex flex-col items-center justify-center gap-3 backdrop-blur-sm"
          style={{ background: 'rgba(10, 14, 20, 0.95)', border: '1px solid #00D4E5' }}
        >
          <p className="text-xs font-medium mb-2" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
            Choose perspective for {shift.company_input}
          </p>
          <div className="grid grid-cols-2 gap-2 w-full px-4">
            {(Object.entries(stakeholderConfig) as [StakeholderType, typeof stakeholderConfig.all][]).map(([key, config]) => {
              const Icon = config.icon;
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
                    e.currentTarget.style.background = `${config.color}20`;
                    e.currentTarget.style.borderColor = `${config.color}50`;
                    e.currentTarget.style.color = config.color;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                    e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)';
                  }}
                >
                  <Icon size={14} />
                  {config.label}
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
  );
};

export const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);
  const [limits, setLimits] = useState<{ tier: string; limit: number; used: number } | null>(null);

  useEffect(() => {
    loadShifts();
  }, [user]);

  const loadShifts = async () => {
    if (!user?.id) return;

    try {
      // Load shifts
      const { data: shiftsData, error: shiftsError } = await supabase
        .from('shifts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (shiftsError) throw shiftsError;

      // Load engagement data for all shifts
      const shiftIds = (shiftsData || []).map(s => s.id);
      
      let engagementMap: Record<string, ShiftEngagement> = {};
      
      if (shiftIds.length > 0) {
        const { data: interactions, error: interactionsError } = await supabase
          .from('node_interactions')
          .select('shift_id, interaction_type, created_at')
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
            <div className="mb-8">
              <h1 className="text-3xl font-bold" style={{ color: '#F5F5F5' }}>Your Shifts</h1>
              <p className="mt-2" style={{ color: '#6B7A8C' }}>
                {shifts.length} {shifts.length === 1 ? 'shift' : 'shifts'} • Hover to choose perspective
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {shifts.map((shift) => (
                <ShiftCard
                  key={shift.id}
                  shift={shift}
                  onSelect={(stakeholder) => handleShiftSelect(shift.id, stakeholder)}
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