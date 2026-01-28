import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Assessment } from '../types/index.ts';
import { getAssessmentById } from '../services/storage.ts';
import { downloadMarkdownReport, generatePDFReport } from '../services/reportGenerator.ts';
import { countUnknowns } from '../services/riskAssessment.ts';
import { RiskBadge } from '../components/RiskBadge.tsx';
import { ConfidenceMeter } from '../components/ConfidenceMeter.tsx';
import { PrintPlanCard } from '../components/PrintPlanCard.tsx';

export const ReportDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) {
      setNotFound(true);
      return;
    }

    const data = getAssessmentById(id);
    if (!data) {
      setNotFound(true);
      return;
    }

    setAssessment(data);
  }, [id]);

  const handleDownloadMarkdown = () => {
    if (!assessment) return;
    downloadMarkdownReport(assessment);
  };

  const handleDownloadPDF = () => {
    if (!assessment) return;
    generatePDFReport(assessment);
  };

  if (notFound) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Assessment Not Found</h1>
          <p className="text-gray-600 mb-6">
            The requested assessment could not be found. It may have been deleted.
          </p>
          <Link
            to="/history"
            className="inline-block bg-blue-600 text-white font-bold px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            ← Back to History
          </Link>
        </div>
      </div>
    );
  }

  if (!assessment) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <p className="text-center text-gray-500">Loading assessment...</p>
      </div>
    );
  }

  const unknownCount = countUnknowns(assessment.modelInput);
  const formattedDate = new Date(assessment.timestamp).toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-8">
        <Link to="/history" className="text-blue-600 hover:underline mb-4 inline-block">
          ← Back to History
        </Link>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {assessment.modelInput.modelName}
          </h1>
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <span>Assessment ID: {assessment.id}</span>
            <span>•</span>
            <span>{formattedDate}</span>
          </div>
        </div>
      </div>

      {/* Risk Assessment */}
      <div className="bg-white rounded-lg shadow-md p-8 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Risk Assessment</h2>
        <div className="flex items-center space-x-6 mb-6">
          <RiskBadge level={assessment.riskLevel} size="large" />
          <div className="flex-1">
            <ConfidenceMeter level={assessment.confidence} unknownCount={unknownCount} />
          </div>
        </div>

        {/* Risk Factors */}
        <h3 className="text-xl font-bold text-gray-900 mb-4">Risk Factors</h3>
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

      {/* Print Plan */}
      <div className="bg-white rounded-lg shadow-md p-8 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Recommended Print Plan</h2>
        <div className="grid md:grid-cols-2 gap-6 mb-6">
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

        {/* Pre-Flight Checklist */}
        <h3 className="text-xl font-bold text-gray-900 mb-4">Pre-Flight Checklist</h3>
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

      {/* Model & Printer Info */}
      <div className="bg-white rounded-lg shadow-md p-8 mb-8">
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

      {/* Export Buttons */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-wrap gap-4">
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
          <Link
            to="/assess/model"
            className="bg-blue-600 text-white font-bold px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors ml-auto"
          >
            🔄 Run New Assessment
          </Link>
        </div>
      </div>
    </div>
  );
};
