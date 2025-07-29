"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { deletePlan, getTripPlans } from "@/lib/actions/planActions";
import PlanModal from "./PlanModal";

interface Plan {
    id: string;
    title: string;
    description?: string | null;
    day: number;
    startTime: string;
    endTime?: string | null;
    category: string;
    priority: string;
    status: string;
    tripId: string;
    createdAt?: Date;
    updatedAt?: Date;
}

interface PlansListProps {
    tripId: string;
    tripStartDate: Date;
    tripEndDate: Date;
}

export default function PlansList({ tripId, tripStartDate, tripEndDate }: PlansListProps) {
    const [plans, setPlans] = useState<Plan[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
    const [selectedPlan, setSelectedPlan] = useState<Plan | undefined>();
    const [isDeleting, setIsDeleting] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [planToDelete, setPlanToDelete] = useState<Plan | null>(null);

    // Load plans
    const loadPlans = async () => {
        setIsLoading(true);
        setError(null);
        try {
            console.log('Loading plans for trip:', tripId);
            const result = await getTripPlans(tripId);
            console.log('Plans loaded:', result);
            
            if (result.success && result.data) {
                setPlans(result.data);
            } else {
                setError(result.error || 'Failed to load plans');
            }
        } catch (error) {
            console.error('Error loading plans:', error);
            setError('Failed to load plans');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (tripId) {
            loadPlans();
        }
    }, [tripId]);

    // Group plans by day
    const plansByDay = plans.reduce((acc, plan) => {
        const day = plan.day;
        if (!acc[day]) {
            acc[day] = [];
        }
        acc[day].push(plan);
        return acc;
    }, {} as Record<number, Plan[]>);

    const handleCreatePlan = () => {
        console.log('Opening create modal');
        setModalMode('create');
        setSelectedPlan(undefined);
        setIsModalOpen(true);
        
    };

    const handleEditPlan = (plan: Plan) => {
        console.log('Opening edit modal for plan:', plan);
        setModalMode('edit');
        setSelectedPlan(plan);
        setIsModalOpen(true);
        
    };

    const handleModalClose = () => {
        console.log('Closing modal');
        setIsModalOpen(false);
        setSelectedPlan(undefined);
        
    };

    const handleModalSuccess = () => {
        console.log('Modal operation successful, reloading plans');
        loadPlans();
        setIsModalOpen(false);
       
    };

    const handleDeletePlan = (plan: Plan) => {
        setPlanToDelete(plan);
        setShowDeleteModal(true);
        
    };

    const confirmDelete = async () => {
        if (!planToDelete) return;

        console.log('Deleting plan:', planToDelete.id);
        setIsDeleting(planToDelete.id);
        
        try {
            const result = await deletePlan(planToDelete.id);
            console.log('Delete result:', result);
            
            if (result.success) {
                await loadPlans(); // Reload plans after deletion
                setShowDeleteModal(false);
                setPlanToDelete(null);
            } else {
                alert(result.error || 'Failed to delete plan');
            }
        } catch (error) {
            console.error('Delete error:', error);
            alert('An error occurred while deleting the plan');
        } finally {
            setIsDeleting(null);
            
        }
    };

    const cancelDelete = () => {
        setShowDeleteModal(false);
        setPlanToDelete(null);
        
    };

    const formatTime = (time?: string | null) => {
        if (!time) return 'Not specified';
        try {
            return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
            });
        } catch {
            return time; // Return original if formatting fails
        }
    };

    const formatDate = (day: number) => {
        try {
            const date = new Date(tripStartDate);
            date.setDate(date.getDate() + day - 1);
            return date.toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric'
            });
        } catch {
            return `Day ${day}`;
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center py-8">
                <div className="animate-spin h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                <span className="ml-2 text-gray-600">Loading plans...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-8">
                <div className="text-red-600 mb-4">
                    <p className="text-lg font-semibold">Error loading plans</p>
                    <p className="text-sm">{error}</p>
                </div>
                <Button onClick={loadPlans} variant="outline">
                    Try Again
                </Button>
            </div>
        );
    }

    const tripDuration = Math.ceil((tripEndDate.getTime() - tripStartDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    const dayNumbers = Array.from({ length: tripDuration }, (_, i) => i + 1);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">
                    📋 Trip Plans ({plans.length} total)
                </h3>
                <Button 
                    onClick={handleCreatePlan} 
                    className="bg-green-600 hover:bg-green-700"
                    disabled={isLoading}
                >
                    ➕ Add Plan
                </Button>
            </div>

            {/* Plans by Day */}
            {dayNumbers.map(dayNumber => {
                const dayPlans = plansByDay[dayNumber] || [];

                return (
                    <Card key={dayNumber} className="shadow-sm">
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
                                        Day {dayNumber}
                                    </span>
                                    <span className="text-gray-600">
                                        {formatDate(dayNumber)}
                                    </span>
                                </div>
                                <span className="text-sm text-gray-500">
                                    {dayPlans.length} plan{dayPlans.length !== 1 ? 's' : ''}
                                </span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {dayPlans.length > 0 ? (
                                <div className="space-y-3">
                                    {dayPlans.map(plan => (
                                        <div
                                            key={plan.id}
                                            className="p-4 border border-gray-200 rounded-lg hover:shadow-sm transition-shadow"
                                        >
                                            <div className="flex justify-between items-start">
                                                <div className="flex-1">
                                                    <h4 className="font-semibold text-gray-900 mb-1">
                                                        {plan.title}
                                                    </h4>
                                                    {plan.description && (
                                                        <p className="text-gray-600 text-sm mb-2">
                                                            {plan.description}
                                                        </p>
                                                    )}
                                                    <div className="flex items-center gap-4 text-xs text-gray-500">
                                                        <span className="flex items-center gap-1">
                                                            🕐 {formatTime(plan.startTime)}
                                                            {plan.endTime && ` - ${formatTime(plan.endTime)}`}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            📅 {formatDate(plan.day)}
                                                        </span>
                                                        <span className="capitalize px-2 py-1 bg-gray-100 rounded text-xs">
                                                            {plan.status}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2 ml-4">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => handleEditPlan(plan)}
                                                        disabled={isDeleting === plan.id}
                                                        title="Edit plan"
                                                    >
                                                        ✏️
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => handleDeletePlan(plan)}
                                                        disabled={isDeleting === plan.id}
                                                        className="text-red-600 hover:text-red-700 hover:border-red-300"
                                                        title="Delete plan"
                                                    >
                                                        {isDeleting === plan.id ? '⏳' : '🗑️'}
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-500">
                                    <div className="text-2xl mb-2">📝</div>
                                    <p className="text-sm mb-3">No plans for this day</p>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={handleCreatePlan}
                                        className="text-blue-600 border-blue-300 hover:bg-blue-50"
                                    >
                                        Add Plan for Day {dayNumber}
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                );
            })}

            {/* Plan Modal */}
            <PlanModal
                isOpen={isModalOpen}
                onClose={handleModalClose}
                mode={modalMode}
                tripId={tripId}
                tripStartDate={tripStartDate}
                tripEndDate={tripEndDate}
                plan={selectedPlan}
                onSuccess={handleModalSuccess}
            />

            {/* Delete Confirmation Modal */}
            {showDeleteModal && planToDelete && (
                <div className="fixed inset-0 backdrop-blur-md flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <Card className="max-w-md w-full shadow-xl">
                        <CardHeader>
                            <CardTitle className="text-xl font-bold text-red-600 flex items-center gap-2">
                                🗑️ Delete Plan
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Warning Message */}
                            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <div className="text-red-600 text-2xl">⚠️</div>
                                    <div>
                                        <h3 className="font-semibold text-red-800">Are you sure?</h3>
                                        <p className="text-red-700 text-sm">This action cannot be undone.</p>
                                    </div>
                                </div>
                            </div>

                            {/* Plan Details */}
                            <div className="p-4 bg-gray-50 rounded-lg">
                                <h4 className="font-medium text-gray-700 mb-2">Plan to delete:</h4>
                                <div className="space-y-2">
                                    <p className="font-semibold text-gray-900">{planToDelete.title}</p>
                                    {planToDelete.description && (
                                        <p className="text-sm text-gray-600">{planToDelete.description}</p>
                                    )}
                                    <div className="flex items-center gap-4 text-xs text-gray-500">
                                        <span>📅 Day {planToDelete.day}</span>
                                        <span>🕐 {formatTime(planToDelete.startTime)}</span>
                                        {planToDelete.endTime && (
                                            <span>- {formatTime(planToDelete.endTime)}</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3 pt-2">
                                <Button
                                    variant="outline"
                                    onClick={cancelDelete}
                                    disabled={isDeleting === planToDelete.id}
                                    className="flex-1"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={confirmDelete}
                                    disabled={isDeleting === planToDelete.id}
                                    className="flex-1 bg-red-600 hover:bg-red-700"
                                >
                                    {isDeleting === planToDelete.id ? (
                                        <div className="flex items-center gap-2">
                                            <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                                            Deleting...
                                        </div>
                                    ) : (
                                        'Delete Plan'
                                    )}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
