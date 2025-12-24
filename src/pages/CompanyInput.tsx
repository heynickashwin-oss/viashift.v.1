import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import logo from '../assets/logo.svg';
import { UserMenu } from '../components/ui/UserMenu';
import { templates, TemplateId } from '../data/templates';

export const CompanyInput = () => {
  const [company, setCompany] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!company.trim()) return;

    if (!user) {
      navigate('/login?redirect=/create');
      return;
    }

    setIsLoading(true);

    try {
      const templateId = (searchParams.get('template') || 'b2b-sales-enablement') as TemplateId;
      const template = templates[templateId] || templates['b2b-sales-enablement'];
      const defaultSightline = template.viewerConfig.default.sightline;

      const { data, error } = await supabase
        .from('shifts')
        .insert({
          company_input: company.trim(),
          user_id: user.id,
          template_id: templateId,
          sightline_line1: defaultSightline.line1,
          sightline_metric: defaultSightline.metric,
          sightline_line2: defaultSightline.line2,
        })
        .select()
        .single();

      if (error) throw error;

      if (data) {
        navigate(`/shift/${data.id}?configure=true`);
      }
    } catch (error) {
      console.error('Error creating shift:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        background: 'linear-gradient(to bottom, #0A0E14 0%, #080B0F 100%)'
      }}
    >
      {/* Header */}
      <header className="w-full px-8 py-6 flex items-center justify-between border-b" style={{ borderColor: '#1E2530' }}>
        <div className="flex items-center gap-3">
          <img src={logo} alt="viashift" style={{ height: '32px', width: 'auto' }} />
          <span className="text-xl font-bold tracking-tight" style={{ color: '#F5F5F5', fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
            viashift
          </span>
        </div>
        <UserMenu />
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <div className="w-full max-w-[600px] flex flex-col items-center">
          <div className="flex items-center gap-3 mb-3">
            <img
              src={logo}
              alt="viashift"
              style={{ height: '48px', width: '48px' }}
            />
            <h1
              className="text-3xl font-bold tracking-wide"
              style={{
                fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
                color: '#FFFFFF',
              }}
            >
              viashift
            </h1>
          </div>

          <p
            className="text-sm mb-16"
            style={{
              color: '#6B7A8C',
              fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
            }}
          >
            Shift the perspective
          </p>

          <form onSubmit={handleSubmit} className="w-full">
            <label
              className="block text-sm font-medium mb-3"
              style={{
                color: '#FFFFFF',
                fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
              }}
            >
              Enter a company
            </label>

            <div className="relative mb-4">
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                placeholder="Company name or website URL..."
                className="w-full px-6 py-5 text-lg rounded-lg outline-none transition-all"
                style={{
                  background: '#12161C',
                  color: '#FFFFFF',
                  border: (isFocused || isHovered) ? '1px solid #00D4E5' : '1px solid transparent',
                  boxShadow: isFocused ? '0 0 20px rgba(0, 212, 229, 0.15)' : 'none',
                  fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
                }}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || !company.trim()}
              className="w-full px-6 py-5 text-base font-semibold rounded-lg transition-all flex items-center justify-center gap-2"
              style={{
                background: (isLoading || !company.trim()) ? '#6B7A8C' : '#00D4E5',
                color: '#0A0E14',
                fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
                cursor: (isLoading || !company.trim()) ? 'not-allowed' : 'pointer',
                opacity: (isLoading || !company.trim()) ? 0.6 : 1,
              }}
              onMouseEnter={(e) => {
                if (!isLoading && company.trim()) {
                  e.currentTarget.style.filter = 'brightness(1.1)';
                  e.currentTarget.style.boxShadow = '0 0 24px rgba(0, 212, 229, 0.4)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.filter = 'brightness(1)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {isLoading ? 'Creating...' : 'Generate Shift'}
              {!isLoading && (
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              )}
            </button>
          </form>
        </div>

        <div
          className="absolute bottom-8 text-xs"
          style={{
            color: '#6B7A8C',
            fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
          }}
        >
          Powered by viashift
        </div>
      </div>
    </div>
  );
};

export default CompanyInput;