import { useState, useEffect } from 'react';
import { CanonicalEvent } from '@/utils/parser';
import { ImportControls } from '@/components/ImportControls';
import { TimelineCanvas } from '@/components/TimelineCanvas';
import { Inspector } from '@/components/Inspector';
import { StoryBuilder } from '@/components/StoryBuilder';
import { Button } from '@/components/ui/button';
import { Save, FolderOpen, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

const Index = () => {
  const [events, setEvents] = useState<CanonicalEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<CanonicalEvent | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredEvents, setFilteredEvents] = useState<CanonicalEvent[]>([]);

  // Filter events based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredEvents(events);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = events.filter(event =>
      event.summary.toLowerCase().includes(query) ||
      event.type.toLowerCase().includes(query) ||
      event.source.toLowerCase().includes(query) ||
      event.path?.toLowerCase().includes(query)
    );
    setFilteredEvents(filtered);
  }, [searchQuery, events]);

  const handleImport = (newEvents: CanonicalEvent[]) => {
    setEvents([...events, ...newEvents]);
    toast.success(`Loaded ${newEvents.length} events`);
  };

  const saveCase = () => {
    const caseData = {
      events,
      metadata: {
        savedAt: new Date().toISOString(),
        version: '1.0',
        eventCount: events.length
      }
    };

    const blob = new Blob([JSON.stringify(caseData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `timeline-case-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Case saved successfully');
  };

  const loadCase = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          const caseData = JSON.parse(evt.target?.result as string);
          setEvents(caseData.events || []);
          toast.success(`Loaded case with ${caseData.events.length} events`);
        } catch (error) {
          console.error('Load case error:', error);
          toast.error('Failed to load case file');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  // Keyboard shortcut: / for search focus
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === '/' && e.target === document.body) {
        e.preventDefault();
        const searchInput = document.getElementById('search-input');
        searchInput?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  return (
    <div className="min-h-screen bg-background p-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-[1800px] mx-auto space-y-6"
      >
        {/* Header */}
        <header className="border-b border-border pb-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
            TimelineFusion
          </h1>
          <p className="text-muted-foreground">Interactive Event Reconstruction Toolkit</p>
        </header>

        {/* Controls Bar */}
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <ImportControls onImport={handleImport} />
          
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="search-input"
                placeholder="Search events (press / to focus)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-[300px]"
                aria-label="Search events"
              />
            </div>
            <Button variant="outline" onClick={saveCase} disabled={events.length === 0}>
              <Save className="mr-2 h-4 w-4" />
              Save Case
            </Button>
            <Button variant="outline" onClick={loadCase}>
              <FolderOpen className="mr-2 h-4 w-4" />
              Load Case
            </Button>
          </div>
        </div>

        {/* Main Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Timeline (spans 2 columns) */}
          <div className="lg:col-span-2">
            <TimelineCanvas
              events={filteredEvents}
              onSelectEvent={setSelectedEvent}
              selectedEvent={selectedEvent}
            />
          </div>

          {/* Right Panel (Inspector + Story) */}
          <div className="space-y-6">
            <Inspector event={selectedEvent} />
            <StoryBuilder selectedEvent={selectedEvent} />
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center text-sm text-muted-foreground pt-8">
          <p>
            Keyboard shortcuts: <kbd className="px-2 py-1 bg-muted rounded">Space</kbd> Play/Pause |{' '}
            <kbd className="px-2 py-1 bg-muted rounded">/</kbd> Search |{' '}
            <kbd className="px-2 py-1 bg-muted rounded">Ctrl+F</kbd> Focus Timeline
          </p>
        </footer>
      </motion.div>
    </div>
  );
};

export default Index;
