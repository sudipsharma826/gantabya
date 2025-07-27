"use client";
import { useTransition, useState, useEffect, useRef } from "react";
import { Button } from "./ui/button";
import addLocationAction from "@/lib/actions/addLocation";

interface LocationSuggestion {
    display_name: string;
    lat: string;
    lon: string;
    place_id: string;
}

export default function AddLocationPage({tripId}: { tripId: string }) {
    const [isPending , startTransition] = useTransition();
    const [locationName, setLocationName] = useState('');
    const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [selectedLocation, setSelectedLocation] = useState<LocationSuggestion | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (locationName.length >= 3 && !selectedLocation) {
                fetchSuggestions();
            } else {
                setSuggestions([]);
                setShowSuggestions(false);
            }
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [locationName, selectedLocation]);

    const fetchSuggestions = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`/api/locationsuggestions?q=${encodeURIComponent(locationName)}`);
            const data = await response.json();
            setSuggestions(data.suggestions || []);
            setShowSuggestions(true);
        } catch (error) {
            console.error('Error fetching suggestions:', error);
            setSuggestions([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSuggestionClick = (suggestion: LocationSuggestion) => {
        setSelectedLocation(suggestion);
        setLocationName(suggestion.display_name);
        setShowSuggestions(false);
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Escape') {
            setShowSuggestions(false);
        }
    };

    return (
        <div className="min-h-calc(100vh - 64px) flex items-center justify-center mt-10">
            <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
                <div className="text-center mb-6">
                    <h1 className="text-2xl font-bold mb-2">Add New Location</h1>
                    <p className="text-gray-600">Add a new location to your trip</p>

                    <form className="mt-4" 
                    action={(formData : FormData)=>{
                        if (!selectedLocation) {
                            alert('Please select a location from suggestions');
                            return;
                        }
                        formData.append('lat', selectedLocation.lat);
                        formData.append('lng', selectedLocation.lon);
                        startTransition(()=>{
                            addLocationAction(formData, tripId);
                        })
                    }}>
                        <div className="mb-4 relative" ref={containerRef}>
                            <label htmlFor="locationName" className="block text-sm font-medium text-gray-700">Location Name</label>
                            <input
                                type="text"
                                id="locationName"
                                name="locationName"
                                value={locationName}
                                onChange={(e) => {
                                    setLocationName(e.target.value);
                                    setSelectedLocation(null);
                                }}
                                onKeyDown={handleKeyDown}
                                onFocus={() => {
                                    if (suggestions.length > 0) {
                                        setShowSuggestions(true);
                                    }
                                }}
                                required
                                autoComplete="off"
                                placeholder="Type to search locations..."
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            />
                            
                            {isLoading && (
                                <div className="absolute right-3 top-9">
                                    <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                                </div>
                            )}

                            {showSuggestions && suggestions.length > 0 && (
                                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                                    {suggestions.map((suggestion) => (
                                        <div
                                            key={suggestion.place_id}
                                            onClick={() => handleSuggestionClick(suggestion)}
                                            className="p-3 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0 text-left transition-colors duration-150"
                                        >
                                            <div className="text-sm text-gray-800 truncate">
                                                {suggestion.display_name}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {showSuggestions && suggestions.length === 0 && !isLoading && locationName.length >= 3 && (
                                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg p-3">
                                    <div className="text-sm text-gray-500 text-center">No locations found</div>
                                </div>
                            )}
                        </div>

                        {selectedLocation && (
                            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md text-left">
                                <p className="text-sm text-green-800">
                                    ✓ Selected: {selectedLocation.display_name}
                                </p>
                            </div>
                        )}

                        <Button
                            type="submit"
                            className="w-full mt-4"
                            disabled={!selectedLocation || isPending}
                        >
                           {isPending ? "Adding..." : "Add Location"}
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
}