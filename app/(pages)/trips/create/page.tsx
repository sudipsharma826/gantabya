"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { createTrip } from "@/lib/actions/createTrip";
import { cn } from "@/lib/utils";
import { useState, useTransition } from "react";
import { UploadButton,UploadDropzone } from "@/lib/uploadThing"
import Image from "next/image";

export default function TripCreate(){
    const [isPending, startTransition] = useTransition();
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
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
                        formData.append("tripImageUrl", imageUrl || "");
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
                            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="tripImage">Trip Image</label>
                            
                            {imageUrl ? (
                                // Image Preview with Remove Option
                                <div className="relative">
                                    <Image 
                                        src={imageUrl} 
                                        alt="Trip Image" 
                                        className="mt-2 w-full h-64 object-cover rounded-md border-2 border-green-300" 
                                        width={500} 
                                        height={300} 
                                    />
                                    <Button
                                        type="button"
                                        onClick={() => {
                                            setImageUrl(null);
                                            setUploadProgress(0);
                                        }}
                                        className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white px-3 py-1 text-sm rounded"
                                    >
                                        Remove
                                    </Button>
                                    <div className="absolute bottom-2 left-2 bg-green-500 text-white px-2 py-1 rounded text-xs">
                                        ✓ Uploaded Successfully
                                    </div>
                                    <input type="hidden" name="tripImage" value={imageUrl} />
                                </div>
                            ) : isUploading ? (
                                // Upload Progress Display
                                <div className="w-full border-2 border-dashed border-orange-300 rounded-lg p-8 bg-orange-50">
                                    <div className="text-center">
                                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mb-4"></div>
                                        <p className="text-lg font-medium text-gray-700 mb-2">Uploading your image...</p>
                                        <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                                            <div 
                                                className="bg-orange-500 h-3 rounded-full transition-all duration-300 ease-out"
                                                style={{ width: `${uploadProgress}%` }}
                                            ></div>
                                        </div>
                                        <p className="text-sm text-gray-600">{uploadProgress}% Complete</p>
                                    </div>
                                </div>
                            ) : (
                                // Upload Dropzone
                                <UploadDropzone
                                    endpoint="imageUploader"
                                    onBeforeUploadBegin={(files) => {
                                        setIsUploading(true);
                                        setUploadProgress(0);
                                        return files;
                                    }}
                                    onUploadProgress={(progress) => {
                                        setUploadProgress(progress);
                                    }}
                                    onClientUploadComplete={(res)=>{
                                        if(res && res[0].url){
                                            setImageUrl(res[0].url);
                                            setIsUploading(false);
                                            setUploadProgress(100);
                                        }
                                    }}
                                    onUploadError={(error) => {
                                        console.error("Upload failed:", error);
                                        setIsUploading(false);
                                        setUploadProgress(0);
                                        alert("Upload failed: " + error.message);
                                    }}
                                    appearance={{
                                        container: "w-full border-2 border-dashed border-gray-300 rounded-lg p-8 hover:border-orange-400 transition-colors bg-gray-50 hover:bg-orange-50",
                                        uploadIcon: "text-orange-500 w-12 h-12",
                                        label: "text-lg font-medium text-gray-700 mt-4",
                                        allowedContent: "text-gray-500 mt-2",
                                        button: "hidden", // Hide the upload button
                                    }}
                                    content={{
                                        label: "Drop your trip image here or click to browse",
                                        allowedContent: "Images up to 4MB (JPG, PNG, GIF)",
                                    }}
                                    config={{
                                        mode: "auto" // This makes it auto-upload on file selection
                                    }}
                                />
                            )}
                            
                            <p className="mt-2 text-sm text-gray-500">
                                {imageUrl 
                                    ? "Image uploaded successfully! You can remove it and upload a different one if needed." 
                                    : isUploading 
                                        ? "Please wait while your image is being uploaded..." 
                                        : "Drag and drop your trip image here, or click to select a file. Upload will start automatically."
                                }
                            </p>
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
                                   