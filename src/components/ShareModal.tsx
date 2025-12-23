import { useState } from 'react';
import { X, Copy, Check } from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  shiftId: string;
  companyName: string;
}

type StakeholderType = 'finance' | 'ops' | 'sales' | 'all';

const stakeholderOptions: { type: StakeholderType; icon: string; label: string; description: string }[] = [
  { type: 'finance', icon: '💰', label: 'Finance', description: 'Cost savings & ROI focus' },
  { type: 'ops', icon: '⚙️', label: 'Operations', description: 'Efficiency & time savings' },
  { type: 'sales', icon: '📈', label: 'Sales', description: 'Pipeline & close rates' },
  { type: 'all', icon: '🎯', label: 'General', description: 'Overview for any audience' },
];

export const ShareModal = ({ isOpen, onClose, shiftId, companyName }: ShareModalProps) => {
  const [selectedType, setSelectedType] = useState<StakeholderType>('all');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const shareUrl = `${window.location.origin}/view/${shiftId}${selectedType !== 'all' ? `?stakeholder=${selectedType}` : ''}`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      <div
        className="relative w-full max-w-md mx-4 rounded-2xl overflow-hidden"
        style={{ background: '#12161C', border: '1px solid rgba(255,255,255,0.1)' }}
      >
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #00D4E5 0%, #00BFA6 100%)' }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0A0A0A" strokeWidth="2.5">
                <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
                <polyline points="16 6 12 2 8 6"/>
                <line x1="12" y1="2" x2="12" y2="15"/>
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Share this Shift</h2>
              <p className="text-xs text-white/50">Select a perspective for your recipient</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X size={20} className="text-white/60" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          <p className="text-sm text-white/60">
            Choose a perspective for <span className="text-white">{companyName}</span>
          </p>

          <div className="grid grid-cols-2 gap-3">
            {stakeholderOptions.map((option) => (
              <button
                key={option.type}
                onClick={() => setSelectedType(option.type)}
                className="p-4 rounded-xl text-left transition-all"
                style={{
                  background: selectedType === option.type
                    ? 'rgba(0, 212, 229, 0.15)'
                    : 'rgba(255, 255, 255, 0.05)',
                  border: selectedType === option.type
                    ? '1px solid rgba(0, 212, 229, 0.4)'
                    : '1px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                <div className="text-xl mb-2">{option.icon}</div>
                <div className="text-sm font-medium text-white">{option.label}</div>
                <div className="text-xs text-white/50 mt-1">{option.description}</div>
              </button>
            ))}
          </div>

          <div
            className="p-3 rounded-lg text-xs font-mono text-white/60 break-all"
            style={{ background: 'rgba(0,0,0,0.3)' }}
          >
            {shareUrl}
          </div>

          <button
            onClick={handleCopy}
            className="w-full py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-all"
            style={{
              background: copied ? '#00BFA6' : '#00D4E5',
              color: '#0A0A0A',
            }}
          >
            {copied ? (
              <>
                <Check size={18} />
                Copied!
              </>
            ) : (
              <>
                <Copy size={18} />
                Copy Link
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
