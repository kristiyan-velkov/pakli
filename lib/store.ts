import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface Outage {
  id: string
  source: string
  area: string
  type: string
  category: string
  description: string
  start: string
  end: string
  timestamp: string
  serviceType: "water" | "electricity" | "heating"
  district: string
  severity: "low" | "medium" | "high"
}

export interface User {
  id: string
  name: string
  email: string
  address: string
  district: string
  notifications: boolean
  emailNotifications: boolean
}

export interface Subscription {
  active: boolean
  expiresAt: string
  paymentMethod: string
  amount: number
  currency: string
  startDate: string
}

interface FilterState {
  searchQuery: string
  selectedService: string
  selectedCategory: string
  selectedType: string
  showOnlyUserDistrict: boolean
}

interface AppState {
  // User state
  user: User | null
  subscription: Subscription | null
  setUser: (user: User | null) => void
  setSubscription: (subscription: Subscription | null) => void

  // Outages state
  outages: Outage[]
  filteredOutages: Outage[]
  selectedOutage: Outage | null
  userNotifications: Outage[]
  setOutages: (outages: Outage[]) => void
  setSelectedOutage: (outage: Outage | null) => void

  // UI state
  viewMode: "map" | "list"
  mapType: "leaflet" | "mapbox" | "google"
  loading: boolean
  error: string | null
  showPaymentModal: boolean
  setViewMode: (mode: "map" | "list") => void
  setMapType: (type: "leaflet" | "mapbox" | "google") => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setShowPaymentModal: (show: boolean) => void

  // Filters
  filters: FilterState
  setSearchQuery: (query: string) => void
  setSelectedService: (service: string) => void
  setSelectedCategory: (category: string) => void
  setSelectedType: (type: string) => void
  setShowOnlyUserDistrict: (show: boolean) => void
  resetFilters: () => void

  // Actions
  applyFilters: () => void
  fetchOutages: () => Promise<void>
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
        const { outages, user, filters } = get()
        let filtered = [...outages]

        if (user && filters.showOnlyUserDistrict) {
          filtered = filtered.filter((outage) => outage.district.toLowerCase() === user.district.toLowerCase())
        }

        if (filters.searchQuery.trim()) {
          const query = filters.searchQuery.toLowerCase().trim()
          filtered = filtered.filter(
            (outage) =>
              outage.area.toLowerCase().includes(query) ||
              outage.description.toLowerCase().includes(query) ||
              outage.district.toLowerCase().includes(query),
          )
        }

        if (filters.selectedService !== "all") {
          filtered = filtered.filter((outage) => outage.serviceType === filters.selectedService)
        }

        if (filters.selectedCategory !== "all") {
          filtered = filtered.filter((outage) => outage.category === filters.selectedCategory)
        }

        if (filters.selectedType !== "all") {
          if (filters.selectedType === "emergency") {
            filtered = filtered.filter((outage) => outage.type && outage.type.toLowerCase().includes("аварийно"))
          } else if (filters.selectedType === "scheduled") {
            filtered = filtered.filter((outage) => !outage.type || !outage.type.toLowerCase().includes("аварийно"))
          }
        }

        set({ filteredOutages: filtered })

        // Update user notifications
        if (user && get().subscription?.active) {
          const userDistrictOutages = outages.filter(
            (outage) => outage.district.toLowerCase() === user.district.toLowerCase() && outage.severity === "high",
          )
          set({ userNotifications: userDistrictOutages })
        } else {
          set({ userNotifications: [] })
        }
      },

      fetchOutages: async () => {
        const { setLoading, setError, setOutages, applyFilters, setSelectedOutage } = get()

        try {
          setLoading(true)
          setError(null)

          // In a real app, this would be an API call
          await new Promise((resolve) => setTimeout(resolve, 1000))
          const mockData = generateMockOutages()

          setOutages(mockData)

          if (mockData.length > 0) {
            setSelectedOutage(mockData[0])
          }

          applyFilters()
        } catch (error) {
          console.error("Error fetching outages:", error)
          setError("Възникна грешка при зареждане на данните")
        } finally {
          setLoading(false)
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
    },
  ),
)

// Helper function to generate mock data
function generateMockOutages(): Outage[] {
  return [
    {
      id: "1",
      source: "Софийска вода",
      area: "кв. Център - ул. Витоша от пл. Св. Неделя до бул. Патриарх Евтимий",
      type: "Аварийно спиране",
      category: "emergency",
      description: "Ремонт на главен водопровод поради пукнатина. Засегнати са жилищни и търговски обекти.",
      start: "8 Юни 2025, 09:00 ч.",
      end: "8 Юни 2025, 18:00 ч.",
      timestamp: "2025-06-08T09:00:00",
      serviceType: "water",
      district: "Център",
      severity: "high",
    },
    {
      id: "2",
      source: "Софийска вода",
      area: "кв. Дружба 1 - ул. Капитан Димитър Списаревски от бл. 1 до бл. 9",
      type: "Планирано спиране",
      category: "maintenance",
      description:
        "Подмяна на спирателни кранове и водомери. Молим гражданите да си осигурят необходимите количества вода.",
      start: "10 Юни 2025, 09:30 ч.",
      end: "10 Юни 2025, 17:30 ч.",
      timestamp: "2025-06-10T09:30:00",
      serviceType: "water",
      district: "Дружба",
      severity: "medium",
    },
    // Add more mock data as needed...
  ]
}
