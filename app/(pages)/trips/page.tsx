import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import Image from "next/image";
import Link from "next/link";

export default async function Trips(){
    //only accessible if the user is logged in
    const session = await auth();
    if (!session || !session.user) {
        return (
            <div className="container mx-auto p-6">
                <h1 className="text-3xl font-bold mb-4">Access Denied</h1>
                <p>You must be logged in to view this page.</p>
            </div>
        );
    }
    // Render the trips page content
    const trips = await prisma.trip.findMany({
        where:{
            userId: session.user.id
        }
    });
    
    const sortedTrips = [...trips].sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()); //Trips in descending order by start date
    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0); // Normalize today's date to midnight
    
    // Current/Ongoing trips (trips that have started but not ended yet)
    const currentTrips = sortedTrips.filter(trip => {
        const startDate = new Date(trip.startDate);
        const endDate = new Date(trip.endDate);
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);
        return startDate <= todayDate && endDate >= todayDate;
    });
    
    const upcomingTrips = sortedTrips.filter(trip => new Date(trip.startDate) > todayDate);
    const pastTrips = [...trips].filter(trip => {
        const endDate = new Date(trip.endDate);
        endDate.setHours(23, 59, 59, 999);
        return endDate < todayDate;
    });

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
            <div className="container mx-auto px-4 py-6 max-w-7xl">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">My Trips</h1>
                        <p className="text-gray-600 text-lg">Manage and explore your travel adventures</p>
                    </div>
                    <Link href={"/trips/create"}>
                        <Button className="px-8 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                            ✈️ Plan New Trip
                        </Button>
                    </Link>
                </div>
                
                {/* Quick Stats Dashboard */}
                <div className="mb-8">
                    <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-2xl font-bold text-gray-800 flex items-center">
                                <span className="mr-3">👋</span>
                                Welcome back, {session.user.name}!
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="text-center p-6 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl shadow-lg">
                                    <div className="text-3xl font-bold mb-1">{trips.length}</div>
                                    <div className="text-sm opacity-90">Total Trips</div>
                                </div>
                                <div className="text-center p-6 bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl shadow-lg">
                                    <div className="text-3xl font-bold mb-1">{currentTrips.length}</div>
                                    <div className="text-sm opacity-90">Active Now</div>
                                </div>
                                <div className="text-center p-6 bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl shadow-lg">
                                    <div className="text-3xl font-bold mb-1">{upcomingTrips.length}</div>
                                    <div className="text-sm opacity-90">Coming Up</div>
                                </div>
                                <div className="text-center p-6 bg-gradient-to-br from-gray-500 to-gray-600 text-white rounded-xl shadow-lg">
                                    <div className="text-3xl font-bold mb-1">{pastTrips.length}</div>
                                    <div className="text-sm opacity-90">Completed</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
                
                {/* Trips Sections */}
                <div className="space-y-8">
                    {/* Current/Ongoing Trips Section */}
                    {currentTrips.length > 0 && (
                        <section>
                            <div className="flex items-center mb-4">
                                <div className="flex items-center">
                                    <span className="w-3 h-3 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                                    <h2 className="text-xl font-bold text-green-700">Current Trips</h2>
                                </div>
                                <div className="ml-auto bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                                    {currentTrips.length} ongoing
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {currentTrips.map((trip) => (
                                    <Card key={trip.id} className="bg-white shadow-sm hover:shadow-md transition-shadow border-l-4 border-green-500">
                                        <CardContent className="p-4">
                                            <div className="flex items-start justify-between mb-2">
                                                <h3 className="text-lg font-semibold text-gray-900 line-clamp-1 flex-1">{trip.name}</h3>
                                                <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium ml-2 whitespace-nowrap">
                                                    🌟 Live
                                                </span>
                                            </div>
                                            <div className=" flex justify-around text-sm text-gray-600 space-y-1 mb-3">
                                                <p>Started: {new Date(trip.startDate).toLocaleDateString()}</p>
                                                <p>Ends: {new Date(trip.endDate).toLocaleDateString()}</p>
                                                <p className="text-green-600 font-medium">
                                                    {Math.ceil((new Date(trip.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days left
                                                </p>
                                            </div>
                                            <Link 
                                                href={`/trips/${trip.id}`} 
                                                className="block w-full text-center bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition-colors text-sm font-medium"
                                            >
                                                View Details
                                            </Link>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Upcoming Trips Section */}
                    <section>
                        <div className="flex items-center mb-4">
                            <div className="flex items-center">
                                <span className="w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
                                <h2 className="text-xl font-bold text-blue-700">Upcoming Trips</h2>
                            </div>
                            <div className="ml-auto bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                                {upcomingTrips.length} planned
                            </div>
                        </div>
                        {upcomingTrips.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {upcomingTrips.map((trip) => (
                                    <Card key={trip.id} className="bg-white shadow-sm hover:shadow-md transition-shadow border-l-4 border-blue-500">
                                        <CardContent className="p-4">
                                            <div className="flex items-start justify-between mb-2">
                                                <h3 className="text-lg font-semibold text-gray-900 line-clamp-1 flex-1">{trip.name}</h3>
                                                <span className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-medium ml-2 whitespace-nowrap">
                                                    📅 Soon
                                                </span>
                                            </div>
                                            <div className=" flex justify-around text-sm text-gray-600 space-y-1 mb-3">
                                                <p>Starts: {new Date(trip.startDate).toLocaleDateString()}</p>
                                                <p>Ends: {new Date(trip.endDate).toLocaleDateString()}</p>
                                                <p className="text-blue-600 font-medium">
                                                    {Math.ceil((new Date(trip.startDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days to go
                                                </p>
                                            </div>
                                            <Link 
                                                href={`/trips/${trip.id}`} 
                                                className="block w-full text-center bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
                                            >
                                                View Details
                                            </Link>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <Card className="bg-white shadow-sm">
                                <CardContent className="text-center py-8">
                                    <div className="text-4xl mb-2">✈️</div>
                                    <h3 className="text-lg font-semibold text-gray-700 mb-1">No upcoming trips</h3>
                                    <p className="text-gray-500 text-sm mb-4">Start planning your next adventure!</p>
                                    <Link href="/trips/create">
                                        <Button size="sm">Plan a Trip</Button>
                                    </Link>
                                </CardContent>
                            </Card>
                        )}
                    </section>

                    {/* Past Trips Section */}
                    <section>
                        <div className="flex items-center mb-4">
                            <div className="flex items-center">
                                <span className="w-3 h-3 bg-gray-500 rounded-full mr-2"></span>
                                <h2 className="text-xl font-bold text-gray-700">Past Trips</h2>
                            </div>
                            <div className="ml-auto bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs font-medium">
                                {pastTrips.length} completed
                            </div>
                        </div>
                        {pastTrips.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {pastTrips.map((trip) => (
                                    <Card key={trip.id} className="bg-white shadow-sm hover:shadow-md transition-shadow border-l-4 border-gray-400">
                                        <CardContent className="p-4">
                                            <div className="flex items-start justify-between mb-2">
                                                <h3 className="text-lg font-semibold text-gray-900 line-clamp-1 flex-1">{trip.name}</h3>
                                                <span className="bg-gray-500 text-white px-2 py-1 rounded-full text-xs font-medium ml-2 whitespace-nowrap">
                                                    📖 Done
                                                </span>
                                            </div>
                                            <div className="flex justify-around text-sm text-gray-600 space-y-1 mb-3">
                                                <p>Started: {new Date(trip.startDate).toLocaleDateString()}</p>
                                                <p>Ended: {new Date(trip.endDate).toLocaleDateString()}</p>
                                                <p className="text-gray-500 font-medium">
                                                    {Math.floor((new Date().getTime() - new Date(trip.endDate).getTime()) / (1000 * 60 * 60 * 24))} days ago
                                                </p>
                                            </div>
                                            <Link 
                                                href={`/trips/${trip.id}`} 
                                                className="block w-full text-center bg-gray-600 text-white py-2 rounded-md hover:bg-gray-700 transition-colors text-sm font-medium"
                                            >
                                                View Memories
                                            </Link>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <Card className="bg-white shadow-sm">
                                <CardContent className="text-center py-8">
                                    <div className="text-4xl mb-2">📖</div>
                                    <h3 className="text-lg font-semibold text-gray-700 mb-1">No past trips</h3>
                                    <p className="text-gray-500 text-sm">Your travel memories will appear here!</p>
                                </CardContent>
                            </Card>
                        )}
                    </section>
                </div>
            </div>
        </div>
    );
}