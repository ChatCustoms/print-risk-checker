import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ModelInput as ModelInputType } from '../types/index.ts';
import { saveSessionModelInput } from '../services/storage.ts';
import { ProgressStepper } from '../components/ProgressStepper.tsx';

export const ModelInput = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<ModelInputType>({
    modelName: '',
    modelLink: '',
    intendedUse: 'decorative',
    fileType: 'STL',
    units: 'mm',
    boundingBox: { x: 0, y: 0, z: 0 },
    minWallThickness: 'unknown',
    smallestFeature: 'unknown',
    flatBase: 'unknown',
    overhangs: 'unknown',
    bridges: 'unknown',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.modelName || formData.boundingBox.x === 0 || formData.boundingBox.y === 0 || formData.boundingBox.z === 0) {
      alert('Please fill in the required fields: Model Name and Bounding Box dimensions');
      return;
    }

    // Save to session storage
    saveSessionModelInput(formData);

    // Navigate to next step
    navigate('/assess/printer');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <ProgressStepper currentStep={1} />

      <div className="bg-white rounded-lg shadow-md p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Step 1: Model Details</h1>
        <p className="text-gray-600 mb-8">
          Provide information about the 3D model you want to print.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Model Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.modelName}
                onChange={(e) => setFormData({ ...formData, modelName: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Dragon Figurine"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Model Link (optional)
              </label>
              <input
                type="url"
                value={formData.modelLink}
                onChange={(e) => setFormData({ ...formData, modelLink: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://thingiverse.com/..."
              />
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Intended Use <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={formData.intendedUse}
                onChange={(e) => setFormData({ ...formData, intendedUse: e.target.value as any })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="decorative">Decorative</option>
                <option value="functional">Functional</option>
                <option value="fit-critical">Fit-critical</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                File Type (optional)
              </label>
              <select
                value={formData.fileType}
                onChange={(e) => setFormData({ ...formData, fileType: e.target.value as any })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="STL">STL</option>
                <option value="OBJ">OBJ</option>
                <option value="3MF">3MF</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Units (optional)
              </label>
              <select
                value={formData.units}
                onChange={(e) => setFormData({ ...formData, units: e.target.value as any })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="mm">mm</option>
                <option value="in">inches</option>
              </select>
            </div>
          </div>

          {/* Dimensions */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bounding Box (mm) <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.1"
                  value={formData.boundingBox.x || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      boundingBox: { ...formData.boundingBox, x: parseFloat(e.target.value) || 0 },
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="X (width)"
                />
              </div>
              <div>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.1"
                  value={formData.boundingBox.y || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      boundingBox: { ...formData.boundingBox, y: parseFloat(e.target.value) || 0 },
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Y (depth)"
                />
              </div>
              <div>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.1"
                  value={formData.boundingBox.z || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      boundingBox: { ...formData.boundingBox, z: parseFloat(e.target.value) || 0 },
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Z (height)"
                />
              </div>
            </div>
          </div>

          {/* Geometry Details */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Min Wall Thickness (mm)
              </label>
              <input
                type="number"
                min="0"
                step="0.1"
                value={formData.minWallThickness === 'unknown' ? '' : formData.minWallThickness}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    minWallThickness: e.target.value ? parseFloat(e.target.value) : 'unknown',
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Leave blank if unknown"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Smallest Feature Size (mm)
              </label>
              <input
                type="number"
                min="0"
                step="0.1"
                value={formData.smallestFeature === 'unknown' ? '' : formData.smallestFeature}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    smallestFeature: e.target.value ? parseFloat(e.target.value) : 'unknown',
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Leave blank if unknown"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Flat Base?
              </label>
              <select
                value={formData.flatBase}
                onChange={(e) => setFormData({ ...formData, flatBase: e.target.value as any })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="unknown">Unknown</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Overhangs Expected?
              </label>
              <select
                value={formData.overhangs}
                onChange={(e) => setFormData({ ...formData, overhangs: e.target.value as any })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="unknown">Unknown</option>
                <option value="none">None</option>
                <option value="some">Some</option>
                <option value="many">Many</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bridges Expected?
              </label>
              <select
                value={formData.bridges}
                onChange={(e) => setFormData({ ...formData, bridges: e.target.value as any })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="unknown">Unknown</option>
                <option value="none">None</option>
                <option value="some">Some</option>
                <option value="many">Many</option>
              </select>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-6">
            <button
              type="submit"
              className="bg-blue-600 text-white font-bold px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Next: Printer Setup →
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
