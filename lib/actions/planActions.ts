"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// Types for plan actions
interface PlanActionResult {
    success: boolean;
    error?: string;
    message?: string;
    data?: any;
}

export async function createPlan(
    tripId: string, 
    title: string, 
    description: string, 
    day: number, 
    startTime: string, 
    endTime: string
): Promise<PlanActionResult> {
    try {
        const session = await auth();
        
        if (!session || !session.user?.id) {
            return { success: false, error: "Not authenticated" };
        }

        console.log("Creating plan with parameters:", { 
            title, 
            description, 
            day,
            startTime, 
            endTime, 
            tripId 
        });

        // Validate required fields
        if (!title || title.trim().length === 0) {
            return { success: false, error: "Plan title is required" };
        }

        if (isNaN(day) || day < 1) {
            return { success: false, error: "Valid day number is required" };
        }

        // Verify trip exists and user owns it
        const trip = await prisma.trip.findFirst({
            where: { 
                id: tripId,
                userId: session.user.id 
            }
        });

        if (!trip) {
            return { success: false, error: "Trip not found or access denied" };
        }

        // Create the plan with proper defaults
        const planData = {
            title: title.trim(),
            description: description?.trim() || null,
            day: day,
            startTime: startTime?.trim() || "09:00",
            endTime: endTime?.trim() || null,
            category: "activity",
            priority: "medium",
            status: "planned",
            notes: null,
            cost: null,
            location: null,
            tripId: tripId
        };

        console.log("Creating plan with processed data:", planData);

        const newPlan = await prisma.plan.create({
            data: planData
        });

        console.log("Plan created successfully:", newPlan);

        revalidatePath(`/trips/${tripId}`);
        
        return { 
            success: true, 
            message: "Plan created successfully",
            data: newPlan
        };

    } catch (error) {
        console.error("Error creating plan:", error);
        return { 
            success: false, 
            error: `Failed to create plan: ${error instanceof Error ? error.message : 'Unknown error'}` 
        };
    }
}

export async function updatePlan(
    planId: string,
    title: string, 
    description: string, 
    day: number, 
    startTime: string, 
    endTime: string
): Promise<PlanActionResult> {
    try {
        const session = await auth();
        
        if (!session || !session.user?.id) {
            return { success: false, error: "Not authenticated" };
        }

        console.log("Updating plan with parameters:", { 
            planId, 
            title, 
            description, 
            day, 
            startTime, 
            endTime 
        });

        // Validate required fields
        if (!title || title.trim().length === 0) {
            return { success: false, error: "Plan title is required" };
        }

        // Verify plan exists and user owns the trip
        const existingPlan = await prisma.plan.findFirst({
            where: { 
                id: planId,
                trip: {
                    userId: session.user.id
                }
            },
            include: { trip: true }
        });

        if (!existingPlan) {
            return { success: false, error: "Plan not found or access denied" };
        }

        // Update the plan
        const updateData = {
            title: title.trim(),
            description: description?.trim() || null,
            day: !isNaN(day) ? day : existingPlan.day,
            startTime: startTime?.trim() || existingPlan.startTime || "09:00",
            endTime: endTime?.trim() || "17:00"
        };

        console.log("Updating plan with processed data:", updateData);

        const updatedPlan = await prisma.plan.update({
            where: { id: planId },
            data: updateData
        });

        console.log("Plan updated successfully:", updatedPlan);

        revalidatePath(`/trips/${existingPlan.tripId}`);
        
        return { 
            success: true, 
            message: "Plan updated successfully",
            data: updatedPlan
        };

    } catch (error) {
        console.error("Error updating plan:", error);
        return { 
            success: false, 
            error: `Failed to update plan: ${error instanceof Error ? error.message : 'Unknown error'}` 
        };
    }
}

export async function deletePlan(planId: string): Promise<PlanActionResult> {
    try {
        const session = await auth();
        
        if (!session || !session.user?.id) {
            return { success: false, error: "Not authenticated" };
        }

        console.log("Deleting plan:", planId);

        // Verify plan exists and user owns the trip
        const existingPlan = await prisma.plan.findFirst({
            where: { 
                id: planId,
                trip: {
                    userId: session.user.id
                }
            },
            include: { trip: true }
        });

        if (!existingPlan) {
            return { success: false, error: "Plan not found or access denied" };
        }

        const tripId = existingPlan.tripId;

        // Delete the plan
        await prisma.plan.delete({
            where: { id: planId }
        });

        console.log("Plan deleted successfully");

        revalidatePath(`/trips/${tripId}`);
        
        return { 
            success: true, 
            message: "Plan deleted successfully"
        };

    } catch (error) {
        console.error("Error deleting plan:", error);
        return { 
            success: false, 
            error: `Failed to delete plan: ${error instanceof Error ? error.message : 'Unknown error'}` 
        };
    }
}

export async function getTripPlans(tripId: string): Promise<PlanActionResult> {
    try {
        const session = await auth();
        
        if (!session || !session.user?.id) {
            return { success: false, error: "Not authenticated" };
        }

        console.log("Fetching plans for trip:", tripId);

        // Verify trip exists and user owns it
        const trip = await prisma.trip.findFirst({
            where: { 
                id: tripId,
                userId: session.user.id 
            }
        });

        if (!trip) {
            return { success: false, error: "Trip not found or access denied" };
        }

        // Get all plans for the trip
        const plans = await prisma.plan.findMany({
            where: { tripId: tripId },
            orderBy: [
                { day: 'asc' },
                { startTime: 'asc' }
            ]
        });

        console.log(`Found ${plans.length} plans for trip`);

        return { 
            success: true, 
            data: plans
        };

    } catch (error) {
        console.error("Error fetching plans:", error);
        return { 
            success: false, 
            error: `Failed to fetch plans: ${error instanceof Error ? error.message : 'Unknown error'}` 
        };
    }
}