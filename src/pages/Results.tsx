import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Assessment } from '../types/index.ts';
import { saveAssessment, clearSessionData } from '../services/storage.ts';
import { downloadMarkdownReport, generatePDFReport } from '../services/reportGenerator.ts';
import { countUnknowns } from '../services/riskAssessment.ts';
import { RiskBadge } from '../components/RiskBadge.tsx';
import { ConfidenceMeter } from '../components/ConfidenceMeter.tsx';
import { PrintPlanCard } from '../components/PrintPlanCard.tsx';
import { ProgressStepper } from '../components/ProgressStepper.tsx';

export const Results = () => {
  const navigate = useNavigate();
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    // Load assessment from session storage
    const stored = sessionStorage.getItem('current-assessment');
    if (!stored) {
      alert('No assessment found. Please complete the assessment form.');
      navigate('/assess/model');
      return;
    }

    const data = JSON.parse(stored) as Assessment;
    setAssessment(data);
  }, [navigate]);

  const handleSave = () => {
    if (!assessment) return;

    saveAssessment(assessment);
    setIsSaved(true);
    alert('Assessment saved to history!');
  };

  const handleDownloadMarkdown = () => {
    if (!assessment) return;
    downloadMarkdownReport(assessment);
  };

  const handleDownloadPDF = () => {
    if (!assessment) return;
    generatePDFReport(assessment);
  };

  const handleNewAssessment = () => {
    clearSessionData();
    sessionStorage.removeItem('current-assessment');
    navigate('/assess/model');
  };

  if (!assessment) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <p className="text-center text-gray-500">Loading assessment...</p>
      </div>
    );
  }

  const unknownCount = countUnknowns(assessment.modelInput);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <ProgressStepper currentStep={3} />

      <div className="bg-white rounded-lg shadow-md p-8 mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Assessment Results</h1>

        {/* A) Risk Rating */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Overall Risk Assessment</h2>
          <div className="flex items-center space-x-6 mb-6">
            <RiskBadge level={assessment.riskLevel} size="large" />
            <div className="flex-1">
              <ConfidenceMeter level={assessment.confidence} unknownCount={unknownCount} />
            </div>
          </div>
        </div>

        {/* B) Risk Factors */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Risk Factors</h2>
          {assessment.riskFactors.length === 0 ? (
            <p className="text-gray-600">No significant risks identified.</p>
          ) : (
            <div className="space-y-4">
              {assessment.riskFactors.map((factor, index) => (
                <div
                  key={index}
                  className="bg-gray-50 rounded-lg p-4 border-l-4"
                  style={{
                    borderColor:
                      factor.severity === 'high'
                        ? '#ef4444'
                        : factor.severity === 'medium'
                        ? '#eab308'
                        : '#22c55e',
                  }}
                >
                  <div className="flex items-start space-x-3">
                    <span
                      className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                        factor.severity === 'high'
                          ? 'bg-red-500 text-white'
                          : factor.severity === 'medium'
                          ? 'bg-yellow-500 text-white'
                          : 'bg-green-500 text-white'
                      }`}
                    >
                      {factor.severity}
                    </span>
                    <div className="flex-1">
                      <p className="text-gray-900 font-medium">{factor.message}</p>
                      {factor.mitigation && (
                        <p className="text-sm text-gray-600 mt-2">
                          <span className="font-medium">Mitigation:</span> {factor.mitigation}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* C) Print Plan */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Recommended Print Plan</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <PrintPlanCard icon="🔄" title="Orientation">
              <p>{assessment.printPlan.orientation}</p>
            </PrintPlanCard>

            <PrintPlanCard icon="🏗️" title="Supports">
              <p className="font-medium mb-2">
                {assessment.printPlan.supports.enabled ? 'Enabled' : 'Disabled'}
              </p>
              <p className="text-sm">{assessment.printPlan.supports.details}</p>
            </PrintPlanCard>

            <PrintPlanCard icon="⚙️" title="Print Settings">
              <div className="space-y-1 text-sm">
                <p>
                  <span className="font-medium">Walls:</span> {assessment.printPlan.walls}
                </p>
                <p>
                  <span className="font-medium">Infill:</span>{' '}
                  {assessment.printPlan.infill.percentage}% {assessment.printPlan.infill.pattern}
                </p>
                <p>
                  <span className="font-medium">Adhesion:</span>{' '}
                  {assessment.printPlan.adhesion === 'none'
                    ? 'None required'
                    : assessment.printPlan.adhesion.charAt(0).toUpperCase() +
                      assessment.printPlan.adhesion.slice(1)}
                </p>
              </div>
            </PrintPlanCard>

            <PrintPlanCard icon="⚡" title="Speed & Material">
              <div className="space-y-2 text-sm">
                <p>{assessment.printPlan.speedNotes}</p>
                <p className="text-gray-600">{assessment.printPlan.materialNotes}</p>
              </div>
            </PrintPlanCard>
          </div>
        </div>

        {/* D) Pre-Flight Checklist */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Pre-Flight Checklist</h2>
          <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
            <ul className="space-y-2">
              {assessment.printPlan.mitigationChecklist.map((item, index) => (
                <li key={index} className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    className="mt-1 w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-gray-900">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 pt-6 border-t border-gray-200">
          <button
            onClick={handleDownloadMarkdown}
            className="bg-green-600 text-white font-bold px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
          >
            📄 Download Markdown
          </button>
          <button
            onClick={handleDownloadPDF}
            className="bg-red-600 text-white font-bold px-6 py-3 rounded-lg hover:bg-red-700 transition-colors"
          >
            📑 Download PDF
          </button>
          <button
            onClick={handleSave}
            disabled={isSaved}
            className={`font-bold px-6 py-3 rounded-lg transition-colors ${
              isSaved
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isSaved ? '✓ Saved to History' : '💾 Save Assessment'}
          </button>
          <button
            onClick={handleNewAssessment}
            className="bg-gray-600 text-white font-bold px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors ml-auto"
          >
            🔄 Run Another Assessment
          </button>
        </div>
      </div>

      {/* Model & Printer Info Summary */}
      <div className="bg-white rounded-lg shadow-md p-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Assessment Details</h2>
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h3 className="font-bold text-gray-900 mb-2">Model Information</h3>
            <dl className="text-sm space-y-1">
              <div>
                <dt className="inline font-medium">Name:</dt>
                <dd className="inline ml-2">{assessment.modelInput.modelName}</dd>
              </div>
              {assessment.modelInput.modelLink && (
                <div>
                  <dt className="inline font-medium">Link:</dt>
                  <dd className="inline ml-2">
                    <a
                      href={assessment.modelInput.modelLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      View Model
                    </a>
                  </dd>
                </div>
              )}
              <div>
                <dt className="inline font-medium">Use:</dt>
                <dd className="inline ml-2">{assessment.modelInput.intendedUse}</dd>
              </div>
              <div>
                <dt className="inline font-medium">Dimensions:</dt>
                <dd className="inline ml-2">
                  {assessment.modelInput.boundingBox.x} × {assessment.modelInput.boundingBox.y} ×{' '}
                  {assessment.modelInput.boundingBox.z} mm
                </dd>
              </div>
            </dl>
          </div>

          <div>
            <h3 className="font-bold text-gray-900 mb-2">Printer & Material</h3>
            <dl className="text-sm space-y-1">
              <div>
                <dt className="inline font-medium">Material:</dt>
                <dd className="inline ml-2">{assessment.printerMaterial.material}</dd>
              </div>
              <div>
                <dt className="inline font-medium">Nozzle:</dt>
                <dd className="inline ml-2">{assessment.printerMaterial.nozzleSize}mm</dd>
              </div>
              <div>
                <dt className="inline font-medium">Layer Height:</dt>
                <dd className="inline ml-2">{assessment.printerMaterial.layerHeight}mm</dd>
              </div>
              <div>
                <dt className="inline font-medium">Priority:</dt>
                <dd className="inline ml-2">{assessment.printerMaterial.priority}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
};
