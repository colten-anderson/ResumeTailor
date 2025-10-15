# Resume Tailor - AI-Powered Resume Customization

## Overview

Resume Tailor is a web application that helps users optimize their resumes for specific job postings using AI. Users upload their resume (PDF or DOCX), paste a job description, and receive an AI-tailored version that highlights relevant skills and experience. The application provides a side-by-side comparison view and allows users to download the optimized resume in multiple formats (TXT, DOCX, PDF) or copy it to clipboard.

## Recent Changes (October 15, 2025)
- **NEW**: Added format selector with Professional and Modern resume styles
- **NEW**: Added DOCX and PDF download functionality for tailored resumes
- Professional format: Clean, ATS-friendly styling with black text and standard fonts
- Modern format: Eye-catching styling with blue headings (#1E40AF) and enhanced spacing
- Document generation using `docx` library for DOCX files and PDFKit for PDF files
- Architecture ready for future paid feature implementation (Phase 2)

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Routing**
- React with TypeScript for type safety and component development
- Wouter for lightweight client-side routing
- Single-page application architecture with minimal route complexity

**State Management**
- TanStack Query (React Query) for server state management and API data fetching
- Local React state (useState) for UI-specific state like form inputs and workflow steps
- No global state management library needed due to simple data flow

**UI Component System**
- Shadcn UI components built on Radix UI primitives for accessible, customizable components
- Tailwind CSS for styling with custom design tokens
- Material Design 3 principles for professional aesthetics
- Custom CSS variables for theme switching (light/dark mode)
- Monospace fonts (JetBrains Mono) for resume content display

**Key UI Patterns**
- Progressive disclosure workflow with stepper component (4 steps: Upload → Add Job Details → AI Tailoring → Download)
- File upload with drag-and-drop support
- Side-by-side comparison view for original vs. tailored resumes
- Scrollable content areas for long-form text
- Toast notifications for user feedback

### Backend Architecture

**Server Framework**
- Express.js with TypeScript for API endpoints
- Custom middleware for request logging and error handling
- No authentication/authorization layer (public access)

**API Design**
- RESTful endpoints for resume upload and tailoring
- Multipart form data handling for file uploads via Multer
- JSON responses for API communication
- Zod schema validation for request data

**File Processing Pipeline**
- PDF parsing using pdf-parse v2 library
- DOCX parsing using mammoth library
- File size limit: 10MB
- Text extraction and normalization

**AI Integration**
- OpenAI GPT-4o-mini API for resume tailoring
- Prompt engineering to maintain truthfulness while optimizing content
- Keyword extraction from job descriptions
- Skill highlighting and experience relevance optimization

### Data Storage

**Storage Strategy**
- In-memory storage using custom MemStorage class (no database)
- Session-based data model with UUID identifiers
- Data stored: original resume content, job description, tailored content, file metadata
- No persistence across server restarts
- No user accounts or authentication

**Data Schema**
- ResumeSession type with Zod validation
- Fields: id, fileName, originalContent, jobDescription, tailoredContent, createdAt
- Type-safe data access through TypeScript interfaces

**Rationale for In-Memory Storage**
- Suitable for prototype/demo phase
- No sensitive data retention requirements
- Simplifies deployment without database dependencies
- Easy migration path to PostgreSQL with Drizzle ORM (config already present)

### Security Considerations

**Removed Features**
- URL extraction feature removed to prevent SSRF vulnerabilities
- Users must manually paste job descriptions instead of fetching from URLs

**Current Security Measures**
- File size limits to prevent resource exhaustion
- File type validation (PDF and DOCX only)
- Input validation with Zod schemas
- No server-side file storage (files processed in memory only)

**Future Considerations**
- Rate limiting not implemented
- No API key protection
- No content sanitization for AI-generated text

## External Dependencies

### Third-Party Services

**OpenAI API**
- Service: GPT-4o-mini model for resume tailoring
- Authentication: API key via environment variable (OPENAI_API_KEY)
- Purpose: Natural language processing to analyze job requirements and optimize resume content
- Usage: Single API call per tailoring request

### Database Configuration

**Drizzle ORM Setup**
- PostgreSQL dialect configured but not actively used
- Database URL expected via DATABASE_URL environment variable
- Migration folder: ./migrations
- Schema location: ./shared/schema.ts
- Ready for future migration from in-memory to persistent storage

### NPM Packages

**Core Libraries**
- pdf-parse: PDF text extraction
- mammoth: DOCX text extraction
- docx: DOCX document generation for tailored resumes
- pdfkit: PDF document generation for tailored resumes
- openai: Official OpenAI API client
- multer: File upload handling
- zod: Runtime schema validation

**UI Libraries**
- @radix-ui/*: Accessible UI primitives (20+ component packages)
- class-variance-authority: Component variant management
- tailwind-merge & clsx: CSS class utilities
- lucide-react: Icon library
- date-fns: Date formatting utilities

**Development Tools**
- Vite: Build tool and dev server
- tsx: TypeScript execution for development
- esbuild: Production build bundler
- @replit/vite-plugin-*: Replit-specific development plugins