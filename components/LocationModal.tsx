"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { updateLocation, deleteLocation } from "@/lib/actions/locationActions";

// Local types for this component
interface LocationSuggestion {
    display_name: string;
    lat: string;
    lon: string;
    place_id?: string;
}

interface Location {
    id: string;
    locationTitle: string;
    latitude: number;
    longitude: number;
    description?: string;
    tripId: string;
}

interface LocationModalProps {
    location: Location;
    isOpen: boolean;
    onClose: () => void;
    mode: 'edit' | 'delete';
}

export default function LocationModal({ location, isOpen, onClose, mode }: LocationModalProps) {
    // State management
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [query, setQuery] = useState(location.locationTitle);
    const [selectedLocation, setSelectedLocation] = useState<LocationSuggestion | null>(null);
    const [isSearching, setIsSearching] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Reset state when modal opens/closes or location changes
    useEffect(() => {
        if (isOpen) {
            setQuery(location.locationTitle);
            setSelectedLocation(null);
            setError(null);
            setSuggestions([]);
            setShowSuggestions(false);
        }
    }, [isOpen, location.locationTitle]);

    // Debounced search effect with 300ms timeout
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (query.length >= 3 && query !== location.locationTitle && !selectedLocation) {
                fetchLocationSuggestions(query);
            } else if (query.length < 3) {
                setSuggestions([]);
                setShowSuggestions(false);
            }
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [query]);

    // Click outside handler
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => {
                document.removeEventListener('mousedown', handleClickOutside);
            };
        }
    }, [isOpen]);

    if (!isOpen) return null;

    // Fetch location suggestions from API
    const fetchLocationSuggestions = async (searchQuery: string) => {
        setIsSearching(true);
        try {
            const response = await fetch(`/api/locationsuggestions?q=${encodeURIComponent(searchQuery)}`);
            
            if (!response.ok) {
                throw new Error('Failed to fetch suggestions');
            }
            
            const data = await response.json();
            setSuggestions(data.suggestions || []);
            setShowSuggestions(true);
        } catch (error) {
            console.error('Error fetching suggestions:', error);
            setSuggestions([]);
            setShowSuggestions(false);
            setError('Failed to fetch location suggestions');
        } finally {
            setIsSearching(false);
        }
    };

    // Handle suggestion selection
    const handleSuggestionClick = (suggestion: LocationSuggestion) => {
        setSelectedLocation(suggestion);
        setQuery(suggestion.display_name);
        setShowSuggestions(false);
        setError(null);
        console.log('Selected location:', suggestion);
    };

    // Handle input change
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setQuery(value);
        setSelectedLocation(null);
        setError(null);
    };

    // Handle location update
    const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const formData = new FormData();
            
            // Add location data to form
            if (selectedLocation) {
                // Use selected location coordinates
                formData.append('locationTitle', selectedLocation.display_name);
                formData.append('latitude', selectedLocation.lat);
                formData.append('longitude', selectedLocation.lon);
                console.log('Using selected location coordinates:', {
                    lat: selectedLocation.lat,
                    lon: selectedLocation.lon,
                    name: selectedLocation.display_name
                });
            } else {
                // Use current query and existing coordinates if no new location selected
                formData.append('locationTitle', query.trim());
                formData.append('latitude', location.latitude.toString());
                formData.append('longitude', location.longitude.toString());
                console.log('Using existing coordinates:', {
                    lat: location.latitude,
                    lon: location.longitude,
                    name: query.trim()
                });
            }

            // Call the server action with correct parameter order
            const result = await updateLocation(location.id, formData);

            if (result.success) {
                console.log('Location updated successfully');
                onClose();
                // Force page refresh to see changes
                window.location.reload();
            } else {
                setError(result.error || 'Failed to update location');
                console.error('Update failed:', result.error);
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An error occurred while updating the location';
            setError(errorMessage);
            console.error('Update error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    // Handle location deletion
    const handleDelete = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const result = await deleteLocation(location.id);

            if (result.success) {
                console.log('Location deleted successfully');
                onClose();
                // Force page refresh to see changes
                window.location.reload();
            } else {
                setError(result.error || 'Failed to delete location');
                console.error('Delete failed:', result.error);
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An error occurred while deleting the location';
            setError(errorMessage);
            console.error('Delete error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="backdrop-blur-sm fixed inset-0 flex items-center justify-center z-50 p-4">
            <Card className="max-w-md w-full max-h-[90vh] overflow-y-auto shadow-xl">
                <CardHeader className="pb-3">
                    <div className="flex justify-between items-center">
                        <CardTitle className="text-xl font-bold text-gray-900">
                            {mode === 'edit' ? '✏️ Edit Location' : '🗑️ Delete Location'}
                        </CardTitle>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 text-xl p-1 rounded hover:bg-gray-100"
                            disabled={isLoading}
                        >
                            ✕
                        </button>
                    </div>
                </CardHeader>

                <CardContent className="pt-0">
                    {error && (
                        <Card className="mb-4 border-red-200 bg-red-50">
                            <CardContent className="p-3">
                                <p className="text-red-700 text-sm">{error}</p>
                            </CardContent>
                        </Card>
                    )}

                    {mode === 'edit' ? (
                        <form onSubmit={handleUpdate} className="space-y-4">
                            <div className="space-y-4">
                                {/* Location Name with Search Suggestions */}
                                <div className="relative" ref={containerRef}>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Location Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={query}
                                        onChange={handleInputChange}
                                        onFocus={() => {
                                            if (suggestions.length > 0) {
                                                setShowSuggestions(true);
                                            }
                                        }}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Escape') {
                                                setShowSuggestions(false);
                                            }
                                        }}
                                        required
                                        autoComplete="off"
                                        disabled={isLoading}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                                        placeholder="Enter location name or search for new location..."
                                    />
                                    
                                    {/* Loading indicator */}
                                    {isSearching && (
                                        <div className="absolute right-3 top-9">
                                            <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                                        </div>
                                    )}
                                    
                                    {/* Suggestions Dropdown */}
                                    {showSuggestions && suggestions.length > 0 && (
                                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                                            {suggestions.map((suggestion, index) => (
                                                <button
                                                    key={suggestion.place_id || index}
                                                    type="button"
                                                    onClick={() => handleSuggestionClick(suggestion)}
                                                    className="w-full px-3 py-2 text-left hover:bg-gray-100 border-b border-gray-100 last:border-b-0 transition-colors duration-150"
                                                >
                                                    <div className="text-sm font-medium text-gray-900 truncate">
                                                        {suggestion.display_name}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        {suggestion.lat}, {suggestion.lon}
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    )}

                                    {/* No results message */}
                                    {showSuggestions && suggestions.length === 0 && !isSearching && query.length >= 3 && query !== location.locationTitle && (
                                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg p-3">
                                            <div className="text-sm text-gray-500 text-center">No locations found</div>
                                        </div>
                                    )}
                                </div>

                                {/* Selected Location Display */}
                                {selectedLocation && (
                                    <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                                        <p className="text-sm text-green-800 font-medium">
                                            ✓ New location selected:
                                        </p>
                                        <p className="text-sm text-green-700 mt-1">
                                            {selectedLocation.display_name}
                                        </p>
                                        <p className="text-xs text-green-600 mt-1">
                                            Coordinates: {selectedLocation.lat}, {selectedLocation.lon}
                                        </p>
                                    </div>
                                )}

                                {/* Current Location Info */}
                                {!selectedLocation && (
                                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                                        <p className="text-sm text-blue-800 font-medium">Current location:</p>
                                        <p className="text-sm text-blue-700 mt-1">{location.locationTitle}</p>
                                        <p className="text-xs text-blue-600 mt-1">
                                            Coordinates: {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-3 pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={onClose}
                                    disabled={isLoading}
                                    className="flex-1"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={isLoading}
                                    className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400"
                                >
                                    {isLoading ? (
                                        <div className="flex items-center gap-2">
                                            <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                                            Updating...
                                        </div>
                                    ) : (
                                        'Update Location'
                                    )}
                                </Button>
                            </div>
                        </form>
                    ) : (
                        // Delete mode
                        <div className="space-y-4">
                            <Card className="border-red-200 bg-red-50">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="text-red-600 text-2xl">⚠️</div>
                                        <div>
                                            <h3 className="font-semibold text-red-800">Are you sure?</h3>
                                            <p className="text-red-700 text-sm">This action cannot be undone.</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="bg-gray-50">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm text-gray-700">Location to delete:</CardTitle>
                                </CardHeader>
                                <CardContent className="pt-0">
                                    <div className="space-y-2 text-sm text-gray-600">
                                        <div className="flex justify-between">
                                            <span className="font-medium">Name:</span>
                                            <span className="text-gray-900">{location.locationTitle}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="font-medium">Coordinates:</span>
                                            <span className="text-gray-900 font-mono text-xs">
                                                {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
                                            </span>
                                        </div>
                                        {location.description && (
                                            <div className="pt-2 border-t border-gray-200">
                                                <span className="font-medium">Description:</span>
                                                <p className="text-gray-900 mt-1">{location.description}</p>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            <div className="flex gap-3 pt-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={onClose}
                                    disabled={isLoading}
                                    className="flex-1"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="button"
                                    onClick={handleDelete}
                                    disabled={isLoading}
                                    className="flex-1 bg-red-600 hover:bg-red-700"
                                >
                                    {isLoading ? 'Deleting...' : 'Delete Location'}
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}