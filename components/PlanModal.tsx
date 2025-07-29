"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createPlan, updatePlan } from "@/lib/actions/planActions";

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
}

interface PlanModalProps {
    isOpen: boolean;
    onClose: () => void;
    mode: 'create' | 'edit';
    tripId: string;
    tripStartDate: Date;
    tripEndDate: Date;
    plan?: Plan;
    onSuccess?: () => void;
}

export default function PlanModal({ 
    isOpen, 
    onClose, 
    mode, 
    tripId, 
    tripStartDate, 
    tripEndDate, 
    plan,
    onSuccess 
}: PlanModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        day: 1,
        startTime: '',
        endTime: ''
    });

    // Calculate trip duration
    const tripDuration = Math.ceil((tripEndDate.getTime() - tripStartDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    // Initialize form data when modal opens or plan changes
    useEffect(() => {
        if (isOpen) {
            if (mode === 'edit' && plan) {
                setFormData({
                    title: plan.title,
                    description: plan.description || '',
                    day: plan.day,
                    startTime: plan.startTime || '',
                    endTime: plan.endTime || ''
                });
            } else {
                // Reset form for create mode
                setFormData({
                    title: '',
                    description: '',
                    day: 1,
                    startTime: '',
                    endTime: ''
                });
            }
            setError(null);
        }
    }, [isOpen, mode, plan]);

    if (!isOpen) return null;

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ 
            ...prev, 
            [name]: name === 'day' ? parseInt(value) || 1 : value 
        }));
        setError(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            
            if (!formData.title || formData.title.trim().length === 0) {
                setError('Plan title is required');
                setIsLoading(false);
                return;
            }

            if (formData.day < 1 || formData.day > tripDuration) {
                setError(`Day must be between 1 and ${tripDuration}`);
                setIsLoading(false);
                return;
            }

            console.log('Form data before submission:', formData);
            console.log('Form data type:', typeof formData);
            console.log('Form data keys:', Object.keys(formData));

            let result;
            if (mode === 'create') {
                result = await createPlan(
                    tripId,
                    formData.title,
                    formData.description,
                    formData.day,
                    formData.startTime,
                    formData.endTime
                );
            } else if (plan) {
                result = await updatePlan(
                    plan.id,
                    formData.title,
                    formData.description,
                    formData.day,
                    formData.startTime,
                    formData.endTime
                );
            } else {
                setError('No plan data available for update');
                setIsLoading(false);
                return;
            }

            console.log('Operation result:', result);

            if (result.success) {
                console.log('Operation successful, calling callbacks');
                onSuccess?.();
                onClose();
            } else {
                setError(result.error || 'Operation failed');
            }
        } catch (err) {
            console.error('Form submission error:', err);
            setError('An unexpected error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        if (!isLoading) {
            setError(null);
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle className="text-xl font-bold">
                            {mode === 'create' ? '📝 Create New Plan' : '✏️ Edit Plan'}
                        </CardTitle>
                        <button
                            onClick={handleClose}
                            className="text-gray-400 hover:text-gray-600 text-xl p-1 rounded hover:bg-gray-100"
                            disabled={isLoading}
                        >
                            ✕
                        </button>
                    </div>
                </CardHeader>

                <CardContent>
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                            <p className="text-red-700 text-sm">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Plan Title */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Plan Title *
                            </label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleInputChange}
                                required
                                disabled={isLoading}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                                placeholder="Enter plan title"
                                maxLength={100}
                            />
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Description
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                disabled={isLoading}
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                                placeholder="Enter plan description (optional)"
                                maxLength={500}
                            />
                        </div>

                        {/* Day Number */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Day Number *
                            </label>
                            <select
                                name="day"
                                value={formData.day}
                                onChange={handleInputChange}
                                disabled={isLoading}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                            >
                                {[...Array(tripDuration)].map((_, index) => (
                                    <option key={index} value={index + 1}>
                                        Day {index + 1}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Time Range */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Start Time
                                </label>
                                <input
                                    type="time"
                                    name="startTime"
                                    value={formData.startTime}
                                    onChange={handleInputChange}
                                    disabled={isLoading}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Optional - defaults to 9:00 AM if not specified
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    End Time
                                </label>
                                <input
                                    type="time"
                                    name="endTime"
                                    value={formData.endTime}
                                    onChange={handleInputChange}
                                    disabled={isLoading}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Optional - defaults to 5:00 PM if not specified
                                </p>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3 pt-6">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleClose}
                                disabled={isLoading}
                                className="flex-1"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={isLoading || !formData.title.trim()}
                                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400"
                            >
                                {isLoading ? (
                                    <div className="flex items-center gap-2">
                                        <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                                        {mode === 'create' ? 'Creating...' : 'Updating...'}
                                    </div>
                                ) : (
                                    mode === 'create' ? 'Create Plan' : 'Update Plan'
                                )}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}