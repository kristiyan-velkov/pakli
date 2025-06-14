import { StateCreator } from "zustand";
import { AppState, ViewMode, MapType } from "../types";

export const createMapSlice: StateCreator<AppState, [], [], Partial<AppState>> = (set) => ({
    viewMode: ViewMode.Map,
    mapType: MapType.Google,
    loading: false,
    error: null,
    showPaymentModal: false,
    setViewMode: (mode: ViewMode) => set({ viewMode: mode }),
    setMapType: (type: MapType) => set({ mapType: type }),
    setLoading: (loading: boolean) => set({ loading }),
    setError: (error: string | null) => set({ error }),
    setShowPaymentModal: (show: boolean) => set({ showPaymentModal: show }),
});
