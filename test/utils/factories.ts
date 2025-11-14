import type { User, ResumeSession } from '@shared/schema';

export const createMockUser = (overrides: Partial<User> = {}): User => ({
  id: 1,
  username: 'testuser',
  email: 'test@example.com',
  fullName: 'Test User',
  accountType: 'free',
  createdAt: new Date(),
  ...overrides,
});

export const createMockResumeSession = (overrides: Partial<ResumeSession> = {}): ResumeSession => ({
  id: 1,
  userId: 1,
  originalResume: 'Original resume content',
  tailoredResume: 'Tailored resume content',
  jobDescription: 'Job description',
  createdAt: new Date(),
  ...overrides,
});

export const sampleResumeText = `
John Doe
john.doe@example.com | (555) 123-4567 | linkedin.com/in/johndoe

SUMMARY
Experienced software engineer with 5 years of full-stack development expertise.

WORK EXPERIENCE
Senior Software Engineer | Tech Corp | Jan 2020 - Present
- Developed scalable web applications using React and Node.js
- Led a team of 4 engineers in delivering critical features
- Improved application performance by 40%

Software Engineer | StartupXYZ | Jun 2018 - Dec 2019
- Built RESTful APIs using Express.js and PostgreSQL
- Implemented authentication and authorization systems
- Collaborated with cross-functional teams

EDUCATION
Bachelor of Science in Computer Science
University of Technology | 2014 - 2018

SKILLS
JavaScript, TypeScript, React, Node.js, Express, PostgreSQL, MongoDB, Git, Docker, AWS
`;

export const sampleJobDescription = `
We are looking for a Senior Full-Stack Engineer to join our team.

Requirements:
- 5+ years of experience with JavaScript and TypeScript
- Strong expertise in React and Node.js
- Experience with PostgreSQL and database design
- Familiarity with cloud platforms (AWS, Azure, or GCP)
- Excellent problem-solving skills

Responsibilities:
- Design and implement scalable web applications
- Collaborate with product and design teams
- Mentor junior engineers
- Optimize application performance
`;
