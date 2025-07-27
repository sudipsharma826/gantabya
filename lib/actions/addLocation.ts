"use server"

import { auth } from "@/auth";
import { prisma } from "../prisma";
import { redirect } from "next/navigation";

export async function locationSuggestion(locationName: string) {
    if (!locationName || locationName.length < 3) {
        return [];
    }
    
    const nominatimUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(locationName)}&format=json&addressdetails=1&limit=5`;
    
    try {
        const response = await fetch(nominatimUrl);
        const data = await response.json();
        
        if (data && data.length > 0) {
            return data.map((item: any) => ({
                display_name: item.display_name,
                lat: item.lat,
                lon: item.lon,
                place_id: item.place_id
            }));
        }
        return [];
    } catch (error) {
        console.error("Error fetching location suggestions:", error);
        return [];
    }
}

export default async function addLocationAction(
    formData : FormData,
    tripId  : string
){
  const session = await auth();
    if (!session || !session.user) {
        throw new Error("Please login first");
    }
   const locationName = formData.get("locationName") as string;
   const lat = formData.get("lat") as string;
   const lng = formData.get("lng") as string;
   
   if (!locationName) {
         throw new Error("Location name is required");
    }
    if (!tripId) {
          throw new Error("Trip ID is required");
    }
    if (!lat || !lng) {
        throw new Error("Location coordinates are required");
    }
    //check if the location already exists
    const existingLocation = await prisma.location.findFirst({
        where: {
            locationTitle: locationName,
            tripId: tripId,
        }
    });

    if (existingLocation) {
        throw new Error("Location already exists in this trip");
    }
    //if the location is not found then add it to the database
    //get the count of locations in the trip to set the order
    const count = await prisma.location.count({
        where: {
            tripId: tripId,
        }
    });

    //save the location to the database
    await prisma.location.create({
        data:{
            locationTitle: locationName,
            latitude: parseFloat(lat),
            longitude: parseFloat(lng),
            tripId: tripId,
            order: count
        }
    })

    redirect(`/trips/${tripId}`);
}