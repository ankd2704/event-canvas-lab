import { useEffect, useState } from 'react';
import { CanonicalEvent } from '@/utils/parser';
import { hashEvent } from '@/utils/crypto';
import { Copy, Hash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

interface InspectorProps {
  event: CanonicalEvent | null;
}

export const Inspector = ({ event }: InspectorProps) => {
  const [eventHash, setEventHash] = useState<string>('');

  useEffect(() => {
    if (event) {
      hashEvent(event).then(hash => setEventHash(hash));
    } else {
      setEventHash('');
    }
  }, [event]);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  if (!event) {
    return (
      <Card className="h-full border-border bg-card">
        <CardContent className="flex items-center justify-center h-full">
          <p className="text-muted-foreground">Select an event to inspect</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="h-full border-border bg-card shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="text-lg">Event Inspector</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => copyToClipboard(JSON.stringify(event, null, 2), 'Event JSON')}
              aria-label="Copy event JSON to clipboard"
            >
              <Copy className="h-4 w-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Event Summary */}
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground mb-1">Summary</h3>
            <p className="text-foreground">{event.summary}</p>
          </div>

          {/* Key Details */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-1">Type</h3>
              <p className="text-sm text-foreground">{event.type}</p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-1">Source</h3>
              <p className="text-sm text-foreground">{event.source}</p>
            </div>
            <div className="col-span-2">
              <h3 className="text-sm font-semibold text-muted-foreground mb-1">Timestamp</h3>
              <p className="text-sm text-foreground font-mono">{event.timestamp}</p>
            </div>
            {event.path && (
              <div className="col-span-2">
                <h3 className="text-sm font-semibold text-muted-foreground mb-1">Path</h3>
                <p className="text-sm text-foreground font-mono break-all">{event.path}</p>
              </div>
            )}
          </div>

          {/* SHA-256 Hash */}
          <div className="bg-muted p-3 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <Hash className="h-4 w-4 text-primary" />
                SHA-256 Hash
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(eventHash, 'Hash')}
                aria-label="Copy hash to clipboard"
              >
                <Copy className="h-3 w-3" />
              </Button>
            </div>
            <p className="text-xs font-mono break-all text-muted-foreground">{eventHash}</p>
          </div>

          {/* Raw JSON */}
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground mb-2">Raw JSON</h3>
            <ScrollArea className="h-[200px] w-full rounded-xl border border-border bg-background p-3">
              <pre className="text-xs font-mono text-foreground">
                {JSON.stringify(event, null, 2)}
              </pre>
            </ScrollArea>
          </div>

          {/* Metadata */}
          {event.metadata && Object.keys(event.metadata).length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-2">Metadata</h3>
              <ScrollArea className="h-[150px] w-full rounded-xl border border-border bg-background p-3">
                <pre className="text-xs font-mono text-foreground">
                  {JSON.stringify(event.metadata, null, 2)}
                </pre>
              </ScrollArea>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};
