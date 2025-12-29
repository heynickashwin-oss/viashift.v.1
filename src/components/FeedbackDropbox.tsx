import React, { useState, useEffect, useCallback } from 'react';
import logoSrc from '../assets/logo.svg';

/**
 * SECURITY TODO: The current implementation uses URL params (?u=slug) to identify
 * collaborators, which can be spoofed. Before production:
 * 1. Implement signed invite tokens (JWT or HMAC-signed URLs)
 * 2. Or require Supabase authentication
 * 3. Add server-side validation of collaborator identity
 * 
 * Current risk: Anyone can submit feedback as any user by guessing ?u= parameter.
 */

function PenroseLogo({ size = 40 }: { size?: number }) {
  return <img src={logoSrc} width={size} height={size} alt="viashift" />;
}


const CONFIG = {
  EDGE_FUNCTION_URL: import.meta.env.VITE_FEEDBACK_FUNCTION_URL || '',
  MAX_CONTENT_LENGTH: 2000,
  MAX_NAME_LENGTH: 50,
  MIN_CONTENT_LENGTH: 10,
  COOLDOWN_SECONDS: 30,
};

const PROJECT_INFO = {
  name: "viashift",
  phases: [
    { id: "foundation", name: "Phase 1: Foundation" },
    { id: "core-product", name: "Phase 2: Core Product" },
    { id: "sharing", name: "Phase 3: Sharing & Tracking" },
    { id: "teams", name: "Phase 4: Teams" },
  ],
};

function sanitizeContent(input: string): string {
  return input.trim().replace(/[\x00-\x09\x0B\x0C\x0E-\x1F\x7F]/g, '').replace(/\n{3,}/g, '\n\n').slice(0, CONFIG.MAX_CONTENT_LENGTH);
}

function sanitizeName(input: string): string {
  return input.trim().replace(/[^a-zA-Z0-9\s\-]/g, '').slice(0, CONFIG.MAX_NAME_LENGTH);
}

function sanitizeSlug(input: string): string {
  return input.toLowerCase().trim().replace(/[^a-z0-9\-]/g, '').slice(0, 30);
}

function useCooldown() {
  const [cooldownEnd, setCooldownEnd] = useState<number | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(0);

  useEffect(() => {
    if (!cooldownEnd) { setSecondsLeft(0); return; }
    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((cooldownEnd - Date.now()) / 1000));
      setSecondsLeft(remaining);
      if (remaining === 0) setCooldownEnd(null);
    }, 100);
    return () => clearInterval(interval);
  }, [cooldownEnd]);

  const startCooldown = useCallback((seconds: number) => {
    setCooldownEnd(Date.now() + seconds * 1000);
  }, []);

  return { secondsLeft, startCooldown, isOnCooldown: secondsLeft > 0 };
}



export default function FeedbackDropbox() {
  const [collaboratorSlug, setCollaboratorSlug] = useState<string | null>(null);
  const [collaboratorName, setCollaboratorName] = useState('');
  const [isNewUser, setIsNewUser] = useState(true);
  const [content, setContent] = useState('');
  const [submissionType, setSubmissionType] = useState<'idea' | 'question' | 'issue'>('idea');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [response, setResponse] = useState<{
    category: string;
    categoryName: string;
    text: string;
    remainingHour: number;
    remainingDay: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<Array<{
    id: string;
    type: string;
    content: string;
    category: string;
    categoryName: string;
    response: string;
    timestamp: string;
  }>>([]);
  const [showHistory, setShowHistory] = useState(false);
  const { secondsLeft, startCooldown, isOnCooldown } = useCooldown();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlSlug = params.get('u') || params.get('collaborator');
    const storedSlug = localStorage.getItem('viashift_collaborator_slug');
    const storedName = localStorage.getItem('viashift_collaborator_name');

    if (urlSlug) {
      const cleanSlug = sanitizeSlug(urlSlug);
      setCollaboratorSlug(cleanSlug);
      localStorage.setItem('viashift_collaborator_slug', cleanSlug);
      if (storedSlug === cleanSlug && storedName) {
        setCollaboratorName(storedName);
        setIsNewUser(false);
      }
    } else if (storedSlug && storedName) {
      setCollaboratorSlug(storedSlug);
      setCollaboratorName(storedName);
      setIsNewUser(false);
    }

    try {
      const storedHistory = localStorage.getItem('viashift_history');
      if (storedHistory) setHistory(JSON.parse(storedHistory));
    } catch (e) { console.warn('Failed to load history'); }
  }, []);

  const handleRegisterName = (name: string) => {
    const cleanName = sanitizeName(name);
    if (!cleanName) return;
    const slug = cleanName.toLowerCase().replace(/\s+/g, '-');
    setCollaboratorName(cleanName);
    setCollaboratorSlug(slug);
    setIsNewUser(false);
    localStorage.setItem('viashift_collaborator_name', cleanName);
    localStorage.setItem('viashift_collaborator_slug', slug);
  };

  const handleSubmit = async () => {
    const cleanContent = sanitizeContent(content);
    if (cleanContent.length < CONFIG.MIN_CONTENT_LENGTH) {
      setError('Please provide more detail (at least 10 characters).');
      return;
    }
    if (isOnCooldown) {
      setError(`Please wait ${secondsLeft} seconds before submitting again.`);
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setResponse(null);

try {
      const res = await fetch(CONFIG.EDGE_FUNCTION_URL, {
        method: 'POST',
        headers: { 
     'Content-Type': 'application/json',
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY || '',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY || ''}`,
        },
        body: JSON.stringify({
          content: cleanContent,
          type: submissionType,
          collaborator_slug: collaboratorSlug,
          collaborator_name: collaboratorName || 'Anonymous',
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 429) {
          setError(data.error || 'Rate limit exceeded. Please wait before trying again.');
          startCooldown(data.remaining_hour === 0 ? 3600 : CONFIG.COOLDOWN_SECONDS);
          return;
        }
        throw new Error(data.error || 'Submission failed');
      }

      setResponse({
        category: data.category,
        categoryName: data.category_name,
        text: data.response,
        remainingHour: data.remaining_hour,
        remainingDay: data.remaining_day,
      });

      const newEntry = {
        id: data.submission_id,
        type: submissionType,
        content: cleanContent.slice(0, 200),
        category: data.category,
        categoryName: data.category_name,
        response: data.response,
        timestamp: new Date().toISOString(),
      };

      const updatedHistory = [newEntry, ...history].slice(0, 20);
      setHistory(updatedHistory);
      localStorage.setItem('viashift_history', JSON.stringify(updatedHistory));
      setContent('');
      startCooldown(CONFIG.COOLDOWN_SECONDS);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isNewUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 mb-4">
              <PenroseLogo size={40} />
              <span className="text-2xl font-light text-white tracking-wide">viashift</span>
            </div>
            <h1 className="text-xl text-gray-300 font-light">Feedback & Ideas</h1>
          </div>
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 backdrop-blur">
            <p className="text-gray-400 text-sm mb-4">Enter your name to get started. You'll only need to do this once.</p>
            <input
              type="text"
              placeholder="Your name"
              maxLength={CONFIG.MAX_NAME_LENGTH}
              className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 mb-4"
              onKeyDown={(e) => { if (e.key === 'Enter') handleRegisterName((e.target as HTMLInputElement).value); }}
              onBlur={(e) => { if (e.target.value.trim()) handleRegisterName(e.target.value); }}
            />
            <p className="text-gray-500 text-xs">Or use a personalized link: <code className="text-cyan-400/70">?u=yourname</code></p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      <header className="border-b border-gray-800/50 bg-gray-900/30 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <PenroseLogo size={32} />
            <div>
              <span className="text-white font-light tracking-wide">viashift</span>
              <span className="text-gray-500 text-sm ml-2">feedback</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setShowHistory(!showHistory)} className="text-gray-400 hover:text-white text-sm flex items-center gap-1 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              History
            </button>
            <div className="text-right">
              <div className="text-white text-sm">{collaboratorName}</div>
              <div className="text-gray-500 text-xs">Collaborator</div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-gray-900/40 border border-gray-800 rounded-xl p-6 mb-6">
          <div className="flex gap-2 mb-4">
            {(['idea', 'question', 'issue'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setSubmissionType(type)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  submissionType === type
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                    : 'bg-gray-800/50 text-gray-400 border border-gray-700 hover:border-gray-600'
                }`}
              >
                {type === 'idea' && '💡'} {type === 'question' && '❓'} {type === 'issue' && '🐛'}
                <span className="ml-1 capitalize">{type}</span>
              </button>
            ))}
          </div>

          <div className="relative">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={
                submissionType === 'idea' ? "Share your idea for viashift..." :
                submissionType === 'question' ? "What would you like to know about the project?" :
                "Describe the issue or problem..."
              }
              maxLength={CONFIG.MAX_CONTENT_LENGTH}
              className="w-full bg-gray-800/30 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 min-h-[120px] resize-none"
            />
            <div className="absolute bottom-2 right-2 text-xs text-gray-600">{content.length}/{CONFIG.MAX_CONTENT_LENGTH}</div>
          </div>

          {error && (
            <div className="mt-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">{error}</div>
          )}

          <div className="flex items-center justify-between mt-4">
            <div className="text-gray-500 text-xs">
              {response && <span>{response.remainingHour} left this hour • {response.remainingDay} left today</span>}
            </div>
            <button
              onClick={handleSubmit}
              disabled={!content.trim() || isSubmitting || isOnCooldown}
              className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-cyan-400 text-gray-900 font-medium rounded-lg hover:from-cyan-400 hover:to-cyan-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Processing...
                </>
              ) : isOnCooldown ? `Wait ${secondsLeft}s` : 'Submit'}
            </button>
          </div>
        </div>

        {response && (
          <div className="bg-gradient-to-br from-cyan-500/10 to-cyan-500/5 border border-cyan-500/20 rounded-xl p-6 mb-6">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-full bg-cyan-500/20 flex items-center justify-center">
                <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="text-cyan-400 text-sm font-medium">Categorized: {response.categoryName}</span>
            </div>
            <p className="text-gray-300 leading-relaxed">{response.text}</p>
          </div>
        )}

        {showHistory && (
          <div className="bg-gray-900/40 border border-gray-800 rounded-xl p-6">
            <h3 className="text-white font-medium mb-4">Your Submissions</h3>
            {history.length === 0 ? (
              <p className="text-gray-500 text-sm">No submissions yet</p>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {history.map((entry) => (
                  <div key={entry.id} className="border-l-2 border-gray-700 pl-4 py-2">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium px-2 py-0.5 rounded bg-gray-800 text-gray-400">{entry.categoryName}</span>
                      <span className="text-gray-600 text-xs">{new Date(entry.timestamp).toLocaleDateString()}</span>
                    </div>
                    <p className="text-gray-300 text-sm">{entry.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <details className="mt-6 bg-gray-900/20 border border-gray-800/50 rounded-lg">
          <summary className="px-4 py-3 text-gray-500 text-sm cursor-pointer hover:text-gray-400">About viashift →</summary>
          <div className="px-4 pb-4 text-sm">
            <p className="text-gray-400 mb-3">B2B sales enablement platform that creates animated visual "Shifts" to help sales reps demonstrate the cost of inaction to prospects.</p>
            <div className="grid grid-cols-2 gap-2">
              {PROJECT_INFO.phases.map((phase) => (
                <div key={phase.id} className="bg-gray-800/30 rounded px-3 py-2">
                  <div className="text-cyan-400/80 text-xs font-medium">{phase.name}</div>
                </div>
              ))}
            </div>
          </div>
        </details>
      </main>
    </div>
  );
}