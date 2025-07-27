import { auth } from "@/auth";
import TripDetails from "@/components/tripDeatils";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function TripDetail({
  params,
}: {
  params: Promise<{ tripId: string }>;
}){
    const { tripId } = await params;
    const session = await auth();
    if (!session || !session.user) {
        return (
            <div className="container mx-auto p-6">
                <h1 className="text-3xl font-bold mb-4">Please log in to view trip details</h1>
            </div>
        );
    }
    //get trip details
    const tripDetails = await prisma.trip.findFirst({
        where: {
            id: tripId,
            userId: session.user.id,
        },
        include:{
            locations:true,
        }
    });
    if (!tripDetails) {
        return redirect("/trips");
    }
    return (
        <TripDetails tripDetails={tripDetails} />
    );
}