import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, LogOut, LayoutDashboard } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export const UserMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const handleDashboard = () => {
    setIsOpen(false);
    navigate('/dashboard');
  };

  return (
    <div ref={menuRef} style={{ position: 'relative' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="rounded-full p-2 transition-all"
        style={{
          background: isOpen ? '#1E2530' : 'transparent',
          border: '1px solid #2A3040',
          color: '#F0F4F8',
        }}
        onMouseEnter={(e) => {
          if (!isOpen) {
            e.currentTarget.style.background = '#1E2530';
          }
        }}
        onMouseLeave={(e) => {
          if (!isOpen) {
            e.currentTarget.style.background = 'transparent';
          }
        }}
      >
        <User size={20} />
      </button>

      {isOpen && (
        <div
          className="absolute right-0 mt-2 rounded-lg overflow-hidden"
          style={{
            width: '200px',
            background: '#12161C',
            border: '1px solid #2A3040',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
            zIndex: 1000,
          }}
        >
          <button
            onClick={handleDashboard}
            className="w-full px-4 py-3 flex items-center gap-3 transition-all"
            style={{
              background: 'transparent',
              color: '#F0F4F8',
              fontSize: '14px',
              border: 'none',
              cursor: 'pointer',
              textAlign: 'left',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#1E2530';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
          >
            <LayoutDashboard size={16} />
            Dashboard
          </button>
          <div
            style={{
              height: '1px',
              background: '#2A3040',
            }}
          />
          <button
            onClick={handleLogout}
            className="w-full px-4 py-3 flex items-center gap-3 transition-all"
            style={{
              background: 'transparent',
              color: '#FF6B6B',
              fontSize: '14px',
              border: 'none',
              cursor: 'pointer',
              textAlign: 'left',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#1E2530';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      )}
    </div>
  );
};
