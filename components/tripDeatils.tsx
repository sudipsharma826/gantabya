"use client";
import { Trip } from "@/lib/generated/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface TripDetailsClientProps {
    tripDetails: Trip;
}

export default function TripDetails({ tripDetails }: TripDetailsClientProps) {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState("details");
    
    
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
        <div className="min-h-screen bg-gray-50">
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
                                        📍 Trip Locations
                                    </span>
                                    <Button onClick={()=>{
                                        // Logic to add a new location
                                        router.push(`/trips/${tripDetails.id}/addLocation`);
                                        
                                    }} className="cursor-pointer">
                                        Add Location
                                    </Button>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {/* TODO: Display locations from the database */}
                                <div className="text-center py-12 text-gray-500">
                                    <div className="text-4xl mb-4">🗺️</div>
                                    <p className="text-lg mb-2">No locations added yet</p>
                                    <p className="text-sm">Add locations to see them here</p>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Itinerary Tab */}
                    <TabsContent value="itinerary" className="space-y-6">
                        <Card className="shadow-sm">
                            <CardHeader>
                                <CardTitle className="flex items-center justify-between">
                                    <span className="flex items-center gap-2">
                                        🗓️ Trip Itinerary
                                    </span>
                                    <Button className="bg-green-500 hover:bg-green-600">
                                        Create Itinerary
                                    </Button>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-center py-12 text-gray-500">
                                    <div className="text-4xl mb-4">📋</div>
                                    <p className="text-lg mb-2">No itinerary created yet</p>
                                    <p className="text-sm">Create an itinerary to plan your daily activities</p>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Maps Tab */}
                    <TabsContent value="maps" className="space-y-6">
                        <Card className="shadow-sm">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    🗺️ Trip Map
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-center py-12 text-gray-500">
                                    <div className="text-4xl mb-4">🗺️</div>
                                    <p className="text-lg mb-2">Map view coming soon</p>
                                    <p className="text-sm">Add locations to see them on the map</p>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}