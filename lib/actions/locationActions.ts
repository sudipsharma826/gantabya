"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// Types for this action file
interface ActionResult {
    success: boolean;
    error?: string;
    message?: string;
}

export async function updateLocation(locationId: string, formData: FormData): Promise<ActionResult> {
    try {
        const session = await auth();
        
        if (!session || !session.user?.id) {
            return { success: false, error: "Not authenticated" };
        }

        // Extract data from FormData
        const locationTitle = formData.get('locationTitle') as string;
        const latitude = parseFloat(formData.get('latitude') as string);
        const longitude = parseFloat(formData.get('longitude') as string);
        
        console.log("Update Location Data:", { 
            locationId, 
            locationTitle, 
            latitude, 
            longitude,
            userId: session.user.id 
        });

        // Validate data
        if (!locationTitle?.trim()) {
            return { success: false, error: "Location name is required" };
        }

        if (isNaN(latitude) || isNaN(longitude)) {
            console.log("Invalid coordinates:", { latitude, longitude });
            return { success: false, error: "Invalid coordinates provided" };
        }

        if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
            return { success: false, error: "Coordinates out of valid range" };
        }

        // Check if location exists and user owns the trip
        const existingLocation = await prisma.location.findFirst({
            where: { id: locationId },
            include: { trip: true }
        });

        if (!existingLocation) {
            return { success: false, error: "Location not found" };
        }

        if (existingLocation.trip.userId !== session.user.id) {
            return { success: false, error: "Not authorized to edit this location" };
        }

        // Update the location with new data
        const updatedLocation = await prisma.location.update({
            where: { id: locationId },
            data: {
                locationTitle: locationTitle.trim(),
                latitude: latitude,
                longitude: longitude,
            },
        });

        console.log("Location updated successfully:", updatedLocation);

        // Revalidate the trip page
        revalidatePath(`/trips/${existingLocation.tripId}`);
        revalidatePath('/trips');
        
        return { 
            success: true, 
            message: "Location updated successfully" 
        };

    } catch (error) {
        console.error("Error updating location:", error);
        return { 
            success: false, 
            error: `Failed to update location: ${error instanceof Error ? error.message : 'Unknown error'}` 
        };
    }
}

export async function deleteLocation(locationId: string): Promise<ActionResult> {
    try {
        const session = await auth();
        
        if (!session || !session.user?.id) {
            return { success: false, error: "Not authenticated" };
        }

        // Check if location exists and user owns the trip
        const existingLocation = await prisma.location.findFirst({
            where: { id: locationId },
            include: { trip: true }
        });

        if (!existingLocation) {
            return { success: false, error: "Location not found" };
        }

        if (existingLocation.trip.userId !== session.user.id) {
            return { success: false, error: "Not authorized to delete this location" };
        }

        const tripId = existingLocation.tripId;

        // Delete the location
        await prisma.location.delete({
            where: { id: locationId },
        });

        console.log("Location deleted successfully:", locationId);

        // Revalidate the trip page
        revalidatePath(`/trips/${tripId}`);
        revalidatePath('/trips');
        
        return { 
            success: true, 
            message: "Location deleted successfully" 
        };

    } catch (error) {
        console.error("Error deleting location:", error);
        return { 
            success: false, 
            error: `Failed to delete location: ${error instanceof Error ? error.message : 'Unknown error'}` 
        };
    }
}