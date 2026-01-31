import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { PrinterMaterial as PrinterMaterialType } from '../types/index.ts';
import { getSessionModelInput, generateId } from '../services/storage.ts';
import { assessRisk } from '../services/riskAssessment.ts';
import { generatePrintPlan } from '../services/printPlanGenerator.ts';
import { ProgressStepper } from '../components/ProgressStepper.tsx';
import { BED_SIZE_PRESETS } from '../utils/constants.ts';

export const PrinterMaterial = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<PrinterMaterialType>({
    printerType: 'FDM',
    nozzleSize: 0.4,
    material: 'PLA',
    layerHeight: 0.2,
    supportsAllowed: true,
    priority: 'quality',
  });
  const [selectedPreset, setSelectedPreset] = useState<string>('');

  useEffect(() => {
    // Check if model input exists
    const modelInput = getSessionModelInput();
    if (!modelInput) {
      alert('Please complete Step 1 first');
      navigate('/assess/model');
    }
  }, [navigate]);

  const handlePresetChange = (preset: string) => {
    setSelectedPreset(preset);
    if (preset && preset in BED_SIZE_PRESETS) {
      setFormData({
        ...formData,
        bedSize: BED_SIZE_PRESETS[preset as keyof typeof BED_SIZE_PRESETS],
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Get model input from session
    const modelInput = getSessionModelInput();
    if (!modelInput) {
      alert('Model input not found. Please start from Step 1.');
      navigate('/assess/model');
      return;
    }

    // Run risk assessment
    const { riskLevel, confidence, riskFactors } = assessRisk(modelInput, formData);

    // Generate print plan
    const printPlan = generatePrintPlan(modelInput, formData, riskLevel);

    // Create assessment object
    const assessment = {
      id: generateId(),
      timestamp: Date.now(),
      modelInput,
      printerMaterial: formData,
      riskLevel,
      confidence,
      riskFactors,
      printPlan,
    };

    // Save to localStorage (will be saved formally from Results page)
    sessionStorage.setItem('current-assessment', JSON.stringify(assessment));

    // Navigate to results
    navigate(`/results/${assessment.id}`);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <ProgressStepper currentStep={2} />

      <div className="bg-white rounded-lg shadow-md p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Step 2: Printer & Material Setup</h1>
        <p className="text-gray-600 mb-8">
          Provide your printer specifications and material settings.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Printer Setup */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Printer Type
              </label>
              <input
                type="text"
                value={formData.printerType}
                disabled
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
              />
              <p className="text-xs text-gray-500 mt-1">FDM printers only (currently)</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nozzle Size (mm) <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={formData.nozzleSize}
                onChange={(e) => setFormData({ ...formData, nozzleSize: parseFloat(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value={0.2}>0.2mm</option>
                <option value={0.4}>0.4mm (standard)</option>
                <option value={0.6}>0.6mm</option>
                <option value={0.8}>0.8mm</option>
                <option value={1.0}>1.0mm</option>
              </select>
            </div>
          </div>

          {/* Bed Size */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bed Size Preset (optional)
            </label>
            <select
              value={selectedPreset}
              onChange={(e) => handlePresetChange(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4"
            >
              <option value="">Select a preset or enter manually below</option>
              {Object.keys(BED_SIZE_PRESETS).map((preset) => (
                <option key={preset} value={preset}>
                  {preset}
                </option>
              ))}
            </select>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={formData.bedSize?.x || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      bedSize: {
                        ...formData.bedSize,
                        x: parseFloat(e.target.value) || 0,
                        y: formData.bedSize?.y || 0,
                        z: formData.bedSize?.z || 0,
                      },
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="X (mm)"
                />
              </div>
              <div>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={formData.bedSize?.y || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      bedSize: {
                        ...formData.bedSize,
                        x: formData.bedSize?.x || 0,
                        y: parseFloat(e.target.value) || 0,
                        z: formData.bedSize?.z || 0,
                      },
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Y (mm)"
                />
              </div>
              <div>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={formData.bedSize?.z || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      bedSize: {
                        ...formData.bedSize,
                        x: formData.bedSize?.x || 0,
                        y: formData.bedSize?.y || 0,
                        z: parseFloat(e.target.value) || 0,
                      },
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Z (mm)"
                />
              </div>
            </div>
          </div>

          {/* Material & Settings */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Material <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={formData.material}
                onChange={(e) => setFormData({ ...formData, material: e.target.value as any })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="PLA">PLA</option>
                <option value="PLA+">PLA+</option>
                <option value="PETG">PETG</option>
                <option value="ABS">ABS</option>
                <option value="Nylon">Nylon</option>
                <option value="TPU">TPU (Flexible)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Layer Height (mm) <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={formData.layerHeight}
                onChange={(e) => setFormData({ ...formData, layerHeight: parseFloat(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value={0.12}>0.12mm (High quality)</option>
                <option value={0.16}>0.16mm</option>
                <option value={0.2}>0.20mm (Standard)</option>
                <option value={0.28}>0.28mm (Fast)</option>
                <option value={0.32}>0.32mm</option>
              </select>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Supports Allowed? <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={formData.supportsAllowed ? 'yes' : 'no'}
                onChange={(e) => setFormData({ ...formData, supportsAllowed: e.target.value === 'yes' })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="quality">Quality (slower, better finish)</option>
                <option value="strength">Strength (balanced)</option>
                <option value="speed">Speed (faster, less detail)</option>
              </select>
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-6">
            <button
              type="button"
              onClick={() => navigate('/assess/model')}
              className="text-gray-600 font-medium hover:text-gray-900 transition-colors"
            >
              ← Back to Model Details
            </button>
            <button
              type="submit"
              className="bg-blue-600 text-white font-bold px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Generate Results →
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
