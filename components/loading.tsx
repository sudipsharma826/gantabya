"use client";

import React from "react";
import Image from "next/image";

interface LoadingProps {
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "default" | "pulse" | "spin" | "bounce" | "glow";
  text?: string;
  showText?: boolean;
}

const sizeClasses = {
  sm: "w-12 h-12",
  md: "w-16 h-16", 
  lg: "w-24 h-24",
  xl: "w-32 h-32"
};

const textSizeClasses = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-lg", 
  xl: "text-xl"
};

export default function Loading({ 
  size = "md", 
  variant = "default", 
  text = "Loading...", 
  showText = true 
}: LoadingProps) {
  const getAnimationClass = () => {
    switch (variant) {
      case "pulse":
        return "animate-pulse";
      case "spin":
        return "animate-spin";
      case "bounce":
        return "animate-bounce";
      case "glow":
        return "animate-pulse drop-shadow-[0_0_20px_rgba(59,130,246,0.5)]";
      default:
        return "animate-pulse";
    }
  };

  const getContainerAnimation = () => {
    switch (variant) {
      case "default":
        return "animate-pulse";
      case "pulse":
        return "";
      case "spin":
        return "";
      case "bounce":
        return "";
      case "glow":
        return "animate-pulse";
      default:
        return "";
    }
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      {/* Simple Logo with Location Pin Effect */}
      <div className="relative">
        {/* Simple pulsing ring for location effect */}
        <div className={`absolute inset-0 ${sizeClasses[size]} rounded-full border-2 border-blue-500/30 animate-ping`}></div>
        
        {/* Logo Image */}
        <div className={`relative ${sizeClasses[size]} ${getAnimationClass()}`}>
          <Image
            src="/logo.png"
            alt="Loading"
            fill
            className="object-contain"
            priority
          />
        </div>
      </div>

      {/* Simple Loading Text */}
      {showText && (
        <div className="text-center">
          <p className={`font-medium text-gray-700 dark:text-gray-300 ${textSizeClasses[size]}`}>
            {text}
          </p>
        </div>
      )}
    </div>
  );
}

// Alternative Variants for Different Use Cases

// Minimal Loading Component
export function MinimalLoading({ size = "md" }: { size?: "sm" | "md" | "lg" | "xl" }) {
  return (
    <div className="flex items-center justify-center p-4">
      <div className="relative">
        <div className={`absolute inset-0 ${sizeClasses[size]} rounded-full border border-blue-500/30 animate-pulse`}></div>
        <div className={`relative ${sizeClasses[size]}`}>
          <Image
            src="/logo.png"
            alt="Loading"
            fill
            className="object-contain animate-pulse"
            priority
          />
        </div>
      </div>
    </div>
  );
}

// Full Screen Loading Component
export function FullScreenLoading({ text = "Loading..." }: { text?: string }) {
  return (
    <div className="fixed inset-0 bg-white/80 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
      <Loading size="xl" variant="glow" text={text} />
    </div>
  );
}

// Inline Loading Component
export function InlineLoading({ text = "Loading..." }: { text?: string }) {
  return (
    <div className="flex items-center justify-center space-x-2 p-2">
      <div className="relative w-6 h-6">
        <Image
          src="/logo.png"
          alt="Loading"
          fill
          className="object-contain animate-spin"
          priority
        />
      </div>
      <span className="text-sm text-gray-600 dark:text-gray-400">{text}</span>
    </div>
  );
}
