import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Assessment } from '../types/index.ts';
import { getAllAssessments, deleteAssessment } from '../services/storage.ts';
import { RiskBadge } from '../components/RiskBadge.tsx';

export const History = () => {
  const [assessments, setAssessments] = useState<Assessment[]>([]);

  useEffect(() => {
    loadAssessments();
  }, []);

  const loadAssessments = () => {
    const data = getAllAssessments();
    setAssessments(data);
  };

  const handleDelete = (id: string, modelName: string) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete the assessment for "${modelName}"?`
    );
    if (confirmed) {
      deleteAssessment(id);
      loadAssessments();
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Assessment History</h1>
        <p className="text-gray-600">
          View and manage your saved print risk assessments
        </p>
      </div>

      {assessments.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <div className="text-6xl mb-4">📋</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">No Saved Assessments</h2>
          <p className="text-gray-600 mb-6">
            You haven't saved any assessments yet. Run an assessment and save it to see it here.
          </p>
          <Link
            to="/assess/model"
            className="inline-block bg-blue-600 text-white font-bold px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Start New Assessment
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {assessments.map((assessment) => (
            <div
              key={assessment.id}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-4 mb-2">
                    <h2 className="text-xl font-bold text-gray-900">
                      {assessment.modelInput.modelName}
                    </h2>
                    <RiskBadge level={assessment.riskLevel} size="small" />
                  </div>

                  <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-600 mb-4">
                    <div>
                      <span className="font-medium">Material:</span>{' '}
                      {assessment.printerMaterial.material}
                    </div>
                    <div>
                      <span className="font-medium">Use:</span>{' '}
                      {assessment.modelInput.intendedUse}
                    </div>
                    <div>
                      <span className="font-medium">Date:</span>{' '}
                      {formatDate(assessment.timestamp)}
                    </div>
                  </div>

                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Dimensions:</span>{' '}
                    {assessment.modelInput.boundingBox.x} ×{' '}
                    {assessment.modelInput.boundingBox.y} ×{' '}
                    {assessment.modelInput.boundingBox.z} mm
                  </div>

                  {assessment.riskFactors.length > 0 && (
                    <div className="mt-3">
                      <span className="text-xs font-medium text-gray-700">Top Risk: </span>
                      <span className="text-xs text-gray-600">
                        {assessment.riskFactors[0].message}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex flex-col space-y-2 ml-6">
                  <Link
                    to={`/report/${assessment.id}`}
                    className="bg-blue-600 text-white font-medium px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-center text-sm"
                  >
                    View Details
                  </Link>
                  <button
                    onClick={() =>
                      handleDelete(assessment.id, assessment.modelInput.modelName)
                    }
                    className="bg-red-600 text-white font-medium px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {assessments.length > 0 && (
        <div className="mt-8 text-center">
          <Link
            to="/assess/model"
            className="inline-block bg-blue-600 text-white font-bold px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            + New Assessment
          </Link>
        </div>
      )}
    </div>
  );
};
