# TimelineFusion - 3-Minute Demo Script

## Setup (Pre-Demo)
✅ Ensure `npm install && npm run dev` has been run  
✅ Browser open to `http://localhost:8080`  
✅ `sample_cases/case1.csv` ready to drag & drop  

---

## Demo Timeline (Total: 3 minutes)

### [0:00-0:30] Introduction & Problem Statement
**Say:**
> "TimelineFusion solves the critical challenge in digital forensics: reconstructing complex event sequences from disparate data sources. Investigators often work with thousands of events from file systems, network logs, and memory dumps. Our toolkit unifies these into an interactive, tamper-evident timeline."

**Action:**
- Show the landing page with clean dark UI
- Point out the cyan/magenta accent colors and professional forensic aesthetic

---

### [0:30-1:15] Data Ingestion & Timeline Visualization
**Say:**
> "Let me show you how quickly we can ingest forensic data. I'll import a sample case with 12 events covering a 30-minute user session."

**Actions:**
1. **Drag & drop** `case1.csv` into the drop zone
2. **Point out** the toast notification: "Imported 12 events from CSV"
3. **Show the timeline** with 4 color-coded lanes:
   - 🔵 Memory (cyan)
   - 🟣 System (magenta)
   - 🟢 User (green)
   - 🟠 Network (orange)
4. **Zoom and pan** on the timeline to show interactivity
5. **Hover** over an event to show tooltip details

**Say:**
> "Events are automatically categorized into logical lanes. The CSV parser preserves all original metadata—critical for evidence integrity."

---

### [1:15-2:00] Event Inspection & Cryptographic Integrity
**Say:**
> "Each event can be inspected in detail with cryptographic verification."

**Actions:**
1. **Click** on "File Created" event (evt-001)
2. **Point out** Inspector panel showing:
   - Summary and key details
   - SHA-256 hash (64-character hex)
   - Raw JSON with all metadata
   - Preserved CSV row data
3. **Click "Copy"** button to demonstrate hash copying
4. **Show** another event to demonstrate hash changes

**Say:**
> "Every event has a unique SHA-256 hash. This ensures data integrity—any tampering would break the hash chain."

---

### [2:00-2:45] Story Builder & Tamper-Evident Export
**Say:**
> "Now I'll build an investigative narrative using drag-and-drop."

**Actions:**
1. **Select** "User Login" event (evt-004)
2. **Click "Add"** to Story Builder
3. **Add** 2-3 more events (File Modified, HTTP POST, User Logout)
4. **Drag** to reorder events in chronological sequence
5. **Type** author name: "Detective Smith"
6. **Add** a note to one event: "Suspicious upload timing"
7. **Point out** the combined story hash at top
8. **Click "Export"** to generate PDF

**Say:**
> "The exported PDF includes each event's JSON, individual hashes, and a combined story hash—making it tamper-evident. Courts can verify data integrity."

---

### [2:45-3:00] Wrap-Up & Key Features
**Say:**
> "Key features demonstrated:
> - **Multi-format ingestion** with auto-detection
> - **Interactive multi-lane timeline** with zoom/pan
> - **Cryptographic integrity** via SHA-256 hashing
> - **Tamper-evident reports** with combined hashes
> - **Keyboard shortcuts** for power users (press / for search)"

**Actions:**
1. **Press `/`** to focus search bar
2. **Type** "login" to filter events
3. **Show** filtered timeline

**Final Say:**
> "TimelineFusion streamlines forensic investigations while maintaining the highest standards of evidence integrity. Thank you!"

---

## Backup Demo Points (If Time Allows)

### Save/Load Case Feature
1. Click "Save Case" to download JSON
2. Reload page
3. Click "Load Case" to restore state

### Keyboard Shortcuts
- `Space`: Toggle playback (placeholder)
- `/`: Focus search
- `Ctrl+F`: Focus timeline

### Accessibility
- Show keyboard navigation through events
- Mention ARIA labels and screen reader support

---

## Common Questions & Answers

**Q: "Can it handle large datasets?"**  
A: "Current prototype is optimized for up to 10,000 events. Production version would implement virtualization and backend pagination."

**Q: "What CSV formats are supported?"**  
A: "It auto-detects Autopsy/Timeline formats and preserves original rows. Custom mapping can be added for specialized formats."

**Q: "Is the hash verification court-admissible?"**  
A: "SHA-256 is NIST-approved and widely accepted. The PDF report includes all hashes and raw JSON for independent verification."

**Q: "Can multiple investigators collaborate?"**  
A: "Not in this prototype, but the architecture supports real-time collaboration via WebSocket or backend sync."

---

## Technical Notes for Examiner

**Browser Tested:** Chromium (Chrome/Edge), Firefox  
**Resolution:** 1920x1080 or higher recommended  
**No external dependencies:** All data processing is client-side  
**No API keys required:** Fully offline-capable after initial load  

**If PDF export fails:** Some browsers block automatic downloads. Use "Save as PDF" from print dialog (still includes all hashes).
