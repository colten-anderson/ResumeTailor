import ResumeDisplay from '../ResumeDisplay'

export default function ResumeDisplayExample() {
  const sampleContent = `JOHN DOE
Senior Software Engineer

CONTACT
Email: john.doe@email.com
Phone: (555) 123-4567
LinkedIn: linkedin.com/in/johndoe

EXPERIENCE
Senior Software Engineer | Tech Corp
2020 - Present
• Led development of microservices architecture
• Improved system performance by 40%
• Mentored team of 5 junior developers

Software Engineer | StartupXYZ
2018 - 2020
• Built scalable web applications
• Implemented CI/CD pipelines

SKILLS
Languages: JavaScript, Python, Java
Frameworks: React, Node.js, Django
Tools: Docker, Kubernetes, AWS`;

  return <ResumeDisplay content={sampleContent} title="Original Resume" />
}
