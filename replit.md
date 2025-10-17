# Resume Tailor - AI-Powered Resume Customization

## Overview

Resume Tailor is a web application that helps users optimize their resumes for specific job postings using AI. Users upload their resume (PDF or DOCX), paste a job description, and receive an AI-tailored version that highlights relevant skills and experience. The application provides a side-by-side comparison view and allows users to download the optimized resume in multiple formats (TXT, DOCX, PDF) or copy it to clipboard.

## Recent Changes (October 15, 2025)
- **NEW**: Replit Auth integration - users can log in with Google, GitHub, X, Apple, or email/password
- **NEW**: Two-tier account system - Free (copy only) and Pro (DOCX/PDF downloads)
- **NEW**: PostgreSQL database with user accounts and session management
- **NEW**: Account tier enforcement on both frontend and backend
- **NEW**: Professional landing page with pricing tiers display
- **NEW**: Intelligent resume parser extracts structured data (contact, sections, jobs, education)
- **NEW**: Professional and Modern resume formats with DOCX and PDF export
- Document generation using `docx` library for DOCX files and PDFKit for PDF files
- Free accounts: Copy to clipboard, TXT download, unlimited AI tailoring
- Pro accounts: All features plus DOCX and PDF downloads in Professional and Modern formats
- Ready for Stripe integration for subscription payments (Phase 2)

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
- Replit Auth via OpenID Connect (Passport.js + openid-client)
- Session management with PostgreSQL session store
- Authentication middleware protecting all routes
- Account tier-based access control (free/pro)

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
- PostgreSQL database via Neon serverless adapter
- Drizzle ORM for type-safe database access
- User accounts with authentication via Replit Auth
- Resume sessions linked to user accounts
- Persistent storage with proper data relationships

**Data Schema**
- **users** table: id, email, firstName, lastName, profileImageUrl, accountTier (free/pro), createdAt, updatedAt
- **resumeSessions** table: id, userId (FK), fileName, originalContent, jobDescription, tailoredContent, createdAt
- **sessions** table: PostgreSQL session store for Replit Auth (sid, sess, expire)
- Type-safe access through Drizzle ORM and TypeScript interfaces

**Database Operations**
- DatabaseStorage class implements all CRUD operations
- User operations: getUser, upsertUser (auto-create on first login)
- Resume operations: createResumeSession, getResumeSession, updateResumeSession, getUserResumeSessions
- Cascade delete: deleting a user removes all their resume sessions
- Schema synchronization via `npm run db:push`

### Security Considerations

**Authentication & Authorization**
- Replit Auth (OpenID Connect) for secure user authentication
- Session cookies with httpOnly flag and environment-based secure flag
- All API endpoints protected with isAuthenticated middleware
- Resume sessions verified to belong to requesting user
- Account tier checked before allowing premium downloads

**Data Protection**
- Session data encrypted and stored in PostgreSQL
- Automatic token refresh for expired sessions
- Users can only access their own resume sessions
- File uploads limited to 10MB
- File type validation (PDF and DOCX only)

**Removed/Mitigated Vulnerabilities**
- URL extraction feature removed to prevent SSRF vulnerabilities
- Input validation with Zod schemas
- Proper error handling with 401/403 status codes
- No server-side file storage (files processed in memory only)

**Future Considerations**
- Stripe integration for payment processing (Phase 2)
- Rate limiting per user account
- Content sanitization for AI-generated text

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