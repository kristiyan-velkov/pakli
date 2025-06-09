"use client"

import { useAppStore } from "@/lib/store"
import { Icon } from "@/components/ui/icon"

export function ViewToggle() {
  const { viewMode, setViewMode, mapType, setMapType } = useAppStore()

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="inline-flex bg-gray-200 rounded-full p-1">
        <button
          onClick={() => setViewMode("map")}
          className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
            viewMode === "map" ? "bg-blue-600 text-white shadow-sm" : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Карта
        </button>
        <button
          onClick={() => setViewMode("list")}
          className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
            viewMode === "list" ? "bg-blue-600 text-white shadow-sm" : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Списък
        </button>
      </div>

      {viewMode === "map" && (
        <div className="inline-flex bg-gray-100 rounded-full p-1">
          <button
            onClick={() => setMapType("leaflet")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
              mapType === "leaflet" ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <Icon name="map" className="h-4 w-4" />
            2D Карта
          </button>
          <button
            onClick={() => setMapType("mapbox")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
              mapType === "mapbox" ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <Icon name="mountain" className="h-4 w-4" />
            3D Карта
          </button>
          <button
            onClick={() => setMapType("google")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
              mapType === "google" ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <Icon name="globe" className="h-4 w-4" />
            Google 3D
          </button>
        </div>
      )}
    </div>
  )
}
