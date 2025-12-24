import { useEffect, useState, useMemo } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { TransformationExperience, TransformationStory } from '../components/TransformationExperience';
import { Sightline } from '../components/Sightline';
import { ChampionSharePrompt } from '../components/ChampionSharePrompt';
import { BrandConfig } from '../components/branding/brandUtils';
import { templates, TemplateId, ViewerType } from '../data/templates';

interface ShiftData {
  id: string;
  company_input: string;
  created_at: string;
  logo_url?: string;
  primary_color?: string;
  secondary_color?: string;
  vendor_logo_url?: string;
  vendor_name?: string;
  sightline_line1?: string;
  sightline_metric?: string;
  sightline_line2?: string;
  sightline_enabled?: boolean;
  template_id?: string;
}

type StakeholderType = 'finance' | 'ops' | 'sales' | 'all';
type ViewPhase = 'sightline' | 'transformation';

// Map URL stakeholder param to viewer type
const mapStakeholderToViewerType = (stakeholder: StakeholderType): ViewerType => {
  switch (stakeholder) {
    case 'finance': return 'cfo';
    case 'ops': return 'ops';
    case 'sales': return 'sales';
    case 'all':
    default: return 'default';
  }
};

export const ViewShift = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const [shift, setShift] = useState<ShiftData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewPhase, setViewPhase] = useState<ViewPhase>('sightline');
  const [showSharePrompt, setShowSharePrompt] = useState(false);
  const [sharePromptDismissed, setSharePromptDismissed] = useState(false);

  const stakeholderType = (searchParams.get('stakeholder') as StakeholderType) || 'all';
  const viewerType = mapStakeholderToViewerType(stakeholderType);

  useEffect(() => {
    const fetchAndTrackShift = async () => {
      if (!id) return;

      try {
        const { data, error: fetchError } = await supabase
          .from('shifts')
          .select('*')
          .eq('id', id)
          .maybeSingle();

        if (fetchError) throw fetchError;

        if (!data) {
          setError('Shift not found');
        } else {
          setShift(data);

          if (data.sightline_enabled === false) {
            setViewPhase('transformation');
          }

          await supabase
            .from('shifts')
            .update({ view_count: (data.view_count || 0) + 1 })
            .eq('id', id);
        }
      } catch (err) {
        console.error('Error fetching shift:', err);
        setError('Failed to load shift');
      } finally {
        setLoading(false);
      }
    };

    fetchAndTrackShift();
  }, [id]);

  useEffect(() => {
    if (viewPhase === 'transformation' && !sharePromptDismissed) {
      const timer = setTimeout(() => {
        setShowSharePrompt(true);
      }, 12000);

      return () => clearTimeout(timer);
    }
  }, [viewPhase, sharePromptDismissed]);

  const handleSightlineComplete = () => {
    setViewPhase('transformation');
  };

  const handleDismissShare = () => {
    setShowSharePrompt(false);
    setSharePromptDismissed(true);
  };

  const getSightlineContent = () => {
    const templateId = shift?.template_id || 'b2b-sales-enablement';
    const template = templates[templateId as TemplateId] || templates['b2b-sales-enablement'];
    const viewerConfig = template.viewerConfig[viewerType] || template.viewerConfig.default;

    return {
      line1: shift?.sightline_line1 || viewerConfig.sightline.line1,
      metric: shift?.sightline_metric || viewerConfig.sightline.metric,
      line2: shift?.sightline_line2 || viewerConfig.sightline.line2,
    };
  };

  const story = useMemo((): TransformationStory => {
    const templateId = shift?.template_id || 'b2b-sales-enablement';
    const template = templates[templateId as TemplateId] || templates['b2b-sales-enablement'];
    const viewerConfig = template.viewerConfig[viewerType] || template.viewerConfig.default;

    return {
      id: shift?.id || 'shift',
      title: shift?.company_input || 'Transformation',
      subtitle: template.description,
      stageLabels: viewerConfig.stageLabels,
      narrative: viewerConfig.narrative,
      before: {
        data: template.currentState.data,
        metrics: template.currentState.metrics,
        stageLabel: template.currentState.stageLabel,
        anchoredMetric: template.currentState.anchoredMetric,
      },
      after: {
        data: template.shiftedState.data,
        metrics: template.shiftedState.metrics,
        stageLabel: template.shiftedState.stageLabel,
        anchoredMetric: template.shiftedState.anchoredMetric,
        insight: template.shiftedState.insight.replace('[company]', shift?.company_input || 'Your company'),
      },
    };
  }, [shift, viewerType]);

  const buildBrand = (): BrandConfig => {
    return {
      name: shift?.company_input || 'Prospect',
      logoUrl: shift?.logo_url,
      colors: {
        primary: shift?.primary_color || '#00D4E5',
        secondary: shift?.secondary_color || '#00BFA6',
        accent: '#FF6B6B',
      },
      vendor: shift?.vendor_name || shift?.vendor_logo_url ? {
        name: shift?.vendor_name || '',
        logoUrl: shift?.vendor_logo_url,
      } : undefined,
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0A0A0A' }}>
        <div className="animate-pulse text-lg" style={{ color: '#00D4E5' }}>
          Loading...
        </div>
      </div>
    );
  }

  if (error || !shift) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6" style={{ background: '#0A0A0A' }}>
        <h1 className="text-2xl font-bold" style={{ color: '#FFFFFF' }}>
          {error || 'Shift not found'}
        </h1>
      </div>
    );
  }

  const sightlineContent = getSightlineContent();

  return (
    <div className="h-screen w-screen overflow-hidden" style={{ background: '#0A0A0A' }}>
      {viewPhase === 'sightline' && (
        <Sightline
          line1={sightlineContent.line1}
          metric={sightlineContent.metric}
          line2={sightlineContent.line2}
          companyName={shift.company_input}
          companyLogo={shift.logo_url}
          stakeholderType={stakeholderType}
          onContinue={handleSightlineComplete}
          autoAdvance={true}
          autoAdvanceDuration={6000}
        />
      )}

      {viewPhase === 'transformation' && (
        <TransformationExperience
          story={story}
          initialBrand={buildBrand()}
          readOnly={true}
          showCTA={true}
        />
      )}

      {shift && (
        <ChampionSharePrompt
          shiftId={shift.id}
          companyName={shift.company_input}
          isVisible={showSharePrompt}
          onDismiss={handleDismissShare}
        />
      )}
    </div>
  );
};

export default ViewShift;