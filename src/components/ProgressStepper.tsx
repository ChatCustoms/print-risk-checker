interface ProgressStepperProps {
  currentStep: 1 | 2 | 3;
}

export const ProgressStepper = ({ currentStep }: ProgressStepperProps) => {
  const steps = [
    { number: 1, label: 'Model Details' },
    { number: 2, label: 'Printer Setup' },
    { number: 3, label: 'Results' },
  ];

  return (
    <div className="flex items-center justify-center space-x-4 mb-8">
      {steps.map((step, index) => (
        <div key={step.number} className="flex items-center">
          {/* Step Circle */}
          <div className="flex flex-col items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-colors ${
                step.number === currentStep
                  ? 'bg-blue-600 text-white'
                  : step.number < currentStep
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-300 text-gray-600'
              }`}
            >
              {step.number < currentStep ? '✓' : step.number}
            </div>
            <span
              className={`mt-2 text-sm font-medium ${
                step.number === currentStep ? 'text-blue-600' : 'text-gray-600'
              }`}
            >
              {step.label}
            </span>
          </div>

          {/* Connector Line */}
          {index < steps.length - 1 && (
            <div
              className={`w-16 h-1 mx-2 ${
                step.number < currentStep ? 'bg-green-500' : 'bg-gray-300'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
};
