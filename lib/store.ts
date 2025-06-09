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
  id: string;
  name: string;
  email: string;
  address: string;
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
  // User state
  user: User | null;
  subscription: Subscription | null;
  setUser: (user: User | null) => void;
  setSubscription: (subscription: Subscription | null) => void;

  // Outages state
  outages: Outage[];
  filteredOutages: Outage[];
  selectedOutage: Outage | null;
  userNotifications: Outage[];
  setOutages: (outages: Outage[]) => void;
  setSelectedOutage: (outage: Outage | null) => void;

  // UI state
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

  // Filters
  filters: FilterState;
  setSearchQuery: (query: string) => void;
  setSelectedService: (service: string) => void;
  setSelectedCategory: (category: string) => void;
  setSelectedType: (type: string) => void;
  setShowOnlyUserDistrict: (show: boolean) => void;
  resetFilters: () => void;

  // Actions
  applyFilters: () => void;
  fetchOutages: () => Promise<void>;
}

// Helper function to transform API data to our Outage format
function transformApiToOutage(apiData: any): Outage {
  // Format dates
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return (
        date.toLocaleDateString("bg-BG", {
          day: "numeric",
          month: "long",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }) + " ч."
      );
    } catch {
      return dateString; // Return original if parsing fails
    }
  };

  // Map service types from JSON to our format
  const serviceTypeMap: { [key: string]: "water" | "electricity" | "heating" } =
    {
      water: "water",
      electricity: "electricity",
      heating: "heating",
    };

  // Extract district from location or use fallback
  const district =
    apiData.location?.district || apiData.district || "Неизвестен";

  // Extract area from location or use fallback
  const area =
    apiData.affectedArea ||
    apiData.location?.address ||
    apiData.area ||
    "Неизвестна зона";

  return {
    id: apiData.id,
    source: apiData.source,
    area: area,
    type:
      apiData.category === "emergency"
        ? "Аварийно спиране"
        : "Планирано спиране",
    category: apiData.category,
    description: apiData.description,
    start: formatDate(apiData.startTime),
    end: formatDate(apiData.endTime),
    timestamp: apiData.startTime,
    serviceType:
      serviceTypeMap[apiData.serviceType] ||
      serviceTypeMap[apiData.type] ||
      "water",
    district: district,
    severity: apiData.severity || apiData.priority || "medium",
  };
}

// Helper function to load outages from API
async function loadOutagesFromApi(): Promise<Outage[]> {
  try {
    const response = await fetch("/api/outages");
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    if (!result.success || !Array.isArray(result.data)) {
      throw new Error("Invalid API response format");
    }

    // Transform each API entry to our Outage format
    const outages = result.data.map(transformApiToOutage);

    return outages;
  } catch (error) {
    console.error("Error loading outages from API:", error);
    // Return fallback data if API fails
    return getFallbackOutages();
  }
}

// Fallback data in case API fails
function getFallbackOutages(): Outage[] {
  return [
    {
      id: "1",
      source: "Софийска вода",
      area: "кв. Център - ул. Витоша от пл. Св. Неделя до бул. Патриарх Евтимий",
      type: "Аварийно спиране",
      category: "emergency",
      description:
        "Ремонт на главен водопровод поради пукнатина. Засегнати са жилищни и търговски обекти.",
      start: "9 Юни 2025, 09:00 ч.",
      end: "9 Юни 2025, 18:00 ч.",
      timestamp: "2025-06-09T09:00:00",
      serviceType: "water",
      district: "Център",
      severity: "high",
    },
    {
      id: "2",
      source: "ЧЕЗ България",
      area: "ж.к. Младост 1А - блокове 101-110",
      type: "Аварийно спиране",
      category: "emergency",
      description:
        "Авария в трафопост поради претоварване. Работи се по възстановяване на електрозахранването.",
      start: "9 Юни 2025, 14:30 ч.",
      end: "9 Юни 2025, 20:00 ч.",
      timestamp: "2025-06-09T14:30:00",
      serviceType: "electricity",
      district: "Младост",
      severity: "high",
    },
    {
      id: "3",
      source: "Топлофикация София",
      area: "ж.к. Люлин 5 - блокове 501-515",
      type: "Аварийно спиране",
      category: "emergency",
      description:
        "Авария на топлопровод. Временно спиране на топлата вода и отоплението.",
      start: "9 Юни 2025, 08:00 ч.",
      end: "10 Юни 2025, 16:00 ч.",
      timestamp: "2025-06-09T08:00:00",
      serviceType: "heating",
      district: "Люлин",
      severity: "high",
    },
  ];
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // User state
      user: null,
      subscription: null,
      setUser: (user) => set({ user }),
      setSubscription: (subscription) => set({ subscription }),

      // Outages state
      outages: [],
      filteredOutages: [],
      selectedOutage: null,
      userNotifications: [],
      setOutages: (outages) => set({ outages }),
      setSelectedOutage: (outage) => set({ selectedOutage: outage }),

      // UI state
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

      // Filters
      filters: {
        searchQuery: "",
        selectedService: "all",
        selectedCategory: "all",
        selectedType: "all",
        showOnlyUserDistrict: true,
      },
      setSearchQuery: (query) =>
        set((state) => ({
          filters: { ...state.filters, searchQuery: query },
        })),
      setSelectedService: (service) =>
        set((state) => ({
          filters: { ...state.filters, selectedService: service },
        })),
      setSelectedCategory: (category) =>
        set((state) => ({
          filters: { ...state.filters, selectedCategory: category },
        })),
      setSelectedType: (type) =>
        set((state) => ({
          filters: { ...state.filters, selectedType: type },
        })),
      setShowOnlyUserDistrict: (show) =>
        set((state) => ({
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

      // Actions
      applyFilters: () => {
        const { outages, user, filters } = get();
        let filtered = [...outages];

        if (user && filters.showOnlyUserDistrict) {
          filtered = filtered.filter(
            (outage) =>
              outage.district.toLowerCase() === user.district.toLowerCase()
          );
        }

        if (filters.searchQuery.trim()) {
          const query = filters.searchQuery.toLowerCase().trim();
          filtered = filtered.filter(
            (outage) =>
              outage.area.toLowerCase().includes(query) ||
              outage.description.toLowerCase().includes(query) ||
              outage.district.toLowerCase().includes(query)
          );
        }

        if (filters.selectedService !== "all") {
          filtered = filtered.filter(
            (outage) => outage.serviceType === filters.selectedService
          );
        }

        if (filters.selectedCategory !== "all") {
          filtered = filtered.filter(
            (outage) => outage.category === filters.selectedCategory
          );
        }

        if (filters.selectedType !== "all") {
          if (filters.selectedType === "emergency") {
            filtered = filtered.filter(
              (outage) =>
                outage.type && outage.type.toLowerCase().includes("аварийно")
            );
          } else if (filters.selectedType === "scheduled") {
            filtered = filtered.filter(
              (outage) =>
                !outage.type || !outage.type.toLowerCase().includes("аварийно")
            );
          }
        }

        set({ filteredOutages: filtered });

        // Update user notifications
        if (user && get().subscription?.active) {
          const userDistrictOutages = outages.filter(
            (outage) =>
              outage.district.toLowerCase() === user.district.toLowerCase() &&
              outage.severity === "high"
          );
          set({ userNotifications: userDistrictOutages });
        } else {
          set({ userNotifications: [] });
        }
      },

      fetchOutages: async () => {
        const {
          setLoading,
          setError,
          setOutages,
          applyFilters,
          setSelectedOutage,
        } = get();

        try {
          setLoading(true);
          setError(null);

          // Load outages from API
          const outagesData = await loadOutagesFromApi();

          setOutages(outagesData);

          if (outagesData.length > 0) {
            setSelectedOutage(outagesData[0]);
          }

          applyFilters();
        } catch (error) {
          console.error("Error fetching outages:", error);
          setError("Възникна грешка при зареждане на данните");

          // Use fallback data on error
          const fallbackData = getFallbackOutages();
          setOutages(fallbackData);
          if (fallbackData.length > 0) {
            setSelectedOutage(fallbackData[0]);
          }
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
