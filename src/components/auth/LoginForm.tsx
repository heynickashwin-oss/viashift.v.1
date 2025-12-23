import { useState, FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import logo from '../../assets/logo.svg';

export const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignup, setIsSignup] = useState(false);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignup) {
        await signUp(email, password);
      } else {
        await signIn(email, password);
      }
      const redirect = searchParams.get('redirect');
      navigate(redirect || '/dashboard');
    } catch (err) {
      setError(isSignup ? 'Failed to create account' : 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{
        background: '#0A0E14',
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
      }}
    >
      {/* Animated flow lines background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <svg className="absolute w-full h-full" style={{ opacity: 0.12 }}>
          <defs>
            <linearGradient id="flowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#00D4E5" stopOpacity="0" />
              <stop offset="50%" stopColor="#00D4E5" stopOpacity="1" />
              <stop offset="100%" stopColor="#00D4E5" stopOpacity="0" />
            </linearGradient>
          </defs>
          <g className="flow-line-1">
            <line x1="-100%" y1="20%" x2="100%" y2="20%" stroke="url(#flowGradient)" strokeWidth="2" />
          </g>
          <g className="flow-line-2">
            <line x1="-100%" y1="45%" x2="100%" y2="45%" stroke="url(#flowGradient)" strokeWidth="1.5" />
          </g>
          <g className="flow-line-3">
            <line x1="-100%" y1="70%" x2="100%" y2="70%" stroke="url(#flowGradient)" strokeWidth="2" />
          </g>
        </svg>
      </div>

      <style>
        {`
          @keyframes flowMove {
            from {
              transform: translateX(-100%);
            }
            to {
              transform: translateX(200%);
            }
          }
          .flow-line-1 {
            animation: flowMove 25s linear infinite;
          }
          .flow-line-2 {
            animation: flowMove 30s linear infinite;
            animation-delay: -10s;
          }
          .flow-line-3 {
            animation: flowMove 28s linear infinite;
            animation-delay: -15s;
          }
          @keyframes buttonPulse {
            0%, 100% {
              box-shadow: 0 0 0 0 rgba(0, 212, 229, 0.4);
            }
            50% {
              box-shadow: 0 0 20px 0 rgba(0, 212, 229, 0.2);
            }
          }
        `}
      </style>

      {/* Login card */}
      <div
        className="w-full max-w-[400px] relative z-10"
        style={{
          background: 'rgba(18, 22, 28, 0.8)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(0, 212, 229, 0.2)',
          borderRadius: '16px',
          padding: '48px 40px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
        }}
      >
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
           <img src={logo} alt="viashift" style={{ height: '48px', width: 'auto' }} />
          </div>
       <h1
  className="text-2xl font-bold mb-2"
  style={{ color: '#FFFFFF', letterSpacing: '2px' }}
>
  viashift
</h1>
<p style={{ color: '#00D4E5', fontStyle: 'italic', fontSize: '14px' }}>
  See what others cannot
</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div
              className="px-4 py-3 rounded-lg"
              style={{
                background: 'rgba(255, 107, 107, 0.1)',
                border: '1px solid #FF6B6B',
                color: '#FF6B6B',
                fontSize: '14px',
              }}
            >
              {error}
            </div>
          )}

          <div>
            <label
              htmlFor="email"
              style={{
                display: 'block',
                marginBottom: '8px',
                color: '#F0F4F8',
                fontSize: '14px',
                fontWeight: 500,
              }}
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '12px 16px',
                background: '#12161C',
                border: '1px solid #1E2530',
                borderRadius: '8px',
                color: '#F0F4F8',
                fontSize: '14px',
                outline: 'none',
                transition: 'border-color 0.2s',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#00D4E5';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '#1E2530';
              }}
            />
          </div>

          <div>
            <label
              htmlFor="password"
              style={{
                display: 'block',
                marginBottom: '8px',
                color: '#F0F4F8',
                fontSize: '14px',
                fontWeight: 500,
              }}
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '12px 16px',
                background: '#12161C',
                border: '1px solid #1E2530',
                borderRadius: '8px',
                color: '#F0F4F8',
                fontSize: '14px',
                outline: 'none',
                transition: 'border-color 0.2s',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#00D4E5';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '#1E2530';
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px',
              background: '#00D4E5',
              color: '#0A0E14',
              border: 'none',
              borderRadius: '8px',
              fontSize: '15px',
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1,
              transition: 'all 0.2s',
              animation: loading ? 'none' : 'buttonPulse 2s ease-in-out infinite',
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.boxShadow = '0 0 24px rgba(0, 212, 229, 0.4)';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
            onMouseDown={(e) => {
              if (!loading) {
                e.currentTarget.style.transform = 'scale(0.98)';
              }
            }}
            onMouseUp={(e) => {
              if (!loading) {
                e.currentTarget.style.transform = 'scale(1)';
              }
            }}
          >
            {loading ? (isSignup ? 'Creating account...' : 'Signing in...') : (isSignup ? 'Sign up' : 'Sign in')}
          </button>
        </form>

        <p className="text-center mt-6" style={{ color: '#6B7A8C', fontSize: '14px' }}>
          {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            onClick={() => setIsSignup(!isSignup)}
            style={{
              background: 'none',
              border: 'none',
              color: '#00D4E5',
              cursor: 'pointer',
              padding: 0,
              fontWeight: 500,
              textDecoration: 'underline',
            }}
          >
            {isSignup ? 'Sign in' : 'Sign up'}
          </button>
        </p>
      </div>
    </div>
  );
};
