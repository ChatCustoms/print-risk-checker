import { Link } from 'react-router-dom';

export const Home = () => {
  return (
    <div className="bg-gradient-to-b from-blue-50 to-white">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <div className="text-6xl mb-6">🖨️</div>
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Print Risk Checker
          </h1>
          <p className="text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Check print risk and generate a print plan before you waste time and material
          </p>
          <Link
            to="/assess/model"
            className="inline-block bg-blue-600 text-white font-bold text-lg px-8 py-4 rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
          >
            Start Assessment
          </Link>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-4xl mb-4">⚠️</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Risk Scoring
            </h3>
            <p className="text-gray-600">
              Get clear Low / Medium / High risk ratings based on your model geometry and print settings
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-4xl mb-4">📋</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Print Plan
            </h3>
            <p className="text-gray-600">
              Receive specific recommendations for orientation, supports, speeds, and material settings
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-4xl mb-4">📄</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Downloadable Report
            </h3>
            <p className="text-gray-600">
              Export your assessment as a professional PDF or Markdown report to share or reference
            </p>
          </div>
        </div>
      </div>

      {/* Example Output Section */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Example Risk Factors
          </h2>
          <div className="bg-white rounded-lg shadow-md p-8 max-w-2xl mx-auto">
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <span className="bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">HIGH</span>
                <p className="text-gray-700 flex-1">
                  Tall part with small footprint → high wobble/layer shift risk
                </p>
              </div>
              <div className="flex items-start space-x-3">
                <span className="bg-yellow-500 text-white px-2 py-1 rounded text-xs font-bold">MEDIUM</span>
                <p className="text-gray-700 flex-1">
                  Functional part + PLA → limited strength and heat resistance
                </p>
              </div>
              <div className="flex items-start space-x-3">
                <span className="bg-green-500 text-white px-2 py-1 rounded text-xs font-bold">LOW</span>
                <p className="text-gray-700 flex-1">
                  Model appears well-suited for printing with current settings
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">
          Ready to check your print?
        </h2>
        <Link
          to="/assess/model"
          className="inline-block bg-blue-600 text-white font-bold text-lg px-8 py-4 rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
        >
          Start Assessment
        </Link>
      </div>
    </div>
  );
};
