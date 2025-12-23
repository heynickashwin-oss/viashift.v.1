import { Waves } from 'lucide-react';
import { Button } from '../ui/Button';

interface EmptyStateProps {
  onCreateWorkflow: () => void;
}

export const EmptyState = ({ onCreateWorkflow }: EmptyStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-6">
        <Waves size={48} className="text-primary" />
      </div>
      <h2 className="text-2xl font-bold text-white mb-3">No workflows yet</h2>
      <p className="text-gray-400 mb-8 text-center max-w-md">
        Create your first workflow and start transforming conversations into visual stories
      </p>
      <Button onClick={onCreateWorkflow}>
        Create your first workflow
      </Button>
    </div>
  );
};
