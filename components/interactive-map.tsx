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
  Target,
  Maximize2,
  Satellite,
  Moon,
} from "lucide-react";
import { useAppStore } from "@/lib/store";
import { sofiaDistricts } from "@/constants/sofiaDistricts";

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
    const [initAttempts, setInitAttempts] = useState(0);
    const [mapTypeLocal, setMapTypeLocal] = useState<
      "normal" | "satellite" | "dark"
    >("normal");
    const [serviceFilter, setServiceFilter] = useState<string>("all");
    const [priorityFilter, setPriorityFilter] = useState<boolean>(false);
    const maxInitAttempts = 5;
    const { setSelectedService, applyFilters } = useAppStore();
    const [isFullscreen, setIsFullscreen] = useState(false);

    // Ensure we're on the client side
    useEffect(() => {
      setIsClient(true);
    }, []);

    // Filter outages based on current filters
    const filteredOutages = outages.filter((outage) => {
      if (serviceFilter !== "all" && outage.serviceType !== serviceFilter) {
        return false;
      }
      if (priorityFilter && outage.severity !== "high") {
        return false;
      }
      return true;
    });

    // Handle service filter click
    const handleServiceFilter = (service: string) => {
      if (serviceFilter === service) {
        setServiceFilter("all");
        setSelectedService("all");
      } else {
        setServiceFilter(service);
        setSelectedService(service);
      }
      applyFilters();
    };

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
          return "🏠";
        default:
          return "⚠️";
      }
    };

    // Initialize map
    useEffect(() => {
      if (!isClient) return;

      // Don't try to initialize if we've reached max attempts
      if (initAttempts >= maxInitAttempts) {
        setMapError(
          `Грешка при зареждане на картата: Достигнат максимален брой опити (${maxInitAttempts})`
        );
        return;
      }

      // If map is already initialized, don't try again
      if (mapInstanceRef.current) {
        return;
      }

      const initMap = async () => {
        try {
          console.log(
            `Map initialization attempt ${initAttempts + 1}/${maxInitAttempts}`
          );

          // Wait for DOM to be ready
          await new Promise((resolve) =>
            setTimeout(resolve, 500 + initAttempts * 300)
          );

          // Check if component is still mounted
          if (!mapRef.current) {
            console.warn("Map container ref is null, will retry");
            setInitAttempts((prev) => prev + 1);
            return;
          }

          // Double-check container exists and is mounted in the DOM
          if (!document.body.contains(mapRef.current)) {
            console.warn("Map container not found in DOM, will retry");
            setInitAttempts((prev) => prev + 1);
            return;
          }

          // Ensure container has dimensions
          const container = mapRef.current;
          if (container.clientWidth === 0 || container.clientHeight === 0) {
            console.warn(
              "Map container has zero dimensions, setting default dimensions"
            );
            container.style.height = "300px";
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

            // Add Leaflet CSS if not already added
            if (!document.querySelector('link[href*="leaflet.css"]')) {
              const link = document.createElement("link");
              link.rel = "stylesheet";
              link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
              link.integrity =
                "sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=";
              link.crossOrigin = "";
              document.head.appendChild(link);
            }
          } catch (importError) {
            console.error("Failed to import Leaflet:", importError);
            setMapError(
              "Грешка при зареждане на картата: Leaflet не може да бъде зареден"
            );
            return;
          }

          // Final check before initialization
          if (!mapRef.current || !document.body.contains(mapRef.current)) {
            console.warn(
              "Map container lost during initialization, will retry"
            );
            setInitAttempts((prev) => prev + 1);
            return;
          }

          // Initialize map with error handling
          try {
            console.log("Creating map instance");
            const map = L.map(mapRef.current, {
              center: [42.6977, 23.3219],
              zoom: 12,
              zoomControl: true,
              preferCanvas: true, // Use canvas for better performance
              fadeAnimation: false, // Disable fade animation to prevent issues
              zoomAnimation: true,
              markerZoomAnimation: false,
              scrollWheelZoom: true,
              doubleClickZoom: true,
              touchZoom: true,
              boxZoom: true,
              keyboard: true,
            });

            // Add tile layer based on map type
            const getTileLayer = () => {
              switch (mapTypeLocal) {
                case "satellite":
                  return L.tileLayer(
                    "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
                    {
                      attribution:
                        "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community",
                    }
                  );
                case "dark":
                  return L.tileLayer(
                    "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
                    {
                      attribution:
                        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
                    }
                  );
                default:
                  return L.tileLayer(
                    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
                    {
                      attribution:
                        '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                    }
                  );
              }
            };

            getTileLayer().addTo(map);

            // Add custom zoom controls
            L.control
              .zoom({
                position: "bottomright",
              })
              .addTo(map);

            // Wait for map to be fully loaded
            map.whenReady(() => {
              console.log("Map is ready");
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
          } catch (error) {
            console.error("Error initializing map:", error);
            setMapError(
              `Грешка при зареждане на картата: ${
                error.message || "Неизвестна грешка"
              }`
            );
            setInitAttempts((prev) => prev + 1);
          }
        } catch (error) {
          console.error("Error in map initialization:", error);
          setMapError("Грешка при зареждане на картата");
          setInitAttempts((prev) => prev + 1);
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
    }, [isClient, initAttempts, maxInitAttempts, mapTypeLocal]);

    // Retry initialization if it fails
    useEffect(() => {
      if (mapError && initAttempts < maxInitAttempts && !mapLoaded) {
        const retryTimeout = setTimeout(() => {
          setInitAttempts((prev) => prev + 1);
        }, 2000);

        return () => clearTimeout(retryTimeout);
      }
    }, [mapError, initAttempts, maxInitAttempts, mapLoaded]);

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
              <div style="
                background: linear-gradient(135deg, ${color}, ${color}dd);
                width: 28px;
                height: 28px;
                border-radius: 50%;
                border: 3px solid white;
                box-shadow: 0 4px 8px rgba(0,0,0,0.2);
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-weight: bold;
                font-size: 14px;
                transition: all 0.2s ease;
                position: relative;
              ">
                ${serviceIcon}
                ${
                  outage.severity === "high"
                    ? '<div style="position: absolute; top: -2px; right: -2px; width: 8px; height: 8px; background: #ef4444; border-radius: 50%; border: 1px solid white;"></div>'
                    : ""
                }
              </div>
            `,
                iconSize: [34, 34],
                iconAnchor: [17, 17],
              });

              const marker = L.marker([coords.lat, coords.lng], {
                icon: customIcon,
              });

              if (mapInstanceRef.current) {
                marker.addTo(mapInstanceRef.current);

                const popupContent = `
              <div style="min-width: 240px; font-family: system-ui; padding: 4px;">
                <h3 style="margin: 0 0 8px 0; color: ${color}; font-size: 16px; font-weight: bold; display: flex; align-items: center; gap: 8px;">
                  ${serviceIcon}
                  ${
                    outage.type &&
                    outage.type.toLowerCase().includes("аварийно")
                      ? "🚨 Авария"
                      : outage.type &&
                        outage.type.toLowerCase().includes("планирано")
                      ? "⏰ Планирано"
                      : "🔧 В ход"
                  }
                  ${
                    outage.severity === "high"
                      ? '<span style="background: #ef4444; color: white; padding: 2px 6px; border-radius: 12px; font-size: 10px;">ВИСОК</span>'
                      : ""
                  }
                </h3>
                <p style="margin: 0 0 8px 0; font-size: 13px; font-weight: bold; color: #333;">
                  📍 ${outage.area}
                </p>
                ${
                  outage.description
                    ? `
                  <p style="margin: 0 0 8px 0; font-size: 12px; color: #666; line-height: 1.4;">
                    ${outage.description}
                  </p>
                `
                    : ""
                }
                ${
                  outage.start && outage.end
                    ? `
                  <p style="margin: 0 0 8px 0; font-size: 12px; color: #666;">
                    ⏰ ${outage.start} - ${outage.end}
                  </p>
                `
                    : ""
                }
                <p style="margin: 0; font-size: 11px; color: #999;">
                  Източник: ${outage.source} | Квартал: ${outage.district}
                </p>
              </div>
            `;

                marker.bindPopup(popupContent, {
                  maxWidth: 340,
                  className: "custom-popup",
                });

                marker.on("click", () => {
                  if (onOutageSelect) {
                    onOutageSelect(outage);
                  }

                  // Add area highlighting
                  highlightOutageArea(outage, coords);
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
        focusOnOutage,
        resetView,
        zoomToOutages,
      }),
      []
    );

    const resetView = () => {
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
    };

    const zoomToOutages = () => {
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
    };

    // Add this function to ensure map refreshes when it becomes visible
    useEffect(() => {
      if (mapInstanceRef.current && mapLoaded && viewMode === "map") {
        // Use a longer delay and check if map still exists
        const timeoutId = setTimeout(() => {
          if (
            mapInstanceRef.current &&
            typeof mapInstanceRef.current.invalidateSize === "function"
          ) {
            try {
              mapInstanceRef.current.invalidateSize(true);
            } catch (error) {
              console.warn("Error invalidating map size:", error);
            }
          }
        }, 500);

        return () => clearTimeout(timeoutId);
      }
    }, [mapLoaded, viewMode]);

    // Handle escape key for fullscreen
    useEffect(() => {
      const handleEscape = (event: KeyboardEvent) => {
        if (event.key === "Escape" && isFullscreen) {
          setIsFullscreen(false);
        }
      };

      document.addEventListener("keydown", handleEscape);

      return () => {
        document.removeEventListener("keydown", handleEscape);
      };
    }, [isFullscreen]);

    // Don't render on server side
    if (!isClient) {
      return (
        <div className="rounded-xl overflow-hidden">
          <CardHeader className="px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50">
            <CardTitle className="flex items-center gap-2 font-semibold text-gray-800">
              <MapPin className="h-5 w-5 text-blue-600" />
              Интерактивна карта на прекъсванията
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="h-[600px] w-full flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600 font-medium">
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
        <Card className="h-96">
          <CardContent className="flex items-center justify-center h-full">
            <div className="text-center">
              <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-lg text-gray-600">{mapError}</p>
              <p className="text-sm text-gray-500 mt-2">
                Моля опитайте да презаредите страницата
              </p>
              {initAttempts < maxInitAttempts && (
                <Button
                  onClick={() => setInitAttempts((prev) => prev + 1)}
                  className="mt-4"
                  variant="outline"
                >
                  Опитай отново ({initAttempts}/{maxInitAttempts})
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      );
    }

    return (
      <div
        className={`rounded-xl overflow-hidden ${
          isFullscreen ? "fixed inset-0 z-50" : ""
        }`}
      >
        {/* Blue Header with Filters */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Left side - Title */}
            <div className="flex items-center gap-3">
              <MapPin className="h-6 w-6 text-white" />
              <h2 className="text-white font-semibold text-lg">
                Интерактивна карта на прекъсванията
              </h2>
            </div>

            {/* Right side - Controls */}
            <div className="flex items-center gap-2">
              <Button
                variant={mapTypeLocal === "normal" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setMapTypeLocal("normal")}
                className={`text-white border-white/30 ${
                  mapTypeLocal === "normal"
                    ? "bg-white/20"
                    : "hover:bg-white/10"
                }`}
              >
                Карта
              </Button>
              <Button
                variant={mapTypeLocal === "satellite" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setMapTypeLocal("satellite")}
                className={`text-white border-white/30 ${
                  mapTypeLocal === "satellite"
                    ? "bg-white/20"
                    : "hover:bg-white/10"
                }`}
              >
                <Satellite className="h-4 w-4 mr-1" />
                Сателит
              </Button>
              <Button
                variant={mapTypeLocal === "dark" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setMapTypeLocal("dark")}
                className={`text-white border-white/30 ${
                  mapTypeLocal === "dark" ? "bg-white/20" : "hover:bg-white/10"
                }`}
              >
                <Moon className="h-4 w-4 mr-1" />
                Тъмна
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (mapInstanceRef.current) {
                    mapInstanceRef.current.setView([42.6977, 23.3219], 12, {
                      animate: true,
                    });
                  }
                }}
                className="text-white border-white/30 hover:bg-white/10"
              >
                <Target className="h-4 w-4 mr-1" />
                Център
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (mapInstanceRef.current && filteredOutages.length > 0) {
                    const coords = filteredOutages.map(getOutageCoordinates);
                    const lats = coords.map((c) => c.lat);
                    const lngs = coords.map((c) => c.lng);
                    const bounds = [
                      [Math.min(...lats), Math.min(...lngs)],
                      [Math.max(...lats), Math.max(...lngs)],
                    ];
                    mapInstanceRef.current.fitBounds(bounds, {
                      padding: [20, 20],
                    });
                  }
                }}
                className="text-white border-white/30 hover:bg-white/10"
              >
                <Layers className="h-4 w-4 mr-1" />
                Всички
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="text-white border-white/30 hover:bg-white/10"
              >
                <Maximize2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Filter Buttons */}
          <div className="flex items-center gap-3 mt-4">
            <Button
              variant={serviceFilter === "water" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => handleServiceFilter("water")}
              className={`text-white border-white/30 ${
                serviceFilter === "water" ? "bg-white/20" : "hover:bg-white/10"
              } flex items-center gap-2`}
            >
              <span className="text-blue-300">💧</span>
              Вода
            </Button>
            <Button
              variant={serviceFilter === "electricity" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => handleServiceFilter("electricity")}
              className={`text-white border-white/30 ${
                serviceFilter === "electricity"
                  ? "bg-white/20"
                  : "hover:bg-white/10"
              } flex items-center gap-2`}
            >
              <span className="text-yellow-300">⚡</span>
              Ток
            </Button>
            <Button
              variant={serviceFilter === "heating" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => handleServiceFilter("heating")}
              className={`text-white border-white/30 ${
                serviceFilter === "heating"
                  ? "bg-white/20"
                  : "hover:bg-white/10"
              } flex items-center gap-2`}
            >
              <span className="text-red-300">🏠</span>
              Топлофикация
            </Button>
            <Button
              variant={priorityFilter ? "secondary" : "ghost"}
              size="sm"
              disabled
              className={`text-white border-white/30 ${
                priorityFilter ? "bg-white/20" : "hover:bg-white/10"
              } flex items-center gap-2 opacity-50 cursor-not-allowed`}
            >
              <div className="w-2 h-2 bg-red-400 rounded-full"></div>
              Висок приоритет
            </Button>
          </div>
        </div>

        {/* Map Container */}
        <div className="relative">
          <div
            ref={mapRef}
            className={`w-full ${isFullscreen ? "h-screen" : "h-[700px]"}`}
            style={{ minHeight: "600px" }}
            id="map-container"
            data-testid="map-container"
          />

          {!mapLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600 font-medium">
                  Зареждане на картата...
                </p>
                {initAttempts > 0 && (
                  <p className="text-gray-500 text-sm mt-2">
                    Опит {initAttempts}/{maxInitAttempts}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {mapLoaded && (
          <div className="px-6 py-3 bg-gray-50/50 text-sm text-gray-600 border-t">
            <div className="flex items-center justify-between">
              <p>💡 Натиснете на маркер за повече информация</p>
              <p className="font-medium">
                📍 {filteredOutages.length} прекъсвания показани
              </p>
            </div>
          </div>
        )}
      </div>
    );
  }
);

InteractiveMap.displayName = "InteractiveMap";

export default InteractiveMap;
