"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { createTrip } from "@/lib/actions/createTrip";
import { cn } from "@/lib/utils";
import { useTransition } from "react";

export default function TripCreate(){
    const [isPending, startTransition] = useTransition();
    return (
        <div className="container mx-auto p-6">
            <h1 className="text-3xl font-bold mb-4">Create a New Trip</h1>
            <Card>
                <CardHeader>
                    <p className="text-lg font-semibold">Trip Creation Form</p>
                    <p className="text-gray-600">Fill out the details to create a new trip.</p>
                </CardHeader>
                <CardContent>
                    <form className="space-y-6"
                    action={(formData : FormData)=>{
                        startTransition(()=>{
                            createTrip(formData);
                        })
                    }}>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="tripName">Trip Name</label>
                            <input type="text"
                            name="tripName"
                            className={cn("w-full border border-gray-300 px-3 py-2","rounded-md focus:outline-none focus:ring-2 focus:ring-orange-300")}
                            placeholder="Trip Name"
                            required
                              />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="tripDescription">Trip Description</label>
                            <textarea
                                name="tripDescription"
                                className={cn("w-full border border-gray-300 px-3 py-2","rounded-md focus:outline-none focus:ring-2 focus:ring-orange-300")}
                                placeholder="Trip Description"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="tripStartDate">Start Date</label>
                                <input type="date"
                                name="tripStartDate"
                                className={cn("w-full border border-gray-300 px-3 py-2","rounded-md focus:outline-none focus:ring-2 focus:ring-orange-300")}
                                required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="tripEndDate">End Date</label>
                                <input type="date"
                                name="tripEndDate"
                                className={cn("w-full border border-gray-300 px-3 py-2","rounded-md focus:outline-none focus:ring-2 focus:ring-orange-300")}
                                required
                                />
                            </div>
                        </div>
                        <div>

                        </div>
                        <div>
                            <Button type="submit"  disabled={isPending} className="w-full bg-orange-500 text-white py-2 rounded-md hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-300">
                                {isPending ? "Creating Trip..." : "Create Trip"}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
                                   