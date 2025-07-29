"use client";

import { Trip } from "@/lib/generated/prisma";
import { Session } from "next-auth";
import { useState } from "react";
import LocationModal from "./LocationModal";

interface Location {
    id: string;
    locationTitle: string;
    latitude: number;
    longitude: number;
    description?: string;
    tripId: string;
    createdAt?: Date;
}

interface LocationDetailsListProps {
    locations: Location[];
    session: Session;
    tripDetails: Trip;
    onMapVisibilityChange?: (shouldHide: boolean) => void; // Add this prop
}

export default function LocationDetailsList({ 
    locations, 
    session, 
    tripDetails, 
    onMapVisibilityChange 
}: LocationDetailsListProps) {
    const [modalState, setModalState] = useState<{
        isOpen: boolean;
        mode: 'edit' | 'delete' | null;
        location: Location | null;
    }>({
        isOpen: false,
        mode: null,
        location: null
    });

    if(!session || !session?.user?.id) {
        return (
            <div className="container mx-auto p-6">
                <h1 className="text-3xl font-bold mb-4">Please log in to view locations</h1>
            </div>
        );
    }
    
    console.log("session", session);
    
    if (locations.length === 0) {
        return (
            <div className="text-center py-12 text-gray-500">
                <div className="text-4xl mb-4">📍</div>
                <p className="text-lg mb-2">No locations added yet</p>
                <p className="text-sm">Add locations to see them here</p>
            </div>
        );
    }

    const openModal = (mode: 'edit' | 'delete', location: Location) => {
        setModalState({
            isOpen: true,
            mode,
            location
        });
    };

    const closeModal = () => {
        setModalState({
            isOpen: false,
            mode: null,
            location: null
        });
    };

    const handleEditClick = (location: Location) => {
        onMapVisibilityChange?.(true); // Hide map when edit modal opens
        setModalState({
            isOpen: true,
            mode: 'edit',
            location
        });
    };

    const handleDeleteClick = (location: Location) => {
        onMapVisibilityChange?.(true); // Hide map when delete modal opens
        setModalState({
            isOpen: true,
            mode: 'delete',
            location
        });
    };

    const handleCloseModal = () => {
        onMapVisibilityChange?.(false); // Show map when modal closes
        setModalState({
            isOpen: false,
            mode: null,
            location: null
        });
    };

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-4">Trip Route ({locations.length} stops)</h3>
            <div className="space-y-3">
                {locations.map((location, index) => (
                    <div key={location.id} className="flex items-start gap-3 p-3 border rounded-lg hover:shadow-md transition-shadow">
                        {/* NUMBERED INDICATOR */}
                        <div className="flex-shrink-0">
                            <div className={`w-8 h-8 ${
                                index === 0 ? 'bg-green-500' : 
                                index === locations.length - 1 ? 'bg-red-500' : 'bg-blue-500'
                            } text-white rounded-full flex items-center justify-center text-sm font-bold`}>
                                {index + 1}
                            </div>
                        </div>
                        
                        {/* LOCATION INFO */}
                        <div className="flex-1">
                            <h4 className="font-semibold text-gray-900">
                                {index === 0 ? '🚀 ' : index === locations.length - 1 ? '🏁 ' : '📍 '}
                                {location.locationTitle}
                            </h4>
                            {location.description && (
                                <p className="text-gray-600 text-sm mt-1">
                                    {location.description}
                                </p>
                            )}
                            <div className="text-xs text-gray-500 mt-2">
                                📍 {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
                            </div>
                            <div className="text-xs text-gray-400 mt-1">
                                Added: {location.createdAt ? new Date(location.createdAt).toLocaleDateString() : 'Unknown'}
                            </div>
                        </div>
                         {/* Delete and edit btn */}
                         {tripDetails.userId === session?.user?.id && (
                        <div className="flex-shrink-0 space-x-2">
                            <button 
                                onClick={() => handleEditClick(location)}
                                className="text-blue-400 hover:text-blue-600 transition-colors p-1 rounded hover:bg-blue-50"
                                title="Edit location"
                            >
                                ✏️
                            </button>
                            <button 
                                onClick={() => handleDeleteClick(location)}
                                className="text-red-400 hover:text-red-600 transition-colors p-1 rounded hover:bg-red-50"
                                title="Delete location"
                            >
                                🗑️
                            </button>
                        </div>
                         )}
                        {/* ARROW INDICATOR */}
                        {index < locations.length - 1 && (
                            <div className="flex-shrink-0 text-gray-400 text-lg">
                                ↓
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Modal */}
            {modalState.isOpen && modalState.location && modalState.mode && (
                <LocationModal
                    location={modalState.location}
                    isOpen={modalState.isOpen}
                    onClose={handleCloseModal}
                    mode={modalState.mode}
                />
            )}
        </div>
    );
}
