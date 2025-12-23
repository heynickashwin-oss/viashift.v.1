import { useNavigate } from 'react-router-dom';
import { Calendar, FileText } from 'lucide-react';
import { WorkflowSummary } from '../../services/workflowService';

interface WorkflowCardProps {
  workflow: WorkflowSummary;
}

export const WorkflowCard = ({ workflow }: WorkflowCardProps) => {
  const navigate = useNavigate();

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div
      onClick={() => navigate(`/editor/${workflow.id}`)}
      className="bg-surface border border-border rounded-lg p-4 cursor-pointer hover:border-[rgba(0,212,229,0.4)] transition-all duration-150 ease-smooth hover:shadow group"
    >
      <div className="aspect-video bg-background rounded-lg mb-4 flex items-center justify-center border border-border group-hover:border-primary/50 transition-all duration-150 ease-smooth">
        <FileText className="text-border group-hover:text-primary transition-all duration-150 ease-smooth" size={48} />
      </div>

      <h3 className="text-lg font-medium text-white mb-2 truncate">
        {workflow.title}
      </h3>

      <div className="flex items-center text-sm text-gray-400">
        <Calendar size={14} className="mr-2" />
        <span>Edited {formatRelativeTime(workflow.updated_at)}</span>
      </div>
    </div>
  );
};
