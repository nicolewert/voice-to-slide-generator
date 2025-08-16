import React from "react"
import { Skeleton } from "@/components/ui/skeleton"

interface DeckListSkeletonProps {
  count?: number
}

export function DeckListSkeleton({ count = 6 }: DeckListSkeletonProps) {
  return (
    <div 
      className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-4"
      aria-label="Loading decks"
    >
      {Array.from({ length: count }).map((_, index) => (
        <div 
          key={index} 
          className="bg-background border border-primary/10 rounded-xl shadow-md p-4 space-y-4"
        >
          <Skeleton variant="card" size="lg" className="w-full h-40" />
          
          <div className="space-y-2">
            <Skeleton variant="text" size="md" className="w-3/4" />
            <Skeleton variant="text" size="sm" className="w-1/2" />
          </div>
          
          <div className="flex justify-between items-center">
            <Skeleton variant="circle" size="sm" className="h-8 w-8" />
            <Skeleton variant="text" size="sm" className="w-1/3" />
          </div>
        </div>
      ))}
    </div>
  )
}