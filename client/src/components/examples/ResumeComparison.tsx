import ResumeComparison from '../ResumeComparison'

export default function ResumeComparisonExample() {
  const original = `JOHN DOE
Senior Software Engineer

EXPERIENCE
Senior Software Engineer | Tech Corp
2020 - Present
• Led development projects
• Improved performance`;

  const tailored = `JOHN DOE
Senior Software Engineer

EXPERIENCE
Senior Software Engineer | Tech Corp
2020 - Present
• Led development of cloud-based microservices
• Optimized system performance by 40% using AWS
• Implemented containerized deployments with Docker`;

  return <ResumeComparison originalContent={original} tailoredContent={tailored} />
}
