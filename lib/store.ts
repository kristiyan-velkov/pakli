import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Outage {
  id: string;
  source: string;
  area: string;
  type: string;
  category: string;
  description: string;
  start: string;
  end: string;
  timestamp: string;
  serviceType: "water" | "electricity" | "heating";
  district: string;
  severity: "low" | "medium" | "high";
}

export interface User {
  id?: string;
  name: string;
  email: string;
  address: string;
  password?: string;
  city: string;
  district: string;
  notifications: boolean;
  emailNotifications: boolean;
}

export interface Subscription {
  active: boolean;
  expiresAt: string;
  paymentMethod: string;
  amount: number;
  currency: string;
  startDate: string;
}

interface FilterState {
  searchQuery: string;
  selectedService: string;
  selectedCategory: string;
  selectedType: string;
  showOnlyUserDistrict: boolean;
}

interface AppState {
  user: User | null;
  subscription: Subscription | null;
  setUser: (user: User | null) => void;
  setSubscription: (subscription: Subscription | null) => void;

  outages: Outage[];
  filteredOutages: Outage[];
  selectedOutage: Outage | null;
  userNotifications: Outage[];
  setOutages: (outages: Outage[]) => void;
  setSelectedOutage: (outage: Outage | null) => void;

  viewMode: "map" | "list";
  mapType: "leaflet" | "mapbox" | "google";
  loading: boolean;
  error: string | null;
  showPaymentModal: boolean;
  setViewMode: (mode: "map" | "list") => void;
  setMapType: (type: "leaflet" | "mapbox" | "google") => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setShowPaymentModal: (show: boolean) => void;

  filters: FilterState;
  setSearchQuery: (query: string) => void;
  setSelectedService: (service: string) => void;
  setSelectedCategory: (category: string) => void;
  setSelectedType: (type: string) => void;
  setShowOnlyUserDistrict: (show: boolean) => void;
  resetFilters: () => void;

  applyFilters: () => void;
  fetchOutages: () => Promise<void>;
}

function transformApiToOutage(apiData: any): Outage {
  const validServiceTypes = ["water", "electricity", "heating"] as const;

  const rawServiceType =
    apiData.serviceType || apiData.service_type || apiData.type || "water";

  const serviceType = validServiceTypes.includes(rawServiceType)
    ? rawServiceType
    : "water";

  return {
    id: apiData.id,
    source: apiData.source,
    area: apiData.affectedArea || apiData.location?.address || apiData.area || "Неизвестна зона",
    type: apiData.category === "emergency" ? "Аварийно спиране" : "Планирано спиране",
    category: apiData.category,
    description: apiData.description,
    start: apiData.startTime,
    end: apiData.endTime,
    timestamp: apiData.startTime,
    serviceType,
    district: apiData.location?.district || apiData.district || "Неизвестен",
    severity: apiData.severity || apiData.priority || "medium",
  };
}

async function loadOutagesFromApi(): Promise<Outage[]> {
  try {
    const response = await fetch("/api/outages");
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const result = await response.json();
    if (!result.success || !Array.isArray(result.data)) {
      throw new Error("Invalid API response format");
    }

    return result.data.map(transformApiToOutage);
  } catch (error) {
    console.error("Error loading outages from API:", error);
    return [];
  }
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      user: null,
      subscription: null,
      setUser: (user) => set({ user }),
      setSubscription: (subscription) => set({ subscription }),

      outages: [],
      filteredOutages: [],
      selectedOutage: null,
      userNotifications: [],
      setOutages: (outages) => set({ outages }),
      setSelectedOutage: (outage) => set({ selectedOutage: outage }),

      viewMode: "map",
      mapType: "google",
      loading: false,
      error: null,
      showPaymentModal: false,
      setViewMode: (mode) => set({ viewMode: mode }),
      setMapType: (type) => set({ mapType: type }),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
      setShowPaymentModal: (show) => set({ showPaymentModal: show }),

      filters: {
        searchQuery: "",
        selectedService: "all",
        selectedCategory: "all",
        selectedType: "all",
        showOnlyUserDistrict: true,
      },
      setSearchQuery: (query) => set((state) => ({ filters: { ...state.filters, searchQuery: query } })),
      setSelectedService: (service) => set((state) => ({ filters: { ...state.filters, selectedService: service } })),
      setSelectedCategory: (category) => set((state) => ({ filters: { ...state.filters, selectedCategory: category } })),
      setSelectedType: (type) => set((state) => ({ filters: { ...state.filters, selectedType: type } })),
      setShowOnlyUserDistrict: (show) => set((state) => ({ filters: { ...state.filters, showOnlyUserDistrict: show } })),
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
        const { outages, user, filters } = get();
        const { selectedService, selectedCategory, selectedType, searchQuery, showOnlyUserDistrict } = filters;
        const normalizedQuery = searchQuery.trim().toLowerCase();

        const filtered = outages.filter((outage) => {
          if (user && showOnlyUserDistrict && outage.district.toLowerCase() !== user.district.toLowerCase()) return false;
          if (
            normalizedQuery &&
            !outage.area.toLowerCase().includes(normalizedQuery) &&
            !outage.description.toLowerCase().includes(normalizedQuery) &&
            !outage.district.toLowerCase().includes(normalizedQuery)
          ) return false;
          if (selectedService !== "all" && outage.serviceType !== selectedService) return false;
          if (selectedCategory !== "all" && outage.category !== selectedCategory) return false;
          const isEmergency = outage.type.toLowerCase().includes("аварийно");
          if (selectedType === "emergency" && !isEmergency) return false;
          if (selectedType === "scheduled" && isEmergency) return false;
          return true;
        });

        set({ filteredOutages: filtered });

        if (user && get().subscription?.active) {
          set({
            userNotifications: filtered.filter(
              (o) => o.district.toLowerCase() === user.district.toLowerCase() && o.severity === "high"
            ),
          });
        } else {
          set({ userNotifications: [] });
        }
      },

      fetchOutages: async () => {
        const { setLoading, setError, setOutages, applyFilters, setSelectedOutage } = get();

        try {
          setLoading(true);
          setError(null);

          const outagesData = await loadOutagesFromApi();
          setOutages(outagesData);
          if (outagesData.length > 0) setSelectedOutage(outagesData[0]);
          applyFilters();
        } catch (error) {
          console.error("Error fetching outages:", error);
          setError("Възникна грешка при зареждане на данните");
          applyFilters();
        } finally {
          setLoading(false);
        }
      },
    }),
    {
      name: "pakli-storage",
      partialize: (state) => ({
        user: state.user,
        subscription: state.subscription,
        mapType: state.mapType,
        viewMode: state.viewMode,
      }),
    }
  )
);
