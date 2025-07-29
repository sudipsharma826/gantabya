"use client";
import { Trip } from "@/lib/generated/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import TripMapComponent from "./TripMapComponent";
import LocationDetailsList from "./LocationDetailsList";
import PlansList from "./PlansList";
import { Session } from "next-auth";
import clsx from "clsx";

// TYPES - Define what location data looks like
interface Location {
    id: string;
    locationTitle: string;
    latitude: number;
    longitude: number;
    description?: string;
    tripId: string;
    createdAt?: Date;
}

interface TripDetailsClientProps {
    tripDetails: Trip & {
        locations: Location[];
    },
    session: Session;
}

export default function TripDetails({ tripDetails , session }: TripDetailsClientProps) {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState("details");
    const [mapKey, setMapKey] = useState(0);
    const [isMapHidden, setIsMapHidden] = useState(false);
    
    // USE LOCATIONS FROM PROPS
    const locations = tripDetails.locations || [];
    
    // Force map re-render when locations change
    useEffect(() => {
        setMapKey(prev => prev + 1);
    }, [locations.length, locations]);

    // Function to handle map visibility
    const handleMapVisibility = (shouldHide: boolean) => {
        setIsMapHidden(shouldHide);
    };


    const currentDate = new Date();
    const startDate = new Date(tripDetails.startDate);
    const endDate = new Date(tripDetails.endDate);
    
    // Basic trip calculations
    const isUpcoming = startDate > currentDate;
    const isCurrent = startDate <= currentDate && endDate >= currentDate;
    const isPast = endDate < currentDate;
    const tripDuration = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    // Status configuration
    const getStatusConfig = () => {
        if (isCurrent) {
            return {
                status: "Current Trip",
                badge: "🌟 Ongoing",
                bgGradient: "bg-gradient-to-r from-green-500 to-emerald-600"
            };
        } else if (isUpcoming) {
            return {
                status: "Upcoming Trip",
                badge: "📅 Upcoming",
                bgGradient: "bg-gradient-to-r from-blue-500 to-cyan-600"
            };
        } else {
            return {
                status: "Past Trip",
                badge: "✅ Completed",
                bgGradient: "bg-gradient-to-r from-gray-500 to-slate-600"
            };
        }
    };

    const statusConfig = getStatusConfig();

    return (
        <div className={clsx(
            "min-h-screen bg-gray-50 transition-all duration-300"
        )}>
            <div className="container mx-auto px-4 py-6 max-w-6xl">
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
                    <Link href="/trips">
                        <Button variant="outline" className="flex items-center gap-2">
                            <span>←</span> Back to Trips
                        </Button>
                    </Link>
                    <div className={`px-4 py-2 rounded-full text-white text-sm font-semibold ${statusConfig.bgGradient}`}>
                        {statusConfig.badge}
                    </div>
                </div>

                {/* Hero Image & Title */}
                <div className="relative overflow-hidden rounded-xl shadow-lg mb-6">
                    <div className="relative h-[250px] md:h-[300px] w-full">
                        <Image
                            src={tripDetails.imageUrl || "/logo.png"}
                            alt={tripDetails.name}
                            fill
                            sizes="100vw"
                            priority
                            className="object-cover"
                            onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = "/logo.png";
                            }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                            <h1 className="text-3xl md:text-4xl font-bold mb-2">{tripDetails.name}</h1>
                            <p className="text-lg opacity-90">{statusConfig.status}</p>
                        </div>
                    </div>
                </div>

                {/* Tabbed Content */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                    <TabsList className="grid w-full grid-cols-4 bg-white shadow-sm rounded-lg">
                        <TabsTrigger value="details" className="text-sm font-medium">
                            📋 Details
                        </TabsTrigger>
                        <TabsTrigger value="locations" className="text-sm font-medium">
                            📍 Locations
                        </TabsTrigger>
                        <TabsTrigger value="itinerary" className="text-sm font-medium">
                            🗓️ Plans
                        </TabsTrigger>
                        <TabsTrigger value="maps" className="text-sm font-medium">
                            🗺️ Maps
                        </TabsTrigger>
                    </TabsList>

                    {/* Trip Details Tab */}
                    <TabsContent value="details" className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Trip Information */}
                            <Card className="shadow-sm">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        📝 Trip Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-600">Trip Name</label>
                                        <p className="text-lg font-semibold">{tripDetails.name}</p>
                                    </div>
                                    
                                    <div>
                                        <label className="text-sm font-medium text-gray-600">Description</label>
                                        <p className="text-gray-700 leading-relaxed">
                                            {tripDetails.description || "No description provided for this trip."}
                                        </p>
                                    </div>
                                    
                                    <div>
                                        <label className="text-sm font-medium text-gray-600">Duration</label>
                                        <p className="text-lg font-semibold">{tripDuration} days</p>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Trip Dates */}
                            <Card className="shadow-sm">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        📅 Trip Schedule
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="p-3 bg-blue-50 rounded-lg">
                                        <label className="text-sm font-medium text-blue-600">Start Date</label>
                                        <p className="text-lg font-semibold text-blue-700">
                                            {startDate.toLocaleDateString('en-US', { 
                                                weekday: 'long', 
                                                year: 'numeric', 
                                                month: 'long', 
                                                day: 'numeric' 
                                            })}
                                        </p>
                                    </div>
                                    
                                    <div className="p-3 bg-purple-50 rounded-lg">
                                        <label className="text-sm font-medium text-purple-600">End Date</label>
                                        <p className="text-lg font-semibold text-purple-700">
                                            {endDate.toLocaleDateString('en-US', { 
                                                weekday: 'long', 
                                                year: 'numeric', 
                                                month: 'long', 
                                                day: 'numeric' 
                                            })}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* Locations Tab */}
                    <TabsContent value="locations" className="space-y-6">
                        <Card className="shadow-sm">
                            <CardHeader>
                                <CardTitle className="flex items-center justify-between">
                                    <span className="flex items-center gap-2">
                                        📍 Trip Locations ({locations.length})
                                    </span>
                                    <Button onClick={()=>{
                                        router.push(`/trips/${tripDetails.id}/addLocation`);
                                    }} className="cursor-pointer">
                                        Add Location
                                    </Button>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {locations.length > 0 ? (
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        {/* LEFT SIDE - Location List using reusable component */}
                                        <div>
                                            <LocationDetailsList 
                                                locations={locations} 
                                                session={session} 
                                                tripDetails={tripDetails}
                                                onMapVisibilityChange={handleMapVisibility}
                                            />
                                        </div>

                                        {/* RIGHT SIDE - Interactive Map Only */}
                                        <div className="space-y-4">
                                            <h3 className="text-lg font-semibold mb-4">Interactive Map</h3>
                                            <div className={clsx(
                                                "transition-all duration-300 ease-in-out",
                                                isMapHidden && "opacity-0 pointer-events-none scale-95",
                                                !isMapHidden && "opacity-100 pointer-events-auto scale-100"
                                            )}>
                                                {locations.length > 0 ? (
                                                    <TripMapComponent 
                                                        key={`locations-map-${mapKey}`}
                                                        locations={locations}
                                                        isOverview={false}
                                                    />
                                                ) : (
                                                    <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                                                        <div className="text-center text-gray-500">
                                                            <div className="text-2xl mb-2">🗺️</div>
                                                            <p>Map will appear when locations are added</p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                            
                                            {/* Overlay when map is hidden */}
                                            <div className={clsx(
                                                "absolute inset-0 bg-gray-100/80 backdrop-blur-sm rounded-lg flex items-center justify-center transition-all duration-300",
                                                isMapHidden ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
                                            )}>
                                                <div className="text-center text-gray-600">
                                                    <div className="text-3xl mb-2">⚙️</div>
                                                    <p className="font-medium">Location Operation in Progress</p>
                                                    <p className="text-sm">Map will be available after completing the action</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-12 text-gray-500">
                                        <div className="text-4xl mb-4">🗺️</div>
                                        <p className="text-lg mb-2">No locations added yet</p>
                                        <p className="text-sm">Add locations to see them here and on the map</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Itinerary Tab */}
                    <TabsContent value="itinerary" className="space-y-6">
                        <Card className="shadow-sm">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    🗓️ Trip Itinerary & Plans
                                </CardTitle>
                            </CardHeader>
                            <CardContent >
                                <PlansList
                                    tripId={tripDetails.id}
                                    tripStartDate={new Date(tripDetails.startDate)}
                                    tripEndDate={new Date(tripDetails.endDate)}
                                />
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Maps Tab */}
                    <TabsContent value="maps" className="space-y-6">
                        <Card className="shadow-sm">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    🗺️ Trip Map Overview
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {locations.length > 0 ? (
                                    <div className="space-y-4">
                                        {/* OVERVIEW MAP ONLY */}
                                        <div className={clsx(
                                            "transition-all duration-300 ease-in-out relative",
                                            isMapHidden && "opacity-50 pointer-events-none",
                                            !isMapHidden && "opacity-100 pointer-events-auto"
                                        )}>
                                            <TripMapComponent 
                                                key={`overview-map-${mapKey}`}
                                                locations={locations}
                                                isOverview={true}
                                            />
                                            
                                            {/* Overlay for overview map when hidden */}
                                            <div className={clsx(
                                                "absolute inset-0 bg-gray-100/80 backdrop-blur-sm rounded-lg flex items-center justify-center transition-all duration-300",
                                                isMapHidden ? "opacity-100" : "opacity-0 pointer-events-none"
                                            )}>
                                                <div className="text-center text-gray-600">
                                                    <div className="text-2xl mb-2">🔄</div>
                                                    <p className="font-medium">Updating...</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-12 text-gray-500">
                                        <div className="text-4xl mb-4">🗺️</div>
                                        <p className="text-lg mb-2">Map view will appear here</p>
                                        <p className="text-sm">Add locations to see them on the map</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                </Tabs>
            </div>
        </div>
    );
}