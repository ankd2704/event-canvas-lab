import { useCallback } from 'react';
import { Upload, FileJson, FileSpreadsheet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { parseJSON, parseCSV } from '@/utils/parser';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

interface ImportControlsProps {
  onImport: (events: any[]) => void;
}

export const ImportControls = ({ onImport }: ImportControlsProps) => {
  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      try {
        let events;
        if (file.name.endsWith('.json')) {
          const jsonData = JSON.parse(content);
          events = parseJSON(jsonData);
          toast.success(`Imported ${events.length} events from JSON`);
        } else if (file.name.endsWith('.csv')) {
          events = parseCSV(content);
          toast.success(`Imported ${events.length} events from CSV`);
        } else {
          toast.error('Unsupported file format. Please use .json or .csv');
          return;
        }
        onImport(events);
      } catch (error) {
        console.error('Import error:', error);
        toast.error('Failed to parse file. Check console for details.');
      }
    };
    reader.readAsText(file);
  }, [onImport]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = evt.target?.result as string;
      try {
        let events;
        if (file.name.endsWith('.json')) {
          const jsonData = JSON.parse(content);
          events = parseJSON(jsonData);
          toast.success(`Imported ${events.length} events from JSON`);
        } else if (file.name.endsWith('.csv')) {
          events = parseCSV(content);
          toast.success(`Imported ${events.length} events from CSV`);
        } else {
          toast.error('Unsupported file format. Please use .json or .csv');
          return;
        }
        onImport(events);
      } catch (error) {
        console.error('Import error:', error);
        toast.error('Failed to parse file. Check console for details.');
      }
    };
    reader.readAsText(file);
  }, [onImport]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-wrap gap-3 items-center"
    >
      <div
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className="flex-1 min-w-[200px] border-2 border-dashed border-border rounded-2xl p-4 text-center hover:border-primary transition-colors"
      >
        <p className="text-sm text-muted-foreground mb-2">
          Drop JSON or CSV file here
        </p>
        <input
          type="file"
          accept=".json,.csv"
          onChange={handleFileUpload}
          className="hidden"
          id="file-upload"
          aria-label="Upload event file"
        />
        <label htmlFor="file-upload">
          <Button variant="outline" className="cursor-pointer" asChild>
            <span>
              <Upload className="mr-2 h-4 w-4" />
              Browse Files
            </span>
          </Button>
        </label>
      </div>
      
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            const input = document.getElementById('file-upload') as HTMLInputElement;
            if (input) input.click();
          }}
          aria-label="Import JSON file"
        >
          <FileJson className="mr-2 h-4 w-4" />
          JSON
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            const input = document.getElementById('file-upload') as HTMLInputElement;
            if (input) input.click();
          }}
          aria-label="Import CSV file"
        >
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          CSV
        </Button>
      </div>
    </motion.div>
  );
};
