"use client"

import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MapPin, RotateCcw, AlertTriangle, RefreshCw } from "lucide-react"

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

interface ThreeGlobeMapProps {
  outages: Outage[]
  onOutageSelect?: (outage: Outage | null) => void
  selectedOutage?: Outage | null
  userDistrict?: string | null
  showOnlyUserDistrict?: boolean
  viewMode?: string
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
}

const ThreeGlobeMap = forwardRef<any, ThreeGlobeMapProps>(
  ({ outages, onOutageSelect, selectedOutage, userDistrict, showOnlyUserDistrict, viewMode }, ref) => {
    const mapRef = useRef<HTMLDivElement>(null)
    const canvasRef = useRef<HTMLCanvasElement | null>(null)
    const sceneRef = useRef<any>(null)
    const rendererRef = useRef<any>(null)
    const cameraRef = useRef<any>(null)
    const markersRef = useRef<any[]>([])
    const animationFrameRef = useRef<number | null>(null)
    const [mapLoaded, setMapLoaded] = useState(false)
    const [mapError, setMapError] = useState<string | null>(null)
    const [isClient, setIsClient] = useState(false)
    const [initAttempts, setInitAttempts] = useState(0)
    const [tooltipInfo, setTooltipInfo] = useState<{
      visible: boolean
      x: number
      y: number
      outage: Outage | null
    }>({
      visible: false,
      x: 0,
      y: 0,
      outage: null,
    })

    // Ensure we're on the client side
    useEffect(() => {
      setIsClient(true)
    }, [])

    // Function to get coordinates for an outage based on area text
    const getOutageCoordinates = (outage: Outage) => {
      const area = outage.area.toLowerCase()
      const district = outage.district.toLowerCase()

      // Try to match district names
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

    // Get marker color based on service type and severity
    const getMarkerColor = (outage: Outage) => {
      const baseColors = {
        water: "#3b82f6", // blue
        electricity: "#eab308", // yellow
        heating: "#ef4444", // red
      }
      return baseColors[outage.serviceType] || "#6b7280"
    }

    // Check if Three.js is available
    const checkThreeAvailability = async () => {
      try {
        if (typeof window === "undefined") return false

        // Try to load Three.js dynamically
        const threeScript = document.createElement("script")
        threeScript.src = "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.min.js"
        threeScript.async = true

        document.head.appendChild(threeScript)

        return new Promise((resolve) => {
          threeScript.onload = () => {
            // Wait a bit for Three to initialize
            setTimeout(() => {
              resolve(typeof window.THREE !== "undefined")
            }, 500)
          }
          threeScript.onerror = () => resolve(false)
          // Timeout after 5 seconds
          setTimeout(() => resolve(false), 5000)
        })
      } catch (error) {
        console.error("Error loading Three.js:", error)
        return false
      }
    }

    // Initialize Three.js map
    useEffect(() => {
      if (!isClient || !mapRef.current) return

      if (sceneRef.current) {
        return
      }

      const initMap = async () => {
        try {
          // Wait for DOM to be ready
          await new Promise((resolve) => setTimeout(resolve, 1000))

          // Check container
          if (!mapRef.current || !document.body.contains(mapRef.current)) {
            console.warn("Three.js container not found")
            if (initAttempts < 2) {
              setInitAttempts((prev) => prev + 1)
              setTimeout(() => initMap(), 1000)
              return
            } else {
              setMapError("Контейнерът за 3D картата не може да бъде намерен")
              return
            }
          }

          // Check if Three.js is available
          const threeAvailable = await checkThreeAvailability()
          if (!threeAvailable) {
            console.warn("Three.js not available")
            setMapError("Three.js библиотеката не може да бъде заредена")
            return
          }

          // Ensure container has dimensions
          const container = mapRef.current
          if (container.clientWidth === 0 || container.clientHeight === 0) {
            container.style.height = "600px"
            container.style.width = "100%"
          }

          // Clear container
          container.innerHTML = ""

          // Create canvas
          const canvas = document.createElement("canvas")
          canvas.style.width = "100%"
          canvas.style.height = "100%"
          canvas.style.display = "block"
          container.appendChild(canvas)
          canvasRef.current = canvas

          // Initialize Three.js
          const THREE = window.THREE
          const width = container.clientWidth
          const height = container.clientHeight

          // Create scene
          const scene = new THREE.Scene()
          scene.background = new THREE.Color(0xf0f8ff) // Light blue background
          sceneRef.current = scene

          // Create camera
          const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000)
          camera.position.set(0, 0, 50)
          cameraRef.current = camera

          // Create renderer
          const renderer = new THREE.WebGLRenderer({
            canvas,
            antialias: true,
            alpha: true,
          })
          renderer.setSize(width, height)
          renderer.setPixelRatio(window.devicePixelRatio)
          rendererRef.current = renderer

          // Add ambient light
          const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
          scene.add(ambientLight)

          // Add directional light
          const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
          directionalLight.position.set(5, 5, 5)
          scene.add(directionalLight)

          // Create a simple earth sphere
          const earthGeometry = new THREE.SphereGeometry(20, 32, 32)
          const earthMaterial = new THREE.MeshPhongMaterial({
            color: 0x9dc3e6, // Light blue
            specular: 0x333333,
            shininess: 5,
            transparent: true,
            opacity: 0.9,
          })
          const earth = new THREE.Mesh(earthGeometry, earthMaterial)
          scene.add(earth)

          // Add simple grid lines for longitude/latitude
          const gridMaterial = new THREE.LineBasicMaterial({ color: 0xaaaaaa, transparent: true, opacity: 0.3 })

          // Longitude lines
          for (let i = 0; i < 24; i++) {
            const angle = (i / 24) * Math.PI * 2
            const points = []
            for (let j = 0; j <= 100; j++) {
              const lat = (j / 100) * Math.PI - Math.PI / 2
              const x = 20 * Math.cos(lat) * Math.cos(angle)
              const y = 20 * Math.sin(lat)
              const z = 20 * Math.cos(lat) * Math.sin(angle)
              points.push(new THREE.Vector3(x, y, z))
            }
            const geometry = new THREE.BufferGeometry().setFromPoints(points)
            const line = new THREE.Line(geometry, gridMaterial)
            scene.add(line)
          }

          // Latitude lines
          for (let i = 0; i < 12; i++) {
            const lat = (i / 12) * Math.PI - Math.PI / 2
            const points = []
            for (let j = 0; j <= 100; j++) {
              const angle = (j / 100) * Math.PI * 2
              const x = 20 * Math.cos(lat) * Math.cos(angle)
              const y = 20 * Math.sin(lat)
              const z = 20 * Math.cos(lat) * Math.sin(angle)
              points.push(new THREE.Vector3(x, y, z))
            }
            const geometry = new THREE.BufferGeometry().setFromPoints(points)
            const line = new THREE.Line(geometry, gridMaterial)
            scene.add(line)
          }

          // Add Bulgaria highlight
          const bulgariaLat = 42.7
          const bulgariaLng = 25.5
          const bulgariaRadius = 3

          const bulgariaGeometry = new THREE.CircleGeometry(bulgariaRadius, 32)
          const bulgariaMaterial = new THREE.MeshBasicMaterial({
            color: 0x90ee90,
            transparent: true,
            opacity: 0.5,
            side: THREE.DoubleSide,
          })

          const bulgariaMesh = new THREE.Mesh(bulgariaGeometry, bulgariaMaterial)

          // Convert lat/lng to 3D position
          const phi = (90 - bulgariaLat) * (Math.PI / 180)
          const theta = (bulgariaLng + 180) * (Math.PI / 180)

          const x = -(20 * Math.sin(phi) * Math.cos(theta))
          const y = 20 * Math.cos(phi)
          const z = 20 * Math.sin(phi) * Math.sin(theta)

          bulgariaMesh.position.set(x, y, z)

          // Orient the circle to face outward from the globe
          bulgariaMesh.lookAt(0, 0, 0)
          bulgariaMesh.rotateY(Math.PI)

          scene.add(bulgariaMesh)

          // Add Sofia marker
          const sofiaLat = 42.6977
          const sofiaLng = 23.3219

          const sofiaGeometry = new THREE.SphereGeometry(0.4, 16, 16)
          const sofiaMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 })
          const sofiaMesh = new THREE.Mesh(sofiaGeometry, sofiaMaterial)

          // Convert lat/lng to 3D position
          const sofiaPhi = (90 - sofiaLat) * (Math.PI / 180)
          const sofiaTheta = (sofiaLng + 180) * (Math.PI / 180)

          const sofiaX = -(20 * Math.sin(sofiaPhi) * Math.cos(sofiaTheta))
          const sofiaY = 20 * Math.cos(sofiaPhi)
          const sofiaZ = 20 * Math.sin(sofiaPhi) * Math.sin(sofiaTheta)

          sofiaMesh.position.set(sofiaX, sofiaY, sofiaZ)
          scene.add(sofiaMesh)

          // Add Sofia label
          const sofiaDiv = document.createElement("div")
          sofiaDiv.className = "sofia-label"
          sofiaDiv.textContent = "София"
          sofiaDiv.style.position = "absolute"
          sofiaDiv.style.color = "white"
          sofiaDiv.style.padding = "2px 6px"
          sofiaDiv.style.backgroundColor = "rgba(255, 0, 0, 0.7)"
          sofiaDiv.style.borderRadius = "4px"
          sofiaDiv.style.fontSize = "12px"
          sofiaDiv.style.fontWeight = "bold"
          sofiaDiv.style.pointerEvents = "none"
          container.appendChild(sofiaDiv)

          // Add controls
          let isDragging = false
          let previousMousePosition = { x: 0, y: 0 }
          const rotationSpeed = 0.01

          // Mouse down event
          canvas.addEventListener("mousedown", (e) => {
            isDragging = true
            previousMousePosition = {
              x: e.clientX,
              y: e.clientY,
            }
          })

          // Mouse up event
          canvas.addEventListener("mouseup", () => {
            isDragging = false
          })

          // Mouse out event
          canvas.addEventListener("mouseout", () => {
            isDragging = false
          })

          // Mouse move event
          canvas.addEventListener("mousemove", (e) => {
            if (isDragging) {
              const deltaMove = {
                x: e.clientX - previousMousePosition.x,
                y: e.clientY - previousMousePosition.y,
              }

              earth.rotation.y += deltaMove.x * 0.01
              earth.rotation.x += deltaMove.y * 0.01

              previousMousePosition = {
                x: e.clientX,
                y: e.clientY,
              }
            }
          })

          // Mouse wheel event for zoom
          canvas.addEventListener("wheel", (e) => {
            e.preventDefault()

            // Adjust camera position based on wheel delta
            const zoomSpeed = 1
            if (e.deltaY > 0) {
              // Zoom out
              camera.position.z = Math.min(camera.position.z + zoomSpeed, 70)
            } else {
              // Zoom in
              camera.position.z = Math.max(camera.position.z - zoomSpeed, 30)
            }
          })

          // Animation loop
          const animate = () => {
            if (!sceneRef.current) return

            // Slowly rotate the earth
            earth.rotation.y += 0.001

            // Update Sofia label position
            if (sofiaDiv) {
              const vector = new THREE.Vector3(sofiaX, sofiaY, sofiaZ)
              vector.project(camera)

              const x = (vector.x * 0.5 + 0.5) * width
              const y = (-(vector.y * 0.5) + 0.5) * height

              sofiaDiv.style.transform = `translate(-50%, -50%) translate(${x}px, ${y}px)`

              // Hide label if Sofia is on the back side of the globe
              const dot = new THREE.Vector3(0, 0, 1).dot(vector.normalize())
              sofiaDiv.style.display = dot > 0 ? "block" : "none"
            }

            renderer.render(scene, camera)
            animationFrameRef.current = requestAnimationFrame(animate)
          }

          // Start animation
          animate()

          // Handle window resize
          const handleResize = () => {
            if (!mapRef.current || !camera || !renderer) return

            const width = mapRef.current.clientWidth
            const height = mapRef.current.clientHeight

            camera.aspect = width / height
            camera.updateProjectionMatrix()

            renderer.setSize(width, height)
          }

          window.addEventListener("resize", handleResize)

          setMapLoaded(true)
          setMapError(null)

          console.log("Three.js map initialized successfully")

          // Cleanup function
          return () => {
            window.removeEventListener("resize", handleResize)
            if (animationFrameRef.current) {
              cancelAnimationFrame(animationFrameRef.current)
            }
            if (sofiaDiv && sofiaDiv.parentNode) {
              sofiaDiv.parentNode.removeChild(sofiaDiv)
            }
          }
        } catch (error) {
          console.error("Error initializing Three.js:", error)
          setMapError(`3D карта грешка: ${error.message || "Неизвестна грешка"}`)

          if (initAttempts >= 1) {
            setMapError("3D картата не може да бъде заредена. Моля използвайте 2D картата.")
          } else {
            setInitAttempts((prev) => prev + 1)
            setTimeout(() => initMap(), 2000)
          }
        }
      }

      const timeoutId = setTimeout(initMap, 1000)

      return () => {
        clearTimeout(timeoutId)
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current)
          animationFrameRef.current = null
        }
        if (sceneRef.current) {
          sceneRef.current = null
          rendererRef.current = null
          cameraRef.current = null
          setMapLoaded(false)
        }
      }
    }, [isClient, initAttempts])

    // Expose methods via ref
    useImperativeHandle(
      ref,
      () => ({
        focusOnOutage: (outage: Outage) => {
          // Focus on Bulgaria/Sofia
          if (sceneRef.current && cameraRef.current) {
            try {
              if (onOutageSelect) {
                onOutageSelect(outage)
              }
            } catch (error) {
              console.error("Error focusing on outage:", error)
            }
          }
        },
        resetView: () => {
          // Reset to default view
          if (cameraRef.current) {
            try {
              cameraRef.current.position.set(0, 0, 50)
            } catch (error) {
              console.error("Error resetting view:", error)
            }
          }
        },
        zoomToOutages: () => {
          // Zoom to Bulgaria
          if (cameraRef.current) {
            try {
              cameraRef.current.position.set(0, 0, 40)
            } catch (error) {
              console.error("Error zooming to outages:", error)
            }
          }
        },
      }),
      [onOutageSelect],
    )

    // Don't render on server side
    if (!isClient) {
      return (
        <div className="rounded-xl overflow-hidden">
          <CardHeader className="px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50">
            <CardTitle className="flex items-center gap-2 font-semibold text-gray-800">
              <MapPin className="h-5 w-5 text-blue-600" />
              3D Интерактивна карта на прекъсванията
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="h-[600px] w-full flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600 font-medium">Зареждане на 3D картата...</p>
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
              <h3 className="text-lg font-semibold text-gray-800 mb-2">3D картата не може да се зареди</h3>
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
          <CardHeader className="px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50">
            <CardTitle className="flex items-center gap-2 font-semibold text-gray-800">
              <MapPin className="h-5 w-5 text-blue-600" />
              3D Интерактивна карта на прекъсванията
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="h-[600px] w-full flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600 font-medium">Зареждане на 3D картата...</p>
                <p className="text-gray-500 text-sm mt-2">Опит {initAttempts + 1}/3</p>
              </div>
            </div>
          </CardContent>
        </div>
      )
    }

    // Render successful Three.js map
    return (
      <div className="rounded-xl overflow-hidden">
        <CardHeader className="px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 font-semibold text-gray-800">
              <MapPin className="h-5 w-5 text-blue-600" />
              3D Интерактивна карта на прекъсванията
            </CardTitle>
            <div className="flex items-center gap-2">
              <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">3D активна</div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (cameraRef.current) {
                    cameraRef.current.position.set(0, 0, 50)
                  }
                }}
              >
                <RotateCcw className="h-4 w-4 mr-1" />
                Център
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
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="relative">
            <div ref={mapRef} className="h-[600px] w-full" style={{ minHeight: "500px" }} />

            {tooltipInfo.visible && tooltipInfo.outage && (
              <div
                className="absolute bg-white p-3 rounded-lg shadow-lg z-10 max-w-xs"
                style={{
                  left: tooltipInfo.x + "px",
                  top: tooltipInfo.y + "px",
                  transform: "translate(-50%, -100%)",
                  pointerEvents: "none",
                }}
              >
                <h4 className="font-bold">{tooltipInfo.outage.area}</h4>
                <p className="text-sm">{tooltipInfo.outage.description}</p>
              </div>
            )}
          </div>

          <div className="px-6 py-4 bg-gray-50/50 text-sm text-gray-600 border-t">
            <div className="flex items-center justify-between">
              <p>💡 3D карта активна • Използвайте мишката за навигация</p>
              <p className="font-medium">📍 {outages.length} прекъсвания в София</p>
            </div>
          </div>
        </CardContent>
      </div>
    )
  },
)

export default ThreeGlobeMap
