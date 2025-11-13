import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { CanonicalEvent } from '@/utils/parser';
import { hashEvent, hashEventArray } from '@/utils/crypto';
import { Plus, Trash2, GripVertical, FileDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import html2pdf from 'html2pdf.js';

interface StoryItem {
  event: CanonicalEvent;
  note: string;
  hash: string;
}

interface StoryBuilderProps {
  selectedEvent: CanonicalEvent | null;
}

export const StoryBuilder = ({ selectedEvent }: StoryBuilderProps) => {
  const [storyItems, setStoryItems] = useState<StoryItem[]>([]);
  const [author, setAuthor] = useState('');
  const [storyHash, setStoryHash] = useState('');

  // Calculate combined story hash
  useEffect(() => {
    if (storyItems.length > 0) {
      const events = storyItems.map(item => item.event);
      hashEventArray(events).then(hash => setStoryHash(hash));
    } else {
      setStoryHash('');
    }
  }, [storyItems]);

  const addToStory = async () => {
    if (!selectedEvent) {
      toast.error('Please select an event first');
      return;
    }

    // Check if already in story
    if (storyItems.some(item => item.event.id === selectedEvent.id)) {
      toast.error('Event already in story');
      return;
    }

    const hash = await hashEvent(selectedEvent);
    setStoryItems([...storyItems, { event: selectedEvent, note: '', hash }]);
    toast.success('Event added to story');
  };

  const removeFromStory = (index: number) => {
    setStoryItems(storyItems.filter((_, i) => i !== index));
    toast.success('Event removed from story');
  };

  const updateNote = (index: number, note: string) => {
    const updated = [...storyItems];
    updated[index].note = note;
    setStoryItems(updated);
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(storyItems);
    const [reordered] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reordered);

    setStoryItems(items);
    toast.success('Story reordered');
  };

  // ---------- FIXED exportToPDF: print-friendly, white background, readable ----------
  const exportToPDF = async () => {
    if (storyItems.length === 0) {
      toast.error('No events in story to export');
      return;
    }

    // Build a clean, self-contained report DOM (white background, dark text)
    const report = document.createElement('div');
    report.style.width = '800px';
    report.style.margin = '0 auto';
    report.style.padding = '24px';
    report.style.background = '#ffffff';
    report.style.color = '#0f172a';
    report.style.fontFamily = "Inter, Arial, sans-serif";
    report.style.lineHeight = '1.5';
    report.style.fontSize = '12pt';

    // Header
    report.innerHTML = `
      <h1 style="color:#06b6d4; font-size:20pt; margin-bottom:8px;
                 border-bottom: 3px solid #06b6d4; padding-bottom:6px;">
        TimelineFusion Event Reconstruction Report
      </h1>

      <p><strong>Author:</strong> ${author || 'Unknown'}</p>
      <p><strong>Generated:</strong> ${new Date().toISOString()}</p>
      <p><strong>Total Events:</strong> ${storyItems.length}</p>

      <p style="margin-top:16px;"><strong>Combined Story Hash (SHA-256):</strong></p>
      <div style="
        background:#f1f5f9;
        padding:10px;
        border:1px solid #e2e8f0;
        border-radius:6px;
        font-family:monospace;
        word-break:break-all;">
        ${storyHash}
      </div>

      <hr style="margin:24px 0; border:0; border-top:1px solid #cbd5e1;" />
    `;

    // Add event blocks
    storyItems.forEach((item, index) => {
      const block = document.createElement('div');
      block.style.marginBottom = '28px';
      block.style.pageBreakInside = 'avoid';

      // Use JSON.stringify for raw and ensure it's readable
      const rawJson = JSON.stringify(item.event, null, 2);

      block.innerHTML = `
        <h2 style="color:#d946ef; font-size:15pt; margin-bottom:4px;">
          Event ${index + 1}: ${item.event.type}
        </h2>

        <p><strong>Summary:</strong> ${item.event.summary || ''}</p>
        <p><strong>Timestamp:</strong> ${item.event.timestamp || ''}</p>
        <p><strong>Source:</strong> ${item.event.source || ''}</p>
        ${item.event.path ? `<p><strong>Path:</strong> ${item.event.path}</p>` : ''}
        ${item.note ? `<p><strong>Investigator Note:</strong> ${item.note}</p>` : ''}

        <p style="margin-top:8px;"><strong>Event Hash (SHA-256):</strong></p>
        <div style="
          background:#f8fafc;
          padding:10px;
          border:1px solid #e2e8f0;
          border-radius:6px;
          font-family:monospace;
          font-size:10pt;
          word-break:break-all;">
          ${item.hash}
        </div>

        <p style="margin-top:12px;"><strong>Raw JSON</strong></p>
        <pre style="
          background:#f3f4f6;
          padding:12px;
          border-radius:6px;
          border:1px solid #e2e8f0;
          font-size:10pt;
          font-family:monospace;
          white-space:pre-wrap;
          word-break:break-word;">${rawJson}</pre>
      `;

      report.appendChild(block);
    });

    // html2pdf options: ensure white background is used and high-quality rendering
    const opt = {
      margin: 10,
      filename: `timelinefusion-report-${Date.now()}.pdf`,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: {
        scale: 2,
        backgroundColor: '#ffffff'
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const }
    };

    try {
      await html2pdf().set(opt).from(report).save();
      toast.success('PDF exported successfully');
    } catch (error) {
      console.error('PDF export error:', error);
      toast.error('Failed to export PDF');
    }
  };
  // -------------------------------------------------------------------------------

  return (
    <Card className="h-full border-border bg-card shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="text-lg">Story Builder</span>
          <div className="flex gap-2">
            <Button
              variant="default"
              size="sm"
              onClick={addToStory}
              disabled={!selectedEvent}
              aria-label="Add selected event to story"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={exportToPDF}
              disabled={storyItems.length === 0}
              aria-label="Export story as PDF"
            >
              <FileDown className="h-4 w-4 mr-1" />
              Export
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <label htmlFor="author" className="text-sm font-semibold text-muted-foreground mb-1 block">
              Author/Investigator
            </label>
            <Input
              id="author"
              placeholder="Enter your name"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              className="bg-background"
            />
          </div>

          {storyHash && (
            <div className="bg-muted p-3 rounded-xl">
              <p className="text-xs font-semibold mb-1">Story Hash (SHA-256):</p>
              <p className="text-xs font-mono break-all text-muted-foreground">{storyHash}</p>
            </div>
          )}

          <ScrollArea className="h-[400px]">
            {storyItems.length === 0 ? (
              <div className="flex items-center justify-center h-[200px] text-muted-foreground">
                <p>Add events to build your story</p>
              </div>
            ) : (
              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="story-items">
                  {(provided) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className="space-y-3"
                    >
                      <AnimatePresence>
                        {storyItems.map((item, index) => (
                          <Draggable key={item.event.id} draggableId={item.event.id} index={index}>
                            {(provided, snapshot) => (
                              <motion.div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className={`bg-background border border-border rounded-xl p-3 ${
                                  snapshot.isDragging ? 'shadow-lg' : ''
                                }`}
                              >
                                <div className="flex items-start gap-3">
                                  <div {...provided.dragHandleProps} className="mt-1 cursor-grab">
                                    <GripVertical className="h-5 w-5 text-muted-foreground" />
                                  </div>
                                  <div className="flex-1 space-y-2">
                                    <div className="flex justify-between items-start">
                                      <div>
                                        <p className="font-semibold text-sm">
                                          {index + 1}. {item.event.type}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                          {new Date(item.event.timestamp).toLocaleString()}
                                        </p>
                                      </div>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => removeFromStory(index)}
                                        aria-label="Remove event from story"
                                      >
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                      </Button>
                                    </div>
                                    <p className="text-sm">{item.event.summary}</p>
                                    <Textarea
                                      placeholder="Add investigator notes..."
                                      value={item.note}
                                      onChange={(e) => updateNote(index, e.target.value)}
                                      className="text-sm"
                                      rows={2}
                                    />
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </Draggable>
                        ))}
                      </AnimatePresence>
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            )}
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
};
