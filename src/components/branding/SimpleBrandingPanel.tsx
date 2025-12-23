import { useState, useRef } from 'react';
import { X, Upload, Check } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface SimpleBrandingPanelProps {
  shiftId: string;
  currentLogo?: string;
  currentPrimaryColor?: string;
  currentSecondaryColor?: string;
  onClose: () => void;
  onSave: (data: { logoUrl?: string; primaryColor: string; secondaryColor: string }) => void;
}

export const SimpleBrandingPanel = ({
  shiftId,
  currentLogo,
  currentPrimaryColor = '#00D4E5',
  currentSecondaryColor = '#FF6B6B',
  onClose,
  onSave,
}: SimpleBrandingPanelProps) => {
  const [logoUrl, setLogoUrl] = useState(currentLogo);
  const [primaryColor, setPrimaryColor] = useState(currentPrimaryColor);
  const [secondaryColor, setSecondaryColor] = useState(currentSecondaryColor);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('File size must be less than 2MB');
      return;
    }

    if (!['image/png', 'image/jpeg', 'image/svg+xml'].includes(file.type)) {
      alert('Only PNG, JPG, and SVG files are allowed');
      return;
    }

    setUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${shiftId}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('logos')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from('logos')
        .getPublicUrl(filePath);

      setLogoUrl(publicUrlData.publicUrl);
    } catch (error) {
      console.error('Error uploading logo:', error);
      alert('Failed to upload logo');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);

    try {
      const { error } = await supabase
        .from('shifts')
        .update({
          logo_url: logoUrl,
          primary_color: primaryColor,
          secondary_color: secondaryColor,
        })
        .eq('id', shiftId);

      if (error) throw error;

      onSave({ logoUrl, primaryColor, secondaryColor });
      onClose();
    } catch (error) {
      console.error('Error saving branding:', error);
      alert('Failed to save branding');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setLogoUrl(undefined);
    setPrimaryColor('#00D4E5');
    setSecondaryColor('#FF6B6B');
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
        onClick={onClose}
      />
      <div
        className="fixed top-0 right-0 h-full w-[360px] z-50 flex flex-col"
        style={{
          background: '#12161C',
          borderLeft: '1px solid #1E2530',
          boxShadow: '-8px 0 32px rgba(0, 0, 0, 0.5)',
        }}
      >
        <div
          className="flex items-center justify-between p-6 border-b"
          style={{ borderColor: '#1E2530' }}
        >
          <h2 className="text-xl font-bold" style={{ color: '#F5F5F5' }}>
            Customize Branding
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg transition-colors"
            style={{ color: '#6B7A8C' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#1E2530';
              e.currentTarget.style.color = '#F5F5F5';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = '#6B7A8C';
            }}
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium mb-3" style={{ color: '#F5F5F5' }}>
              Prospect Logo
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/svg+xml"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />
            <div
              className="border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all"
              style={{
                borderColor: '#1E2530',
                background: '#0A0E14',
              }}
              onClick={() => fileInputRef.current?.click()}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#00D4E5';
                e.currentTarget.style.background = '#12161C';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#1E2530';
                e.currentTarget.style.background = '#0A0E14';
              }}
            >
              {logoUrl ? (
                <div className="space-y-3">
                  <img
                    src={logoUrl}
                    alt="Logo preview"
                    style={{
                      maxHeight: '80px',
                      maxWidth: '100%',
                      objectFit: 'contain',
                      margin: '0 auto',
                    }}
                  />
                  <p className="text-sm" style={{ color: '#6B7A8C' }}>
                    Click to change
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex justify-center">
                    <Upload size={32} style={{ color: '#6B7A8C' }} />
                  </div>
                  <p className="text-sm" style={{ color: '#F5F5F5' }}>
                    {uploading ? 'Uploading...' : 'Upload Logo'}
                  </p>
                  <p className="text-xs" style={{ color: '#6B7A8C' }}>
                    PNG, JPG, SVG • Max 2MB
                  </p>
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-3" style={{ color: '#F5F5F5' }}>
              Flow Color
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                style={{
                  width: '60px',
                  height: '40px',
                  border: '1px solid #1E2530',
                  borderRadius: '8px',
                  cursor: 'pointer',
                }}
              />
              <input
                type="text"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="flex-1 px-3 py-2 rounded-lg"
                style={{
                  background: '#0A0E14',
                  border: '1px solid #1E2530',
                  color: '#F5F5F5',
                  fontSize: '14px',
                }}
              />
            </div>
            <div
              className="mt-2 h-2 rounded-full"
              style={{ background: `linear-gradient(90deg, ${primaryColor}, #00BFA6)` }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-3" style={{ color: '#F5F5F5' }}>
              Accent Color
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={secondaryColor}
                onChange={(e) => setSecondaryColor(e.target.value)}
                style={{
                  width: '60px',
                  height: '40px',
                  border: '1px solid #1E2530',
                  borderRadius: '8px',
                  cursor: 'pointer',
                }}
              />
              <input
                type="text"
                value={secondaryColor}
                onChange={(e) => setSecondaryColor(e.target.value)}
                className="flex-1 px-3 py-2 rounded-lg"
                style={{
                  background: '#0A0E14',
                  border: '1px solid #1E2530',
                  color: '#F5F5F5',
                  fontSize: '14px',
                }}
              />
            </div>
            <div
              className="mt-2 h-2 rounded-full"
              style={{ background: `linear-gradient(90deg, ${secondaryColor}, #994444)` }}
            />
          </div>
        </div>

        <div
          className="p-6 border-t space-y-3"
          style={{ borderColor: '#1E2530' }}
        >
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all"
            style={{
              background: '#00D4E5',
              color: '#0A0E14',
              cursor: saving ? 'not-allowed' : 'pointer',
              opacity: saving ? 0.6 : 1,
            }}
            onMouseEnter={(e) => {
              if (!saving) {
                e.currentTarget.style.boxShadow = '0 0 20px rgba(0, 212, 229, 0.3)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <Check size={18} />
            {saving ? 'Saving...' : 'Apply Branding'}
          </button>

          <button
            onClick={handleReset}
            className="w-full py-2 text-sm transition-colors"
            style={{ color: '#6B7A8C' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#F5F5F5';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#6B7A8C';
            }}
          >
            Reset to defaults
          </button>
        </div>
      </div>
    </>
  );
};
