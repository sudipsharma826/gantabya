"use server"

import { auth } from "@/auth";
import { prisma } from "../prisma";
import { redirect } from "next/navigation";
async function locationSuggestion(locationName: string) {
};

function geoLocation(locationName: string) {
     const nominatimUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(locationName)}&format=json&addressdetails=1&limit=5`;
     return fetch(nominatimUrl)
         .then(response => response.json())
         .then(data => {
             if (data && data.length > 0) {
                 const { lat, lon } = data[0];
                 console.log("Location found:", lat, lon);
                 return { lat, lng: lon };
             }
             throw new Error("Location not found");
         });
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
   if (!locationName) {
         throw new Error("Location name is required");
    }
    if (!tripId) {
          throw new Error("Trip ID is required");
    } 
    //with the user inputed address get the geo location
    const {lat, lng} = await geoLocation(locationName);
    if (!lat || !lng) {
        throw new Error("Invalid location coordinates");
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
            order: count //as default the order is from 0 , so no count + 1
        }
    })

    redirect(`/trips/${tripId}`);
}