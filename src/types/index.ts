// Assessment data structure
export interface ModelInput {
  modelName: string;
  modelLink?: string;
  intendedUse: 'decorative' | 'functional' | 'fit-critical';
  fileType?: 'STL' | 'OBJ' | '3MF';
  units?: 'mm' | 'in';
  boundingBox: { x: number; y: number; z: number };
  minWallThickness?: number | 'unknown';
  smallestFeature?: number | 'unknown';
  flatBase?: 'yes' | 'no' | 'unknown';
  overhangs?: 'none' | 'some' | 'many' | 'unknown';
  bridges?: 'none' | 'some' | 'many' | 'unknown';
}

export interface PrinterMaterial {
  printerType: 'FDM';
  nozzleSize: number;
  bedSize?: { x: number; y: number; z: number };
  material: 'PLA' | 'PLA+' | 'PETG' | 'ABS' | 'Nylon' | 'TPU';
  layerHeight: number;
  supportsAllowed: boolean;
  priority: 'quality' | 'strength' | 'speed';
}

export interface RiskFactor {
  severity: 'low' | 'medium' | 'high';
  category: 'geometry' | 'material' | 'printer' | 'settings';
  message: string;
  mitigation?: string;
}

export interface PrintPlan {
  orientation: string;
  supports: { enabled: boolean; details: string };
  walls: number;
  infill: { percentage: number; pattern: string };
  adhesion: 'none' | 'brim' | 'raft';
  speedNotes: string;
  materialNotes: string;
  mitigationChecklist: string[];
}

export interface Assessment {
  id: string;
  timestamp: number;
  modelInput: ModelInput;
  printerMaterial: PrinterMaterial;
  riskLevel: 'low' | 'medium' | 'high';
  confidence: 'low' | 'medium' | 'high';
  riskFactors: RiskFactor[];
  printPlan: PrintPlan;
}

export type RiskLevel = 'low' | 'medium' | 'high';
export type ConfidenceLevel = 'low' | 'medium' | 'high';
