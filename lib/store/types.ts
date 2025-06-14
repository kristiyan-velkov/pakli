export enum ServiceType {
  Water = "water",
  Electricity = "electricity",
  Heating = "heating",
}

export enum Severity {
  Low = "low",
  Medium = "medium",
  High = "high",
}

export enum ViewMode {
  Map = "map",
  List = "list",
}

export enum MapType {
  Leaflet = "leaflet",
  Mapbox = "mapbox",
  Google = "google",
}

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
  serviceType: ServiceType;
  district: string;
  severity: Severity;
}

export interface User {
  id?: string;
  name: string;
  email: string;
  address: string;
  password?: string;
  city: string;
  district: string;
  notifications?: boolean;
  emailNotifications?: boolean;
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

export interface AppState {
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

  viewMode: ViewMode;
  mapType: MapType;
  loading: boolean;
  error: string | null;
  showPaymentModal: boolean;
  setViewMode: (mode: ViewMode) => void;
  setMapType: (type: MapType) => void;
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
}