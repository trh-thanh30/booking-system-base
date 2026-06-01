"use client";

import { create } from "zustand";

type AdminUiState = {
  commandOpen: boolean;
  setCommandOpen: (open: boolean) => void;
};

export const useAdminUiStore = create<AdminUiState>((set) => ({
  commandOpen: false,
  setCommandOpen: (open) => set({ commandOpen: open }),
}));
