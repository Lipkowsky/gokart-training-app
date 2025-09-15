import { create } from "zustand";

export const useTrainingCopyStore = create((set) => ({
  copiedTraining: null,
  setCopiedTraining: (training) => set({ copiedTraining: training }),
  clearCopiedTraining: () => set({ copiedTraining: null }),
}));
