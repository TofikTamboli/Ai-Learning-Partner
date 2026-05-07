import { cn } from '@/utils/cn';
import { POPULAR_TOPICS } from '@/constants';

interface PopularTopicsProps {
  onSelect: (topic: string) => void;
  disabled?: boolean;
}

export function PopularTopics({ onSelect, disabled }: PopularTopicsProps) {
  return (
    <div className="space-y-3">
      <p className="text-sm font-bold text-brand-gray uppercase tracking-wide">Popular Topics</p>
      <div className="flex flex-wrap gap-2">
        {POPULAR_TOPICS.map((topic) => (
          <button
            key={topic.query}
            onClick={() => onSelect(topic.query)}
            disabled={disabled}
            className={cn(
              'px-3 py-1.5 text-sm font-medium brutal-border bg-white',
              'hover:bg-brand-orange hover:text-white transition-colors',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
          >
            {topic.label}
          </button>
        ))}
      </div>
    </div>
  );
}
