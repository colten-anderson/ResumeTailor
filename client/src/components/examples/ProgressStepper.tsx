import ProgressStepper from '../ProgressStepper'

export default function ProgressStepperExample() {
  const steps = [
    { id: 1, label: 'Upload Resume' },
    { id: 2, label: 'Add Job Details' },
    { id: 3, label: 'AI Tailoring' },
    { id: 4, label: 'Download' },
  ];

  return <ProgressStepper steps={steps} currentStep={2} />
}
