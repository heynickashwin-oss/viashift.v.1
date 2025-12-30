/**
 * NodeInteractionDialog.tsx
 * 
 * Unified dialog for node/link interactions:
 * - Seller/Champion: Can edit values
 * - Stakeholders: Can react (👍/👎), comment, suggest
 * - Everyone: Sees activity history
 */

import { useState, useEffect } from 'react';
import { ThumbsUp, ThumbsDown, MessageSquare, Edit3, X, Send, Clock } from 'lucide-react';
import { supabase } from '../lib/supabase';

// ============================================
// TYPES
// ============================================

export interface NodeInteraction {
  id: string;
  element_id: string;
  element_type: 'node' | 'link';
  viewer_type: string;
  viewer_email?: string;
  interaction_type: 'view' | 'click' | 'edit' | 'thumbs_up' | 'thumbs_down' | 'comment' | 'suggestion';
  previous_value?: string;
  new_value?: string;
  comment?: string;
  created_at: string;
}

export interface InteractionSummary {
  views: number;
  clicks: number;
  thumbsUp: number;
  thumbsDown: number;
  comments: number;
  edits: number;
  suggestions: number;
}

export interface NodeInteractionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  
  // What element
  shiftId: string;
  elementId: string;
  elementType: 'node' | 'link';
  elementLabel: string;
  currentValue: string;
  
  // Who is viewing
  viewerType: 'seller' | 'champion' | 'finance' | 'ops' | 'sales' | 'anonymous';
  viewerEmail?: string;
  sessionId?: string;
  
  // Callbacks
  onValueChange?: (newValue: string) => void;
}

// ============================================
// HELPER: Get viewer label
// ============================================
function getViewerLabel(type: string): string {
  const labels: Record<string, string> = {
    seller: 'Seller',
    champion: 'Champion',
    finance: 'Finance',
    ops: 'Operations',
    sales: 'Sales',
    anonymous: 'Viewer',
  };
  return labels[type] || type;
}

// ============================================
// HELPER: Get viewer color
// ============================================
function getViewerColor(type: string): string {
  const colors: Record<string, string> = {
    seller: '#00D4E5',
    champion: '#00D4E5',
    finance: '#4ADE80',
    ops: '#F59E0B',
    sales: '#8B5CF6',
    anonymous: '#6B7A8C',
  };
  return colors[type] || '#6B7A8C';
}

// ============================================
// HELPER: Format time ago
// ============================================
function timeAgo(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

// ============================================
// COMPONENT
// ============================================

export function NodeInteractionDialog({
  isOpen,
  onClose,
  shiftId,
  elementId,
  elementType,
  elementLabel,
  currentValue,
  viewerType,
  viewerEmail,
  sessionId,
  onValueChange,
}: NodeInteractionDialogProps) {
  // State
  const [interactions, setInteractions] = useState<NodeInteraction[]>([]);
  const [loading, setLoading] = useState(true);
  const [editValue, setEditValue] = useState(currentValue);
  const [comment, setComment] = useState('');
  const [suggestion, setSuggestion] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'react' | 'history'>('react');
  const [userReaction, setUserReaction] = useState<'thumbs_up' | 'thumbs_down' | null>(null);
  
  const canEdit = viewerType === 'seller' || viewerType === 'champion';

  // Update editValue when a different node is selected
  useEffect(() => {
    setEditValue(currentValue);
  }, [currentValue]);
  
  // ============================================
  // Load interactions on open
  // ============================================
  useEffect(() => {
    if (isOpen) {
      loadInteractions();
      recordClick();
    }
  }, [isOpen, shiftId, elementId]);
  
  // ============================================
  // Load interaction history
  // TODO: Deploy node_interactions table to Supabase
  // For now, return empty list to prevent 404 spam
  // ============================================
  async function loadInteractions() {
    setLoading(true);
    try {
      // Stubbed - table doesn't exist yet
      setInteractions([]);
    } catch (err) {
      console.error('Error loading interactions:', err);
    } finally {
      setLoading(false);
    }
  }
  
  // ============================================
  // Record a click (opening the dialog)
  // TODO: Deploy node_interactions table
  // ============================================
  async function recordClick() {
    // Stubbed - table doesn't exist yet
  }
  
  // ============================================
  // Submit an interaction
  // TODO: Deploy node_interactions table
  // ============================================
  async function submitInteraction(
    type: 'edit' | 'thumbs_up' | 'thumbs_down' | 'comment' | 'suggestion',
    data: { previous_value?: string; new_value?: string; comment?: string }
  ) {
    setSubmitting(true);
    try {
      // Stubbed - table doesn't exist yet
      // Update local state optimistically
      if (type === 'thumbs_up' || type === 'thumbs_down') {
        setUserReaction(type);
      }
      
      // Clear inputs
      if (type === 'comment') setComment('');
      if (type === 'suggestion') setSuggestion('');
      
      // Notify parent of edit
      if (type === 'edit' && data.new_value && onValueChange) {
        onValueChange(data.new_value);
      }
      
    } catch (err) {
      console.error('Error submitting interaction:', err);
    } finally {
      setSubmitting(false);
    }
  }
  
  // ============================================
  // Handlers
  // ============================================
  function handleThumbsUp() {
    if (userReaction === 'thumbs_up') return;
    submitInteraction('thumbs_up', {});
  }
  
  function handleThumbsDown() {
    if (userReaction === 'thumbs_down') return;
    submitInteraction('thumbs_down', {});
  }
  
  function handleComment() {
    if (!comment.trim()) return;
    submitInteraction('comment', { comment: comment.trim() });
  }
  
  function handleSuggestion() {
    if (!suggestion.trim()) return;
    submitInteraction('suggestion', { new_value: suggestion.trim() });
  }
  
  function handleEdit() {
    if (editValue === currentValue) return;
    submitInteraction('edit', { previous_value: currentValue, new_value: editValue });
  }
  
  // ============================================
  // Calculate summary
  // ============================================
  const summary: InteractionSummary = {
    views: interactions.filter(i => i.interaction_type === 'view').length,
    clicks: interactions.filter(i => i.interaction_type === 'click').length,
    thumbsUp: interactions.filter(i => i.interaction_type === 'thumbs_up').length,
    thumbsDown: interactions.filter(i => i.interaction_type === 'thumbs_down').length,
    comments: interactions.filter(i => i.interaction_type === 'comment').length,
    edits: interactions.filter(i => i.interaction_type === 'edit').length,
    suggestions: interactions.filter(i => i.interaction_type === 'suggestion').length,
  };
  
  // ============================================
  // RENDER
  // ============================================
  if (!isOpen) return null;
  
  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0, 0, 0, 0.8)' }}
      onClick={onClose}
    >
      <div 
        className="w-full max-w-md rounded-xl overflow-hidden"
        style={{ 
          background: '#12161C',
          border: '1px solid #1E2530',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div 
          className="px-5 py-4 flex items-center justify-between"
          style={{ borderBottom: '1px solid #1E2530' }}
        >
          <div>
            <h3 className="text-lg font-semibold" style={{ color: '#F5F5F5' }}>
              {elementLabel}
            </h3>
           <p className="text-sm" style={{ color: '#6B7A8C' }}>
              {elementType === 'node' ? 'Node' : 'Flow'}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-lg transition-colors"
            style={{ color: '#6B7A8C' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <X size={20} />
          </button>
        </div>
        
        {/* Tabs */}
        <div 
          className="flex"
          style={{ borderBottom: '1px solid #1E2530' }}
        >
          <button
            onClick={() => setActiveTab('react')}
            className="flex-1 px-4 py-3 text-sm font-medium transition-colors"
            style={{ 
              color: activeTab === 'react' ? '#00D4E5' : '#6B7A8C',
              borderBottom: activeTab === 'react' ? '2px solid #00D4E5' : '2px solid transparent',
            }}
          >
            React
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className="flex-1 px-4 py-3 text-sm font-medium transition-colors"
            style={{ 
              color: activeTab === 'history' ? '#00D4E5' : '#6B7A8C',
              borderBottom: activeTab === 'history' ? '2px solid #00D4E5' : '2px solid transparent',
            }}
          >
            Activity ({interactions.length})
          </button>
        </div>
        
        {/* Content */}
        <div className="p-5">
          {activeTab === 'react' ? (
            <div className="space-y-5">
              {/* Edit (seller/champion only) */}
             {/* Edit (seller/champion only) */}
{canEdit && (
  <div>
    <div className="flex items-center justify-between mb-2">
      <label className="text-xs font-medium" style={{ color: '#6B7A8C' }}>
        <Edit3 size={12} className="inline mr-1" />
        Edit Value
      </label>
      <span className="text-xs" style={{ color: '#6B7A8C' }}>
        Current: <span style={{ color: '#00D4E5' }}>{currentValue}</span>
      </span>
    </div>
    <div className="flex gap-2">
      <input
        type="text"
        value={editValue}
        onChange={e => setEditValue(e.target.value)}
        placeholder={currentValue}
        className="flex-1 px-3 py-2 rounded-lg text-sm"
        style={{ 
          background: '#1E2530',
          border: '1px solid #2A3441',
          color: '#F5F5F5',
          outline: 'none',
        }}
      />
      <button
        onClick={handleEdit}
        disabled={editValue === currentValue || submitting}
        className="px-4 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-50"
        style={{ background: '#00D4E5', color: '#0A0E14' }}
      >
        Save
      </button>
    </div>
  </div>
)}
              
              {/* Quick reactions */}
              <div>
                <label className="block text-xs font-medium mb-2" style={{ color: '#6B7A8C' }}>
                  Does this look right?
                </label>
                <div className="flex gap-3">
                  <button
                    onClick={handleThumbsUp}
                    disabled={submitting}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-all"
                    style={{ 
                      background: userReaction === 'thumbs_up' ? 'rgba(74, 222, 128, 0.2)' : '#1E2530',
                      border: userReaction === 'thumbs_up' ? '1px solid #4ADE80' : '1px solid #2A3441',
                      color: userReaction === 'thumbs_up' ? '#4ADE80' : '#F5F5F5',
                    }}
                  >
                    <ThumbsUp size={18} />
                    Yes ({summary.thumbsUp})
                  </button>
                  <button
                    onClick={handleThumbsDown}
                    disabled={submitting}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-all"
                    style={{ 
                      background: userReaction === 'thumbs_down' ? 'rgba(239, 68, 68, 0.2)' : '#1E2530',
                      border: userReaction === 'thumbs_down' ? '1px solid #EF4444' : '1px solid #2A3441',
                      color: userReaction === 'thumbs_down' ? '#EF4444' : '#F5F5F5',
                    }}
                  >
                    <ThumbsDown size={18} />
                    No ({summary.thumbsDown})
                  </button>
                </div>
              </div>
              
              {/* Suggest different value (non-editors) */}
              {!canEdit && (
                <div>
                  <label className="block text-xs font-medium mb-2" style={{ color: '#6B7A8C' }}>
                    Suggest a different value
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={suggestion}
                      onChange={e => setSuggestion(e.target.value)}
                      placeholder="e.g., $4M"
                      className="flex-1 px-3 py-2 rounded-lg text-sm"
                      style={{ 
                        background: '#1E2530',
                        border: '1px solid #2A3441',
                        color: '#F5F5F5',
                        outline: 'none',
                      }}
                    />
                    <button
                      onClick={handleSuggestion}
                      disabled={!suggestion.trim() || submitting}
                      className="px-3 py-2 rounded-lg transition-all disabled:opacity-50"
                      style={{ background: '#2A3441', color: '#F5F5F5' }}
                    >
                      <Send size={16} />
                    </button>
                  </div>
                </div>
              )}
              
              {/* Comment */}
              <div>
                <label className="block text-xs font-medium mb-2" style={{ color: '#6B7A8C' }}>
                  <MessageSquare size={12} className="inline mr-1" />
                  Add a comment
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                    placeholder="Share your thoughts..."
                    className="flex-1 px-3 py-2 rounded-lg text-sm"
                    style={{ 
                      background: '#1E2530',
                      border: '1px solid #2A3441',
                      color: '#F5F5F5',
                      outline: 'none',
                    }}
                    onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleComment();
                    }
                  }}
                  />
                  <button
                    onClick={handleComment}
                    disabled={!comment.trim() || submitting}
                    className="px-3 py-2 rounded-lg transition-all disabled:opacity-50"
                    style={{ 
                      background: comment.trim() ? '#00D4E5' : '#2A3441', 
                      color: comment.trim() ? '#0A0E14' : '#F5F5F5' 
                    }}
                  >
                    <Send size={16} />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* History tab */
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {loading ? (
                <p className="text-center py-4" style={{ color: '#6B7A8C' }}>Loading...</p>
              ) : interactions.length === 0 ? (
                <p className="text-center py-4" style={{ color: '#6B7A8C' }}>No activity yet</p>
              ) : (
                interactions
                  .filter(i => i.interaction_type !== 'view' && i.interaction_type !== 'click')
                  .map(interaction => (
                    <div 
                      key={interaction.id}
                      className="flex gap-3 p-3 rounded-lg"
                      style={{ background: '#1E2530' }}
                    >
                      {/* Icon */}
                      <div 
                        className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ background: getViewerColor(interaction.viewer_type) + '20' }}
                      >
                        {interaction.interaction_type === 'thumbs_up' && <ThumbsUp size={14} style={{ color: '#4ADE80' }} />}
                        {interaction.interaction_type === 'thumbs_down' && <ThumbsDown size={14} style={{ color: '#EF4444' }} />}
                        {interaction.interaction_type === 'comment' && <MessageSquare size={14} style={{ color: '#6B7A8C' }} />}
                        {interaction.interaction_type === 'edit' && <Edit3 size={14} style={{ color: '#00D4E5' }} />}
                        {interaction.interaction_type === 'suggestion' && <Edit3 size={14} style={{ color: '#F59E0B' }} />}
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span 
                            className="text-xs font-medium px-2 py-0.5 rounded"
                            style={{ 
                              background: getViewerColor(interaction.viewer_type) + '20',
                              color: getViewerColor(interaction.viewer_type),
                            }}
                          >
                            {getViewerLabel(interaction.viewer_type)}
                          </span>
                          <span className="text-xs" style={{ color: '#6B7A8C' }}>
                            <Clock size={10} className="inline mr-1" />
                            {timeAgo(interaction.created_at)}
                          </span>
                        </div>
                        
                        {/* Interaction-specific content */}
                        <div className="mt-1 text-sm" style={{ color: '#F5F5F5' }}>
                          {interaction.interaction_type === 'thumbs_up' && 'Agreed this looks right'}
                          {interaction.interaction_type === 'thumbs_down' && 'Disagreed with this value'}
                          {interaction.interaction_type === 'comment' && `"${interaction.comment}"`}
                          {interaction.interaction_type === 'edit' && (
                            <>Changed from <span style={{ color: '#6B7A8C' }}>{interaction.previous_value}</span> to <span style={{ color: '#00D4E5' }}>{interaction.new_value}</span></>
                          )}
                          {interaction.interaction_type === 'suggestion' && (
                            <>Suggested: <span style={{ color: '#F59E0B' }}>{interaction.new_value}</span></>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
              )}
            </div>
          )}
        </div>
        
        {/* Footer - summary */}
        <div 
          className="px-5 py-3 flex items-center justify-between text-xs"
          style={{ background: '#0A0E14', borderTop: '1px solid #1E2530', color: '#6B7A8C' }}
        >
          <span>{summary.clicks} clicks</span>
          <span>{summary.comments} comments</span>
          <span>{summary.edits + summary.suggestions} edits</span>
        </div>
      </div>
    </div>
  );
}

export default NodeInteractionDialog;