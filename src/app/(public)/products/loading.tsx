import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="flex items-center space-x-4 flex-col mb-4">
      <Skeleton className="h-12 w-120 mb-4" />
      <div className="grid grid-cols-4 space-y-2">
        <Skeleton className="h-40 w-[250px]" />
        <Skeleton className="h-40 w-[200px]" />
        <Skeleton className="h-40 w-[250px]" />
        <Skeleton className="h-40 w-[200px]" />
        <Skeleton className="h-40 w-[250px]" />
        <Skeleton className="h-40 w-[200px]" />
        <Skeleton className="h-40 w-[250px]" />
        <Skeleton className="h-40 w-[200px]" />
      </div>
    </div>
  )
}