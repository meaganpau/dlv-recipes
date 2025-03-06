import { Skeleton } from '@/components/ui/skeleton'

const LoadingSkeleton = () => {
  return (
    <div className="flex flex-col gap-4 w-full">
      <Skeleton className="w-[400px] h-[30px]" />
      <Skeleton className="w-[400px] h-[30px]" />
      <Skeleton className="w-full h-[20px]" />
      <Skeleton className="w-full h-[20px]" />
      <Skeleton className="w-full h-[20px]" />
      <Skeleton className="w-full h-[20px]" />
      <Skeleton className="w-full h-[20px]" />
      <Skeleton className="w-full h-[20px]" />
      <Skeleton className="w-full h-[20px]" />
      <Skeleton className="w-full h-[20px]" />
    </div>
  )
}

export default LoadingSkeleton;