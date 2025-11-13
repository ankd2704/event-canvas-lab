# TimelineFusion - Suggested Marking Rubric (20 Marks)

## Category Breakdown

### 1. Functionality & Features (8 marks)

| Criteria | Marks | Description |
|----------|-------|-------------|
| **Data Ingestion** | 1.5 | • JSON/CSV import working<br>• Auto-detection of CSV columns<br>• Metadata preservation |
| **Timeline Visualization** | 1.5 | • vis-timeline integration<br>• 4-lane classification (Memory/System/User/Network)<br>• Zoom/pan functionality<br>• Event selection |
| **Event Inspector** | 1.0 | • Displays event details<br>• Shows SHA-256 hash<br>• Copy-to-clipboard function |
| **Story Builder** | 2.0 | • Add events to story<br>• Drag-and-drop reordering working<br>• Inline notes per event<br>• Combined story hash calculation |
| **PDF Export** | 1.5 | • Generates PDF with hashes<br>• Includes per-event and story hash<br>• Downloadable report |
| **Save/Load Case** | 0.5 | • Save case as JSON<br>• Reload case functionality |

**Marking Notes:**
- Full marks: All features working as demonstrated
- Partial: Feature works but has bugs or missing elements
- Zero: Feature not implemented or non-functional

---

### 2. User Interface & UX (4 marks)

| Criteria | Marks | Description |
|----------|-------|-------------|
| **Visual Design** | 1.5 | • Dark mode with cyan/magenta accents<br>• Professional forensic aesthetic<br>• Consistent spacing and typography<br>• Rounded corners and shadows |
| **Responsiveness** | 1.0 | • Layout adapts to screen sizes<br>• No broken elements on resize<br>• Tablet/desktop optimized |
| **Interactions** | 1.0 | • Smooth animations (Framer Motion)<br>• Hover states and feedback<br>• Loading states and error handling |
| **Accessibility** | 0.5 | • Keyboard shortcuts working<br>• ARIA labels present<br>• Focus indicators visible |

**Marking Notes:**
- Compare against DEMO.md visual expectations
- Test responsiveness at 1920x1080 and 1366x768
- Verify keyboard shortcuts: Space, /, Ctrl+F

---

### 3. Code Quality & Architecture (4 marks)

| Criteria | Marks | Description |
|----------|-------|-------------|
| **Code Organization** | 1.0 | • Clear component structure<br>• Utilities in separate files<br>• Logical file naming |
| **TypeScript Usage** | 1.0 | • Type definitions for events<br>• Interface consistency<br>• No `any` abuse |
| **Comments & Docs** | 1.0 | • Inline comments in complex logic<br>• README is comprehensive<br>• ARCHITECTURE.md clarity |
| **Testing** | 1.0 | • Unit tests present and passing<br>• Parser tests cover key logic<br>• Crypto tests verify hashing |

**Marking Notes:**
- Run `npm test` to verify tests pass
- Check `src/utils/parser.ts` for comments
- Review README for clarity and completeness

---

### 4. Demo Delivery (3 marks)

| Criteria | Marks | Description |
|----------|-------|-------------|
| **Demo Execution** | 1.0 | • Followed DEMO.md script<br>• Completed within 3 minutes<br>• No major technical issues |
| **Explanation Quality** | 1.0 | • Clear explanation of features<br>• Highlighted key innovations<br>• Answered questions confidently |
| **Professional Presentation** | 1.0 | • Rehearsed and polished<br>• Good pacing and flow<br>• Demonstrated all core features |

**Marking Notes:**
- Use DEMO.md as reference timeline
- Verify sample case (case1.csv) was used
- Check if PDF export was demonstrated

---

### 5. Innovation & Polish (1 mark)

| Criteria | Marks | Description |
|----------|-------|-------------|
| **Exceeds Expectations** | 0-1 | • Extra features beyond requirements<br>• Exceptional UI polish<br>• Creative problem-solving<br>• Production-ready quality |

**Examples for Full Mark:**
- Advanced search with regex
- Timeline playback implemented
- Exceptional error handling
- Outstanding visual design

---

## Total: 20 Marks

### Grade Bands

| Range | Grade | Description |
|-------|-------|-------------|
| 18-20 | A+ | Exceptional work, production-ready quality |
| 16-17 | A | Excellent implementation, minor issues only |
| 14-15 | B+ | Strong work, all core features working |
| 12-13 | B | Good implementation, some features missing/buggy |
| 10-11 | C+ | Adequate work, multiple issues present |
| 8-9 | C | Basic implementation, significant gaps |
| <8 | D/F | Incomplete or non-functional |

---

## Examiner Checklist

### Pre-Demo Verification
- [ ] `npm install` runs without errors
- [ ] `npm run dev` starts server successfully
- [ ] Browser opens to `http://localhost:8080`
- [ ] No console errors on page load

### During Demo
- [ ] File import works (JSON and CSV)
- [ ] Timeline displays events correctly
- [ ] Event selection updates inspector
- [ ] Story builder accepts events
- [ ] Drag-and-drop reordering functions
- [ ] PDF export generates successfully
- [ ] Hashes are displayed and unique

### Post-Demo
- [ ] Run `npm test` to verify tests pass
- [ ] Review README, DEMO.md, ARCHITECTURE.md
- [ ] Check code comments and organization
- [ ] Verify LICENSE and .gitignore present

---

## Common Deduction Scenarios

| Issue | Deduction | Category |
|-------|-----------|----------|
| CSV import fails | -1.5 | Functionality |
| Timeline doesn't render | -1.5 | Functionality |
| Hashes not calculated | -1.0 | Functionality |
| PDF export broken | -1.5 | Functionality |
| No drag-and-drop | -2.0 | Functionality |
| Poor color contrast | -0.5 | UI/UX |
| No keyboard shortcuts | -0.5 | UI/UX |
| Missing comments | -0.5 | Code Quality |
| Tests fail or missing | -1.0 | Code Quality |
| Demo over 4 minutes | -0.5 | Demo |
| Couldn't answer questions | -0.5 | Demo |

---

## Bonus Considerations (Not Required)

Features that show exceptional effort:
- Real-time collaboration (placeholder)
- Advanced filtering (regex, date ranges)
- Custom lane configuration
- Export to DOCX/XLSX
- Dark/Light mode toggle
- Timeline playback with animation

**Note**: These are nice-to-have and not required for full marks.

---

## Final Notes for Examiners

This is a **student prototype** demonstrating:
1. Full-stack frontend skills (React, TypeScript, Vite)
2. Forensic domain knowledge (event reconstruction)
3. Security awareness (SHA-256, tamper evidence)
4. UX design (dark mode, drag-and-drop, keyboard shortcuts)
5. Professional documentation (README, DEMO, ARCHITECTURE)

The rubric balances technical implementation with demo presentation and code quality. Adjust deductions based on severity and whether issues are critical or cosmetic.

**Recommended Pass Mark**: 12/20 (60%)  
**Distinction Threshold**: 16/20 (80%)
