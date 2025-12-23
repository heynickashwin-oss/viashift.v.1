import { useState, useEffect } from 'react';
import { X, Send, Copy, Check, Users } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface ChampionSharePromptProps {
  shiftId: string;
  companyName: string;
  isVisible: boolean;
  onDismiss: () => void;
}

type StakeholderType = 'finance' | 'ops' | 'sales' | 'all';

const stakeholderOptions: { type: StakeholderType; icon: string; label: string }[] = [
  { type: 'finance', icon: '💰', label: 'Finance' },
  { type: 'ops', icon: '⚙️', label: 'Operations' },
  { type: 'sales', icon: '📈', label: 'Sales' },
  { type: 'all', icon: '🎯', label: 'General' },
];

export const ChampionSharePrompt = ({
  shiftId,
  companyName,
  isVisible,
  onDismiss,
}: ChampionSharePromptProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [colleagueEmail, setColleagueEmail] = useState('');
  const [myEmail, setMyEmail] = useState('');
  const [selectedType, setSelectedType] = useState<StakeholderType>('all');
  const [copied, setCopied] = useState(false);
  const [sent, setSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => setIsExpanded(true), 500);
      return () => clearTimeout(timer);
    } else {
      setIsExpanded(false);
    }
  }, [isVisible]);

  if (!isVisible) return null;

  const shareUrl = `${window.location.origin}/view/${shiftId}?stakeholder=${selectedType}`;

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);

    await supabase.from('shift_shares').insert({
      shift_id: shiftId,
      shared_by_email: myEmail || null,
      stakeholder_type: selectedType,
    });
  };

  const handleSendEmail = async () => {
    if (!colleagueEmail) return;

    setIsSubmitting(true);

    await supabase.from('shift_shares').insert({
      shift_id: shiftId,
      shared_by_email: myEmail || null,
      shared_to_email: colleagueEmail,
      stakeholder_type: selectedType,
    });

    const subject = encodeURIComponent(`Check out this insight for ${companyName}`);
    const body = encodeURIComponent(`I thought you'd find this interesting:\n\n${shareUrl}\n\nIt shows a breakdown of our current process and potential improvements.`);
    window.location.href = `mailto:${colleagueEmail}?subject=${subject}&body=${body}`;

    setSent(true);
    setIsSubmitting(false);
  };

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-40 flex justify-center px-4 pb-6 pointer-events-none"
      style={{
        opacity: isExpanded ? 1 : 0,
        transform: isExpanded ? 'translateY(0)' : 'translateY(100%)',
        transition: 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
      }}
    >
      <div
        className="pointer-events-auto w-full max-w-xl rounded-2xl overflow-hidden"
        style={{
          background: 'linear-gradient(180deg, rgba(18, 22, 28, 0.98) 0%, rgba(10, 14, 20, 0.98) 100%)',
          border: '1px solid rgba(0, 212, 229, 0.2)',
          boxShadow: '0 -8px 40px rgba(0, 0, 0, 0.5), 0 0 60px rgba(0, 212, 229, 0.1)',
        }}
      >
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(0, 212, 229, 0.15)' }}
            >
              <Users size={20} className="text-cyan-400" />
            </div>
            <div>
              <h3 className="text-white font-semibold">Know someone who should see this?</h3>
              <p className="text-white/50 text-sm">Share with a colleague</p>
            </div>
          </div>
          <button
            onClick={onDismiss}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X size={18} className="text-white/50" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="flex gap-2">
            {stakeholderOptions.map((option) => (
              <button
                key={option.type}
                onClick={() => setSelectedType(option.type)}
                className="flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1.5"
                style={{
                  background: selectedType === option.type
                    ? 'rgba(0, 212, 229, 0.2)'
                    : 'rgba(255, 255, 255, 0.05)',
                  border: selectedType === option.type
                    ? '1px solid rgba(0, 212, 229, 0.4)'
                    : '1px solid rgba(255, 255, 255, 0.1)',
                  color: selectedType === option.type ? '#00D4E5' : 'rgba(255,255,255,0.6)',
                }}
              >
                <span>{option.icon}</span>
                <span>{option.label}</span>
              </button>
            ))}
          </div>

          <div className="space-y-3">
            <input
              type="email"
              value={colleagueEmail}
              onChange={(e) => setColleagueEmail(e.target.value)}
              placeholder="Colleague's email address"
              className="w-full px-4 py-3 rounded-xl text-white text-sm"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
              }}
            />
            <input
              type="email"
              value={myEmail}
              onChange={(e) => setMyEmail(e.target.value)}
              placeholder="Your email (optional - for tracking)"
              className="w-full px-4 py-3 rounded-xl text-white/70 text-sm"
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.05)',
              }}
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleSendEmail}
              disabled={!colleagueEmail || isSubmitting || sent}
              className="flex-1 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all"
              style={{
                background: sent
                  ? '#00BFA6'
                  : colleagueEmail
                    ? 'linear-gradient(135deg, #00D4E5 0%, #00BFA6 100%)'
                    : 'rgba(255,255,255,0.1)',
                color: colleagueEmail || sent ? '#0A0A0A' : 'rgba(255,255,255,0.4)',
                cursor: colleagueEmail && !sent ? 'pointer' : 'default',
              }}
            >
              {sent ? (
                <>
                  <Check size={18} />
                  Sent!
                </>
              ) : (
                <>
                  <Send size={18} />
                  Share via Email
                </>
              )}
            </button>

            <button
              onClick={handleCopyLink}
              className="px-5 py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-all"
              style={{
                background: copied ? 'rgba(0, 191, 166, 0.2)' : 'rgba(255,255,255,0.08)',
                border: copied ? '1px solid rgba(0, 191, 166, 0.4)' : '1px solid rgba(255,255,255,0.15)',
                color: copied ? '#00BFA6' : 'rgba(255,255,255,0.8)',
              }}
            >
              {copied ? <Check size={18} /> : <Copy size={18} />}
              {copied ? 'Copied!' : 'Copy Link'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChampionSharePrompt;
