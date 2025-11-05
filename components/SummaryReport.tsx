
import React from 'react';

interface SummaryReportProps {
  summary: string;
}

export const SummaryReport: React.FC<SummaryReportProps> = ({ summary }) => {
  return (
    <div className="mt-6 p-4 bg-blue-50 dark:bg-gray-700 border-l-4 border-blue-500 rounded-r-lg">
      <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-300 mb-2">Generated Report</h3>
      <div className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
        {summary}
      </div>
    </div>
  );
};
