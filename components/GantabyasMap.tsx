"use client";

import { useEffect, useRef } from 'react';

interface VisitedLocation {
    id: string;
    locationTitle: string;
    latitude: number;
    longitude: number;
    tripId: string;
    tripName: string;
    visitedDate: Date;
    tripStartDate: Date;
    tripEndDate: Date;
    order: number;
}

interface GantabyasMapProps {
    locations: VisitedLocation[];
    className?: string;
}

export default function GantabyasMap({ locations, className = "" }: GantabyasMapProps) {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<any>(null);

    useEffect(() => {
        if (!mapRef.current || locations.length === 0) return;

        // Clear existing map
        if (mapInstanceRef.current) {
            mapInstanceRef.current.remove();
        }

        // Initialize Leaflet map
        const initMap = async () => {
            const L = (await import('leaflet')).default;
            
            // Fix default markers
            delete (L.Icon.Default.prototype as any)._getIconUrl;
            L.Icon.Default.mergeOptions({
                iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
                iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
                shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
            });

            // Create map centered on Nepal
            const map = L.map(mapRef.current!).setView([28.3949, 84.1240], 7);
            mapInstanceRef.current = map;

            // Add tile layer
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors'
            }).addTo(map);

            // Group locations by trip
            const tripGroups = locations.reduce((acc, location) => {
                if (!acc[location.tripId]) {
                    acc[location.tripId] = [];
                }
                acc[location.tripId].push(location);
                return acc;
            }, {} as Record<string, VisitedLocation[]>);

            // Color palette for different trips
            const colors = [
                '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
                '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1'
            ];

            let colorIndex = 0;
            const bounds = L.latLngBounds([]);

            // Process each trip
            Object.entries(tripGroups).forEach(([tripId, tripLocations]) => {
                const color = colors[colorIndex % colors.length];
                colorIndex++;

                // Sort locations by order within trip
                const sortedLocations = tripLocations.sort((a, b) => a.order - b.order);

                // Create markers for each location
                sortedLocations.forEach((location, index) => {
                    const latlng = L.latLng(location.latitude, location.longitude);
                    bounds.extend(latlng);

                    // Create custom icon with trip color
                    const customIcon = L.divIcon({
                        html: `
                            <div style="
                                background-color: ${color};
                                border: 2px solid white;
                                border-radius: 50%;
                                width: 24px;
                                height: 24px;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                font-size: 12px;
                                font-weight: bold;
                                color: white;
                                box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                            ">
                                ${index + 1}
                            </div>
                        `,
                        className: 'custom-div-icon',
                        iconSize: [24, 24],
                        iconAnchor: [12, 12]
                    });

                    // Add marker
                    const marker = L.marker(latlng, { icon: customIcon }).addTo(map);

                    // Create popup content
                    const popupContent = `
                        <div style="min-width: 200px;">
                            <h3 style="margin: 0 0 8px 0; font-size: 14px; font-weight: bold; color: ${color};">
                                ${location.locationTitle}
                            </h3>
                            <div style="font-size: 12px; color: #666;">
                                <p style="margin: 4px 0;"><strong>Trip:</strong> ${location.tripName}</p>
                                <p style="margin: 4px 0;"><strong>Trip Date:</strong> ${new Date(location.tripStartDate).toLocaleDateString()}</p>
                                <p style="margin: 4px 0;"><strong>Position:</strong> ${index + 1} of ${sortedLocations.length}</p>
                                <p style="margin: 4px 0;"><strong>Coordinates:</strong> ${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}</p>
                            </div>
                        </div>
                    `;

                    marker.bindPopup(popupContent);
                });

                // Draw lines connecting locations within the same trip
                if (sortedLocations.length > 1) {
                    const routeCoords = sortedLocations.map(loc => [loc.latitude, loc.longitude] as [number, number]);
                    
                    L.polyline(routeCoords, {
                        color: color,
                        weight: 3,
                        opacity: 0.7,
                        dashArray: '5, 10'
                    }).addTo(map).bindPopup(`
                        <div>
                            <h4 style="margin: 0 0 8px 0; color: ${color};">${tripLocations[0].tripName}</h4>
                            <p style="margin: 0; font-size: 12px;">Route connecting ${sortedLocations.length} locations</p>
                        </div>
                    `);
                }
            });

            // Fit map to show all locations
            if (bounds.isValid()) {
                map.fitBounds(bounds, { padding: [20, 20] });
            }

            // Add legend
            const legend = L.control({ position: 'topright' });
            legend.onAdd = function () {
                const div = L.DomUtil.create('div', 'legend');
                div.style.backgroundColor = 'white';
                div.style.padding = '10px';
                div.style.borderRadius = '5px';
                div.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';
                
                let legendContent = '<h4 style="margin: 0 0 8px 0; font-size: 14px;">Trips</h4>';
                
                Object.entries(tripGroups).forEach(([tripId, tripLocations], index) => {
                    const color = colors[index % colors.length];
                    legendContent += `
                        <div style="margin: 4px 0; display: flex; align-items: center;">
                            <div style="
                                width: 12px; 
                                height: 12px; 
                                background-color: ${color}; 
                                border-radius: 50%; 
                                margin-right: 6px;
                            "></div>
                            <span style="font-size: 12px;">${tripLocations[0].tripName} (${tripLocations.length})</span>
                        </div>
                    `;
                });
                
                div.innerHTML = legendContent;
                return div;
            };
            legend.addTo(map);
        };

        // Load CSS
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.7.1/dist/leaflet.css';
        document.head.appendChild(link);

        initMap();

        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
        };
    }, [locations]);

    if (locations.length === 0) {
        return (
            <div className={`h-96 bg-gray-100 rounded-lg flex items-center justify-center ${className}`}>
                <div className="text-center text-gray-500">
                    <div className="text-4xl mb-4">🗺️</div>
                    <p className="text-lg mb-2">No locations visited yet</p>
                    <p className="text-sm">Start planning trips to see your journey on the map</p>
                </div>
            </div>
        );
    }

    return <div ref={mapRef} className={`h-96 rounded-lg ${className}`} />;
}
