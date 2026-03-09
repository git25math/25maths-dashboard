import type { CoverDesign } from '../views/covers/types';

const STORAGE_KEY = 'cover-designs';

function writeStorage(designs: CoverDesign[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(designs));
  } catch {
    throw new Error('Storage is full. Please delete some designs to free up space.');
  }
}

export const coverService = {
  getDesigns(): CoverDesign[] {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    } catch (err) {
      console.warn('[coverService] Corrupted designs data, resetting:', err);
      localStorage.removeItem(STORAGE_KEY);
      return [];
    }
  },

  saveDesign(design: CoverDesign): void {
    const designs = this.getDesigns();
    const idx = designs.findIndex(d => d.id === design.id);
    if (idx >= 0) {
      designs[idx] = design;
    } else {
      designs.unshift(design);
    }
    writeStorage(designs);
  },

  deleteDesign(id: string): void {
    const designs = this.getDesigns().filter(d => d.id !== id);
    writeStorage(designs);
  },
};
