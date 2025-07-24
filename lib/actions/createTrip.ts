"use server";

import { auth } from "@/auth"; 
import { prisma } from "@/lib/prisma"; 
import { redirect } from "next/navigation";

export async function createTrip(formData: FormData) {
    const session = await auth();

    if (!session?.user?.id) {
        throw new Error("You must be logged in to create a trip.");
    }

    const tripName = formData.get("tripName")?.toString().trim();
    const tripDescription = formData.get("tripDescription")?.toString().trim();
    const tripImageUrl = formData.get("tripImageUrl")?.toString().trim();
    const tripStartDate = formData.get("tripStartDate")?.toString();
    const tripEndDate = formData.get("tripEndDate")?.toString();

    if (!tripName || !tripDescription || !tripStartDate || !tripEndDate) {
        throw new Error("All fields are required.");
    }

    const startDate = new Date(tripStartDate);
    const endDate = new Date(tripEndDate);

   

    await prisma.trip.create({
        data: {
            name: tripName,
            description: tripDescription,
            imageUrl: tripImageUrl || null,
            startDate,
            endDate,
            userId: session.user.id,
        },
    });
    redirect("/trips");
}
