# Resume Tailoring Application - Design Guidelines

## Design Approach: Professional Productivity System

**Selected System**: Material Design 3 with productivity tool refinements
**Justification**: Resume tailoring requires trust, clarity, and efficiency. Material Design provides robust component patterns for document workflows, file uploads, and side-by-side comparisons while maintaining professional credibility.

**Key Design Principles**:
- Clarity over decoration - every element serves the workflow
- Progressive disclosure - guide users through upload → parse → tailor → download
- Trust through transparency - show what AI changes and why
- Professional aesthetics that inspire confidence

---

## Core Design Elements

### A. Color Palette

**Light Mode**:
- Primary: 220 85% 45% (Professional blue - trust and technology)
- Surface: 0 0% 98% (Clean background)
- On-Surface: 220 15% 20% (Readable text)
- Success: 145 65% 45% (Parsing/completion states)
- Border: 220 15% 88% (Subtle divisions)

**Dark Mode**:
- Primary: 220 90% 65% (Lighter blue for dark backgrounds)
- Surface: 220 20% 12% (Deep professional background)
- On-Surface: 220 10% 92% (High contrast text)
- Surface-Variant: 220 18% 18% (Cards, upload zones)
- Border: 220 15% 25% (Subtle divisions)

**Accent Colors**:
- Warning: 35 95% 55% (Required attention states)
- Info: 200 85% 50% (AI processing indicators)

### B. Typography

**Font Stack**: 
- Primary: 'Inter' (Google Fonts) - Clean, professional, excellent readability
- Monospace: 'JetBrains Mono' (Google Fonts) - Resume content display

**Scale**:
- Headings: 32px/700, 24px/600, 20px/600
- Body: 16px/400 (resume content), 14px/400 (UI labels)
- Small: 13px/500 (metadata, file info)
- Line heights: 1.6 for body, 1.3 for headings

### C. Layout System

**Spacing Primitives**: Use Tailwind units of 2, 4, 6, 8, 12, 16
- Component padding: p-6 to p-8
- Section spacing: gap-8 to gap-12
- Card spacing: p-6
- Tight elements: gap-2 to gap-4

**Container Strategy**:
- Max width: max-w-7xl for main content area
- Resume comparison: Two-column grid (grid-cols-1 lg:grid-cols-2)
- Upload zone: Centered, max-w-2xl
- Workflow steps: Horizontal flow on desktop, vertical on mobile

### D. Component Library

**File Upload Zone**:
- Large dashed border area with drag-and-drop
- Icon: Document upload (large, centered)
- Supported formats badge: "PDF, DOCX"
- File size limit indicator: "Max 10MB"
- Hover state: Border color shifts to primary, subtle scale
- Background: Surface-variant with subtle pattern

**Workflow Stepper**:
- Horizontal progress bar with 4 steps: Upload → Parse → Tailor → Download
- Active step: Primary color, checkmark for completed
- Inactive: Muted colors
- Connecting lines between steps

**Resume Display Cards**:
- Clean white/surface-variant cards with subtle shadows
- Header: Job title, company name (bold, 20px)
- Section headers: 16px/600, primary color
- Content: Monospace font for authenticity
- Comparison mode: Highlights for AI changes (yellow background, strikethrough for removed)

**AI Tailoring Panel**:
- Floating panel or side drawer
- Job description textarea: Large, clear, with character count
- "Tailor Resume" CTA: Primary button, prominent placement
- Loading state: Animated progress with "Analyzing..." text
- Results: Collapsible sections showing changes made

**Navigation Header**:
- Logo + "Resume Tailor" title (left)
- User session indicator (right) - optional auth
- Clean, minimal height: h-16
- Sticky positioning for workflow context

**Download Options**:
- Button group: "Download as TXT" | "Download as PDF"
- Secondary action: "Copy to Clipboard"
- Success toast notification on download

### E. Interactions & States

**Loading States**:
- Skeleton screens for resume parsing (animated pulse)
- Spinning loader with status text during AI processing
- Progress percentage for multi-step operations

**Micro-interactions** (minimal):
- Smooth fade-in for parsed content (300ms)
- Gentle scale on button hover (scale-105)
- Color transitions for state changes (200ms ease)

**Error Handling**:
- Inline validation for job description (min 50 chars)
- Upload errors: Red border + error message below
- Retry button for failed AI requests

---

## Page Structure

**Main Workflow Layout**:

1. **Header** (h-16, sticky)
2. **Progress Stepper** (py-6, centered)
3. **Active Step Content** (flex-grow, py-12):
   - Step 1: Upload zone (centered, max-w-2xl)
   - Step 2: Parsing indicator (centered)
   - Step 3: Two-column layout (Original | Job Description)
   - Step 4: Two-column layout (Original | Tailored Resume)
4. **Action Bar** (py-6, border-top): Primary CTA for current step

**Resume Comparison View**:
- Split screen: 50/50 on desktop
- Synchronized scrolling between panels
- Diff indicators: Green for additions, red strikethrough for removals
- Inline suggestions panel (collapsible)

---

## Images & Visual Assets

**No hero image needed** - This is a utility application focused on workflow efficiency.

**Icon Requirements**:
- Use Heroicons via CDN (outline style for UI, solid for status)
- Key icons: DocumentArrowUpIcon, CheckCircleIcon, SparklesIcon (AI), DocumentTextIcon
- File type indicators: PDF and DOCX icons in upload zone

**Illustrations** (optional):
- Empty state: Simple line illustration of resume/document
- Success state: Checkmark animation after successful tailoring

---

## Accessibility & Quality Standards

- Maintain WCAG AA contrast ratios (4.5:1 for text)
- Dark mode toggle (top-right header)
- Keyboard navigation for entire workflow
- Clear focus indicators (2px primary color ring)
- Screen reader labels for all interactive elements
- Form validation with clear error messages