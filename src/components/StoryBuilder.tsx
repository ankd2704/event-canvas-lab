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

  const exportToPDF = async () => {
    if (storyItems.length === 0) {
      toast.error('No events in story to export');
      return;
    }

    // Generate PDF content
    const pdfContent = document.createElement('div');
    pdfContent.style.padding = '20px';
    pdfContent.style.fontFamily = 'Arial, sans-serif';
    pdfContent.innerHTML = `
      <h1 style="color: #06b6d4; border-bottom: 2px solid #06b6d4; padding-bottom: 10px;">
        TimelineFusion Event Reconstruction Report
      </h1>
      <p><strong>Author:</strong> ${author || 'Unknown'}</p>
      <p><strong>Generated:</strong> ${new Date().toISOString()}</p>
      <p><strong>Events:</strong> ${storyItems.length}</p>
      <p><strong>Story Hash (SHA-256):</strong></p>
      <p style="font-family: monospace; font-size: 10px; word-break: break-all; background: #f5f5f5; padding: 10px;">
        ${storyHash}
      </p>
      <hr style="margin: 20px 0;" />
      ${storyItems.map((item, index) => `
        <div style="margin-bottom: 30px; page-break-inside: avoid;">
          <h2 style="color: #d946ef;">Event ${index + 1}: ${item.event.type}</h2>
          <p><strong>Summary:</strong> ${item.event.summary}</p>
          <p><strong>Timestamp:</strong> ${item.event.timestamp}</p>
          <p><strong>Source:</strong> ${item.event.source}</p>
          ${item.event.path ? `<p><strong>Path:</strong> ${item.event.path}</p>` : ''}
          ${item.note ? `<p><strong>Investigator Note:</strong> ${item.note}</p>` : ''}
          <p><strong>Event Hash (SHA-256):</strong></p>
          <p style="font-family: monospace; font-size: 9px; word-break: break-all; background: #f9f9f9; padding: 8px;">
            ${item.hash}
          </p>
          <details>
            <summary style="cursor: pointer; color: #06b6d4;">Raw JSON</summary>
            <pre style="font-size: 8px; background: #f9f9f9; padding: 10px; overflow-x: auto;">
${JSON.stringify(item.event, null, 2)}
            </pre>
          </details>
        </div>
      `).join('')}
    `;

    const opt = {
      margin: 10,
      filename: `timeline-fusion-report-${Date.now()}.pdf`,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const }
    };

    try {
      await html2pdf().set(opt).from(pdfContent).save();
      toast.success('PDF exported successfully');
    } catch (error) {
      console.error('PDF export error:', error);
      toast.error('Failed to export PDF');
    }
  };

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
