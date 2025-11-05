
import React, { useState, useCallback } from 'react';
import { WebcamCapture } from './components/WebcamCapture';
import { AttendanceList } from './components/AttendanceList';
import { SummaryReport } from './components/SummaryReport';
import { generateAttendanceSummary } from './services/geminiService';
import { INITIAL_STUDENTS } from './constants';
import type { Student } from './types';

const App: React.FC = () => {
  const [students, setStudents] = useState<Student[]>(INITIAL_STUDENTS);
  const [summary, setSummary] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleStudentRecognized = useCallback((name: string) => {
    setStudents(prevStudents =>
      prevStudents.map(student =>
        student.name === name && student.status === 'Absent'
          ? { ...student, status: 'Present' }
          : student
      )
    );
  }, []);

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    setError(null);
    setSummary('');
    try {
      const report = await generateAttendanceSummary(students);
      setSummary(report);
    } catch (e) {
      console.error(e);
      setError('Failed to generate summary. Please check your API key and try again.');
    } finally {
      setIsGenerating(false);
    }
  };
  
  const presentCount = students.filter(s => s.status === 'Present').length;
  const totalCount = students.length;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 dark:bg-gray-900 dark:text-gray-200 font-sans">
      <header className="bg-white dark:bg-gray-800 shadow-md">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-blue-600 dark:text-blue-400">AI Attendance Tracker</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Automated attendance using face recognition</p>
            </div>
            <div className="text-right">
                <div className="text-lg font-semibold text-gray-700 dark:text-gray-300">Attendance</div>
                <div className="text-2xl font-bold text-green-500">{presentCount} / {totalCount}</div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3">
            <WebcamCapture onStudentRecognized={handleStudentRecognized} />
          </div>
          <div className="lg:col-span-2">
            <AttendanceList students={students} />
          </div>
        </div>

        <div className="mt-8 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-300">Attendance Summary</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Once the attendance is final, generate a summary report using Gemini.
          </p>
          <button
            onClick={handleGenerateReport}
            disabled={isGenerating}
            className="w-full sm:w-auto bg-blue-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isGenerating ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating...
              </>
            ) : (
              'Generate Summary Report'
            )}
          </button>
          {error && <p className="text-red-500 mt-4">{error}</p>}
          {summary && <SummaryReport summary={summary} />}
        </div>
      </main>
    </div>
  );
};

export default App;
