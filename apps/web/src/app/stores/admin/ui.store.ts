"use client";

import { create } from "zustand";

type AdminUiState = {
  activeBusinessId: string | null;
  commandOpen: boolean;
  setActiveBusinessId: (businessId: string | null) => void;
  setCommandOpen: (open: boolean) => void;
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
};

export const useAdminUiStore = create<AdminUiState>((set) => ({
  activeBusinessId: null,
  commandOpen: false,
  setActiveBusinessId: (businessId) => set({ activeBusinessId: businessId }),
  setCommandOpen: (open) => set({ commandOpen: open }),
  sidebarCollapsed: false,
  toggleSidebar: () =>
    set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
}));
