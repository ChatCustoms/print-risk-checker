import { ModelInput, PrinterMaterial, RiskFactor, RiskLevel, ConfidenceLevel } from '../types/index.ts';
import { RISK_THRESHOLDS, MATERIAL_PROPERTIES } from '../utils/constants.ts';

// Count unknown fields in model input
export const countUnknowns = (model: ModelInput): number => {
  let count = 0;
  if (model.minWallThickness === 'unknown') count++;
  if (model.smallestFeature === 'unknown') count++;
  if (model.flatBase === 'unknown') count++;
  if (model.overhangs === 'unknown') count++;
  if (model.bridges === 'unknown') count++;
  return count;
};

// Calculate confidence level based on unknowns
export const calculateConfidence = (unknownCount: number): ConfidenceLevel => {
  if (unknownCount >= RISK_THRESHOLDS.UNKNOWN_COUNT_LOW_CONFIDENCE) return 'low';
  if (unknownCount >= RISK_THRESHOLDS.UNKNOWN_COUNT_MEDIUM_CONFIDENCE) return 'medium';
  return 'high';
};

// Assess geometry risks
const assessGeometryRisks = (
  model: ModelInput,
  printer: PrinterMaterial,
  riskFactors: RiskFactor[]
): number => {
  let score = 0;

  // Check tall + small footprint (wobble risk)
  const footprint = Math.min(model.boundingBox.x, model.boundingBox.y);
  const aspectRatio = model.boundingBox.z / footprint;

  if (aspectRatio > RISK_THRESHOLDS.TALL_SMALL_RATIO && footprint < RISK_THRESHOLDS.SMALL_FOOTPRINT_MM) {
    riskFactors.push({
      severity: 'high',
      category: 'geometry',
      message: `Tall part (${model.boundingBox.z}mm) with small footprint (${footprint}mm) → high wobble/layer shift risk`,
      mitigation: 'Use brim for better adhesion, reduce print speed, enable supports if needed',
    });
    score += 3;
  } else if (aspectRatio > RISK_THRESHOLDS.TALL_SMALL_RATIO) {
    riskFactors.push({
      severity: 'medium',
      category: 'geometry',
      message: `Tall part with aspect ratio ${aspectRatio.toFixed(1)}:1 → moderate stability risk`,
      mitigation: 'Consider adding brim for stability',
    });
    score += 2;
  }

  // Check wall thickness
  if (typeof model.minWallThickness === 'number') {
    const minRecommended = printer.nozzleSize * RISK_THRESHOLDS.THIN_WALL_MULTIPLIER;
    if (model.minWallThickness < printer.nozzleSize) {
      riskFactors.push({
        severity: 'high',
        category: 'geometry',
        message: `Minimum wall thickness (${model.minWallThickness}mm) < nozzle size (${printer.nozzleSize}mm) → unprintable`,
        mitigation: 'Increase wall thickness in CAD or use smaller nozzle',
      });
      score += 3;
    } else if (model.minWallThickness < minRecommended) {
      riskFactors.push({
        severity: 'medium',
        category: 'geometry',
        message: `Thin walls (${model.minWallThickness}mm) detected → fragility risk`,
        mitigation: `Recommended minimum: ${minRecommended.toFixed(1)}mm for ${printer.nozzleSize}mm nozzle`,
      });
      score += 2;
    }
  }

  // Check flat base
  if (model.flatBase === 'no') {
    riskFactors.push({
      severity: 'medium',
      category: 'geometry',
      message: 'No flat base → adhesion and stability risk',
      mitigation: 'Use brim or raft, consider reorienting the model',
    });
    score += 2;
  }

  // Check overhangs
  if ((model.overhangs === 'many' || model.overhangs === 'some') && !printer.supportsAllowed) {
    const severity = model.overhangs === 'many' ? 'high' : 'medium';
    riskFactors.push({
      severity,
      category: 'settings',
      message: `${model.overhangs === 'many' ? 'Many' : 'Some'} overhangs detected but supports disabled → surface quality/failure risk`,
      mitigation: 'Enable supports or reorient model to minimize overhangs',
    });
    score += severity === 'high' ? 3 : 2;
  } else if (model.overhangs === 'many') {
    riskFactors.push({
      severity: 'low',
      category: 'geometry',
      message: 'Many overhangs detected → supports will be required',
      mitigation: 'Ensure support settings are properly configured',
    });
    score += 1;
  }

  // Check bridges
  if (model.bridges === 'many') {
    riskFactors.push({
      severity: 'medium',
      category: 'geometry',
      message: 'Many bridges detected → cooling and speed critical',
      mitigation: 'Increase cooling, reduce speed for bridges, test bridge settings first',
    });
    score += 2;
  }

  // Check part size vs bed
  if (printer.bedSize) {
    const fitsX = model.boundingBox.x <= printer.bedSize.x;
    const fitsY = model.boundingBox.y <= printer.bedSize.y;
    const fitsZ = model.boundingBox.z <= printer.bedSize.z;

    if (!fitsX || !fitsY || !fitsZ) {
      riskFactors.push({
        severity: 'high',
        category: 'printer',
        message: `Model (${model.boundingBox.x}×${model.boundingBox.y}×${model.boundingBox.z}mm) exceeds bed size → cannot print`,
        mitigation: 'Split model into smaller parts or use larger printer',
      });
      score += 3;
    }
  }

  // Check large part warping risk
  const largestDimension = Math.max(model.boundingBox.x, model.boundingBox.y);
  if (largestDimension > RISK_THRESHOLDS.LARGE_PART_THRESHOLD) {
    if (printer.material === 'ABS' || printer.material === 'Nylon') {
      riskFactors.push({
        severity: 'high',
        category: 'material',
        message: `Large ${printer.material} part (${largestDimension}mm) → high warping risk`,
        mitigation: 'Use enclosure, brim/raft, heated bed, and slow cooling',
      });
      score += 3;
    } else {
      riskFactors.push({
        severity: 'low',
        category: 'geometry',
        message: `Large part (${largestDimension}mm) → monitor first layer adhesion`,
        mitigation: 'Consider using brim for better adhesion',
      });
      score += 1;
    }
  }

  return score;
};

// Assess material risks
const assessMaterialRisks = (
  model: ModelInput,
  printer: PrinterMaterial,
  riskFactors: RiskFactor[]
): number => {
  let score = 0;
  const materialInfo = MATERIAL_PROPERTIES[printer.material];

  // Check material vs use case
  if (model.intendedUse === 'functional') {
    if (printer.material === 'PLA') {
      riskFactors.push({
        severity: 'medium',
        category: 'material',
        message: 'Functional part + PLA → limited strength and heat resistance (~60°C)',
        mitigation: 'Consider PETG, ABS, or Nylon for functional parts',
      });
      score += 2;
    }
    if (printer.material === 'TPU') {
      riskFactors.push({
        severity: 'high',
        category: 'material',
        message: 'Functional part + TPU → TPU is flexible, not suitable for rigid functional parts',
        mitigation: 'Use rigid material like PETG or ABS for functional parts',
      });
      score += 3;
    }
  }

  if (model.intendedUse === 'fit-critical') {
    if (printer.material === 'ABS' || printer.material === 'Nylon') {
      riskFactors.push({
        severity: 'medium',
        category: 'material',
        message: `Fit-critical part + ${printer.material} → warping can affect dimensional accuracy`,
        mitigation: 'Use PETG or PLA+ for better dimensional stability, calibrate first',
      });
      score += 2;
    }
  }

  // Add material-specific warnings
  if (materialInfo.warnings.length > 0) {
    const warningMessage = materialInfo.warnings.join(', ');
    riskFactors.push({
      severity: 'low',
      category: 'material',
      message: `${printer.material} material notes: ${warningMessage}`,
      mitigation: materialInfo.notes,
    });
    score += 1;
  }

  return score;
};

// Assess settings risks
const assessSettingsRisks = (
  model: ModelInput,
  printer: PrinterMaterial,
  riskFactors: RiskFactor[]
): number => {
  let score = 0;

  // Check speed priority vs quality needs
  if (printer.priority === 'speed' && model.intendedUse === 'fit-critical') {
    riskFactors.push({
      severity: 'medium',
      category: 'settings',
      message: 'Speed priority + fit-critical part → dimensional accuracy may suffer',
      mitigation: 'Reduce speed for outer walls and critical dimensions',
    });
    score += 2;
  }

  // Check adhesion method
  if (model.flatBase === 'no' && printer.priority === 'speed') {
    riskFactors.push({
      severity: 'medium',
      category: 'settings',
      message: 'No flat base + speed priority → adhesion failure risk',
      mitigation: 'Use brim or raft, slow down first layer',
    });
    score += 2;
  }

  // Check layer height vs detail
  if (typeof model.smallestFeature === 'number') {
    if (model.smallestFeature < printer.layerHeight * 2) {
      riskFactors.push({
        severity: 'high',
        category: 'settings',
        message: `Smallest feature (${model.smallestFeature}mm) < 2× layer height (${printer.layerHeight}mm) → detail loss`,
        mitigation: 'Reduce layer height or increase feature size in CAD',
      });
      score += 3;
    }
  }

  return score;
};

// Main risk assessment function
export const assessRisk = (
  model: ModelInput,
  printer: PrinterMaterial
): { riskLevel: RiskLevel; confidence: ConfidenceLevel; riskFactors: RiskFactor[] } => {
  const riskFactors: RiskFactor[] = [];
  let totalScore = 0;

  // Run all risk assessments
  totalScore += assessGeometryRisks(model, printer, riskFactors);
  totalScore += assessMaterialRisks(model, printer, riskFactors);
  totalScore += assessSettingsRisks(model, printer, riskFactors);

  // Determine risk level
  let riskLevel: RiskLevel;
  if (totalScore >= RISK_THRESHOLDS.RISK_SCORE_HIGH) {
    riskLevel = 'high';
  } else if (totalScore >= RISK_THRESHOLDS.RISK_SCORE_MEDIUM) {
    riskLevel = 'medium';
  } else {
    riskLevel = 'low';
  }

  // Add positive note if low risk
  if (riskLevel === 'low' && riskFactors.length === 0) {
    riskFactors.push({
      severity: 'low',
      category: 'geometry',
      message: 'Model appears well-suited for printing with current settings',
      mitigation: 'Proceed with standard print settings',
    });
  }

  // Calculate confidence
  const unknownCount = countUnknowns(model);
  const confidence = calculateConfidence(unknownCount);

  // Sort risk factors by severity (high → medium → low)
  const severityOrder = { high: 0, medium: 1, low: 2 };
  riskFactors.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

  return { riskLevel, confidence, riskFactors };
};
