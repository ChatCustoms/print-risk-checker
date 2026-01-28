// Material properties and recommendations
export const MATERIAL_PROPERTIES = {
  PLA: {
    name: 'PLA',
    difficulty: 'easy',
    temperature: '190-220°C',
    bedTemp: '50-60°C',
    fanSpeed: 'high',
    notes: 'Easy to print, good for decorative parts. Low heat resistance (~60°C). Not suitable for functional parts under stress or heat.',
    warnings: ['Not heat resistant', 'Brittle under stress'],
  },
  'PLA+': {
    name: 'PLA+',
    difficulty: 'easy',
    temperature: '205-230°C',
    bedTemp: '50-60°C',
    fanSpeed: 'high',
    notes: 'Improved strength over PLA, slightly better heat resistance. Still not ideal for high-stress functional parts.',
    warnings: ['Limited heat resistance', 'May still be brittle'],
  },
  PETG: {
    name: 'PETG',
    difficulty: 'medium',
    temperature: '220-250°C',
    bedTemp: '70-80°C',
    fanSpeed: 'low',
    notes: 'Good strength and heat resistance (~80°C). Tends to string. Good for functional parts.',
    warnings: ['Stringing issues', 'Reduce cooling fan', 'May need dry storage'],
  },
  ABS: {
    name: 'ABS',
    difficulty: 'hard',
    temperature: '230-260°C',
    bedTemp: '90-110°C',
    fanSpeed: 'minimal',
    notes: 'High strength and heat resistance (~100°C). Requires enclosed printer. Warping issues without proper bed adhesion.',
    warnings: ['Warping risk', 'Requires enclosure', 'Strong fumes', 'Use brim or raft'],
  },
  Nylon: {
    name: 'Nylon',
    difficulty: 'hard',
    temperature: '240-270°C',
    bedTemp: '70-90°C',
    fanSpeed: 'minimal',
    notes: 'Excellent strength and flexibility. Absorbs moisture easily. Requires dry storage and slow printing.',
    warnings: ['Must be dried before printing', 'Warping risk', 'Difficult bed adhesion'],
  },
  TPU: {
    name: 'TPU',
    difficulty: 'medium',
    temperature: '220-250°C',
    bedTemp: '40-60°C',
    fanSpeed: 'low',
    notes: 'Flexible material. Requires slow print speeds. Not suitable for rigid functional parts.',
    warnings: ['Print slowly (20-40mm/s)', 'Direct drive extruder recommended', 'Not for rigid parts'],
  },
};

// Bed size presets
export const BED_SIZE_PRESETS = {
  'Ender 3': { x: 220, y: 220, z: 250 },
  'Prusa i3 MK3': { x: 250, y: 210, z: 210 },
  'CR-10': { x: 300, y: 300, z: 400 },
  'Ender 5 Plus': { x: 350, y: 350, z: 400 },
  'Prusa Mini': { x: 180, y: 180, z: 180 },
  'Bambu Lab X1': { x: 256, y: 256, z: 256 },
};

// Risk assessment thresholds
export const RISK_THRESHOLDS = {
  // Geometry risks
  TALL_SMALL_RATIO: 2.5, // Z-height / footprint ratio
  SMALL_FOOTPRINT_MM: 50, // Minimum footprint for stability
  THIN_WALL_MULTIPLIER: 1.5, // Wall thickness should be > nozzle * this
  LARGE_PART_THRESHOLD: 150, // mm - anything larger needs careful planning

  // Risk scoring
  RISK_SCORE_HIGH: 5,
  RISK_SCORE_MEDIUM: 2,

  // Confidence
  UNKNOWN_COUNT_LOW_CONFIDENCE: 4,
  UNKNOWN_COUNT_MEDIUM_CONFIDENCE: 2,
};

// Infill patterns by priority
export const INFILL_RECOMMENDATIONS = {
  quality: { pattern: 'grid', range: '15-20%' },
  strength: { pattern: 'gyroid', range: '30-40%' },
  speed: { pattern: 'lines', range: '10-15%' },
};

// Wall count recommendations
export const WALL_RECOMMENDATIONS = {
  decorative: 2,
  functional: 4,
  'fit-critical': 3,
};

// Storage keys
export const STORAGE_KEYS = {
  ASSESSMENTS: 'print-risk-assessments',
  SESSION_MODEL: 'session-model-input',
  SESSION_PRINTER: 'session-printer-material',
};
