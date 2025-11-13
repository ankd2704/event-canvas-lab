import Papa from 'papaparse';

/**
 * Canonical event structure for TimelineFusion
 */
export interface CanonicalEvent {
  id: string;
  timestamp: string; // ISO 8601
  source: string;
  type: string;
  summary: string;
  path?: string;
  raw?: any;
  metadata?: any;
}

/**
 * Parse JSON events and convert to canonical format
 * @param jsonData - JSON array or single object
 * @returns Array of canonical events
 */
export function parseJSON(jsonData: any): CanonicalEvent[] {
  const data = Array.isArray(jsonData) ? jsonData : [jsonData];
  
  return data.map((event, index) => {
    // If already in canonical format, return as-is with guaranteed id
    if (event.id && event.timestamp && event.source) {
      return {
        ...event,
        id: event.id || `json-${index}-${Date.now()}`,
        timestamp: ensureISOTimestamp(event.timestamp),
      };
    }
    
    // Convert from various formats
    return {
      id: event.id || `json-${index}-${Date.now()}`,
      timestamp: ensureISOTimestamp(event.timestamp || event.date || event.time || new Date().toISOString()),
      source: event.source || event.origin || 'Unknown',
      type: event.type || event.eventType || 'Event',
      summary: event.summary || event.description || event.message || 'No description',
      path: event.path || event.file,
      raw: event,
      metadata: event.metadata || {}
    };
  });
}

/**
 * Parse Autopsy/Timeline CSV and convert to canonical format
 * Auto-detects common column names and preserves original CSV row
 * @param csvText - CSV file content as string
 * @returns Array of canonical events
 */
export function parseCSV(csvText: string): CanonicalEvent[] {
  const result = Papa.parse(csvText, {
    header: true,
    skipEmptyLines: true,
    dynamicTyping: false
  });
  
  if (result.errors.length > 0) {
    console.warn('CSV parse warnings:', result.errors);
  }
  
  const data = result.data as any[];
  const headers = result.meta.fields || [];
  
  // Common column name mappings for Autopsy/Timeline CSV files
  const timestampFields = ['date', 'time', 'timestamp', 'datetime', 'Date/Time', 'MACB', 'Date'];
  const sourceFields = ['source', 'Source', 'Type', 'source_type', 'Artifact'];
  const typeFields = ['type', 'activity', 'desc', 'Description', 'Short', 'Activity'];
  const summaryFields = ['description', 'summary', 'message', 'Description', 'Short Description', 'Long'];
  const pathFields = ['path', 'file', 'File Name', 'file_name', 'Filename'];
  
  const findField = (fields: string[]): string | undefined => {
    return headers.find(h => fields.some(f => h.toLowerCase().includes(f.toLowerCase())));
  };
  
  const timestampField = findField(timestampFields);
  const sourceField = findField(sourceFields);
  const typeField = findField(typeFields);
  const summaryField = findField(summaryFields);
  const pathField = findField(pathFields);
  
  return data.map((row, index) => ({
    id: `csv-${index}-${Date.now()}`,
    timestamp: ensureISOTimestamp(row[timestampField || 'timestamp'] || new Date().toISOString()),
    source: row[sourceField || 'source'] || 'CSV',
    type: row[typeField || 'type'] || determineTypeFromRow(row),
    summary: row[summaryField || 'description'] || JSON.stringify(row).slice(0, 100),
    path: row[pathField || 'path'],
    raw: row,
    metadata: {
      csvRow: row,
      headers: headers,
      rowIndex: index
    }
  }));
}

/**
 * Ensure timestamp is in ISO 8601 format
 * Handles various input formats
 */
function ensureISOTimestamp(timestamp: string | number | Date): string {
  try {
    // If it's already a valid ISO string, return it
    if (typeof timestamp === 'string' && timestamp.match(/^\d{4}-\d{2}-\d{2}T/)) {
      return new Date(timestamp).toISOString();
    }
    
    // Try to parse various formats
    const date = new Date(timestamp);
    if (!isNaN(date.getTime())) {
      return date.toISOString();
    }
  } catch (e) {
    console.warn('Failed to parse timestamp:', timestamp, e);
  }
  
  // Fallback to current time
  return new Date().toISOString();
}

/**
 * Determine event type from CSV row based on heuristics
 */
function determineTypeFromRow(row: any): string {
  const rowStr = JSON.stringify(row).toLowerCase();
  
  if (rowStr.includes('file') || rowStr.includes('write') || rowStr.includes('modify')) {
    return 'File System';
  }
  if (rowStr.includes('network') || rowStr.includes('http') || rowStr.includes('connection')) {
    return 'Network';
  }
  if (rowStr.includes('process') || rowStr.includes('execute') || rowStr.includes('run')) {
    return 'System';
  }
  if (rowStr.includes('user') || rowStr.includes('login') || rowStr.includes('auth')) {
    return 'User Activity';
  }
  if (rowStr.includes('memory') || rowStr.includes('ram')) {
    return 'Memory';
  }
  
  return 'Unknown';
}

/**
 * Determine lane assignment for timeline visualization
 * @param event - Canonical event
 * @returns Lane identifier (1-4)
 */
export function determineLane(event: CanonicalEvent): number {
  const type = event.type.toLowerCase();
  const source = event.source.toLowerCase();
  const summary = event.summary.toLowerCase();
  
  const combined = `${type} ${source} ${summary}`;
  
  if (combined.includes('memory') || combined.includes('ram')) {
    return 1; // Memory lane
  }
  if (combined.includes('system') || combined.includes('process') || combined.includes('kernel')) {
    return 2; // System lane
  }
  if (combined.includes('user') || combined.includes('login') || combined.includes('session')) {
    return 3; // User lane
  }
  if (combined.includes('network') || combined.includes('http') || combined.includes('connection')) {
    return 4; // Network lane
  }
  
  // Default to system lane
  return 2;
}
