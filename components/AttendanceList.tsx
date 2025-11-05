
import React from 'react';
import type { Student } from '../types';

interface AttendanceListProps {
  students: Student[];
}

const StatusBadge: React.FC<{ status: 'Present' | 'Absent' }> = ({ status }) => {
  const baseClasses = 'px-3 py-1 text-xs font-bold rounded-full';
  const presentClasses = 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
  const absentClasses = 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
  
  return (
    <span className={`${baseClasses} ${status === 'Present' ? presentClasses : absentClasses}`}>
      {status}
    </span>
  );
};

export const AttendanceList: React.FC<AttendanceListProps> = ({ students }) => {
  return (
    <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-md h-full">
      <h2 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-300">Student Roster</h2>
      <div className="space-y-4">
        {students.map(student => (
          <div key={student.id} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
            <div className="flex items-center">
              <img 
                src={student.imageUrl} 
                alt={student.name} 
                className="w-10 h-10 rounded-full mr-4 object-cover" 
                crossOrigin="anonymous" 
              />
              <span className="font-medium text-gray-800 dark:text-gray-200">{student.name}</span>
            </div>
            <StatusBadge status={student.status} />
          </div>
        ))}
      </div>
    </div>
  );
};
