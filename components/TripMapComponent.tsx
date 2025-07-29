"use client";

import dynamic from 'next/dynamic';

// Dynamic import to avoid SSR issues
const InteractiveMap = dynamic(() => import('./InteractiveMap'), {
    ssr: false,
    loading: () => (
        <div className="w-full h-[400px] rounded-lg border bg-gray-100 flex items-center justify-center">
            <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
                <p className="text-gray-500 text-sm">Loading map...</p>
            </div>
        </div>
    )
});

// Server component types
interface Location {
    id: string;
    locationTitle: string;
    latitude: number;
    longitude: number;
    description?: string;
    tripId: string;
    createdAt?: Date;
}

interface MapLocation {
    id: string;
    name: string;
    latitude: number;
    longitude: number;
    description?: string;
    tripId: string;
}

interface TripMapComponentProps {
    locations: Location[];
    isOverview?: boolean;
}

// Server component - converts data and renders the map
export default function TripMapComponent({ 
    locations, 
    isOverview = false
}: TripMapComponentProps) {
    
    // Convert location data for map component
    const convertLocationsForMap = (locations: Location[]): MapLocation[] => {
        return locations.map(location => ({
            id: location.id,
            name: location.locationTitle,
            latitude: Number(location.latitude),
            longitude: Number(location.longitude),
            description: location.description,
            tripId: location.tripId
        }));
    };

    const mapLocations = convertLocationsForMap(locations);

    // If no locations, show empty state
    if (locations.length === 0) {
        return (
            <div className="text-center py-12 text-gray-500">
                <div className="text-4xl mb-4">🗺️</div>
                <p className="text-lg mb-2">No locations added yet</p>
                <p className="text-sm">Add locations to see them on the map</p>
            </div>
        );
    }

    // Only show the interactive map
    return (
        <InteractiveMap 
            locations={mapLocations} 
            isOverview={isOverview}
            className="w-full"
        />
    );
}