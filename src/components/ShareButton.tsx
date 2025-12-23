import { useState } from 'react';
import { Share2, Copy, Check, X } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface ShareButtonProps {
  workflowId: string;
  workflowName: string;
}

export const ShareButton = ({ workflowId, workflowName }: ShareButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateShareLink = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const token = crypto.randomUUID();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      const { error: insertError } = await supabase
        .from('shared_links')
        .insert({
          token,
          workflow_id: workflowId,
          expires_at: expiresAt.toISOString(),
        });

      if (insertError) throw insertError;

      const url = `${window.location.origin}/s/${token}`;
      setShareUrl(url);
    } catch (err) {
      console.error('Failed to generate share link:', err);
      setError('Failed to generate share link. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpen = () => {
    setIsOpen(true);
    if (!shareUrl) {
      generateShareLink();
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setShareUrl(null);
    setCopied(false);
    setError(null);
  };

  const copyToClipboard = async () => {
    if (!shareUrl) return;

    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <>
      <button
        onClick={handleOpen}
        className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all hover:opacity-90"
        style={{
          background: 'linear-gradient(135deg, #00D4E5, #00BFA6)',
          color: '#0A0A0A',
        }}
      >
        <Share2 size={16} />
        Share
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={handleClose}
          />

          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md">
            <div
              className="rounded-2xl p-6"
              style={{
                background: '#141414',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
              }}
            >
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-white">Share Riff</h2>
                  <p className="text-sm text-white/50 mt-1">{workflowName}</p>
                </div>
                <button
                  onClick={handleClose}
                  className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {isLoading && (
                <div className="flex items-center justify-center py-8">
                  <div className="w-8 h-8 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
                </div>
              )}

              {error && (
                <div
                  className="p-4 rounded-lg mb-4"
                  style={{
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                  }}
                >
                  <p className="text-sm text-red-400">{error}</p>
                  <button
                    onClick={generateShareLink}
                    className="text-sm text-white/80 underline mt-2"
                  >
                    Try again
                  </button>
                </div>
              )}

              {shareUrl && !isLoading && (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-medium text-white/60 mb-2 block">
                      Share Link
                    </label>
                    <div
                      className="flex items-center gap-2 p-3 rounded-lg"
                      style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                      }}
                    >
                      <input
                        type="text"
                        value={shareUrl}
                        readOnly
                        className="flex-1 bg-transparent text-sm text-white/80 outline-none"
                      />
                      <button
                        onClick={copyToClipboard}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                        style={{
                          background: copied
                            ? 'rgba(34, 197, 94, 0.2)'
                            : 'rgba(0, 212, 229, 0.2)',
                          border: `1px solid ${
                            copied ? 'rgba(34, 197, 94, 0.4)' : 'rgba(0, 212, 229, 0.4)'
                          }`,
                          color: copied ? '#22C55E' : '#00D4E5',
                        }}
                      >
                        {copied ? (
                          <>
                            <Check size={14} />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy size={14} />
                            Copy
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  <div
                    className="p-4 rounded-lg"
                    style={{
                      background: 'rgba(0, 212, 229, 0.05)',
                      border: '1px solid rgba(0, 212, 229, 0.15)',
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{
                          background: 'rgba(0, 212, 229, 0.2)',
                        }}
                      >
                        <Share2 size={16} style={{ color: '#00D4E5' }} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white mb-1">
                          Link expires in 7 days
                        </p>
                        <p className="text-xs text-white/50">
                          Anyone with this link can view your Riff without signing in
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default ShareButton;
