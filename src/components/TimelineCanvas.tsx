import { useEffect, useRef, useState } from 'react';
import { Timeline } from 'vis-timeline/standalone';
import 'vis-timeline/styles/vis-timeline-graph2d.css';
import { CanonicalEvent, determineLane } from '@/utils/parser';
import { Play, Pause } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

interface TimelineCanvasProps {
  events: CanonicalEvent[];
  onSelectEvent: (event: CanonicalEvent | null) => void;
  selectedEvent: CanonicalEvent | null;
}

export const TimelineCanvas = ({ events, onSelectEvent, selectedEvent }: TimelineCanvasProps) => {
  const timelineRef = useRef<HTMLDivElement>(null);
  const timelineInstance = useRef<Timeline | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (!timelineRef.current || events.length === 0) return;

    // Convert events to vis-timeline items
    const items = events.map(event => {
      const lane = determineLane(event);
      let className = '';
      switch (lane) {
        case 1: className = 'memory'; break;
        case 2: className = 'system'; break;
        case 3: className = 'user'; break;
        case 4: className = 'network'; break;
      }
      
      return {
        id: event.id,
        content: event.summary.slice(0, 50) + (event.summary.length > 50 ? '...' : ''),
        start: new Date(event.timestamp),
        group: lane,
        className,
        title: `${event.type}: ${event.summary}`
      };
    });

    const groups = [
      { id: 1, content: 'Memory' },
      { id: 2, content: 'System' },
      { id: 3, content: 'User' },
      { id: 4, content: 'Network' }
    ];

    const options = {
      width: '100%',
      height: '400px',
      stack: true,
      showCurrentTime: true,
      zoomMin: 1000,
      zoomMax: 1000 * 60 * 60 * 24 * 365 * 10,
      orientation: 'top' as const,
      selectable: true,
      multiselect: false,
      showTooltips: true,
      tooltip: {
        followMouse: true,
        overflowMethod: 'cap' as const
      }
    };

    // Create or update timeline
    if (!timelineInstance.current) {
      timelineInstance.current = new Timeline(timelineRef.current, items, groups, options);
      
      // Handle selection
      timelineInstance.current.on('select', (properties) => {
        const selectedId = properties.items[0];
        if (selectedId) {
          const event = events.find(e => e.id === selectedId);
          onSelectEvent(event || null);
        } else {
          onSelectEvent(null);
        }
      });
    } else {
      timelineInstance.current.setItems(items);
      timelineInstance.current.setGroups(groups);
    }

    // Fit all items in view
    setTimeout(() => {
      if (timelineInstance.current) {
        timelineInstance.current.fit({});
      }
    }, 100);

    return () => {
      // Cleanup handled by component unmount
    };
  }, [events, onSelectEvent]);

  // Highlight selected event
  useEffect(() => {
    if (timelineInstance.current && selectedEvent) {
      timelineInstance.current.setSelection([selectedEvent.id]);
    }
  }, [selectedEvent]);

  const togglePlayback = () => {
    setIsPlaying(!isPlaying);
    // TODO: Implement playback animation
  };

  // Keyboard shortcut: Space for play/pause
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === ' ' && e.target === document.body) {
        e.preventDefault();
        togglePlayback();
      }
      if (e.key === 'f' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        if (timelineInstance.current) {
          timelineInstance.current.focus(selectedEvent?.id || '');
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isPlaying]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-card border border-border rounded-2xl p-4 shadow-lg"
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-foreground">
          Timeline View
          {events.length > 0 && (
            <span className="ml-2 text-sm text-muted-foreground">
              ({events.length} events)
            </span>
          )}
        </h2>
        <Button
          variant="outline"
          size="sm"
          onClick={togglePlayback}
          aria-label={isPlaying ? 'Pause playback' : 'Play playback'}
        >
          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </Button>
      </div>
      <div
        ref={timelineRef}
        className="rounded-xl overflow-hidden"
        style={{ minHeight: '400px' }}
        role="region"
        aria-label="Event timeline visualization"
      />
      {events.length === 0 && (
        <div className="flex items-center justify-center h-[400px] text-muted-foreground">
          <p>Import events to view timeline</p>
        </div>
      )}
    </motion.div>
  );
};
