import type { Assessment, ModelInput, PrinterMaterial } from '../types/index.ts';
import { STORAGE_KEYS } from '../utils/constants.ts';

// Generate unique ID for assessments
export const generateId = (): string => {
  return `assessment-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
};

// Save assessment to LocalStorage
export const saveAssessment = (assessment: Assessment): void => {
  try {
    const existing = getAllAssessments();
    const updated = [assessment, ...existing];
    localStorage.setItem(STORAGE_KEYS.ASSESSMENTS, JSON.stringify(updated));
  } catch (error) {
    console.error('Failed to save assessment:', error);
    throw new Error('Could not save assessment to storage');
  }
};

// Get all assessments from LocalStorage
export const getAllAssessments = (): Assessment[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.ASSESSMENTS);
    if (!stored) return [];
    return JSON.parse(stored) as Assessment[];
  } catch (error) {
    console.error('Failed to load assessments:', error);
    return [];
  }
};

// Get single assessment by ID
export const getAssessmentById = (id: string): Assessment | null => {
  const assessments = getAllAssessments();
  return assessments.find((a) => a.id === id) || null;
};

// Delete assessment by ID
export const deleteAssessment = (id: string): void => {
  try {
    const existing = getAllAssessments();
    const filtered = existing.filter((a) => a.id !== id);
    localStorage.setItem(STORAGE_KEYS.ASSESSMENTS, JSON.stringify(filtered));
  } catch (error) {
    console.error('Failed to delete assessment:', error);
    throw new Error('Could not delete assessment from storage');
  }
};

// Session storage for assessment flow (model input)
export const saveSessionModelInput = (data: ModelInput): void => {
  sessionStorage.setItem(STORAGE_KEYS.SESSION_MODEL, JSON.stringify(data));
};

export const getSessionModelInput = (): ModelInput | null => {
  try {
    const stored = sessionStorage.getItem(STORAGE_KEYS.SESSION_MODEL);
    if (!stored) return null;
    return JSON.parse(stored) as ModelInput;
  } catch (error) {
    console.error('Failed to load session model input:', error);
    return null;
  }
};

// Session storage for printer/material input
export const saveSessionPrinterMaterial = (data: PrinterMaterial): void => {
  sessionStorage.setItem(STORAGE_KEYS.SESSION_PRINTER, JSON.stringify(data));
};

export const getSessionPrinterMaterial = (): PrinterMaterial | null => {
  try {
    const stored = sessionStorage.getItem(STORAGE_KEYS.SESSION_PRINTER);
    if (!stored) return null;
    return JSON.parse(stored) as PrinterMaterial;
  } catch (error) {
    console.error('Failed to load session printer material:', error);
    return null;
  }
};

// Clear session data
export const clearSessionData = (): void => {
  sessionStorage.removeItem(STORAGE_KEYS.SESSION_MODEL);
  sessionStorage.removeItem(STORAGE_KEYS.SESSION_PRINTER);
};
