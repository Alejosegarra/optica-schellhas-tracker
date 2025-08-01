import React from 'react';
import type { Job, JobStatus, User, JobFlag } from '../types';
import { JobCard } from './JobCard';
import { JobCardSkeleton } from './JobCardSkeleton';

interface JobListProps {
  jobs: Job[];
  isLoading: boolean;
  onRequestStatusUpdate: (jobId: string, newStatus: JobStatus) => void;
  updateJobFlag: (jobId: string, newFlag: JobFlag) => void;
  user: User;
  selectedJobIds: string[];
  onToggleSelection: (jobId: string) => void;
  onArchiveJob: (jobId: string) => void;
  onRestoreJob: (jobId: string) => void;
  isArchivedView: boolean;
}

export const JobList: React.FC<JobListProps> = ({ 
    jobs, 
    isLoading, 
    onRequestStatusUpdate, 
    updateJobFlag, 
    user,
    selectedJobIds,
    onToggleSelection,
    onArchiveJob,
    onRestoreJob,
    isArchivedView
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => <JobCardSkeleton key={i} />)}
      </div>
    );
  }
  
  const sortedJobs = [...jobs].sort((a, b) => b.creationDate.getTime() - a.creationDate.getTime());
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {sortedJobs.map(job => (
        <JobCard 
            key={job.id} 
            job={job} 
            onRequestStatusUpdate={onRequestStatusUpdate}
            updateJobFlag={updateJobFlag}
            user={user}
            isSelected={selectedJobIds.includes(job.id)}
            onToggleSelection={onToggleSelection}
            onArchiveJob={onArchiveJob}
            onRestoreJob={onRestoreJob}
            isArchivedView={isArchivedView}
        />
      ))}
    </div>
  );
};