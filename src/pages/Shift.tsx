import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { TransformationExperience, TransformationStory } from '../components/TransformationExperience';
import { Sightline } from '../components/Sightline';
import { ShareModal } from '../components/ShareModal';
import { ChampionSharePrompt } from '../components/ChampionSharePrompt';
import { ConfigPanel } from '../components/branding/BrandingPanel';
import { BrandConfig } from '../components/branding/brandUtils';
import { templates, TemplateId } from '../data/templates';
import { prepareFlowData, ValueOverrides } from '../utils/valueUtils';
console.log('Loaded templates:', templates);
interface ShiftData {
  id: string;
  company_input: string;
  created_at: string;
  user_id?: string;
  view_count?: number;
  shared_at?: string;
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

type ViewPhase = 'sightline' | 'transformation';

export const Shift = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [shift, setShift] = useState<ShiftData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showConfigPanel, setShowConfigPanel] = useState(false);
  const [viewPhase, setViewPhase] = useState<ViewPhase>('sightline');
  const [previewMode, setPreviewMode] = useState<'seller' | 'champion'>('seller');
  const [showSharePrompt, setShowSharePrompt] = useState(false);
  const [sharePromptDismissedThisSession, setSharePromptDismissedThisSession] = useState(false);
  const [transformationViewCount, setTransformationViewCount] = useState(0);
  
const [config, setConfig] = useState({
  companyName: '',
  companyLogo: undefined as string | undefined,
  primaryColor: '#00D4E5',
  secondaryColor: '#00BFA6',
  vendorName: undefined as string | undefined,
  vendorLogo: undefined as string | undefined,
  sightlineLine1: 'What if [company] could recover',
  sightlineMetric: '$1.6M',
  sightlineLine2: 'from deals dying in silence?',
  showLabels: true, 
  valueOverrides: null as ValueOverrides | null, 
});

  useEffect(() => {
    const fetchShift = async () => {
      if (!id) return;

      try {
        const { data, error } = await supabase
          .from('shifts')
          .select('*')
          .eq('id', id)
          .maybeSingle();

        if (error) throw error;

        if (!data) {
          setError('Shift not found');
        } else {
          setShift(data);
          
          // Update config from database
          setConfig({
            companyName: data.company_input || '',
            companyLogo: data.logo_url,
            primaryColor: data.primary_color || '#00D4E5',
            secondaryColor: data.secondary_color || '#00BFA6',
            vendorName: data.vendor_name,
            vendorLogo: data.vendor_logo_url,
            sightlineLine1: data.sightline_line1 || 'What if [company] could recover',
            sightlineMetric: data.sightline_metric || '$1.6M',
            sightlineLine2: data.sightline_line2 || 'from deals dying in silence?',
          });

          // Skip sightline if disabled
          if (data.sightline_enabled === false) {
            setViewPhase('transformation');
          }

          // Auto-open config panel for new shifts
          if (searchParams.get('configure') === 'true') {
            setShowConfigPanel(true);
          }
        }
      } catch (err) {
        console.error('Error fetching shift:', err);
        setError('Failed to load shift');
      } finally {
        setLoading(false);
      }
    };

    fetchShift();
  }, [id, searchParams]);

  // Track when we enter transformation phase and reset share prompt eligibility
  useEffect(() => {
    if (viewPhase === 'transformation') {
      setTransformationViewCount(prev => prev + 1);
      // Reset dismissal after returning from current state
      if (transformationViewCount > 0) {
        setSharePromptDismissedThisSession(false);
      }
    }
  }, [viewPhase]);

  // Champion share prompt timer - more persistent
  useEffect(() => {
    if (previewMode === 'champion' && viewPhase === 'transformation' && !sharePromptDismissedThisSession) {
      const timer = setTimeout(() => {
        setShowSharePrompt(true);
      }, 10000); // 10 seconds

      return () => clearTimeout(timer);
    }
  }, [previewMode, viewPhase, sharePromptDismissedThisSession, transformationViewCount]);

  const handleSightlineComplete = () => {
    setViewPhase('transformation');
  };

  const handleShare = async () => {
    setShowShareModal(true);
    if (id && shift && !shift.shared_at) {
      await supabase
        .from('shifts')
        .update({ shared_at: new Date().toISOString() })
        .eq('id', id);
    }
  };

  const handleSaveConfig = async () => {
    if (!shift || !id) return;

    await supabase
      .from('shifts')
      .update({
        company_input: config.companyName,
        logo_url: config.companyLogo,
        primary_color: config.primaryColor,
        secondary_color: config.secondaryColor,
        vendor_name: config.vendorName,
        vendor_logo_url: config.vendorLogo,
        sightline_line1: config.sightlineLine1,
        sightline_metric: config.sightlineMetric,
        sightline_line2: config.sightlineLine2,
      })
      .eq('id', id);

    // Update local shift state to match config immediately (no reload needed)
    setShift(prev => prev ? {
      ...prev,
      company_input: config.companyName,
      logo_url: config.companyLogo,
      primary_color: config.primaryColor,
      secondary_color: config.secondaryColor,
      vendor_name: config.vendorName,
      vendor_logo_url: config.vendorLogo,
      sightline_line1: config.sightlineLine1,
      sightline_metric: config.sightlineMetric,
      sightline_line2: config.sightlineLine2,
    } : null);
  };

  const handleDismissSharePrompt = () => {
    setShowSharePrompt(false);
    setSharePromptDismissedThisSession(true);
  };

const story = useMemo((): TransformationStory => {
const templateId = shift?.template_id || 'cfo-value-case';
  const template = templates[templateId] || templates['b2b-sales-enablement'];
  console.log('Template debug:', { templateId, template: template?.id, hasValueFormat: !!template?.valueFormat });
  // Generate display values based on template format
  const beforeData = prepareFlowData(
    template.currentState.data,
    template.valueFormat,
    config.valueOverrides
  );
  
  const afterData = prepareFlowData(
    template.shiftedState.data,
    template.valueFormat,
    config.valueOverrides
  );
  
  return {
    id: shift?.id || 'shift',
    title: config.companyName || 'Transformation',
    subtitle: template.description,
    stageLabels: template.stageLabels,
    before: {
      data: beforeData,
      metrics: template.currentState.metrics,
      stageLabel: template.currentState.stageLabel,
      anchoredMetric: template.currentState.anchoredMetric,
    },
    after: {
      data: afterData,
      metrics: template.shiftedState.metrics,
      stageLabel: template.shiftedState.stageLabel,
      anchoredMetric: template.shiftedState.anchoredMetric,
      insight: template.shiftedState.insight.replace('[company]', config.companyName || 'Your company'),
    },
  };
}, [shift?.id, shift?.template_id, config.companyName, config.valueOverrides]);

  // Use config state for live updates (not shift which requires reload)
  const buildBrand = (): BrandConfig => {
    return {
      name: config.companyName || 'Prospect',
      logoUrl: config.companyLogo,
      colors: {
        primary: config.primaryColor,
        secondary: config.secondaryColor,
        accent: '#FF6B6B',
      },
      vendor: config.vendorName || config.vendorLogo ? {
        name: config.vendorName || '',
        logoUrl: config.vendorLogo,
      } : undefined,
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(to bottom, #0A0E14 0%, #080B0F 100%)' }}>
        <div className="animate-pulse text-lg" style={{ color: '#00D4E5', fontFamily: 'Inter, system-ui, sans-serif' }}>
          Loading shift...
        </div>
      </div>
    );
  }

  if (error || !shift) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6" style={{ background: 'linear-gradient(to bottom, #0A0E14 0%, #080B0F 100%)' }}>
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4" style={{ color: '#FFFFFF', fontFamily: 'Inter, system-ui, sans-serif' }}>
            {error || 'Shift not found'}
          </h1>
          <button
            onClick={() => navigate('/create')}
            className="px-6 py-3 rounded-lg transition-all"
            style={{ background: '#00D4E5', color: '#0A0E14', fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 600 }}
          >
            Create New Shift
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen overflow-hidden" style={{ background: '#0A0A0A' }}>
      {/* Sightline Phase */}
      {viewPhase === 'sightline' && (
        <Sightline
          line1={config.sightlineLine1}
          metric={config.sightlineMetric}
          line2={config.sightlineLine2}
          companyName={config.companyName}
          companyLogo={config.companyLogo}
          stakeholderType="all"
          onContinue={handleSightlineComplete}
          autoAdvance={false}
        />
      )}

      {/* Transformation Phase */}
      {viewPhase === 'transformation' && (
        <TransformationExperience
  story={story}
  initialBrand={buildBrand()}
  onShare={handleShare}
  onConfigure={() => setShowConfigPanel(true)}
  readOnly={false}
  previewMode={previewMode}
  onPreviewModeChange={setPreviewMode}
  showLabels={config.showLabels}
/>
      )}

      {/* Modals & Panels */}
      {shift && (
        <>
          <ShareModal
            isOpen={showShareModal}
            onClose={() => setShowShareModal(false)}
            shiftId={shift.id}
            companyName={config.companyName}
          />
          <ConfigPanel
            isOpen={showConfigPanel}
            onClose={() => setShowConfigPanel(false)}
            shiftId={shift.id}
            currentConfig={config}
            onConfigChange={(updates) => setConfig(prev => ({ ...prev, ...updates }))}
            onSave={handleSaveConfig}
          />
          {previewMode === 'champion' && (
            <ChampionSharePrompt
              shiftId={shift.id}
              companyName={config.companyName}
              isVisible={showSharePrompt}
              onDismiss={handleDismissSharePrompt}
            />
          )}
        </>
      )}
    </div>
  );
};

export default Shift;