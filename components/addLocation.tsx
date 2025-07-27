"use client";
import { useTransition } from "react";
import { Button } from "./ui/button";
import addLocationAction from "@/lib/actions/addLocation";

export default function AddLocationPage({tripId}: { tripId: string }) {
    const [isPending , startTransition] = useTransition();
    return (
        <div className="min-h-calc(100vh - 64px) flex items-center justify-center mt-10">
            <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
                <div className="text-center mb-6">
                    <h1 className="text-2xl font-bold mb-2">Add New Location</h1>
                    <p className="text-gray-600">Add a new location to your trip</p>

                    <form className="mt-4" 
                    action={(formData : FormData)=>{
                        startTransition(()=>{
                            addLocationAction(formData, tripId);
                        })
                    }}>
                        <div className="mb-4">
                            <label htmlFor="locationName" className="block text-sm font-medium text-gray-700">Location Name</label>
                            <input
                                type="text"
                                id="locationName"
                                name="locationName"
                                required
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            />
                        </div>

                        <Button
                            type="submit"
                            className="w-full mt-4"
                        >
                           {isPending ? "Adding..." : "Add Location"}
                        </Button>
                    </form>
                </div>

            </div>

        </div>
    );
}