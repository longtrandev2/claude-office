/**
 * Explored dungeon map (phase 9): repo levels/rooms agents touched in the
 * current session, as sent by the backend in every state update.
 */
import { create } from "zustand";
import type { ExploredLevel } from "@/types/generated";

interface ExploredMapState {
  levels: ExploredLevel[];
  setLevels: (levels: ExploredLevel[]) => void;
}

export const useExploredMapStore = create<ExploredMapState>()((set) => ({
  levels: [],
  setLevels: (levels) => set({ levels }),
}));
