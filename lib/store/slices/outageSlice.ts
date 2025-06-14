import { StateCreator } from "zustand";
import { AppState, Outage } from "../types";
import { getOutages } from "../../getters/getOutages";
import { filterOutages, transformApiToOutage } from "@/lib/utils/outage";

export const createOutageSlice: StateCreator<AppState, [], [], Partial<AppState>> = (set, get) => ({
    outages: [],
    filteredOutages: [],
    selectedOutage: null,
    userNotifications: [],
    setOutages: (outages: Outage[]) => set({ outages }),
    setSelectedOutage: (outage: Outage | null) => set({ selectedOutage: outage }),

    filters: {
        searchQuery: "",
        selectedService: "all",
        selectedCategory: "all",
        selectedType: "all",
        showOnlyUserDistrict: true,
    },
    setSearchQuery: (query) => set((state) => ({
        filters: { ...state.filters, searchQuery: query },
    })),
    setSelectedService: (service) => set((state) => ({
        filters: { ...state.filters, selectedService: service },
    })),
    setSelectedCategory: (category) => set((state) => ({
        filters: { ...state.filters, selectedCategory: category },
    })),
    setSelectedType: (type) => set((state) => ({
        filters: { ...state.filters, selectedType: type },
    })),
    setShowOnlyUserDistrict: (show) => set((state) => ({
        filters: { ...state.filters, showOnlyUserDistrict: show },
    })),
    resetFilters: () =>
        set((state) => ({
            filters: {
                searchQuery: "",
                selectedService: "all",
                selectedCategory: "all",
                selectedType: "all",
                showOnlyUserDistrict: state.filters.showOnlyUserDistrict,
            },
        })),

    applyFilters: () => {
        const { outages, user, filters, subscription } = get();
        const { filtered, notifications } = filterOutages(outages, user, filters, subscription);
        set({ filteredOutages: filtered, userNotifications: notifications });
    },

    fetchOutages: async () => {
        const { setLoading, setError, setOutages, applyFilters } = get();
        try {
            setLoading(true);
            setError(null);
            let outagesData = await getOutages();
            if (outagesData.length > 0) {
                outagesData = outagesData.map(transformApiToOutage);
                setOutages(outagesData);
                set({ selectedOutage: null });
                applyFilters();
            }
        } catch (err) {
            console.error("Error fetching outages:", err);
            setError("Възникна грешка при зареждане на данните");
            applyFilters();
        } finally {
            setLoading(false);
        }
    },
});
