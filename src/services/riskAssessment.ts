import type { ModelInput, PrinterMaterial, RiskFactor, RiskLevel, ConfidenceLevel } from '../types/index.ts';

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
// 0-1 unknowns = High, 2-3 = Medium, 4+ = Low
export const calculateConfidence = (unknownCount: number): ConfidenceLevel => {
  if (unknownCount >= 4) return 'low';
  if (unknownCount >= 2) return 'medium';
  return 'high';
};

// Compute derived values
const getDerivedValues = (model: ModelInput) => {
  const footprint_mm2 = model.boundingBox.x * model.boundingBox.y;
  const slenderness = model.boundingBox.z / Math.max(model.boundingBox.x, model.boundingBox.y);
  const base_ratio = Math.min(model.boundingBox.x, model.boundingBox.y) / Math.max(model.boundingBox.x, model.boundingBox.y);

  return { footprint_mm2, slenderness, base_ratio };
};

// A) Print Stability & Tall-Part Risk
const assessStabilityRisks = (
  model: ModelInput,
  derived: ReturnType<typeof getDerivedValues>,
  riskFactors: RiskFactor[]
): number => {
  let points = 0;

  // A1 - Tall/slender part
  if (derived.slenderness > 3.0) {
    riskFactors.push({
      severity: 'high',
      category: 'geometry',
      message: `Very tall/slender part (ratio ${derived.slenderness.toFixed(1)}:1) → wobble, adhesion, or layer shift risk (+18)`,
      mitigation: 'Add brim, slow down, increase cooling, re-orient, or split model',
    });
    points += 18;
  } else if (derived.slenderness > 2.0) {
    riskFactors.push({
      severity: 'medium',
      category: 'geometry',
      message: `Tall/slender part (ratio ${derived.slenderness.toFixed(1)}:1) → stability risk (+10)`,
      mitigation: 'Add brim, slow down, increase cooling',
    });
    points += 10;
  }

  // A2 - Small footprint relative to height
  if (model.boundingBox.z >= 180 && derived.footprint_mm2 < 2500) {
    riskFactors.push({
      severity: 'high',
      category: 'geometry',
      message: `Very tall (${model.boundingBox.z}mm) with small footprint (${derived.footprint_mm2.toFixed(0)}mm²) → high failure risk (+16)`,
      mitigation: 'Brim/raft, supports as stabilizers, or split model',
    });
    points += 16;
  } else if (model.boundingBox.z >= 120 && derived.footprint_mm2 < 2500) {
    riskFactors.push({
      severity: 'medium',
      category: 'geometry',
      message: `Tall (${model.boundingBox.z}mm) with small footprint (${derived.footprint_mm2.toFixed(0)}mm²) → stability risk (+10)`,
      mitigation: 'Brim/raft recommended, consider supports as stabilizers',
    });
    points += 10;
  }

  // A3 - Flat base unknown
  if (model.flatBase === 'unknown') {
    riskFactors.push({
      severity: 'low',
      category: 'geometry',
      message: 'Flat base unknown → base geometry critical to first-layer success (+4)',
      mitigation: 'Confirm base area; consider adding brim',
    });
    points += 4;
  }

  return points;
};

// B) Walls, Features, and Nozzle Compatibility
const assessWallFeatureRisks = (
  model: ModelInput,
  printer: PrinterMaterial,
  riskFactors: RiskFactor[]
): number => {
  let points = 0;

  // B1 - Minimum wall thickness vs nozzle
  if (typeof model.minWallThickness === 'number') {
    if (model.minWallThickness < (2 * printer.nozzleSize)) {
      riskFactors.push({
        severity: 'high',
        category: 'geometry',
        message: `Min wall (${model.minWallThickness}mm) < 2× nozzle (${(2 * printer.nozzleSize).toFixed(1)}mm) → walls may fail or be fragile (+18)`,
        mitigation: 'Increase wall thickness in CAD, use smaller nozzle, or increase perimeters',
      });
      points += 18;
    } else if (model.minWallThickness < (3 * printer.nozzleSize)) {
      riskFactors.push({
        severity: 'medium',
        category: 'geometry',
        message: `Min wall (${model.minWallThickness}mm) < 3× nozzle (${(3 * printer.nozzleSize).toFixed(1)}mm) → reduced strength (+10)`,
        mitigation: 'Consider increasing wall thickness or adding perimeters',
      });
      points += 10;
    }
  } else {
    riskFactors.push({
      severity: 'low',
      category: 'geometry',
      message: 'Min wall thickness unknown → cannot verify nozzle compatibility (+6)',
      mitigation: 'Check model walls are at least 2-3× nozzle width',
    });
    points += 6;
  }

  // B2 - Minimum feature size vs nozzle
  if (typeof model.smallestFeature === 'number') {
    if (model.smallestFeature < (1.2 * printer.nozzleSize)) {
      riskFactors.push({
        severity: 'high',
        category: 'geometry',
        message: `Min feature (${model.smallestFeature}mm) < 1.2× nozzle (${(1.2 * printer.nozzleSize).toFixed(1)}mm) → details may not resolve (+14)`,
        mitigation: 'Scale model up, switch to smaller nozzle, or increase line width control',
      });
      points += 14;
    } else if (model.smallestFeature < (2.0 * printer.nozzleSize)) {
      riskFactors.push({
        severity: 'medium',
        category: 'geometry',
        message: `Min feature (${model.smallestFeature}mm) < 2× nozzle (${(2.0 * printer.nozzleSize).toFixed(1)}mm) → fine details at risk (+8)`,
        mitigation: 'Consider smaller nozzle for better detail resolution',
      });
      points += 8;
    }
  } else {
    riskFactors.push({
      severity: 'low',
      category: 'geometry',
      message: 'Min feature size unknown → detail resolution uncertain (+4)',
      mitigation: 'Verify fine features are at least 2× nozzle width',
    });
    points += 4;
  }

  return points;
};

// C) Overhangs & Supports Logic
const assessOverhangRisks = (
  model: ModelInput,
  printer: PrinterMaterial,
  riskFactors: RiskFactor[]
): number => {
  let points = 0;

  // C1 - Overhangs present
  if (model.overhangs === 'many') {
    points += 16;
  } else if (model.overhangs === 'some') {
    points += 8;
  } else if (model.overhangs === 'unknown') {
    riskFactors.push({
      severity: 'low',
      category: 'geometry',
      message: 'Overhangs unknown → support needs uncertain (+5)',
      mitigation: 'Review model for overhangs >45-50°',
    });
    points += 5;
  }

  // C2 - Supports disabled but overhangs exist
  if (!printer.supportsAllowed && (model.overhangs === 'some' || model.overhangs === 'many')) {
    riskFactors.push({
      severity: 'high',
      category: 'settings',
      message: `Supports disabled with ${model.overhangs} overhangs → top failure mode (+18)`,
      mitigation: 'Allow supports, re-orient model, or split model',
    });
    points += 18;
  } else if (model.overhangs === 'many') {
    riskFactors.push({
      severity: 'medium',
      category: 'geometry',
      message: 'Many overhangs present → supports required (+16 already counted)',
      mitigation: 'Use tree supports or touching build plate only',
    });
  } else if (model.overhangs === 'some') {
    riskFactors.push({
      severity: 'low',
      category: 'geometry',
      message: 'Some overhangs present → support planning needed (+8 already counted)',
      mitigation: 'Enable supports for overhangs >50-60°',
    });
  }

  return points;
};

// D) Bridges
const assessBridgeRisks = (
  model: ModelInput,
  riskFactors: RiskFactor[]
): number => {
  let points = 0;

  if (model.bridges === 'many') {
    riskFactors.push({
      severity: 'medium',
      category: 'geometry',
      message: 'Many bridges expected → cooling/speed tuning critical (+12)',
      mitigation: 'Increase cooling, reduce bridge speed, add supports if bridges sag',
    });
    points += 12;
  } else if (model.bridges === 'some') {
    riskFactors.push({
      severity: 'low',
      category: 'geometry',
      message: 'Some bridges expected → monitor cooling and speed (+6)',
      mitigation: 'Ensure cooling is adequate for material, test bridge settings',
    });
    points += 6;
  } else if (model.bridges === 'unknown') {
    riskFactors.push({
      severity: 'low',
      category: 'geometry',
      message: 'Bridges unknown → bridging performance uncertain (+4)',
      mitigation: 'Review model for unsupported gaps',
    });
    points += 4;
  }

  return points;
};

// E) Size & Fit Constraints
const assessSizeConstraints = (
  model: ModelInput,
  printer: PrinterMaterial,
  riskFactors: RiskFactor[]
): number => {
  let points = 0;

  // E1 - Bed fit
  if (printer.bedSize) {
    const fitsX = model.boundingBox.x <= printer.bedSize.x;
    const fitsY = model.boundingBox.y <= printer.bedSize.y;
    const fitsZ = model.boundingBox.z <= printer.bedSize.z;

    if (!fitsX || !fitsY || !fitsZ) {
      riskFactors.push({
        severity: 'high',
        category: 'printer',
        message: `Model (${model.boundingBox.x}×${model.boundingBox.y}×${model.boundingBox.z}mm) exceeds bed → cannot print in one piece (+30)`,
        mitigation: 'Split model, rotate, scale, or print diagonally',
      });
      points += 30;
    }
  }

  // E2 - Very large part (time & warp risk)
  const maxDim = Math.max(model.boundingBox.x, model.boundingBox.y, model.boundingBox.z);
  if (maxDim >= 220) {
    riskFactors.push({
      severity: 'medium',
      category: 'geometry',
      message: `Large part (${maxDim}mm) → long print amplifies warp, drift, adhesion issues (+10)`,
      mitigation: 'Brim, enclosure (for ABS/Nylon), or segment model',
    });
    points += 10;
  }

  return points;
};

// F) Intended Use (Decorative vs Functional vs Fit-Critical)
const assessIntendedUseRisks = (
  model: ModelInput,
  riskFactors: RiskFactor[]
): number => {
  let points = 0;

  if (model.intendedUse === 'functional') {
    riskFactors.push({
      severity: 'low',
      category: 'settings',
      message: 'Functional part → needs stronger walls/infill and tougher material (+6)',
      mitigation: 'More perimeters, higher infill, consider PETG/ABS/Nylon',
    });
    points += 6;
  } else if (model.intendedUse === 'fit-critical') {
    riskFactors.push({
      severity: 'medium',
      category: 'settings',
      message: 'Fit-critical part → tolerances, shrinkage, dimensional error matter (+14)',
      mitigation: 'Calibration, test coupon, adjust XY compensation, print slower',
    });
    points += 14;
  }

  return points;
};

// G) Material-Specific Risk Adjustments
const assessMaterialRisks = (
  model: ModelInput,
  printer: PrinterMaterial,
  riskFactors: RiskFactor[]
): number => {
  let points = 0;

  switch (printer.material) {
    case 'PLA':
    case 'PLA+':
      if (model.intendedUse === 'functional') {
        riskFactors.push({
          severity: 'low',
          category: 'material',
          message: 'PLA functional part → softening/creep risk under load (+3)',
          mitigation: 'Consider PETG or ABS for load-bearing parts',
        });
        points += 3;
      }
      if (model.intendedUse === 'fit-critical') {
        riskFactors.push({
          severity: 'low',
          category: 'material',
          message: 'PLA fit-critical → dimensional ok, but can creep under load (+2)',
          mitigation: 'Test fit with actual use-case loads',
        });
        points += 2;
      }
      break;

    case 'PETG':
      if (model.overhangs === 'some' || model.overhangs === 'many') {
        riskFactors.push({
          severity: 'low',
          category: 'material',
          message: 'PETG with overhangs → stringing and droop risk (+3)',
          mitigation: 'Tune retraction, reduce temp slightly, use supports',
        });
        points += 3;
      }
      if (model.bridges === 'some' || model.bridges === 'many') {
        riskFactors.push({
          severity: 'low',
          category: 'material',
          message: 'PETG with bridges → may sag more than PLA (+2)',
          mitigation: 'Reduce bridge speed, increase cooling within limits',
        });
        points += 2;
      }
      break;

    case 'ABS':
      riskFactors.push({
        severity: 'medium',
        category: 'material',
        message: 'ABS baseline → warp/shrink risk (+8)',
        mitigation: 'Use enclosure, brim, heated bed (90-110°C)',
      });
      points += 8;

      if (model.flatBase === 'no') {
        riskFactors.push({
          severity: 'low',
          category: 'material',
          message: 'ABS with no flat base → increased warping (+4)',
          mitigation: 'Add raft, ensure enclosure, slow cooling',
        });
        points += 4;
      }
      break;

    case 'Nylon':
      riskFactors.push({
        severity: 'medium',
        category: 'material',
        message: 'Nylon baseline → moisture absorption + warp risk (+10)',
        mitigation: 'Dry filament before printing, use enclosure, expect shrinkage',
      });
      points += 10;

      if (model.intendedUse === 'fit-critical') {
        riskFactors.push({
          severity: 'low',
          category: 'material',
          message: 'Nylon fit-critical → shrink variability affects tolerances (+4)',
          mitigation: 'Print test coupon, adjust XY compensation',
        });
        points += 4;
      }
      break;

    case 'TPU':
      riskFactors.push({
        severity: 'medium',
        category: 'material',
        message: 'TPU baseline → requires slow speeds and extrusion control (+10)',
        mitigation: 'Print 20-40mm/s, reduce retraction, direct drive preferred',
      });
      points += 10;

      if (typeof model.smallestFeature === 'number' && model.smallestFeature < 2.0) {
        riskFactors.push({
          severity: 'low',
          category: 'material',
          message: 'TPU with fine features → flex makes details harder (+6)',
          mitigation: 'Increase perimeters, reduce speed further',
        });
        points += 6;
      }
      break;
  }

  return points;
};

// Main risk assessment function
export const assessRisk = (
  model: ModelInput,
  printer: PrinterMaterial
): { riskLevel: RiskLevel; confidence: ConfidenceLevel; riskFactors: RiskFactor[] } => {
  const riskFactors: RiskFactor[] = [];
  let risk_points = 0;

  // Compute derived values
  const derived = getDerivedValues(model);

  // Run all rule groups
  risk_points += assessStabilityRisks(model, derived, riskFactors);
  risk_points += assessWallFeatureRisks(model, printer, riskFactors);
  risk_points += assessOverhangRisks(model, printer, riskFactors);
  risk_points += assessBridgeRisks(model, riskFactors);
  risk_points += assessSizeConstraints(model, printer, riskFactors);
  risk_points += assessIntendedUseRisks(model, riskFactors);
  risk_points += assessMaterialRisks(model, printer, riskFactors);

  // Determine risk level: 0-19 = LOW, 20-39 = MEDIUM, 40+ = HIGH
  let riskLevel: RiskLevel;
  if (risk_points >= 40) {
    riskLevel = 'high';
  } else if (risk_points >= 20) {
    riskLevel = 'medium';
  } else {
    riskLevel = 'low';
  }

  // Add positive note if low risk and no factors
  if (riskLevel === 'low' && riskFactors.length === 0) {
    riskFactors.push({
      severity: 'low',
      category: 'geometry',
      message: 'No significant risks detected → model appears well-suited for printing',
      mitigation: 'Proceed with standard print settings',
    });
  }

  // Calculate confidence: 0-1 = High, 2-3 = Medium, 4+ = Low
  const unknownCount = countUnknowns(model);
  const confidence = calculateConfidence(unknownCount);

  // Add confidence note if low
  if (confidence === 'low') {
    riskFactors.push({
      severity: 'low',
      category: 'settings',
      message: `Results based on incomplete geometry inputs (${unknownCount} unknowns)`,
      mitigation: 'Provide more details for more accurate assessment',
    });
  }

  // Sort risk factors by severity (high → medium → low)
  const severityOrder = { high: 0, medium: 1, low: 2 };
  riskFactors.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

  return { riskLevel, confidence, riskFactors };
};
