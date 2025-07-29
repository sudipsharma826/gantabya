"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getAllVisitedLocations } from "@/lib/actions/gantabyasActions";
import GantabyasMap from "@/components/GantabyasMap";
import Link from "next/link";

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

export default function Gantabyas() {
    const [locations, setLocations] = useState<VisitedLocation[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [totalTrips, setTotalTrips] = useState(0);

    useEffect(() => {
        loadVisitedLocations();
    }, []);

    const loadVisitedLocations = async () => {
        setIsLoading(true);
        try {
            const result = await getAllVisitedLocations();
            if (result.success && result.data) {
                setLocations(result.data);
                setTotalTrips(result.totalTrips || 0);
            } else {
                setError(result.error || 'Failed to load visited locations');
            }
        } catch (err) {
            setError('An error occurred while loading locations');
        } finally {
            setIsLoading(false);
        }
    };

    const formatDate = (date: Date) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

   
    if (error) {
        return (
            <div className="container mx-auto p-6">
                <Card className="border-red-200 bg-red-50">
                    <CardContent className="p-6 text-center">
                        <p className="text-red-700">{error}</p>
                        <Button onClick={loadVisitedLocations} className="mt-4">
                            Try Again
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6 max-w-7xl">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-orange-600 to-purple-600 bg-clip-text text-transparent">
                    🗺️ Gantabyas - Your Travel Journey
                </h1>
                <p className="text-gray-600 text-lg">
                    You have visited {locations.length} locations across {totalTrips} trips
                </p>
            </div>

            {locations.length === 0 ? (
                <Card>
                    <CardContent className="p-12 text-center">
                        <div className="text-6xl mb-4">🧳</div>
                        <h2 className="text-2xl font-bold mb-4">No trips yet!</h2>
                        <p className="text-gray-600 mb-6">
                            Start planning your first trip to see your journey on the map
                        </p>
                        <Link href="/trips">
                            <Button className="bg-orange-600 hover:bg-orange-700">
                                Plan Your First Trip
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            ) : (
                <>
                    {/* Map */}
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                🗺️ Your Travel Map
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <GantabyasMap locations={locations} className="h-[500px]" />
                        </CardContent>
                    </Card>

                    {/* Locations List */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                📍 All Visited Locations
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {locations
                                    .sort((a, b) => new Date(b.visitedDate).getTime() - new Date(a.visitedDate).getTime())
                                    .map((location) => (
                                        <div key={location.id} className="p-4 border border-gray-200 rounded-lg hover:shadow-sm transition-shadow">
                                            <div className="space-y-3">
                                                <h3 className="font-semibold text-gray-900 text-lg">
                                                    {location.locationTitle}
                                                </h3>
                                                
                                                <div className="space-y-2 text-sm text-gray-600">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-medium">📅 Visited:</span>
                                                        <span>{formatDate(location.visitedDate)}</span>
                                                    </div>
                                                    
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-medium">🧳 Trip:</span>
                                                        <span className="text-orange-600 font-medium">{location.tripName}</span>
                                                    </div>
                                                    
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-medium">📍 Coordinates:</span>
                                                        <span className="font-mono text-xs">
                                                            {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
                                                        </span>
                                                    </div>
                                                </div>
                                                
                                                <Link href={`/trips/${location.tripId}`}>
                                                    <Button 
                                                        size="sm" 
                                                        className="w-full mt-3 bg-orange-600 hover:bg-orange-700"
                                                    >
                                                        View Trip
                                                    </Button>
                                                </Link>
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        </CardContent>
                    </Card>
                </>
            )}
        </div>
    );
}