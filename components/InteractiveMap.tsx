"use client";

import { useEffect, useRef, useState } from 'react';

interface Location {
    id: string;
    name: string;
    latitude: number;
    longitude: number;
    description?: string;
    tripId: string;
}

interface InteractiveMapProps {
    locations: Location[];
    isOverview?: boolean;
    className?: string;
}

interface RouteInfo {
    distance: string;
    duration: string;
}

interface NavigationStep {
    instruction: string;
    distance: number;
    time: number;
    type: string;
}

export default function InteractiveMap({ locations, isOverview = false, className = '' }: InteractiveMapProps) {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<any>(null);
    const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);
    const [navigationSteps, setNavigationSteps] = useState<NavigationStep[]>([]);
    const [showNavigation, setShowNavigation] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadMapLibraries = async () => {
            if (typeof window === 'undefined' || !mapRef.current) {
                return;
            }

            try {
                // Load Leaflet CSS
                if (!document.querySelector('link[href*="leaflet"]')) {
                    const leafletCSS = document.createElement('link');
                    leafletCSS.rel = 'stylesheet';
                    leafletCSS.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
                    document.head.appendChild(leafletCSS);
                    
                    // Wait for CSS to load
                    await new Promise<void>(resolve => {
                        leafletCSS.onload = () => resolve();
                        setTimeout(() => resolve(), 1000); // Fallback
                    });
                }

                // Load Routing Machine CSS
                if (!document.querySelector('link[href*="routing-machine"]')) {
                    const routingCSS = document.createElement('link');
                    routingCSS.rel = 'stylesheet';
                    routingCSS.href = 'https://unpkg.com/leaflet-routing-machine@3.2.12/dist/leaflet-routing-machine.css';
                    document.head.appendChild(routingCSS);
                }

                // Dynamically import Leaflet
                const L = (await import('leaflet')).default;
                
                // Import routing machine
                await import('leaflet-routing-machine');

                // Fix Leaflet icon issue
                delete (L.Icon.Default.prototype as any)._getIconUrl;
                L.Icon.Default.mergeOptions({
                    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
                    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
                    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
                });

                // Cleanup existing map
                if (mapInstanceRef.current) {
                    mapInstanceRef.current.remove();
                    mapInstanceRef.current = null;
                }

                if (locations.length === 0) {
                    setIsLoading(false);
                    return;
                }

                // Validate coordinates before creating map
                const validLocations = locations.filter(loc => {
                    const lat = Number(loc.latitude);
                    const lng = Number(loc.longitude);
                    return !isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
                });

                if (validLocations.length === 0) {
                    setError('No valid coordinates found');
                    setIsLoading(false);
                    return;
                }

                console.log('Valid locations:', validLocations);

                // Initialize map
                const map = L.map(mapRef.current, {
                    zoomControl: true,
                    attributionControl: true
                });
                mapInstanceRef.current = map;

                // Add tile layer
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '© OpenStreetMap contributors',
                    maxZoom: 19
                }).addTo(map);

                if (validLocations.length >= 2) {
                    // Multiple locations - ensure actual routing, not straight lines
                    const waypoints = validLocations.map(loc => 
                        L.latLng(Number(loc.latitude), Number(loc.longitude))
                    );

                    console.log('Creating waypoints for actual routing:', waypoints);

                    // First try with routing machine for real roads
                    try {
                        const routingControl = (L as any).Routing.control({
                            waypoints: waypoints,
                            createMarker: (i: number, waypoint: any) => {
                                const location = validLocations[i];
                                const isStart = i === 0;
                                const isEnd = i === validLocations.length - 1;
                                
                                // Create custom icon
                                const customIcon = L.divIcon({
                                    className: 'custom-numbered-icon',
                                    html: `
                                        <div style="
                                            background-color: ${isStart ? '#10b981' : isEnd ? '#ef4444' : '#3b82f6'};
                                            width: 30px;
                                            height: 30px;
                                            border-radius: 50%;
                                            border: 3px solid white;
                                            display: flex;
                                            align-items: center;
                                            justify-content: center;
                                            color: white;
                                            font-weight: bold;
                                            font-size: 12px;
                                            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                                        ">
                                            ${i + 1}
                                        </div>
                                    `,
                                    iconSize: [30, 30],
                                    iconAnchor: [15, 15]
                                });
                                
                                const marker = L.marker(waypoint.latLng, { icon: customIcon });
                                
                                const popupContent = `
                                    <div style="font-family: system-ui; min-width: 200px;">
                                        <h3 style="margin: 0 0 8px 0; font-weight: bold; color: #1f2937;">
                                            ${isStart ? '🚀 Start: ' : isEnd ? '🏁 End: ' : `📍 Stop ${i + 1}: `}${location.name}
                                        </h3>
                                        ${location.description ? `<p style="margin: 0 0 8px 0; color: #666; font-size: 14px;">${location.description}</p>` : ''}
                                        <div style="font-size: 12px; color: #999;">
                                            📍 ${Number(location.latitude).toFixed(6)}, ${Number(location.longitude).toFixed(6)}
                                        </div>
                                        <div style="font-size: 12px; color: #3b82f6; margin-top: 4px;">
                                            Stop ${i + 1} of ${validLocations.length}
                                        </div>
                                    </div>
                                `;
                                
                                return marker.bindPopup(popupContent);
                            },
                            show: false, // Hide default navigation panel - we'll create our own
                            addWaypoints: false,
                            routeWhileDragging: false,
                            fitSelectedRoutes: true,
                            lineOptions: {
                                styles: [{ color: '#ef4444', weight: 4, opacity: 0.8 }]
                            },
                            // Configure OSRM router for actual roads
                            router: (L as any).Routing.osrmv1({
                                serviceUrl: 'https://router.project-osrm.org/route/v1',
                                profile: 'driving',
                                timeout: 30 * 1000,
                                suppressDemoServerWarning: true
                            }),
                            createGeometry: function(route: any) {
                                return route.geometry;
                            }
                        });

                        // Add to map
                        routingControl.addTo(map);

                        // Track if routing succeeded
                        let routingSucceeded = false;

                        // Handle successful route calculation
                        routingControl.on('routesfound', function (e: any) {
                            console.log('✅ Actual route found successfully:', e.routes[0]);
                            routingSucceeded = true;
                            const route = e.routes[0];
                            const summary = route.summary;
                            
                            const distanceKm = (summary.totalDistance / 1000).toFixed(1);
                            const totalSeconds = summary.totalTime;
                            const hours = Math.floor(totalSeconds / 3600);
                            const minutes = Math.floor((totalSeconds % 3600) / 60);
                            
                            let durationStr = '';
                            if (hours > 0) durationStr += `${hours}h `;
                            durationStr += `${minutes}m`;

                            setRouteInfo({ 
                                distance: `${distanceKm} km`, 
                                duration: durationStr 
                            });

                            // Extract navigation instructions
                            if (route.instructions && route.instructions.length > 0) {
                                const steps: NavigationStep[] = route.instructions.map((instruction: any, index: number) => ({
                                    instruction: instruction.text || `${instruction.type} for ${(instruction.distance / 1000).toFixed(1)} km`,
                                    distance: instruction.distance || 0,
                                    time: instruction.time || 0,
                                    type: instruction.type || 'straight'
                                }));
                                setNavigationSteps(steps);
                                console.log('📋 Navigation steps extracted:', steps.length, 'steps');
                            }
                            
                            setIsLoading(false);
                        });

                        // Handle routing errors
                        routingControl.on('routingerror', function (e: any) {
                            console.error('❌ Routing failed, trying alternative method:', e);
                            routingSucceeded = false;
                            
                            // Remove the failed routing control
                            try {
                                map.removeControl(routingControl);
                            } catch (err) {
                                console.warn('Could not remove failed routing control');
                            }
                            
                            // Try alternative routing method
                            tryAlternativeRouting(L, map, validLocations);
                        });

                        // Timeout fallback
                        setTimeout(() => {
                            if (!routingSucceeded && isLoading) {
                                console.warn('⏰ Routing timeout, trying alternative...');
                                try {
                                    map.removeControl(routingControl);
                                } catch (err) {
                                    console.warn('Could not remove timed-out routing control');
                                }
                                tryAlternativeRouting(L, map, validLocations);
                            }
                        }, 15000); // 15 second timeout

                    } catch (routingError) {
                        console.error('💥 Failed to create routing control:', routingError);
                        tryAlternativeRouting(L, map, validLocations);
                    }

                    // Alternative routing function using direct OSRM API
                    async function tryAlternativeRouting(L: any, map: any, locations: Location[]) {
                        console.log('🔄 Trying alternative OSRM API routing...');
                        
                        try {
                            // Create coordinate string for OSRM API
                            const coordString = locations.map(loc => 
                                `${Number(loc.longitude)},${Number(loc.latitude)}`
                            ).join(';');
                            
                            const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${coordString}?overview=full&geometries=geojson&steps=true`;
                            
                            console.log('📡 Fetching route from:', osrmUrl);
                            
                            const response = await fetch(osrmUrl);
                            const data = await response.json();
                            
                            if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
                                console.log('✅ Alternative routing successful!');
                                const route = data.routes[0];
                                
                                // Add custom markers
                                locations.forEach((location, i) => {
                                    const isStart = i === 0;
                                    const isEnd = i === locations.length - 1;
                                    
                                    const customIcon = L.divIcon({
                                        className: 'custom-numbered-icon',
                                        html: `
                                            <div style="
                                                background-color: ${isStart ? '#10b981' : isEnd ? '#ef4444' : '#3b82f6'};
                                                width: 30px;
                                                height: 30px;
                                                border-radius: 50%;
                                                border: 3px solid white;
                                                display: flex;
                                                align-items: center;
                                                justify-content: center;
                                                color: white;
                                                font-weight: bold;
                                                font-size: 12px;
                                                box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                                            ">
                                                ${i + 1}
                                            </div>
                                        `,
                                        iconSize: [30, 30],
                                        iconAnchor: [15, 15]
                                    });

                                    L.marker([Number(location.latitude), Number(location.longitude)], { icon: customIcon })
                                        .addTo(map)
                                        .bindPopup(`
                                            <div style="font-family: system-ui; min-width: 200px;">
                                                <h3 style="margin: 0 0 8px 0; font-weight: bold; color: #1f2937;">
                                                    ${isStart ? '🚀 Start: ' : isEnd ? '🏁 End: ' : `📍 Stop ${i + 1}: `}${location.name}
                                                </h3>
                                                ${location.description ? `<p style="margin: 0 0 8px 0; color: #666; font-size: 14px;">${location.description}</p>` : ''}
                                                <div style="font-size: 12px; color: #999;">
                                                    📍 ${Number(location.latitude).toFixed(6)}, ${Number(location.longitude).toFixed(6)}
                                                </div>
                                            </div>
                                        `);
                                });
                                
                                // Draw the actual route geometry
                                if (route.geometry && route.geometry.coordinates) {
                                    const routeCoords = route.geometry.coordinates.map((coord: number[]) => [coord[1], coord[0]]);
                                    
                                    L.polyline(routeCoords, {
                                        color: '#ef4444',
                                        weight: 4,
                                        opacity: 0.8,
                                        lineCap: 'round'
                                    }).addTo(map);
                                    
                                    console.log('🛣️ Actual road route drawn with', routeCoords.length, 'points');
                                }
                                
                                // Set route info
                                const distanceKm = (route.distance / 1000).toFixed(1);
                                const totalSeconds = route.duration;
                                const hours = Math.floor(totalSeconds / 3600);
                                const minutes = Math.floor((totalSeconds % 3600) / 60);
                                
                                let durationStr = '';
                                if (hours > 0) durationStr += `${hours}h `;
                                durationStr += `${minutes}m`;

                                setRouteInfo({ 
                                    distance: `${distanceKm} km`, 
                                    duration: durationStr 
                                });

                                // Extract navigation steps from OSRM response
                                if (route.legs && route.legs.length > 0) {
                                    const steps: NavigationStep[] = [];
                                    route.legs.forEach((leg: any, legIndex: number) => {
                                        if (leg.steps && leg.steps.length > 0) {
                                            leg.steps.forEach((step: any, stepIndex: number) => {
                                                steps.push({
                                                    instruction: step.maneuver?.instruction || `Continue for ${(step.distance / 1000).toFixed(1)} km`,
                                                    distance: step.distance || 0,
                                                    time: step.duration || 0,
                                                    type: step.maneuver?.type || 'straight'
                                                });
                                            });
                                        }
                                        // Add waypoint reached step
                                        if (legIndex < locations.length - 1) {
                                            steps.push({
                                                instruction: `📍 Arrive at ${locations[legIndex + 1].name}`,
                                                distance: 0,
                                                time: 0,
                                                type: 'waypoint'
                                            });
                                        }
                                    });
                                    setNavigationSteps(steps);
                                    console.log('📋 Alternative navigation steps extracted:', steps.length, 'steps');
                                }
                                
                                // Fit map to show route
                                const bounds = locations.map(loc => [Number(loc.latitude), Number(loc.longitude)] as [number, number]);
                                map.fitBounds(bounds, { 
                                    padding: [20, 20],
                                    maxZoom: isOverview ? 12 : 15
                                });
                                
                                setIsLoading(false);
                                
                            } else {
                                console.error('❌ Alternative routing also failed:', data);
                                // Final fallback to straight lines
                                addSimpleMarkersAndLines(L, map, locations);
                                setIsLoading(false);
                            }
                            
                        } catch (apiError) {
                            console.error('💥 Alternative routing API failed:', apiError);
                            // Final fallback to straight lines
                            addSimpleMarkersAndLines(L, map, locations);
                            setIsLoading(false);
                        }
                    }

                } else if (validLocations.length === 1) {
                    // Single location
                    const loc = validLocations[0];
                    const center = L.latLng(Number(loc.latitude), Number(loc.longitude));
                    
                    const customIcon = L.divIcon({
                        className: 'custom-numbered-icon',
                        html: `
                            <div style="
                                background-color: #10b981;
                                width: 30px;
                                height: 30px;
                                border-radius: 50%;
                                border: 3px solid white;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                color: white;
                                font-weight: bold;
                                font-size: 12px;
                                box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                            ">
                                1
                            </div>
                        `,
                        iconSize: [30, 30],
                        iconAnchor: [15, 15]
                    });
                    
                    L.marker(center, { icon: customIcon }).addTo(map).bindPopup(`
                        <div style="font-family: system-ui; min-width: 200px;">
                            <h3 style="margin: 0 0 8px 0; font-weight: bold; color: #1f2937;">
                                📍 ${loc.name}
                            </h3>
                            ${loc.description ? `<p style="margin: 0 0 8px 0; color: #666; font-size: 14px;">${loc.description}</p>` : ''}
                            <div style="font-size: 12px; color: #999;">
                                📍 ${Number(loc.latitude).toFixed(6)}, ${Number(loc.longitude).toFixed(6)}
                            </div>
                        </div>
                    `);
                    
                    map.setView(center, 13);
                    setIsLoading(false);
                }

                // Helper function to add simple markers and lines as final fallback
                function addSimpleMarkersAndLines(L: any, map: any, locations: Location[]) {
                    console.log('⚠️ Using straight line fallback');
                    const bounds: [number, number][] = [];
                    const routeCoordinates: [number, number][] = [];
                    let totalDistance = 0;

                    locations.forEach((location, i) => {
                        const lat = Number(location.latitude);
                        const lng = Number(location.longitude);
                        const isStart = i === 0;
                        const isEnd = i === locations.length - 1;

                        // Calculate distance from previous point
                        if (i > 0) {
                            const prevLat = Number(locations[i - 1].latitude);
                            const prevLng = Number(locations[i - 1].longitude);
                            const distance = calculateDistance(prevLat, prevLng, lat, lng);
                            totalDistance += distance;
                        }

                        const customIcon = L.divIcon({
                            className: 'custom-numbered-icon',
                            html: `
                                <div style="
                                    background-color: ${isStart ? '#10b981' : isEnd ? '#ef4444' : '#3b82f6'};
                                    width: 30px;
                                    height: 30px;
                                    border-radius: 50%;
                                    border: 3px solid white;
                                    display: flex;
                                    align-items: center;
                                    justify-content: center;
                                    color: white;
                                    font-weight: bold;
                                    font-size: 12px;
                                    box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                                ">
                                    ${i + 1}
                                </div>
                            `,
                            iconSize: [30, 30],
                            iconAnchor: [15, 15]
                        });

                        L.marker([lat, lng], { icon: customIcon }).addTo(map).bindPopup(`
                            <div style="font-family: system-ui; min-width: 200px;">
                                <h3 style="margin: 0 0 8px 0; font-weight: bold; color: #1f2937;">
                                    ${isStart ? '🚀 Start: ' : isEnd ? '🏁 End: ' : `📍 Stop ${i + 1}: `}${location.name}
                                </h3>
                                ${location.description ? `<p style="margin: 0 0 8px 0; color: #666; font-size: 14px;">${location.description}</p>` : ''}
                                <div style="font-size: 12px; color: #999;">
                                    📍 ${lat.toFixed(6)}, ${lng.toFixed(6)}
                                </div>
                            </div>
                        `);

                        bounds.push([lat, lng]);
                        routeCoordinates.push([lat, lng]);
                    });

                    // Draw simple line between points with clear indication it's not real route
                    if (routeCoordinates.length > 1) {
                        L.polyline(routeCoordinates, {
                            color: '#ef4444',
                            weight: 4,
                            opacity: 0.6,
                            dashArray: '15, 10' // More obvious dashed pattern
                        }).addTo(map);
                        
                        // Add warning about straight line
                        console.warn('⚠️ Showing straight line - actual roads not available');
                    }

                    // Set approximate route info for straight line distance
                    if (totalDistance > 0) {
                        const estimatedTime = Math.round(totalDistance * 1.5); // Rough estimate: 1.5 minutes per km
                        const hours = Math.floor(estimatedTime / 60);
                        const minutes = estimatedTime % 60;
                        
                        let durationStr = '';
                        if (hours > 0) durationStr += `${hours}h `;
                        durationStr += `${minutes}m`;

                        setRouteInfo({ 
                            distance: `~${totalDistance.toFixed(1)} km`, 
                            duration: `~${durationStr}` 
                        });
                    }

                    // Fit map to bounds
                    if (bounds.length > 0) {
                        map.fitBounds(bounds, { 
                            padding: [20, 20],
                            maxZoom: isOverview ? 12 : 15
                        });
                    }

                    // Create simple navigation steps for straight line route
                    if (locations.length > 1) {
                        const steps: NavigationStep[] = [];
                        for (let i = 0; i < locations.length - 1; i++) {
                            const current = locations[i];
                            const next = locations[i + 1];
                            const distance = calculateDistance(
                                Number(current.latitude), Number(current.longitude),
                                Number(next.latitude), Number(next.longitude)
                            );
                            
                            steps.push({
                                instruction: `🔷 Head directly from ${current.name} to ${next.name}`,
                                distance: distance * 1000, // Convert to meters
                                time: distance * 60, // Rough estimate: 1 minute per km
                                type: 'straight'
                            });
                        }
                        steps.push({
                            instruction: `🏁 Arrive at ${locations[locations.length - 1].name}`,
                            distance: 0,
                            time: 0,
                            type: 'waypoint'
                        });
                        setNavigationSteps(steps);
                    }
                }

                // Calculate distance between two points (Haversine formula)
                function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
                    const R = 6371; // Earth's radius in kilometers
                    const dLat = (lat2 - lat1) * Math.PI / 180;
                    const dLon = (lon2 - lon1) * Math.PI / 180;
                    const a = 
                        Math.sin(dLat/2) * Math.sin(dLat/2) +
                        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                        Math.sin(dLon/2) * Math.sin(dLon/2);
                    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
                    return R * c;
                }

                // Force map to resize
                setTimeout(() => {
                    if (map) {
                        map.invalidateSize();
                    }
                }, 100);

            } catch (err) {
                console.error('Map initialization error:', err);
                setError('Failed to initialize map: ' + String(err));
                setIsLoading(false);
            }
        };

        loadMapLibraries();

        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
        };

    }, [locations, isOverview]);

    // Format distance for navigation steps
    const formatStepDistance = (meters: number): string => {
        if (meters >= 1000) {
            return `${(meters / 1000).toFixed(1)} km`;
        }
        return `${meters.toFixed(0)} m`;
    };

    // Format time for navigation steps
    const formatStepTime = (seconds: number): string => {
        const minutes = Math.round(seconds / 60);
        if (minutes < 1) return '< 1 min';
        if (minutes >= 60) {
            const hours = Math.floor(minutes / 60);
            const remainingMinutes = minutes % 60;
            return `${hours}h ${remainingMinutes}m`;
        }
        return `${minutes} min`;
    };

    // Get icon for navigation step type
    const getStepIcon = (type: string): string => {
        switch (type) {
            case 'depart': return '🚀';
            case 'arrive': return '🏁';
            case 'waypoint': return '📍';
            case 'turn-left': return '↰';
            case 'turn-right': return '↱';
            case 'turn-slight-left': return '↙';
            case 'turn-slight-right': return '↘';
            case 'continue': return '⬆';
            case 'straight': return '🔷';
            default: return '➡';
        }
    };

    if (locations.length === 0) {
        return (
            <div className={`w-full h-[400px] rounded-lg border bg-gray-100 flex items-center justify-center ${className}`}>
                <div className="text-center text-gray-500">
                    <div className="text-2xl mb-2">🗺️</div>
                    <p>No locations to display on map</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={`w-full h-[400px] rounded-lg border bg-red-50 flex items-center justify-center ${className}`}>
                <div className="text-center text-red-600">
                    <div className="text-2xl mb-2">⚠️</div>
                    <p>{error}</p>
                    <button 
                        onClick={() => window.location.reload()} 
                        className="mt-2 px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={`${className}`}>
            {/* Route Info and Navigation Toggle */}
            {!isLoading && routeInfo && locations.length >= 2 && (
                <div className="mb-4 space-y-3">
                    {/* Route Summary */}
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                        <div className="flex justify-between items-center">
                            <div className="flex gap-6">
                                <span className="font-medium text-blue-800">
                                    🛣️ Distance: {routeInfo.distance}
                                </span>
                                <span className="font-medium text-blue-800">
                                    ⏱️ Time: {routeInfo.duration}
                                </span>
                            </div>
                            {navigationSteps.length > 0 && (
                                <button
                                    onClick={() => setShowNavigation(!showNavigation)}
                                    className="px-3 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 transition-colors flex items-center gap-2"
                                >
                                    📋 Navigation
                                    <span className="transform transition-transform duration-200" style={{
                                        transform: showNavigation ? 'rotate(180deg)' : 'rotate(0deg)'
                                    }}>
                                        ▼
                                    </span>
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Navigation Steps */}
                    {showNavigation && navigationSteps.length > 0 && (
                        <div className="bg-white border rounded-lg shadow-sm">
                            <div className="p-3 border-b bg-gray-50">
                                <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                                    📋 Turn-by-Turn Navigation
                                    <span className="text-sm text-gray-500">({navigationSteps.length} steps)</span>
                                </h4>
                            </div>
                            <div className="max-h-64 overflow-y-auto">
                                {navigationSteps.map((step, index) => (
                                    <div key={index} className="p-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50">
                                        <div className="flex items-start gap-3">
                                            <span className="text-lg mt-0.5 flex-shrink-0">
                                                {getStepIcon(step.type)}
                                            </span>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm text-gray-800 font-medium">
                                                    {step.instruction}
                                                </p>
                                                {(step.distance > 0 || step.time > 0) && (
                                                    <div className="flex gap-4 mt-1 text-xs text-gray-500">
                                                        {step.distance > 0 && (
                                                            <span>📏 {formatStepDistance(step.distance)}</span>
                                                        )}
                                                        {step.time > 0 && (
                                                            <span>⏱️ {formatStepTime(step.time)}</span>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                            <span className="text-xs text-gray-400 mt-0.5">
                                                {index + 1}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
            
            {/* Map Container - Only show the map */}
            <div className={`relative w-full ${isOverview ? 'h-[500px]' : 'h-[400px]'} rounded-lg border bg-gray-100 overflow-hidden`}>
                {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center z-10 bg-white bg-opacity-90">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
                            <p className="text-gray-600 text-sm">
                                {locations.length === 1 ? 'Loading map...' : 'Calculating route...'}
                            </p>
                        </div>
                    </div>
                )}
                <div ref={mapRef} className="w-full h-full" />
            </div>
        </div>
    );
}
