# Resume Tailor - AI-Powered Resume Customization

## Overview
A web application that allows users to upload their resumes (PDF or DOCX), paste job descriptions, and use AI to tailor the resume to match specific job postings. The app optimizes resumes for applicant tracking systems and helps users stand out to employers.

## Recent Changes (October 14, 2025)
- Implemented complete resume tailoring workflow
- Added PDF and DOCX file parsing capabilities
- Integrated OpenAI GPT-4o-mini for AI-powered resume tailoring
- Created professional UI with progress stepper and comparison view
- Added download and clipboard functionality
- **SECURITY FIX**: Removed URL extraction feature to prevent SSRF vulnerability - users now paste job descriptions manually

## Project Architecture

### Tech Stack
- **Frontend**: React + TypeScript with Wouter routing
- **Backend**: Express.js + TypeScript
- **AI**: OpenAI GPT-4o-mini API
- **Storage**: In-memory storage (MemStorage)
- **File Parsing**: pdf-parse v2 for PDF, mammoth for DOCX
- **UI**: Shadcn components + Tailwind CSS

### Key Features
1. **File Upload & Parsing**
   - Supports PDF and DOCX formats up to 10MB
   - Drag-and-drop or browse file selection
   - Automatic text extraction from uploaded documents

2. **Job Description Input**
   - Simple textarea for manual job description entry
   - Minimum 50 character validation
   - Character counter for user feedback
   - Validated on both frontend and backend

3. **AI Resume Tailoring**
   - Uses OpenAI GPT-4o-mini model
   - Analyzes job requirements and optimizes resume
   - Highlights relevant skills and experience
   - Uses keywords from job posting
   - Maintains original truthfulness and structure

4. **Resume Comparison**
   - Side-by-side view of original and tailored resumes
   - Scrollable content areas
   - Clean monospace font for readability

5. **Download Options**
   - Copy to clipboard functionality
   - Download as TXT file
   - Proper content-type handling

### Project Structure
```
/client
  /src
    /components      # Reusable UI components
      FileUpload.tsx
      JobDescriptionInput.tsx
      ResumeDisplay.tsx
      ResumeComparison.tsx
      ProgressStepper.tsx
      LoadingSpinner.tsx
      ThemeToggle.tsx
    /pages
      Home.tsx       # Main application page
    App.tsx
    index.css        # Global styles and theme

/server
  routes.ts          # API endpoints
  storage.ts         # In-memory storage interface
  pdf-parse.d.ts     # Type definitions for pdf-parse
  index.ts

/shared
  schema.ts          # Shared types and validation schemas
```

### API Endpoints
- `POST /api/upload-resume` - Upload and parse PDF/DOCX files
- `POST /api/tailor-resume` - Tailor resume using AI
- `GET /api/session/:id` - Retrieve session data
- `POST /api/test/upload-resume-text` - Test endpoint for automated testing

### Environment Variables
- `OPENAI_API_KEY` - OpenAI API key for GPT-4o-mini (configured in Replit Secrets)
- `SESSION_SECRET` - Session secret for Express (configured in Replit Secrets)

### Design System
- **Colors**: Professional blue theme (HSL 220 85% 45% primary)
- **Fonts**: Inter for UI, JetBrains Mono for resume display
- **Dark Mode**: Full support with theme toggle
- **Components**: Shadcn UI components with custom styling
- **Spacing**: Consistent spacing scale (small: 4-6, medium: 8-12, large: 16+)

## User Workflow
1. Upload resume (PDF or DOCX)
2. System parses and extracts text content
3. Manually paste job description (min 50 characters)
4. Click "Tailor Resume with AI"
5. AI analyzes and optimizes resume
6. View side-by-side comparison
7. Copy to clipboard or download as TXT

## Security Notes
- URL extraction feature was removed to prevent SSRF (Server-Side Request Forgery) attacks
- Users must manually copy and paste job descriptions from job sites
- This ensures the application only processes trusted, user-provided content

## Known Limitations
- Text-only download format (no PDF generation)
- In-memory storage (sessions reset on server restart)
- Single session per user (no authentication)
- Basic text extraction from PDF/DOCX (formatting not preserved)
- Users must manually copy job descriptions (no URL extraction for security)

## Testing Notes
- Automated E2E testing requires valid PDF/DOCX files
- Test endpoint available at `/api/test/upload-resume-text` for testing without file upload
- Manual testing recommended for file upload functionality

## Future Enhancements
- PDF export for tailored resumes
- Multiple resume templates
- ATS optimization scoring
- Keyword highlighting
- Version history
- User authentication
- Database persistence
- Batch processing for multiple job postings
