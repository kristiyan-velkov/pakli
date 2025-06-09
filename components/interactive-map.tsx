"use client";

import {
  useEffect,
  useRef,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  Layers,
  Maximize2,
  Minimize2,
  Navigation,
  Zap,
  Droplets,
  Thermometer,
} from "lucide-react";

interface Outage {
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

interface InteractiveMapProps {
  outages: Outage[];
  onOutageSelect?: (outage: Outage | null) => void;
  selectedOutage?: Outage | null;
  userDistrict?: string | null;
  showOnlyUserDistrict?: boolean;
  viewMode?: string;
}

// Sofia districts with approximate coordinates
const sofiaDistricts = {
  Център: { lat: 42.6977, lng: 23.3219, zoom: 15 },
  Младост: { lat: 42.6506, lng: 23.375, zoom: 14 },
  Люлин: { lat: 42.7089, lng: 23.2419, zoom: 14 },
  "Студентски град": { lat: 42.6536, lng: 23.3547, zoom: 15 },
  Лозенец: { lat: 42.6833, lng: 23.3333, zoom: 15 },
  Оборище: { lat: 42.7, lng: 23.33, zoom: 15 },
  Дружба: { lat: 42.6444, lng: 23.3889, zoom: 14 },
  "Овча купел": { lat: 42.6667, lng: 23.2333, zoom: 14 },
  "Красно село": { lat: 42.6867, lng: 23.2867, zoom: 14 },
  "Красна поляна": { lat: 42.7033, lng: 23.2767, zoom: 14 },
  Витоша: { lat: 42.6333, lng: 23.3, zoom: 14 },
  Сердика: { lat: 42.7, lng: 23.32, zoom: 15 },
  Възраждане: { lat: 42.7, lng: 23.31, zoom: 15 },
  Подуяне: { lat: 42.72, lng: 23.35, zoom: 14 },
  Слатина: { lat: 42.7, lng: 23.37, zoom: 14 },
  Илинден: { lat: 42.7167, lng: 23.3, zoom: 14 },
  Надежда: { lat: 42.73, lng: 23.29, zoom: 14 },
  Искър: { lat: 42.65, lng: 23.4, zoom: 14 },
  Панчарево: { lat: 42.5833, lng: 23.4167, zoom: 14 },
  Банкя: { lat: 42.7167, lng: 23.15, zoom: 14 },
};

const InteractiveMap = forwardRef<any, InteractiveMapProps>(
  (
    {
      outages,
      onOutageSelect,
      selectedOutage,
      userDistrict,
      showOnlyUserDistrict,
      viewMode,
    },
    ref
  ) => {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<any>(null);
    const markersRef = useRef<any[]>([]);
    const [mapLoaded, setMapLoaded] = useState(false);
    const [mapError, setMapError] = useState<string | null>(null);
    const [isClient, setIsClient] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [mapStyle, setMapStyle] = useState("default");

    // Ensure we're on the client side
    useEffect(() => {
      setIsClient(true);
    }, []);

    // Function to get coordinates for an outage based on area text
    const getOutageCoordinates = (outage: Outage) => {
      const area = outage.area.toLowerCase();
      const district = outage.district.toLowerCase();

      // Try to match district names
      for (const [districtName, coords] of Object.entries(sofiaDistricts)) {
        if (
          district.includes(districtName.toLowerCase()) ||
          area.includes(districtName.toLowerCase())
        ) {
          return {
            lat: coords.lat + (Math.random() - 0.5) * 0.01, // Add small random offset
            lng: coords.lng + (Math.random() - 0.5) * 0.01,
            district: districtName,
          };
        }
      }

      // Default to Sofia center if no match found
      return {
        lat: 42.6977 + (Math.random() - 0.5) * 0.02,
        lng: 23.3219 + (Math.random() - 0.5) * 0.02,
        district: "София",
      };
    };

    // Get marker color based on service type and severity
    const getMarkerColor = (outage: Outage) => {
      const baseColors = {
        water: "#3b82f6", // blue
        electricity: "#eab308", // yellow
        heating: "#ef4444", // red
      };

      const color = baseColors[outage.serviceType] || "#6b7280";

      // Adjust opacity based on severity
      if (outage.severity === "high") return color;
      if (outage.severity === "medium") return color + "cc";
      return color + "99";
    };

    // Get service icon for marker
    const getServiceIcon = (serviceType: string) => {
      switch (serviceType) {
        case "water":
          return "💧";
        case "electricity":
          return "⚡";
        case "heating":
          return "🔥";
        default:
          return "⚠️";
      }
    };

    // Initialize map
    useEffect(() => {
      if (!isClient || !mapRef.current) return;

      // Prevent multiple initializations
      if (mapInstanceRef.current) {
        return;
      }

      const initMap = async () => {
        try {
          // Wait longer for DOM to be ready
          await new Promise((resolve) => setTimeout(resolve, 500));

          // Double-check container exists and is mounted in the DOM
          if (!mapRef.current || !document.body.contains(mapRef.current)) {
            console.warn("Map container not found or not mounted in DOM");
            return;
          }

          // Ensure container has dimensions
          const container = mapRef.current;
          if (container.clientWidth === 0 || container.clientHeight === 0) {
            console.warn("Map container has zero dimensions");
            container.style.height = "600px";
            container.style.width = "100%";
          }

          // Clear any existing map instance
          if (mapInstanceRef.current) {
            try {
              mapInstanceRef.current.remove();
            } catch (e) {
              console.warn("Error removing existing map:", e);
            }
            mapInstanceRef.current = null;
          }

          // Dynamically import Leaflet with error handling
          let L;
          try {
            L = (await import("leaflet")).default;
          } catch (importError) {
            console.error("Failed to import Leaflet:", importError);
            setMapError(
              "Грешка при зареждане на картата: Leaflet не може да бъде зареден"
            );
            return;
          }

          // Initialize map with error handling
          try {
            const map = L.map(mapRef.current, {
              center: [42.6977, 23.3219],
              zoom: 12,
              zoomControl: false,
              preferCanvas: true,
              fadeAnimation: false,
              zoomAnimation: true,
              markerZoomAnimation: false,
            });

            // Add multiple tile layers for different styles
            const tileLayers = {
              default: L.tileLayer(
                "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
                {
                  attribution:
                    '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
                  maxZoom: 18,
                }
              ),
              satellite: L.tileLayer(
                "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
                {
                  attribution: '© <a href="https://www.esri.com/">Esri</a>',
                  maxZoom: 18,
                }
              ),
              dark: L.tileLayer(
                "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
                {
                  attribution:
                    '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> © <a href="https://carto.com/attributions">CARTO</a>',
                  maxZoom: 18,
                }
              ),
            };

            // Add default tile layer
            tileLayers.default.addTo(map);

            // Wait for map to be fully loaded
            map.whenReady(() => {
              mapInstanceRef.current = map;
              setMapLoaded(true);
              setMapError(null);

              // Force a resize after map is loaded to ensure proper rendering
              setTimeout(() => {
                if (map && typeof map.invalidateSize === "function") {
                  map.invalidateSize(true);
                }
              }, 100);
            });

            // Handle map errors
            map.on("error", (e) => {
              console.error("Map error:", e);
              setMapError("Грешка при зареждане на картата");
            });

            // Store tile layers for switching
            map.tileLayers = tileLayers;
          } catch (error) {
            console.error("Error initializing map:", error);
            setMapError(
              `Грешка при зареждане на картата: ${
                error.message || "Неизвестна грешка"
              }`
            );
          }
        } catch (error) {
          console.error("Error in map initialization:", error);
          setMapError("Грешка при зареждане на картата");
        }
      };

      // Delay initialization to ensure DOM is ready
      const timeoutId = setTimeout(initMap, 1000);

      // Cleanup function
      return () => {
        clearTimeout(timeoutId);
        if (mapInstanceRef.current) {
          try {
            // Clear all layers first
            markersRef.current.forEach((marker) => {
              try {
                if (mapInstanceRef.current) {
                  mapInstanceRef.current.removeLayer(marker);
                }
              } catch (e) {
                console.warn("Error removing marker:", e);
              }
            });
            markersRef.current = [];

            // Remove overlay layers
            if (mapInstanceRef.current.overlayLayer) {
              try {
                mapInstanceRef.current.removeLayer(
                  mapInstanceRef.current.overlayLayer
                );
              } catch (e) {
                console.warn("Error removing overlay:", e);
              }
            }

            if (mapInstanceRef.current.boundaryLayer) {
              try {
                mapInstanceRef.current.removeLayer(
                  mapInstanceRef.current.boundaryLayer
                );
              } catch (e) {
                console.warn("Error removing boundary:", e);
              }
            }

            if (mapInstanceRef.current.highlightLayer) {
              try {
                mapInstanceRef.current.removeLayer(
                  mapInstanceRef.current.highlightLayer
                );
              } catch (e) {
                console.warn("Error removing highlight:", e);
              }
            }

            if (mapInstanceRef.current.labelMarker) {
              try {
                mapInstanceRef.current.removeLayer(
                  mapInstanceRef.current.labelMarker
                );
              } catch (e) {
                console.warn("Error removing label:", e);
              }
            }

            // Remove the map instance
            mapInstanceRef.current.remove();
            mapInstanceRef.current = null;
            setMapLoaded(false);
          } catch (e) {
            console.warn("Error during cleanup:", e);
            mapInstanceRef.current = null;
            setMapLoaded(false);
          }
        }
      };
    }, [isClient]);

    // Handle user district focus and overlay
    useEffect(() => {
      if (!mapInstanceRef.current || !mapLoaded) return;

      const updateMapFocus = async () => {
        try {
          // Wait for any ongoing animations to complete
          await new Promise((resolve) => setTimeout(resolve, 100));

          // Additional safety check
          if (
            !mapInstanceRef.current ||
            !mapInstanceRef.current.getContainer()
          ) {
            console.warn("Map instance not ready for focus update");
            return;
          }

          const L = (await import("leaflet")).default;

          // Remove existing layers safely
          if (mapInstanceRef.current.overlayLayer) {
            try {
              mapInstanceRef.current.removeLayer(
                mapInstanceRef.current.overlayLayer
              );
            } catch (e) {
              console.warn("Error removing overlay layer:", e);
            } finally {
              mapInstanceRef.current.overlayLayer = null;
            }
          }

          if (mapInstanceRef.current.boundaryLayer) {
            try {
              mapInstanceRef.current.removeLayer(
                mapInstanceRef.current.boundaryLayer
              );
            } catch (e) {
              console.warn("Error removing boundary layer:", e);
            } finally {
              mapInstanceRef.current.boundaryLayer = null;
            }
          }

          if (
            userDistrict &&
            showOnlyUserDistrict &&
            sofiaDistricts[userDistrict] &&
            mapInstanceRef.current
          ) {
            const districtCoords = sofiaDistricts[userDistrict];

            // Use flyTo instead of setView for smoother animation
            mapInstanceRef.current.flyTo(
              [districtCoords.lat, districtCoords.lng],
              districtCoords.zoom,
              {
                animate: true,
                duration: 1.5,
              }
            );

            // Wait for the view change to complete before adding overlays
            setTimeout(() => {
              if (!mapInstanceRef.current) return;

              try {
                const bounds = mapInstanceRef.current.getBounds();
                if (!bounds) return;

                const southWest = bounds.getSouthWest();
                const northEast = bounds.getNorthEast();

                const outerBounds = [
                  [southWest.lat - 0.5, southWest.lng - 0.5],
                  [northEast.lat + 0.5, northEast.lng + 0.5],
                ];

                const districtRadius = 0.02;
                const innerBounds = [
                  [
                    districtCoords.lat - districtRadius,
                    districtCoords.lng - districtRadius,
                  ],
                  [
                    districtCoords.lat + districtRadius,
                    districtCoords.lng + districtRadius,
                  ],
                ];

                const overlayPolygon = L.polygon(
                  [
                    [
                      [outerBounds[0][0], outerBounds[0][1]],
                      [outerBounds[1][0], outerBounds[0][1]],
                      [outerBounds[1][0], outerBounds[1][1]],
                      [outerBounds[0][0], outerBounds[1][1]],
                      [outerBounds[0][0], outerBounds[0][1]],
                    ],
                    [
                      [innerBounds[0][0], innerBounds[0][1]],
                      [innerBounds[0][0], innerBounds[1][1]],
                      [innerBounds[1][0], innerBounds[1][1]],
                      [innerBounds[1][0], innerBounds[0][1]],
                      [innerBounds[0][0], innerBounds[0][1]],
                    ],
                  ],
                  {
                    fillColor: "#000000",
                    fillOpacity: 0.3,
                    stroke: false,
                    interactive: false,
                  }
                );

                if (mapInstanceRef.current) {
                  overlayPolygon.addTo(mapInstanceRef.current);
                  mapInstanceRef.current.overlayLayer = overlayPolygon;
                }

                const districtBoundary = L.circle(
                  [districtCoords.lat, districtCoords.lng],
                  {
                    radius: districtRadius * 111000,
                    fillColor: "#3b82f6",
                    fillOpacity: 0.1,
                    color: "#3b82f6",
                    weight: 3,
                    opacity: 0.8,
                    interactive: false,
                  }
                );

                if (mapInstanceRef.current) {
                  districtBoundary.addTo(mapInstanceRef.current);
                  mapInstanceRef.current.boundaryLayer = districtBoundary;
                }
              } catch (error) {
                console.warn("Error adding overlay layers:", error);
              }
            }, 1600); // Wait for flyTo animation to complete
          } else if (mapInstanceRef.current) {
            // Reset to Sofia center view
            mapInstanceRef.current.flyTo([42.6977, 23.3219], 12, {
              animate: true,
              duration: 1,
            });
          }
        } catch (error) {
          console.error("Error updating map focus:", error);
        }
      };

      // Debounce the update to prevent rapid calls
      const timeoutId = setTimeout(updateMapFocus, 200);
      return () => clearTimeout(timeoutId);
    }, [userDistrict, showOnlyUserDistrict, mapLoaded]);

    // Update markers when outages change
    useEffect(() => {
      if (!mapInstanceRef.current || !mapLoaded) return;

      const updateMarkers = async () => {
        try {
          // Safety check
          if (
            !mapInstanceRef.current ||
            !mapInstanceRef.current.getContainer()
          ) {
            console.warn("Map instance not ready for marker update");
            return;
          }

          const L = (await import("leaflet")).default;

          // Clear existing markers safely
          markersRef.current.forEach((marker) => {
            try {
              if (mapInstanceRef.current && marker) {
                mapInstanceRef.current.removeLayer(marker);
              }
            } catch (e) {
              console.warn("Error removing marker:", e);
            }
          });
          markersRef.current = [];

          // Add new markers
          outages.forEach((outage) => {
            if (!mapInstanceRef.current) return;

            try {
              const coords = getOutageCoordinates(outage);
              const color = getMarkerColor(outage);
              const serviceIcon = getServiceIcon(outage.serviceType);

              const customIcon = L.divIcon({
                className: "custom-marker",
                html: `
                  <div class="marker-container">
                    <div class="marker-pulse ${
                      outage.severity === "high" ? "pulse-high" : ""
                    }"></div>
                    <div class="marker-main" style="background: linear-gradient(135deg, ${color}, ${color}dd);">
                      <span class="marker-icon">${serviceIcon}</span>
                      ${
                        outage.severity === "high"
                          ? '<div class="marker-priority"></div>'
                          : ""
                      }
                    </div>
                    <div class="marker-shadow"></div>
                  </div>
                `,
                iconSize: [40, 40],
                iconAnchor: [20, 35],
              });

              const marker = L.marker([coords.lat, coords.lng], {
                icon: customIcon,
              });

              if (mapInstanceRef.current) {
                marker.addTo(mapInstanceRef.current);

                const popupContent = `
                  <div class="custom-popup">
                    <div class="popup-header">
                      <div class="popup-service-icon">${serviceIcon}</div>
                      <div class="popup-title">
                        <h3>${
                          outage.type &&
                          outage.type.toLowerCase().includes("аварийно")
                            ? "🚨 Авария"
                            : outage.type &&
                              outage.type.toLowerCase().includes("планирано")
                            ? "⏰ Планирано"
                            : "🔧 В ход"
                        }</h3>
                        ${
                          outage.severity === "high"
                            ? '<span class="popup-priority">ВИСОК ПРИОРИТЕТ</span>'
                            : ""
                        }
                      </div>
                    </div>
                    
                    <div class="popup-content">
                      <div class="popup-location">
                        <MapPin size="16" />
                        <span>${outage.area}</span>
                      </div>
                      
                      ${
                        outage.description
                          ? `<div class="popup-description">${outage.description}</div>`
                          : ""
                      }
                      
                      ${
                        outage.start && outage.end
                          ? `
                        <div class="popup-time">
                          <div class="time-icon">⏰</div>
                          <div class="time-details">
                            <div class="time-period">${outage.start} - ${outage.end}</div>
                          </div>
                        </div>
                      `
                          : ""
                      }
                      
                      <div class="popup-footer">
                        <div class="popup-source">
                          <span>Източник:</span> ${outage.source}
                        </div>
                        <div class="popup-district">
                          <span>Квартал:</span> ${outage.district}
                        </div>
                      </div>
                    </div>
                  </div>
                `;

                marker.bindPopup(popupContent, {
                  maxWidth: 380,
                  className: "modern-popup",
                  closeButton: true,
                  autoPan: true,
                });

                marker.on("click", () => {
                  if (onOutageSelect) {
                    onOutageSelect(outage);
                  }
                });

                markersRef.current.push(marker);
              }
            } catch (error) {
              console.warn(
                "Error creating marker for outage:",
                outage.id,
                error
              );
            }
          });

          // Auto-fit bounds with delay
          if (outages.length > 0 && mapInstanceRef.current) {
            setTimeout(() => {
              if (!mapInstanceRef.current) return;

              try {
                const coords = outages.map(getOutageCoordinates);
                const lats = coords.map((c) => c.lat);
                const lngs = coords.map((c) => c.lng);

                if (lats.length > 0 && lngs.length > 0) {
                  const bounds = [
                    [Math.min(...lats), Math.min(...lngs)],
                    [Math.max(...lats), Math.max(...lngs)],
                  ];

                  mapInstanceRef.current.fitBounds(bounds, {
                    padding: [20, 20],
                    animate: true,
                    duration: 0.5,
                  });

                  // Invalidate size after bounds change
                  setTimeout(() => {
                    if (mapInstanceRef.current) {
                      mapInstanceRef.current.invalidateSize();
                    }
                  }, 600);
                }
              } catch (e) {
                console.warn("Error fitting bounds:", e);
              }
            }, 500);
          }
        } catch (error) {
          console.error("Error updating markers:", error);
        }
      };

      // Debounce marker updates
      const timeoutId = setTimeout(updateMarkers, 300);
      return () => clearTimeout(timeoutId);
    }, [outages, mapLoaded, onOutageSelect]);

    // Handle selected outage change
    useEffect(() => {
      if (!mapInstanceRef.current || !selectedOutage) return;

      try {
        const coords = getOutageCoordinates(selectedOutage);
        mapInstanceRef.current.setView([coords.lat, coords.lng], 15, {
          animate: true,
          duration: 1,
        });
      } catch (error) {
        console.error("Error setting view for selected outage:", error);
      }
    }, [selectedOutage]);

    // Focus on specific outage
    const focusOnOutage = (outage: Outage) => {
      if (!mapInstanceRef.current) return;

      try {
        const coords = getOutageCoordinates(outage);

        // Set as selected outage first
        if (onOutageSelect) {
          onOutageSelect(outage);
        }

        // Zoom to the outage location with higher zoom level
        mapInstanceRef.current.setView([coords.lat, coords.lng], 17, {
          animate: true,
          duration: 1.5,
        });

        // Add area highlighting after zoom
        setTimeout(() => {
          highlightOutageArea(outage, coords);

          // Find and open the popup for this outage
          markersRef.current.forEach((marker) => {
            const markerLatLng = marker.getLatLng();
            if (
              Math.abs(markerLatLng.lat - coords.lat) < 0.001 &&
              Math.abs(markerLatLng.lng - coords.lng) < 0.001
            ) {
              marker.openPopup();
            }
          });
        }, 1600);
      } catch (error) {
        console.error("Error focusing on outage:", error);
      }
    };

    // Add new method for highlighting outage area with circular district highlighting
    const highlightOutageArea = async (outage: Outage, coords: any) => {
      if (!mapInstanceRef.current) return;

      try {
        const L = (await import("leaflet")).default;

        // Remove existing highlight layers
        if (mapInstanceRef.current.highlightLayer) {
          try {
            mapInstanceRef.current.removeLayer(
              mapInstanceRef.current.highlightLayer
            );
          } catch (e) {
            console.warn("Error removing highlight layer:", e);
          }
        }

        if (mapInstanceRef.current.overlayHighlight) {
          try {
            mapInstanceRef.current.removeLayer(
              mapInstanceRef.current.overlayHighlight
            );
          } catch (e) {
            console.warn("Error removing overlay highlight:", e);
          }
        }

        // Create a circular area highlight for the affected district
        const districtRadius = 800; // Radius in meters - adjust based on district size

        // Get the district info to adjust radius
        const districtInfo = sofiaDistricts[outage.district];
        let adjustedRadius = districtRadius;

        if (districtInfo) {
          // Adjust radius based on zoom level - larger districts get bigger radius
          adjustedRadius = districtInfo.zoom > 14 ? 600 : 1000;
        }

        // Create the main highlighted area (circle)
        const highlightedArea = L.circle([coords.lat, coords.lng], {
          radius: adjustedRadius,
          fillColor: "#ef4444",
          fillOpacity: 0.25,
          color: "#ef4444",
          weight: 3,
          opacity: 0.8,
          interactive: false,
        });

        // Create an inner circle for the immediate affected area
        const innerArea = L.circle([coords.lat, coords.lng], {
          radius: adjustedRadius * 0.4,
          fillColor: "#dc2626",
          fillOpacity: 0.4,
          color: "#dc2626",
          weight: 2,
          opacity: 0.9,
          interactive: false,
        });

        // Create overlay for the rest of the map
        const mapBounds = mapInstanceRef.current.getBounds();
        const southWest = mapBounds.getSouthWest();
        const northEast = mapBounds.getNorthEast();

        // Extend bounds to cover more area
        const extendedBounds = [
          [southWest.lat - 0.1, southWest.lng - 0.1],
          [northEast.lat + 0.1, northEast.lng + 0.1],
        ];

        // Create the area bounds for the hole in overlay
        const radiusInDegrees = adjustedRadius / 111000; // Convert meters to approximate degrees
        const circleBounds = [];

        // Create a polygon approximating the circle for the hole
        for (let i = 0; i <= 32; i++) {
          const angle = (i * 2 * Math.PI) / 32;
          const lat = coords.lat + radiusInDegrees * Math.cos(angle);
          const lng = coords.lng + radiusInDegrees * Math.sin(angle);
          circleBounds.push([lat, lng]);
        }

        // Create overlay with hole
        const overlayPolygon = L.polygon(
          [
            [
              [extendedBounds[0][0], extendedBounds[0][1]],
              [extendedBounds[1][0], extendedBounds[0][1]],
              [extendedBounds[1][0], extendedBounds[1][1]],
              [extendedBounds[0][0], extendedBounds[1][1]],
              [extendedBounds[0][0], extendedBounds[0][1]],
            ],
            circleBounds.reverse(), // Reverse to create hole
          ],
          {
            fillColor: "#000000",
            fillOpacity: 0.3,
            stroke: false,
            interactive: false,
          }
        );

        // Add all layers to map
        const layerGroup = L.layerGroup([
          overlayPolygon,
          highlightedArea,
          innerArea,
        ]);
        layerGroup.addTo(mapInstanceRef.current);
        mapInstanceRef.current.highlightLayer = layerGroup;

        // Add a label for the affected area
        const labelMarker = L.marker(
          [coords.lat + radiusInDegrees * 0.7, coords.lng],
          {
            icon: L.divIcon({
              className: "area-label",
              html: `
          <div style="
            background: rgba(239, 68, 68, 0.9);
            color: white;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: bold;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
            white-space: nowrap;
          ">
            Засегната зона: ${outage.district}
          </div>
        `,
              iconSize: [120, 20],
              iconAnchor: [60, 10],
            }),
            interactive: false,
          }
        );

        labelMarker.addTo(mapInstanceRef.current);
        mapInstanceRef.current.labelMarker = labelMarker;

        // Auto-remove highlight after 15 seconds
        setTimeout(() => {
          if (mapInstanceRef.current && mapInstanceRef.current.highlightLayer) {
            try {
              mapInstanceRef.current.removeLayer(
                mapInstanceRef.current.highlightLayer
              );
              if (mapInstanceRef.current.labelMarker) {
                mapInstanceRef.current.removeLayer(
                  mapInstanceRef.current.labelMarker
                );
              }
            } catch (e) {
              console.warn("Error removing auto highlight:", e);
            }
          }
        }, 15000);
      } catch (error) {
        console.error("Error highlighting area:", error);
      }
    };

    // Helper function to parse street information from area text
    const parseStreetInfo = (areaText: string) => {
      const streets = [];
      const streetRegex =
        /(ул\.|бул\.|пл\.|алея|кв\.)\s+([А-Яа-я\s\d-]+?)(?:\s+(?:от|между|до|и)|$|,)/g;
      let match;

      while ((match = streetRegex.exec(areaText)) !== null) {
        streets.push(`${match[1]} ${match[2].trim()}`);
      }

      // If no streets found, try to extract any capitalized words that might be street names
      if (streets.length === 0) {
        const words = areaText.split(/\s+/);
        for (let i = 0; i < words.length; i++) {
          if (/^[А-Я]/.test(words[i]) && words[i].length > 3) {
            streets.push(words[i]);
          }
        }
      }

      return {
        streets,
        district: areaText.match(/кв\.\s+([А-Яа-я\s\d-]+)/)
          ? areaText.match(/кв\.\s+([А-Яа-я\s\d-]+)/)[1].trim()
          : null,
      };
    };

    // Expose the focusOnOutage method via ref
    useImperativeHandle(
      ref,
      () => ({
        focusOnOutage: (outage: Outage) => {
          if (!mapInstanceRef.current) return;

          try {
            const coords = getOutageCoordinates(outage);

            if (onOutageSelect) {
              onOutageSelect(outage);
            }

            mapInstanceRef.current.setView([coords.lat, coords.lng], 17, {
              animate: true,
              duration: 1.5,
            });
          } catch (error) {
            console.error("Error focusing on outage:", error);
          }
        },
        resetView: () => {
          if (mapInstanceRef.current) {
            try {
              mapInstanceRef.current.setView([42.6977, 23.3219], 12, {
                animate: true,
                duration: 1,
              });
            } catch (error) {
              console.error("Error resetting view:", error);
            }
          }
        },
        zoomToOutages: () => {
          if (!mapInstanceRef.current || outages.length === 0) return;

          try {
            const coords = outages.map(getOutageCoordinates);
            const lats = coords.map((c) => c.lat);
            const lngs = coords.map((c) => c.lng);

            const bounds = [
              [Math.min(...lats), Math.min(...lngs)],
              [Math.max(...lats), Math.max(...lngs)],
            ];

            mapInstanceRef.current.fitBounds(bounds, { padding: [20, 20] });
          } catch (error) {
            console.error("Error zooming to outages:", error);
          }
        },
      }),
      [outages, onOutageSelect]
    );

    // Toggle fullscreen
    const toggleFullscreen = () => {
      setIsFullscreen(!isFullscreen);
      setTimeout(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      }, 300);
    };

    // Change map style
    const changeMapStyle = async (style: string) => {
      if (!mapInstanceRef.current) return;

      try {
        const L = (await import("leaflet")).default;

        // Remove current tile layer
        mapInstanceRef.current.eachLayer((layer: any) => {
          if (layer instanceof L.TileLayer) {
            mapInstanceRef.current.removeLayer(layer);
          }
        });

        // Add new tile layer based on style
        let newLayer;
        switch (style) {
          case "satellite":
            newLayer = L.tileLayer(
              "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
              {
                attribution: '© <a href="https://www.esri.com/">Esri</a>',
                maxZoom: 18,
              }
            );
            break;
          case "dark":
            newLayer = L.tileLayer(
              "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
              {
                attribution:
                  '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> © <a href="https://carto.com/attributions">CARTO</a>',
                maxZoom: 18,
              }
            );
            break;
          default:
            newLayer = L.tileLayer(
              "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
              {
                attribution:
                  '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
                maxZoom: 18,
              }
            );
        }

        newLayer.addTo(mapInstanceRef.current);
        setMapStyle(style);
      } catch (error) {
        console.error("Error changing map style:", error);
      }
    };

    // Don't render on server side
    if (!isClient) {
      return (
        <div className="rounded-2xl overflow-hidden shadow-2xl">
          <CardHeader className="px-8 py-6 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white">
            <CardTitle className="flex items-center gap-3 font-bold text-xl">
              <MapPin className="h-6 w-6" />
              Интерактивна карта на прекъсванията
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="h-[600px] w-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
              <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-6"></div>
                <p className="text-gray-700 font-semibold text-lg">
                  Зареждане на картата...
                </p>
              </div>
            </div>
          </CardContent>
        </div>
      );
    }

    if (mapError) {
      return (
        <Card className="h-96 shadow-2xl">
          <CardContent className="flex items-center justify-center h-full">
            <div className="text-center">
              <MapPin className="h-16 w-16 text-gray-400 mx-auto mb-6" />
              <p className="text-xl text-gray-600 mb-4">{mapError}</p>
              <p className="text-sm text-gray-500">
                Моля опитайте да презаредите страницата
              </p>
            </div>
          </CardContent>
        </Card>
      );
    }

    return (
      <div
        className={`rounded-2xl overflow-hidden shadow-2xl transition-all duration-300 ${
          isFullscreen ? "fixed inset-4 z-50" : ""
        }`}
      >
        <CardHeader className="px-8 py-6 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-3 font-bold text-xl">
              <MapPin className="h-6 w-6" />
              Интерактивна карта на прекъсванията
            </CardTitle>
            <div className="flex items-center gap-3">
              {/* Map Style Selector */}
              <div className="flex items-center gap-2 bg-white/20 rounded-lg p-1">
                <button
                  onClick={() => changeMapStyle("default")}
                  className={`px-3 py-1 rounded text-sm font-medium transition-all ${
                    mapStyle === "default"
                      ? "bg-white text-blue-700"
                      : "text-white/80 hover:text-white"
                  }`}
                >
                  Карта
                </button>
                <button
                  onClick={() => changeMapStyle("satellite")}
                  className={`px-3 py-1 rounded text-sm font-medium transition-all ${
                    mapStyle === "satellite"
                      ? "bg-white text-blue-700"
                      : "text-white/80 hover:text-white"
                  }`}
                >
                  Сателит
                </button>
                <button
                  onClick={() => changeMapStyle("dark")}
                  className={`px-3 py-1 rounded text-sm font-medium transition-all ${
                    mapStyle === "dark"
                      ? "bg-white text-blue-700"
                      : "text-white/80 hover:text-white"
                  }`}
                >
                  Тъмна
                </button>
              </div>

              {/* Control Buttons */}
              <Button
                variant="secondary"
                size="sm"
                className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                onClick={() => {
                  if (mapInstanceRef.current) {
                    mapInstanceRef.current.setView([42.6977, 23.3219], 12, {
                      animate: true,
                      duration: 1,
                    });
                  }
                }}
              >
                <Navigation className="h-4 w-4 mr-2" />
                Център
              </Button>
              <Button
                variant="secondary"
                size="sm"
                className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                onClick={() => {
                  if (!mapInstanceRef.current || outages.length === 0) return;
                  const coords = outages.map(getOutageCoordinates);
                  const lats = coords.map((c) => c.lat);
                  const lngs = coords.map((c) => c.lng);
                  const bounds = [
                    [Math.min(...lats), Math.min(...lngs)],
                    [Math.max(...lats), Math.max(...lngs)],
                  ];
                  mapInstanceRef.current.fitBounds(bounds, {
                    padding: [20, 20],
                  });
                }}
              >
                <Layers className="h-4 w-4 mr-2" />
                Всички
              </Button>
              <Button
                variant="secondary"
                size="sm"
                className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                onClick={toggleFullscreen}
              >
                {isFullscreen ? (
                  <Minimize2 className="h-4 w-4" />
                ) : (
                  <Maximize2 className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Enhanced Legend */}
          <div className="flex items-center justify-between w-full mt-6">
            <div className="flex items-center gap-8 text-sm">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-500 rounded-full shadow-lg flex items-center justify-center text-white font-bold">
                  <Droplets className="h-4 w-4" />
                </div>
                <span className="text-white/90 font-medium">Вода</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-yellow-500 rounded-full shadow-lg flex items-center justify-center text-white font-bold">
                  <Zap className="h-4 w-4" />
                </div>
                <span className="text-white/90 font-medium">Ток</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-red-500 rounded-full shadow-lg flex items-center justify-center text-white font-bold">
                  <Thermometer className="h-4 w-4" />
                </div>
                <span className="text-white/90 font-medium">Топлофикация</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse shadow-lg"></div>
                <span className="text-white/90 font-medium text-sm">
                  Висок приоритет
                </span>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0 relative">
          <div className="relative">
            <div
              ref={mapRef}
              className="h-[600px] w-full"
              style={{ minHeight: "500px" }}
            />

            {!mapLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-6"></div>
                  <p className="text-gray-700 font-semibold text-lg">
                    Зареждане на картата...
                  </p>
                </div>
              </div>
            )}
          </div>

          {mapLoaded && (
            <div className="px-8 py-4 bg-gradient-to-r from-gray-50 to-gray-100 text-sm text-gray-700 border-t">
              <div className="flex items-center justify-between">
                <p className="flex items-center gap-2">
                  <span className="text-2xl">💡</span>
                  <span className="font-medium">
                    Натиснете на маркер за повече информация
                  </span>
                </p>
                <p className="font-bold text-blue-700 flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  {outages.length} прекъсвания в София
                </p>
              </div>
            </div>
          )}
        </CardContent>

        {/* Custom CSS for markers and popups */}
        <style jsx global>{`
          .marker-container {
            position: relative;
            width: 40px;
            height: 40px;
          }

          .marker-pulse {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 60px;
            height: 60px;
            background: rgba(59, 130, 246, 0.3);
            border-radius: 50%;
            animation: pulse 2s infinite;
          }

          .pulse-high {
            background: rgba(239, 68, 68, 0.4) !important;
            animation: pulse-urgent 1s infinite;
          }

          @keyframes pulse {
            0% {
              transform: translate(-50%, -50%) scale(0.8);
              opacity: 1;
            }
            100% {
              transform: translate(-50%, -50%) scale(1.5);
              opacity: 0;
            }
          }

          @keyframes pulse-urgent {
            0%,
            100% {
              transform: translate(-50%, -50%) scale(0.8);
              opacity: 1;
            }
            50% {
              transform: translate(-50%, -50%) scale(1.3);
              opacity: 0.5;
            }
          }

          .marker-main {
            position: relative;
            width: 32px;
            height: 32px;
            border-radius: 50%;
            border: 3px solid white;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10;
            transition: all 0.3s ease;
          }

          .marker-main:hover {
            transform: scale(1.1);
            box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
          }

          .marker-icon {
            font-size: 16px;
            filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3));
          }

          .marker-priority {
            position: absolute;
            top: -3px;
            right: -3px;
            width: 12px;
            height: 12px;
            background: #ef4444;
            border: 2px solid white;
            border-radius: 50%;
            animation: priority-blink 1s infinite;
          }

          @keyframes priority-blink {
            0%,
            100% {
              opacity: 1;
            }
            50% {
              opacity: 0.5;
            }
          }

          .marker-shadow {
            position: absolute;
            bottom: -5px;
            left: 50%;
            transform: translateX(-50%);
            width: 20px;
            height: 8px;
            background: rgba(0, 0, 0, 0.2);
            border-radius: 50%;
            filter: blur(3px);
          }

          .custom-popup {
            font-family: system-ui, -apple-system, sans-serif;
            max-width: 350px;
            padding: 0;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
          }

          .popup-header {
            background: linear-gradient(135deg, #3b82f6, #1d4ed8);
            color: white;
            padding: 16px;
            display: flex;
            align-items: center;
            gap: 12px;
          }

          .popup-service-icon {
            font-size: 24px;
            filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
          }

          .popup-title h3 {
            margin: 0;
            font-size: 18px;
            font-weight: bold;
          }

          .popup-priority {
            background: #ef4444;
            color: white;
            padding: 2px 8px;
            border-radius: 12px;
            font-size: 10px;
            font-weight: bold;
            margin-top: 4px;
            display: inline-block;
            animation: priority-glow 2s infinite;
          }

          @keyframes priority-glow {
            0%,
            100% {
              box-shadow: 0 0 5px rgba(239, 68, 68, 0.5);
            }
            50% {
              box-shadow: 0 0 15px rgba(239, 68, 68, 0.8);
            }
          }

          .popup-content {
            padding: 16px;
            background: white;
          }

          .popup-location {
            display: flex;
            align-items: center;
            gap: 8px;
            font-weight: bold;
            color: #374151;
            margin-bottom: 12px;
            font-size: 14px;
          }

          .popup-description {
            color: #6b7280;
            line-height: 1.5;
            margin-bottom: 12px;
            font-size: 13px;
          }

          .popup-time {
            display: flex;
            align-items: center;
            gap: 10px;
            background: #f3f4f6;
            padding: 10px;
            border-radius: 8px;
            margin-bottom: 12px;
          }

          .time-icon {
            font-size: 16px;
          }

          .time-period {
            font-weight: 600;
            color: #374151;
            font-size: 13px;
          }

          .popup-footer {
            border-top: 1px solid #e5e7eb;
            padding-top: 12px;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 8px;
            font-size: 11px;
            color: #6b7280;
          }

          .popup-footer span {
            font-weight: 600;
            color: #374151;
          }

          .modern-popup .leaflet-popup-content-wrapper {
            background: transparent;
            border-radius: 12px;
            box-shadow: none;
            padding: 0;
          }

          .modern-popup .leaflet-popup-content {
            margin: 0;
            padding: 0;
          }

          .modern-popup .leaflet-popup-tip {
            background: white;
            box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
          }
        `}</style>
      </div>
    );
  }
);

export default InteractiveMap;
