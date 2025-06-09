"use client"

import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RotateCcw, AlertTriangle, RefreshCw, Mountain } from "lucide-react"

interface Outage {
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

interface GoogleMaps3DProps {
  outages: Outage[]
  onOutageSelect?: (outage: Outage | null) => void
  selectedOutage?: Outage | null
  userDistrict?: string | null
  showOnlyUserDistrict?: boolean
  viewMode?: string
}

// София районите с координати
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
}

const GoogleMaps3D = forwardRef<any, GoogleMaps3DProps>(
  ({ outages, onOutageSelect, selectedOutage, userDistrict, showOnlyUserDistrict, viewMode }, ref) => {
    const mapRef = useRef<HTMLDivElement>(null)
    const mapInstanceRef = useRef<any>(null)
    const markersRef = useRef<any[]>([])
    const infoWindowRef = useRef<any>(null)
    const [mapLoaded, setMapLoaded] = useState(false)
    const [mapError, setMapError] = useState<string | null>(null)
    const [isClient, setIsClient] = useState(false)
    const [initAttempts, setInitAttempts] = useState(0)
    const [is3DMode, setIs3DMode] = useState(true)

    // Ensure we're on the client side
    useEffect(() => {
      setIsClient(true)
    }, [])

    // Function to get coordinates for an outage
    const getOutageCoordinates = (outage: Outage) => {
      const area = outage.area.toLowerCase()
      const district = outage.district.toLowerCase()

      for (const [districtName, coords] of Object.entries(sofiaDistricts)) {
        if (district.includes(districtName.toLowerCase()) || area.includes(districtName.toLowerCase())) {
          return {
            lat: coords.lat + (Math.random() - 0.5) * 0.01,
            lng: coords.lng + (Math.random() - 0.5) * 0.01,
            district: districtName,
          }
        }
      }

      return {
        lat: 42.6977 + (Math.random() - 0.5) * 0.02,
        lng: 23.3219 + (Math.random() - 0.5) * 0.02,
        district: "София",
      }
    }

    // Get marker color based on service type
    const getMarkerColor = (outage: Outage) => {
      const colors = {
        water: "#3b82f6", // blue
        electricity: "#eab308", // yellow
        heating: "#ef4444", // red
      }
      return colors[outage.serviceType] || "#6b7280"
    }

    // Get service icon
    const getServiceIcon = (serviceType: string) => {
      switch (serviceType) {
        case "water":
          return "💧"
        case "electricity":
          return "⚡"
        case "heating":
          return "🔥"
        default:
          return "⚠️"
      }
    }

    // Load Google Maps API
    const loadGoogleMapsAPI = async () => {
      try {
        // Check if already loaded
        if (window.google && window.google.maps) {
          return true
        }

        // Remove any existing scripts first
        const existingScript = document.querySelector('script[src*="maps.googleapis.com"]')
        if (existingScript) {
          existingScript.remove()
        }

        // Create script element
        const script = document.createElement("script")
        const API_KEY = "AIzaSyCpqk6iR6OzpFWgnn_rsDS_XbYTBmX4jyQ"

        script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&libraries=geometry,places&v=3.55&loading=async`
        script.async = true
        script.defer = true

        return new Promise((resolve, reject) => {
          script.onload = () => {
            // Wait a bit for Google Maps to fully initialize
            setTimeout(() => {
              if (window.google && window.google.maps) {
                console.log("Google Maps API loaded successfully")
                resolve(true)
              } else {
                reject(new Error("Google Maps API failed to initialize"))
              }
            }, 1000)
          }

          script.onerror = (error) => {
            console.error("Failed to load Google Maps script:", error)
            reject(new Error("Failed to load Google Maps API script"))
          }

          document.head.appendChild(script)

          // Timeout after 15 seconds
          setTimeout(() => {
            reject(new Error("Google Maps API load timeout"))
          }, 15000)
        })
      } catch (error) {
        console.error("Error loading Google Maps API:", error)
        return false
      }
    }

    // Create custom marker icon
    const createCustomMarkerIcon = (outage: Outage) => {
      const color = getMarkerColor(outage)
      const icon = getServiceIcon(outage.serviceType)
      const size = outage.severity === "high" ? 40 : 30

      // Create SVG icon
      const svg = `
        <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="2" dy="2" stdDeviation="2" floodColor="rgba(0,0,0,0.3)"/>
            </filter>
          </defs>
          <circle cx="${size / 2}" cy="${size / 2}" r="${size / 2 - 2}" fill="${color}" stroke="white" strokeWidth="3" filter="url(#shadow)"/>
          ${outage.severity === "high" ? `<circle cx="${size - 8}" cy="8" r="6" fill="#ef4444" stroke="white" strokeWidth="2"/>` : ""}
          <text x="${size / 2}" y="${size / 2 + 4}" textAnchor="middle" fontSize="14" fill="white">${icon}</text>
        </svg>
      `

      return {
        url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
        scaledSize: new window.google.maps.Size(size, size),
        anchor: new window.google.maps.Point(size / 2, size / 2),
      }
    }

    // Initialize Google Maps
    useEffect(() => {
      if (!isClient || !mapRef.current) return
      if (mapInstanceRef.current) return

      const initMap = async () => {
        try {
          setMapError(null)
          console.log("Starting Google Maps initialization...")

          // Wait for container to be ready
          await new Promise((resolve) => setTimeout(resolve, 500))

          if (!mapRef.current || !document.body.contains(mapRef.current)) {
            throw new Error("Map container not found in DOM")
          }

          // Load Google Maps API
          console.log("Loading Google Maps API...")
          const mapsLoaded = await loadGoogleMapsAPI()

          if (!mapsLoaded) {
            throw new Error("Google Maps API failed to load")
          }

          console.log("Google Maps API loaded, creating map...")

          const container = mapRef.current

          // Initialize Google Map with 3D options
          const map = new window.google.maps.Map(container, {
            center: { lat: 42.6977, lng: 23.3219 }, // София център
            zoom: 13,
            mapTypeId: window.google.maps.MapTypeId.ROADMAP, // Start with roadmap
            mapTypeControl: true,
            zoomControl: true,
            streetViewControl: true,
            fullscreenControl: true,
            gestureHandling: "greedy",
          })

          // Wait for map to be ready
          await new Promise((resolve) => {
            const listener = map.addListener("idle", () => {
              window.google.maps.event.removeListener(listener)
              resolve(true)
            })
          })

          mapInstanceRef.current = map

          // Create info window
          infoWindowRef.current = new window.google.maps.InfoWindow()

          // Add 3D controls after map is ready
          setTimeout(() => {
            if (map && window.google && window.google.maps) {
              // Switch to satellite for 3D
              map.setMapTypeId(window.google.maps.MapTypeId.SATELLITE)
              map.setTilt(45)
              map.setHeading(0)

              // Add custom 3D control
              const controlDiv = document.createElement("div")
              controlDiv.style.margin = "10px"

              const toggle3DButton = document.createElement("button")
              toggle3DButton.style.cssText = `
                background-color: #fff;
                border: 2px solid #fff;
                border-radius: 3px;
                box-shadow: 0 2px 6px rgba(0,0,0,.3);
                color: rgb(25,25,25);
                cursor: pointer;
                font-family: Roboto,Arial,sans-serif;
                font-size: 16px;
                line-height: 38px;
                margin: 8px 0 22px;
                padding: 0 5px;
                text-align: center;
              `
              toggle3DButton.textContent = "2D Изглед"
              toggle3DButton.title = "Превключи 3D изглед"
              toggle3DButton.type = "button"

              toggle3DButton.addEventListener("click", () => {
                if (is3DMode) {
                  map.setTilt(0)
                  map.setMapTypeId(window.google.maps.MapTypeId.ROADMAP)
                  toggle3DButton.textContent = "3D Изглед"
                  setIs3DMode(false)
                } else {
                  map.setTilt(45)
                  map.setMapTypeId(window.google.maps.MapTypeId.SATELLITE)
                  toggle3DButton.textContent = "2D Изглед"
                  setIs3DMode(true)
                }
              })

              controlDiv.appendChild(toggle3DButton)
              map.controls[window.google.maps.ControlPosition.TOP_LEFT].push(controlDiv)
            }
          }, 1000)

          setMapLoaded(true)
          setMapError(null)
          console.log("Google Maps 3D initialized successfully")
        } catch (error) {
          console.error("Error initializing Google Maps:", error)
          const errorMessage = error.message || "Неизвестна грешка"

          if (errorMessage.includes("API")) {
            setMapError("Google Maps API грешка. Проверете API ключа и интернет връзката.")
          } else if (errorMessage.includes("timeout")) {
            setMapError("Google Maps се зарежда бавно. Моля опитайте отново.")
          } else {
            setMapError(`Google Maps грешка: ${errorMessage}`)
          }

          if (initAttempts < 2) {
            setInitAttempts((prev) => prev + 1)
            setTimeout(initMap, 3000)
          }
        }
      }

      const timeoutId = setTimeout(initMap, 1000)
      return () => clearTimeout(timeoutId)
    }, [isClient, initAttempts])

    // Update markers when outages change
    useEffect(() => {
      if (!mapInstanceRef.current || !mapLoaded || !window.google) return

      const updateMarkers = () => {
        try {
          // Clear existing markers
          markersRef.current.forEach((marker) => {
            marker.setMap(null)
          })
          markersRef.current = []

          // Add new markers
          outages.forEach((outage) => {
            const coords = getOutageCoordinates(outage)
            const icon = createCustomMarkerIcon(outage)

            const marker = new window.google.maps.Marker({
              position: { lat: coords.lat, lng: coords.lng },
              map: mapInstanceRef.current,
              title: outage.area,
              icon: icon,
              animation: outage.severity === "high" ? window.google.maps.Animation.BOUNCE : null,
              zIndex: outage.severity === "high" ? 1000 : 100,
            })

            // Create info window content
            const infoContent = `
              <div style="max-width: 300px; font-family: Arial, sans-serif;">
                <h3 style="margin: 0 0 10px 0; color: ${getMarkerColor(outage)}; display: flex; align-items: center; gap: 8px;">
                  ${getServiceIcon(outage.serviceType)}
                  ${outage.type && outage.type.toLowerCase().includes("аварийно") ? "🚨 Авария" : "⏰ Планирано"}
                  ${outage.severity === "high" ? '<span style="background: #ef4444; color: white; padding: 2px 6px; border-radius: 12px; font-size: 10px; margin-left: 8px;">ВИСОК</span>' : ""}
                </h3>
                <p style="margin: 0 0 8px 0; font-weight: bold; font-size: 14px;">📍 ${outage.area}</p>
                ${outage.description ? `<p style="margin: 0 0 8px 0; font-size: 13px; line-height: 1.4;">${outage.description}</p>` : ""}
                ${outage.start && outage.end ? `<p style="margin: 0 0 8px 0; font-size: 12px; color: #666;">⏰ ${outage.start} - ${outage.end}</p>` : ""}
                <p style="margin: 0; font-size: 11px; color: #999;">Източник: ${outage.source} | Квартал: ${outage.district}</p>
                <div style="margin-top: 10px; text-align: center;">
                  <button onclick="window.showOutageDetails('${outage.id}')" style="background: ${getMarkerColor(outage)}; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; font-size: 12px;">
                    Виж детайли
                  </button>
                </div>
              </div>
            `

            // Add click listener
            marker.addListener("click", () => {
              infoWindowRef.current.setContent(infoContent)
              infoWindowRef.current.open(mapInstanceRef.current, marker)

              if (onOutageSelect) {
                onOutageSelect(outage)
              }

              // Center map on marker with 3D view
              mapInstanceRef.current.panTo(marker.getPosition())
              if (is3DMode) {
                mapInstanceRef.current.setZoom(18)
                mapInstanceRef.current.setTilt(60)
              }
            })

            markersRef.current.push(marker)
          })

          // Global function for info window buttons
          window.showOutageDetails = (outageId: string) => {
            const outage = outages.find((o) => o.id === outageId)
            if (outage && onOutageSelect) {
              onOutageSelect(outage)
            }
          }
        } catch (error) {
          console.error("Error updating markers:", error)
        }
      }

      const timeoutId = setTimeout(updateMarkers, 300)
      return () => clearTimeout(timeoutId)
    }, [outages, mapLoaded, onOutageSelect, is3DMode])

    // Expose methods via ref
    useImperativeHandle(
      ref,
      () => ({
        focusOnOutage: (outage: Outage) => {
          if (mapInstanceRef.current) {
            const coords = getOutageCoordinates(outage)
            mapInstanceRef.current.panTo({ lat: coords.lat, lng: coords.lng })
            mapInstanceRef.current.setZoom(18)
            if (is3DMode) {
              mapInstanceRef.current.setTilt(60)
              mapInstanceRef.current.setHeading(0)
            }

            if (onOutageSelect) {
              onOutageSelect(outage)
            }
          }
        },
        resetView: () => {
          if (mapInstanceRef.current) {
            mapInstanceRef.current.panTo({ lat: 42.6977, lng: 23.3219 })
            mapInstanceRef.current.setZoom(15)
            mapInstanceRef.current.setTilt(45)
            mapInstanceRef.current.setHeading(0)
          }
        },
        zoomToOutages: () => {
          if (mapInstanceRef.current && outages.length > 0) {
            const bounds = new window.google.maps.LatLngBounds()
            outages.forEach((outage) => {
              const coords = getOutageCoordinates(outage)
              bounds.extend({ lat: coords.lat, lng: coords.lng })
            })
            mapInstanceRef.current.fitBounds(bounds)
            if (is3DMode) {
              setTimeout(() => {
                mapInstanceRef.current.setTilt(45)
              }, 1000)
            }
          }
        },
        toggle3D: () => {
          if (mapInstanceRef.current) {
            if (is3DMode) {
              mapInstanceRef.current.setTilt(0)
              mapInstanceRef.current.setHeading(0)
              setIs3DMode(false)
            } else {
              mapInstanceRef.current.setTilt(45)
              mapInstanceRef.current.setHeading(0)
              setIs3DMode(true)
            }
          }
        },
      }),
      [onOutageSelect, outages, is3DMode],
    )

    // Don't render on server side
    if (!isClient) {
      return (
        <div className="rounded-xl overflow-hidden">
          <CardHeader className="px-6 py-4 bg-gradient-to-r from-green-50 to-blue-50">
            <CardTitle className="flex items-center gap-2 font-semibold text-gray-800">
              <Mountain className="h-5 w-5 text-green-600" />
              Google Maps 3D
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="h-[600px] w-full flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                <p className="text-gray-600 font-medium">Зареждане на Google Maps...</p>
              </div>
            </div>
          </CardContent>
        </div>
      )
    }

    // Show error state
    if (mapError) {
      return (
        <Card className="h-96">
          <CardContent className="flex items-center justify-center h-full">
            <div className="text-center max-w-md">
              <AlertTriangle className="h-12 w-12 text-orange-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Google Maps не може да се зареди</h3>
              <p className="text-gray-600 mb-4">{mapError}</p>
              <div className="space-y-2">
                <Button
                  onClick={() => {
                    setMapError(null)
                    setInitAttempts(0)
                  }}
                  variant="outline"
                  className="w-full"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Опитай отново
                </Button>
                <div className="text-xs text-gray-500 mt-2">💡 Трябва Google Maps API ключ за да работи</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )
    }

    // Show loading state
    if (!mapLoaded) {
      return (
        <div className="rounded-xl overflow-hidden">
          <CardHeader className="px-6 py-4 bg-gradient-to-r from-green-50 to-blue-50">
            <CardTitle className="flex items-center gap-2 font-semibold text-gray-800">
              <Mountain className="h-5 w-5 text-green-600" />
              Google Maps 3D
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="h-[600px] w-full flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                <p className="text-gray-600 font-medium">Зареждане на Google Maps...</p>
                <p className="text-gray-500 text-sm mt-2">Опит {initAttempts + 1}/3</p>
              </div>
            </div>
          </CardContent>
        </div>
      )
    }

    // Render successful Google Maps
    return (
      <div className="rounded-xl overflow-hidden">
        <CardHeader className="px-6 py-4 bg-gradient-to-r from-green-50 to-blue-50">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 font-semibold text-gray-800">
              <Mountain className="h-5 w-5 text-green-600" />
              Google Maps 3D - София
            </CardTitle>
            <div className="flex items-center gap-2">
              <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                {is3DMode ? "3D активен" : "2D режим"}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (mapInstanceRef.current) {
                    mapInstanceRef.current.panTo({ lat: 42.6977, lng: 23.3219 })
                    mapInstanceRef.current.setZoom(15)
                    mapInstanceRef.current.setTilt(45)
                    mapInstanceRef.current.setHeading(0)
                  }
                }}
              >
                <RotateCcw className="h-4 w-4 mr-1" />
                Център
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (mapInstanceRef.current) {
                    if (is3DMode) {
                      mapInstanceRef.current.setTilt(0)
                      setIs3DMode(false)
                    } else {
                      mapInstanceRef.current.setTilt(45)
                      setIs3DMode(true)
                    }
                  }
                }}
              >
                <Mountain className="h-4 w-4 mr-1" />
                {is3DMode ? "2D" : "3D"}
              </Button>
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center justify-between w-full mt-4">
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-blue-500 rounded-full shadow-sm flex items-center justify-center text-white text-xs">
                  💧
                </div>
                <span className="text-gray-700 font-medium">Вода</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-yellow-500 rounded-full shadow-sm flex items-center justify-center text-white text-xs">
                  ⚡
                </div>
                <span className="text-gray-700 font-medium">Ток</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-red-500 rounded-full shadow-sm flex items-center justify-center text-white text-xs">
                  🔥
                </div>
                <span className="text-gray-700 font-medium">Топлофикация</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce"></div>
                <span className="text-gray-700 font-medium text-sm">Висок приоритет</span>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="relative">
            <div ref={mapRef} className="h-[600px] w-full" style={{ minHeight: "500px" }} />

            {/* API Key Warning */}
            {mapError && mapError.includes("API") && (
              <div className="absolute top-4 left-4 right-4 bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-3 rounded-lg shadow-sm">
                <div className="flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  <div>
                    <p className="font-medium">Нужен е Google Maps API ключ</p>
                    <p className="text-sm">
                      Получете безплатен ключ от{" "}
                      <a
                        href="https://console.cloud.google.com/apis/credentials"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline"
                      >
                        Google Cloud Console
                      </a>
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="px-6 py-4 bg-gray-50/50 text-sm text-gray-600 border-t">
            <div className="flex items-center justify-between">
              <p>🗺️ Google Maps с реални 3D сгради • Кликнете на маркер за информация • Използвайте контролите за 3D</p>
              <p className="font-medium">📍 {outages.length} прекъсвания в София</p>
            </div>
          </div>
        </CardContent>
      </div>
    )
  },
)

export default GoogleMaps3D
