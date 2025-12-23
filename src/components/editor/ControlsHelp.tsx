import { useState, useEffect, useRef } from 'react';
import { HelpCircle } from 'lucide-react';

export const ControlsHelp = () => {
  const [isOpen, setIsOpen] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('keydown', handleEscape);
      };
    }
  }, [isOpen]);

  return (
    <div ref={popupRef} className="fixed right-6 bottom-20 z-50">
      {isOpen && (
        <div className="absolute bottom-12 right-0 bg-[#1E1E1E] border border-[#00D4E5] rounded-lg p-4 shadow-lg w-64 mb-2">
          <h3 className="text-sm font-medium text-[#00D4E5] mb-3">Controls</h3>
          <div className="space-y-2 text-xs text-gray-300">
            <div className="flex justify-between">
              <span className="text-gray-500">Click</span>
              <span>Select node</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Drag</span>
              <span>Move node</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Shift+Click</span>
              <span>Multi-select nodes</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">C</span>
              <span>Connect nodes</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">ESC</span>
              <span>Cancel connection</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Delete</span>
              <span>Remove selected</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Space</span>
              <span>Play/Pause</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Scroll</span>
              <span>Zoom</span>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-9 h-9 rounded-full bg-[#1E1E1E] border-2 border-[#00D4E5] flex items-center justify-center hover:bg-[#2A2A2A] transition-colors"
        title="Show controls"
      >
        <HelpCircle className="w-5 h-5 text-[#00D4E5]" />
      </button>
    </div>
  );
};
