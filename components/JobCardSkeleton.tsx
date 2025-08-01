import React from 'react';

export const JobCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-xl shadow-lg flex flex-col animate-pulse">
      <div className="p-5">
        <div className="flex justify-between items-start">
          <div>
            <div className="h-4 bg-slate-200 rounded w-20 mb-2"></div>
            <div className="h-6 bg-slate-300 rounded w-40"></div>
          </div>
          <div className="h-6 bg-slate-200 rounded-full w-24"></div>
        </div>
        <div className="flex items-center mt-3">
          <div className="w-4 h-4 bg-slate-200 rounded-full mr-1.5"></div>
          <div className="h-4 bg-slate-200 rounded w-24"></div>
        </div>
        <div className="flex items-center mt-2">
          <div className="w-4 h-4 bg-slate-200 rounded-full mr-1.5"></div>
          <div className="h-4 bg-slate-200 rounded w-32"></div>
        </div>
      </div>
      
      <div className="p-3 mt-auto bg-slate-50 rounded-b-xl border-t border-slate-200 flex items-center justify-between">
        <div className="h-8 bg-slate-200 rounded-md w-36"></div>
        <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-slate-200 rounded-md"></div>
            <div className="h-8 w-8 bg-slate-200 rounded-md"></div>
        </div>
      </div>
    </div>
  );
};
