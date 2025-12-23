import { useState, useRef } from 'react';
import { X, Building2, MessageSquare, User, Upload, Trash2 } from 'lucide-react';

interface ConfigPanelProps {
  isOpen: boolean;
  onClose: () => void;
  shiftId: string;
  currentConfig: {
    companyName: string;
    companyLogo?: string;
    primaryColor: string;
    secondaryColor: string;
    vendorName?: string;
    vendorLogo?: string;
    sightlineLine1: string;
    sightlineMetric: string;
    sightlineLine2: string;
  };
  onConfigChange: (config: Partial<ConfigPanelProps['currentConfig']>) => void;
  onSave: () => void;
}

type TabType = 'prospect' | 'message' | 'seller';
type StakeholderType = 'all' | 'finance' | 'ops' | 'sales';

const stakeholderPresets: Record<StakeholderType, { line1: string; metric: string; line2: string }> = {
  all: { line1: 'What if [company] could recover', metric: '$1.6M', line2: 'from deals dying in silence?' },
  finance: { line1: 'What if [company] could recover', metric: '$1.6M', line2: 'from deals dying in silence?' },
  ops: { line1: 'What if [company] could save', metric: '20 hours', line2: 'per rep per month?' },
  sales: { line1: 'What if [company] could close', metric: '40% more', line2: 'of their pipeline?' },
};

export const ConfigPanel = ({
  isOpen,
  onClose,
  shiftId,
  currentConfig,
  onConfigChange,
  onSave,
}: ConfigPanelProps) => {
  const [activeTab, setActiveTab] = useState<TabType>('prospect');
  const [isSaving, setIsSaving] = useState(false);
  const [selectedStakeholder, setSelectedStakeholder] = useState<StakeholderType>('all');
  const logoInputRef = useRef<HTMLInputElement>(null);
  const vendorLogoInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'company' | 'vendor') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      if (type === 'company') {
        onConfigChange({ companyLogo: base64 });
      } else {
        onConfigChange({ vendorLogo: base64 });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setIsSaving(true);
    await onSave();
    setIsSaving(false);
    onClose();
  };

  const handleStakeholderChange = (type: StakeholderType) => {
    setSelectedStakeholder(type);
    const preset = stakeholderPresets[type];
    onConfigChange({
      sightlineLine1: preset.line1,
      sightlineMetric: preset.metric,
      sightlineLine2: preset.line2,
    });
  };

  const tabs = [
    { id: 'prospect' as TabType, label: 'Prospect', icon: Building2 },
    { id: 'message' as TabType, label: 'Message', icon: MessageSquare },
    { id: 'seller' as TabType, label: 'Seller', icon: User },
  ];

  const inputStyle = {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.15)',
    outline: 'none',
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" onClick={onClose} />

      <div
        className="fixed right-0 top-0 bottom-0 w-full max-w-md z-50 flex flex-col"
        style={{
          background: 'linear-gradient(180deg, #12161C 0%, #0A0E14 100%)',
          borderLeft: '1px solid rgba(255,255,255,0.1)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <h2 className="text-lg font-semibold text-white">Configure Shift</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/10 transition-colors">
            <X size={20} className="text-white/60" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/10">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex-1 flex items-center justify-center gap-2 py-4 text-sm font-medium transition-all relative"
              style={{ color: activeTab === tab.id ? '#00D4E5' : 'rgba(255,255,255,0.5)' }}
            >
              <tab.icon size={16} />
              {tab.label}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5" style={{ background: '#00D4E5' }} />
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">

          {/* PROSPECT TAB */}
          {activeTab === 'prospect' && (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/70">Company Name</label>
                <input
                  type="text"
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck={false}
                  value={currentConfig.companyName}
                  onChange={(e) => onConfigChange({ companyName: e.target.value })}
                  placeholder="Acme Corp"
                  className="w-full px-4 py-3 rounded-xl text-white text-sm focus:border-cyan-500"
                  style={inputStyle}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-white/70">Company Logo</label>
                <div
                  className="relative rounded-xl p-6 flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-white/10 transition-colors"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px dashed rgba(255,255,255,0.2)' }}
                  onClick={() => logoInputRef.current?.click()}
                >
                  {currentConfig.companyLogo ? (
                    <>
                      <img src={currentConfig.companyLogo} alt="Company logo" className="h-16 w-auto object-contain" />
                      <button
                        onClick={(e) => { e.stopPropagation(); onConfigChange({ companyLogo: undefined }); }}
                        className="absolute top-2 right-2 p-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/40 transition-colors"
                      >
                        <Trash2 size={14} className="text-red-400" />
                      </button>
                    </>
                  ) : (
                    <>
                      <Upload size={24} className="text-white/40" />
                      <span className="text-sm text-white/50">Click to upload logo</span>
                    </>
                  )}
                  <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleLogoUpload(e, 'company')} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/70">Primary Color</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={currentConfig.primaryColor}
                      onChange={(e) => onConfigChange({ primaryColor: e.target.value })}
                      className="rounded-lg cursor-pointer border-2 border-white/20"
                      style={{ width: '48px', height: '48px', padding: '2px' }}
                    />
                    <input
                      type="text"
                      autoComplete="off"
                      value={currentConfig.primaryColor}
                      onChange={(e) => onConfigChange({ primaryColor: e.target.value })}
                      className="w-24 px-3 py-2 rounded-lg text-white text-sm font-mono"
                      style={inputStyle}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/70">Secondary Color</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={currentConfig.secondaryColor}
                      onChange={(e) => onConfigChange({ secondaryColor: e.target.value })}
                      className="rounded-lg cursor-pointer border-2 border-white/20"
                      style={{ width: '48px', height: '48px', padding: '2px' }}
                    />
                    <input
                      type="text"
                      autoComplete="off"
                      value={currentConfig.secondaryColor}
                      onChange={(e) => onConfigChange({ secondaryColor: e.target.value })}
                      className="w-24 px-3 py-2 rounded-lg text-white text-sm font-mono"
                      style={inputStyle}
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          {/* MESSAGE TAB */}
          {activeTab === 'message' && (
            <>
              <div className="p-4 rounded-xl" style={{ background: 'rgba(0, 212, 229, 0.1)', border: '1px solid rgba(0, 212, 229, 0.2)' }}>
                <p className="text-sm text-white/70">
                  The Sightline is the opening hook. Use <span className="text-cyan-400 font-mono">[company]</span> to auto-insert their name.
                </p>
              </div>

              {/* Stakeholder Presets */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/70">Quick Presets</label>
                <div className="grid grid-cols-4 gap-2">
                  {(['all', 'finance', 'ops', 'sales'] as StakeholderType[]).map((type) => (
                    <button
                      key={type}
                      onClick={() => handleStakeholderChange(type)}
                      className="py-2 px-3 rounded-lg text-xs font-medium transition-all capitalize"
                      style={{
                        background: selectedStakeholder === type ? 'rgba(0, 212, 229, 0.2)' : 'rgba(255,255,255,0.05)',
                        border: `1px solid ${selectedStakeholder === type ? 'rgba(0, 212, 229, 0.4)' : 'rgba(255,255,255,0.1)'}`,
                        color: selectedStakeholder === type ? '#00D4E5' : 'rgba(255,255,255,0.6)',
                      }}
                    >
                      {type === 'all' ? 'General' : type}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-white/70">Opening Line</label>
                <input
                  type="text"
                  autoComplete="off"
                  autoCorrect="off"
                  spellCheck={false}
                  value={currentConfig.sightlineLine1}
                  onChange={(e) => onConfigChange({ sightlineLine1: e.target.value })}
                  placeholder="What if [company] could recover"
                  className="w-full px-4 py-3 rounded-xl text-white text-sm"
                  style={inputStyle}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-white/70">The Hook (Big Number)</label>
                <input
                  type="text"
                  autoComplete="off"
                  value={currentConfig.sightlineMetric}
                  onChange={(e) => onConfigChange({ sightlineMetric: e.target.value })}
                  placeholder="$1.6M"
                  className="w-full px-4 py-3 rounded-xl text-2xl font-bold text-center"
                  style={{ ...inputStyle, color: '#00D4E5' }}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-white/70">Closing Line</label>
                <input
                  type="text"
                  autoComplete="off"
                  autoCorrect="off"
                  spellCheck={false}
                  value={currentConfig.sightlineLine2}
                  onChange={(e) => onConfigChange({ sightlineLine2: e.target.value })}
                  placeholder="from deals dying in silence?"
                  className="w-full px-4 py-3 rounded-xl text-white text-sm"
                  style={inputStyle}
                />
              </div>

              {/* Preview */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/70">Preview</label>
                <div className="p-6 rounded-xl text-center" style={{ background: 'rgba(0,0,0,0.4)' }}>
                  <p className="text-white/70 text-sm mb-2">
                    {currentConfig.sightlineLine1.replace(/\[company\]/gi, currentConfig.companyName || 'Acme Corp')}
                  </p>
                  <p className="text-3xl font-bold mb-2" style={{ color: '#00D4E5' }}>
                    {currentConfig.sightlineMetric}
                  </p>
                  <p className="text-white/70 text-sm">
                    {currentConfig.sightlineLine2.replace(/\[company\]/gi, currentConfig.companyName || 'Acme Corp')}
                  </p>
                </div>
              </div>
            </>
          )}

          {/* SELLER TAB */}
          {activeTab === 'seller' && (
            <>
              <div className="p-4 rounded-xl" style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                <p className="text-sm text-white/70">
                  Your branding appears as a subtle watermark. Let prospects know who's showing them this insight.
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-white/70">Your Name / Company</label>
                <input
                  type="text"
                  autoComplete="off"
                  autoCorrect="off"
                  spellCheck={false}
                  value={currentConfig.vendorName || ''}
                  onChange={(e) => onConfigChange({ vendorName: e.target.value })}
                  placeholder="Your Name or Company"
                  className="w-full px-4 py-3 rounded-xl text-white text-sm"
                  style={inputStyle}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-white/70">Your Logo (Optional)</label>
                <div
                  className="relative rounded-xl p-6 flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-white/10 transition-colors"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px dashed rgba(255,255,255,0.2)' }}
                  onClick={() => vendorLogoInputRef.current?.click()}
                >
                  {currentConfig.vendorLogo ? (
                    <>
                      <img src={currentConfig.vendorLogo} alt="Vendor logo" className="h-12 w-auto object-contain" />
                      <button
                        onClick={(e) => { e.stopPropagation(); onConfigChange({ vendorLogo: undefined }); }}
                        className="absolute top-2 right-2 p-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/40 transition-colors"
                      >
                        <Trash2 size={14} className="text-red-400" />
                      </button>
                    </>
                  ) : (
                    <>
                      <Upload size={24} className="text-white/40" />
                      <span className="text-sm text-white/50">Click to upload your logo</span>
                    </>
                  )}
                  <input ref={vendorLogoInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleLogoUpload(e, 'vendor')} />
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-white/10">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full py-3 rounded-xl font-semibold transition-all"
            style={{
              background: 'linear-gradient(135deg, #00D4E5 0%, #00BFA6 100%)',
              color: '#0A0A0A',
              opacity: isSaving ? 0.7 : 1,
            }}
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </>
  );
};

export default ConfigPanel;