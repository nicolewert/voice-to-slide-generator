import React from "react"
import { Skeleton } from "@/components/ui/skeleton"

export function SlideViewerSkeleton() {
  return (
    <div 
      className="flex flex-col lg:flex-row min-h-screen bg-background p-4 lg:p-8 space-y-4 lg:space-y-0 lg:space-x-6"
      aria-label="Loading slide presentation"
    >
      {/* Navigation and Slide Control Skeleton */}
      <div className="lg:w-1/4 space-y-4">
        <Skeleton variant="card" size="lg" className="w-full h-12" />
        <div className="flex space-x-2">
          <Skeleton variant="circle" size="md" className="h-10 w-10" />
          <Skeleton variant="circle" size="md" className="h-10 w-10" />
        </div>
        <Skeleton variant="card" size="xl" className="w-full h-64" />
      </div>

      {/* Main Slide Content */}
      <div className="flex-1 space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton variant="text" size="lg" className="w-1/2" />
          <div className="flex space-x-2">
            <Skeleton variant="circle" size="sm" className="h-8 w-8" />
            <Skeleton variant="circle" size="sm" className="h-8 w-8" />
          </div>
        </div>
        
        <Skeleton 
          variant="card" 
          size="xl" 
          className="w-full h-[60vh] rounded-xl shadow-lg" 
        />

        {/* Speaker Notes */}
        <div className="space-y-2">
          <Skeleton variant="text" size="md" className="w-full" />
          <Skeleton variant="text" size="sm" className="w-3/4" />
          <Skeleton variant="text" size="sm" className="w-1/2" />
        </div>
      </div>
    </div>
  )
}