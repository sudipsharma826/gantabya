"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

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

interface GantabyasActionResult {
    success: boolean;
    error?: string;
    data?: VisitedLocation[];
    totalLocations?: number;
    totalTrips?: number;
}

export async function getAllVisitedLocations(): Promise<GantabyasActionResult> {
    try {
        const session = await auth();
        
        if (!session || !session.user?.id) {
            return { success: false, error: "Not authenticated" };
        }

        console.log("Fetching all visited locations for user:", session.user.id);

        // Get all locations from all user's trips
        const locations = await prisma.location.findMany({
            where: {
                trip: {
                    userId: session.user.id
                }
            },
            include: {
                trip: {
                    select: {
                        id: true,
                        name: true,
                        startDate: true,
                        endDate: true
                    }
                }
            },
            orderBy: [
                { trip: { startDate: 'desc' } },
                { order: 'asc' }
            ]
        });

        // Transform data to include trip information
        const visitedLocations: VisitedLocation[] = locations.map(location => ({
            id: location.id,
            locationTitle: location.locationTitle,
            latitude: location.latitude,
            longitude: location.longitude,
            tripId: location.tripId,
            tripName: location.trip.name,
            visitedDate: location.createdAt,
            tripStartDate: location.trip.startDate,
            tripEndDate: location.trip.endDate,
            order: location.order
        }));

        // Get unique trip count
        const uniqueTrips = new Set(locations.map(loc => loc.tripId)).size;

        console.log(`Found ${visitedLocations.length} locations across ${uniqueTrips} trips`);

        return {
            success: true,
            data: visitedLocations,
            totalLocations: visitedLocations.length,
            totalTrips: uniqueTrips
        };

    } catch (error) {
        console.error("Error fetching visited locations:", error);
        return {
            success: false,
            error: `Failed to fetch visited locations: ${error instanceof Error ? error.message : 'Unknown error'}`
        };
    }
}
