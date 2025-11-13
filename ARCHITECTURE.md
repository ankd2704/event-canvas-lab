# TimelineFusion - Architecture Documentation

## System Overview

TimelineFusion is a client-side web application for forensic timeline analysis and event reconstruction. It processes events from multiple sources, visualizes them on an interactive timeline, and generates tamper-evident reports.

### Design Philosophy
- **Client-Side First**: No server required; all processing in browser
- **Data Integrity**: Cryptographic hashing ensures evidence chain
- **Investigator-Focused**: UX optimized for forensic workflows
- **Extensible**: Modular architecture supports new data sources

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    Browser (Client)                     │
│                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │   React UI   │  │  State Mgmt  │  │  Web Crypto  │ │
│  │  Components  │←→│   (Hooks)    │←→│  API (SHA256)│ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
│         ↓                  ↓                  ↓         │
│  ┌──────────────────────────────────────────────────┐  │
│  │              Data Processing Layer               │  │
│  │  • CSV Parser (PapaParse)                        │  │
│  │  • JSON Normalizer                               │  │
│  │  • Event Canonicalizer                           │  │
│  │  • Lane Classifier                               │  │
│  └──────────────────────────────────────────────────┘  │
│         ↓                                               │
│  ┌──────────────────────────────────────────────────┐  │
│  │           Visualization Layer                    │  │
│  │  • vis-timeline (Timeline Canvas)                │  │
│  │  • Framer Motion (Animations)                    │  │
│  │  • @hello-pangea/dnd (Drag & Drop)              │  │
│  └──────────────────────────────────────────────────┘  │
│         ↓                                               │
│  ┌──────────────────────────────────────────────────┐  │
│  │              Export Layer                        │  │
│  │  • html2pdf.js (PDF Generation)                  │  │
│  │  • JSON Serializer (Case Files)                  │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
         ↓                          ↓
   Local Storage              File System
   (Optional)                 (Downloads)
```

---

## Component Architecture

### 1. Data Ingestion Layer

#### ImportControls Component
- **Purpose**: Handle file uploads (JSON/CSV)
- **Features**: 
  - Drag & drop zone
  - File type validation
  - Error handling with user feedback
- **Output**: Array of `CanonicalEvent` objects

#### Parser Utilities (`utils/parser.ts`)
- **`parseJSON()`**: Converts JSON arrays/objects to canonical format
- **`parseCSV()`**: Parses CSV with PapaParse and auto-detects columns
- **`determineLane()`**: Classifies events into timeline lanes
- **Column Auto-Detection**: Recognizes common forensic CSV headers
  - Timestamp: `date`, `time`, `timestamp`, `Date/Time`
  - Type: `type`, `activity`, `desc`, `Description`
  - Source: `source`, `Source`, `Type`, `Artifact`
  - Path: `path`, `file`, `File Name`

**Canonical Event Schema:**
```typescript
{
  id: string;           // Unique, generated if missing
  timestamp: string;    // ISO 8601 (normalized from input)
  source: string;       // "File System", "Network", etc.
  type: string;         // "File Created", "Process Start", etc.
  summary: string;      // Human-readable description
  path?: string;        // Optional file/resource path
  raw?: any;            // Original input data
  metadata?: {          // Preserved context
    csvRow?: object;    // Original CSV row
    headers?: string[]; // CSV column names
    [key: string]: any;
  }
}
```

---

### 2. Visualization Layer

#### TimelineCanvas Component
- **Library**: vis-timeline
- **Configuration**:
  - 4 horizontal lanes (groups)
  - Zoom/pan controls
  - Event selection
  - Custom CSS for dark theme
- **Lane Mapping**:
  1. Memory (cyan)
  2. System (magenta)
  3. User (green)
  4. Network (orange)
- **Interactions**:
  - Click to select event
  - Keyboard: Space (play/pause), F (focus)

#### Inspector Component
- **Purpose**: Display selected event details
- **Features**:
  - Summary and metadata
  - Raw JSON viewer (scrollable)
  - SHA-256 hash display
  - Copy-to-clipboard buttons
- **Hashing**: Asynchronous SHA-256 calculation on event selection

---

### 3. Story Builder Layer

#### StoryBuilder Component
- **Library**: @hello-pangea/dnd
- **Features**:
  - Add selected events to ordered list
  - Drag-and-drop reordering
  - Inline note editor per event
  - Author field
  - Combined story hash calculation
- **Hash Chain**:
  - Each event: `sha256(JSON.stringify(event))`
  - Story hash: `sha256(hash1 + hash2 + ... + hashN)`

#### PDF Export
- **Library**: html2pdf.js
- **Content**:
  - Report header (title, author, timestamp)
  - Combined story hash
  - Per-event sections:
    - Summary, timestamp, source, type, path
    - Investigator notes
    - Event hash
    - Collapsible raw JSON
- **Security**: Hashes enable tamper detection

---

## Data Flow

### Event Ingestion Flow
```
User Action (Upload) 
  → FileReader API 
  → Parser (JSON/CSV) 
  → Canonicalizer 
  → State Update (React.useState) 
  → Timeline Render
```

### Event Selection Flow
```
Timeline Click 
  → vis-timeline Event 
  → Find Event by ID 
  → Update Selected State 
  → Inspector Render 
  → SHA-256 Calculation
```

### Story Building Flow
```
Add Event 
  → Check Duplicates 
  → Calculate Hash 
  → Append to Story Array 
  → Update Story Hash 
  → Re-render DnD List

Reorder Event 
  → DragDropContext Handler 
  → Array Splice/Insert 
  → Recalculate Story Hash
```

### Export Flow
```
Export Button 
  → Generate HTML Content 
  → Include Hashes 
  → html2pdf.js Processing 
  → Browser Download
```

---

## Security & Integrity

### Cryptographic Implementation

**SHA-256 via Web Crypto API:**
```typescript
async function sha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}
```

### Tamper Detection
1. **Event-Level**: Each event hashed individually
2. **Story-Level**: Combined hash of all story events
3. **PDF Inclusion**: Hashes embedded in exported reports
4. **Verification**: Independent tools can recompute hashes from JSON

### Data Preservation
- Original CSV rows stored in `metadata.csvRow`
- Raw input preserved in `raw` field
- No data transformation without audit trail

---

## State Management

### React Hooks Pattern
```typescript
// Main application state
const [events, setEvents] = useState<CanonicalEvent[]>([]);
const [selectedEvent, setSelectedEvent] = useState<CanonicalEvent | null>(null);
const [searchQuery, setSearchQuery] = useState('');

// Derived state (computed)
const filteredEvents = useMemo(() => 
  events.filter(e => e.summary.includes(searchQuery)),
  [events, searchQuery]
);
```

### State Flow
- **Unidirectional**: Parent → Child props
- **Lifting State**: Shared state in `Index.tsx`
- **Local State**: Component-specific (e.g., `isPlaying` in TimelineCanvas)

---

## Performance Considerations

### Current Optimizations
1. **Lazy Hashing**: SHA-256 only on demand (selection, export)
2. **Timeline Virtualization**: vis-timeline handles rendering optimization
3. **Debounced Search**: Filters applied on input change
4. **Memoization**: Derived state cached with `useMemo`

### Scalability Limits
- **10,000 events**: Current soft limit before lag
- **CSV Parsing**: PapaParse is fast but blocks main thread
- **PDF Export**: Large stories (100+ events) may slow generation

### Future Improvements
- Web Workers for CSV parsing
- Virtual scrolling for story builder
- IndexedDB for large datasets
- Incremental hashing (hash on ingest, not on demand)

---

## Accessibility

### ARIA Implementation
- `aria-label` on interactive buttons
- `role="region"` on timeline container
- Keyboard navigation in story builder
- Focus management (search shortcut `/`)

### Contrast & Readability
- WCAG AA compliance
- 4.5:1 contrast ratio for text
- Cyan (#06b6d4) on dark backgrounds
- Semantic color usage (destructive actions in red)

---

## Testing Strategy

### Unit Tests (Vitest)
- **Parser Tests**: CSV/JSON normalization
- **Crypto Tests**: Hash consistency and uniqueness
- **Lane Assignment**: Event classification logic

### Integration Tests (Future)
- End-to-end file import flow
- Story building and export
- Case save/load round-trip

### Manual Testing Checklist
- [ ] Import JSON and CSV files
- [ ] Select events on timeline
- [ ] Drag-and-drop story reordering
- [ ] Export PDF with hashes
- [ ] Save and load case files
- [ ] Keyboard shortcuts (/, Space, Ctrl+F)

---

## Deployment

### Build Process
```bash
npm run build
```
Outputs to `dist/` directory with:
- Minified JS bundles (code-splitting via Vite)
- Optimized CSS (Tailwind purge)
- Asset hashing for cache-busting

### Hosting Requirements
- Static file hosting (Netlify, Vercel, S3 + CloudFront)
- HTTPS required for Web Crypto API
- No server-side components

---

## Limitations & Trade-offs

### Current Limitations
1. **Client-Side Only**: No persistent storage (except local downloads)
2. **Single User**: No collaboration features
3. **Memory Bound**: All events in RAM (no pagination)
4. **PDF Export**: Browser-dependent (some require print dialog)

### Design Trade-offs
- **Simplicity vs. Power**: Chose ease-of-use over advanced features
- **Offline vs. Cloud**: Prioritized privacy (no external calls)
- **Speed vs. Integrity**: SHA-256 adds latency but ensures trust

---

## Future Enhancements

### Planned Features
1. **Backend Integration**: Supabase/Firebase for multi-user sync
2. **Advanced Filters**: Regex, date ranges, custom queries
3. **Playback Animation**: Automated timeline traversal
4. **Custom Lanes**: User-defined event categories
5. **Export Formats**: DOCX, XLSX, Markdown

### Architecture Changes
- **State Management**: Migrate to Zustand/Redux for complex state
- **Database Layer**: IndexedDB for offline persistence
- **API Layer**: REST/GraphQL for backend sync
- **Real-Time**: WebSocket for collaborative editing

---

## Compliance & Standards

### Forensic Standards
- **NIST SP 800-86**: SHA-256 for data integrity
- **ISO/IEC 27037**: Evidence handling guidelines
- **SWGDE**: Digital evidence best practices

### Web Standards
- **Web Crypto API**: W3C standard for cryptography
- **ES2020+**: Modern JavaScript features
- **WCAG 2.1 AA**: Accessibility compliance

---

## Conclusion

TimelineFusion demonstrates a modern approach to forensic timeline analysis with:
- **Robust Data Handling**: Auto-detection and normalization
- **Cryptographic Integrity**: SHA-256 hash chains
- **Investigator UX**: Drag-and-drop, keyboard shortcuts, tamper-evident exports
- **Production-Ready Foundation**: Modular, tested, documented

The architecture supports future growth while maintaining simplicity and evidence integrity.

---

**Version**: 1.0  
**Last Updated**: 2024-11-13  
**Maintainer**: Student Project Team
