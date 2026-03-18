import React from 'react';
import { Loader2 } from 'lucide-react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

// 1. Full Page / Section Loading Skeleton
export const SkeletonLoader = ({ className }) => (
  <div className={twMerge("animate-pulse min-h-[400px] flex flex-col space-y-4 p-4", className)}>
    <div className="h-8 bg-gray-200 rounded w-1/4"></div>
    <div className="space-y-3 flex-1">
      <div className="h-32 bg-gray-200 rounded"></div>
      <div className="h-8 bg-gray-200 rounded w-full"></div>
      <div className="h-8 bg-gray-200 rounded w-5/6"></div>
      <div className="h-8 bg-gray-200 rounded w-4/6"></div>
    </div>
  </div>
);

// 2. Inline Spinner
export const Spinner = ({ className, size = 'md' }) => {
  const sizeMap = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };
  
  return (
    <div className={twMerge("flex justify-center items-center p-4", className)}>
      <Loader2 className={clsx("animate-spin text-primary", sizeMap[size])} />
    </div>
  );
};

// 3. Table Shimmer Skeleton
export const TableSkeleton = ({ rows = 5, columns = 5 }) => {
  return (
    <div className="animate-pulse bg-white border border-gray-200 rounded-lg overflow-hidden relative">
       {/* Table Header Wrapper */}
      <div className="bg-gray-50 border-b border-gray-200 h-10 flex items-center px-4 gap-4">
        {Array.from({ length: columns }).map((_, i) => (
          <div key={i} className="h-4 bg-gray-300 rounded flex-1"></div>
        ))}
      </div>
      {/* Table Rows */}
      <div className="divide-y divide-gray-100">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="h-14 flex items-center px-4 gap-4 bg-white">
            {Array.from({ length: columns }).map((_, j) => (
              <div key={j} className="h-4 bg-gray-200 rounded flex-1"></div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default {
  Skeleton: SkeletonLoader,
  Spinner,
  Table: TableSkeleton
};
