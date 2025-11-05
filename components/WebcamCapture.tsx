import React, { useRef, useEffect, useState, useCallback } from 'react';
import { loadModels, getFaceMatcher } from '../services/faceService';
import { INITIAL_STUDENTS } from '../constants';

// Extend the Window interface to include faceapi
declare global {
  interface Window {
    faceapi: any;
  }
}

interface WebcamCaptureProps {
  onStudentRecognized: (name: string) => void;
}

export const WebcamCapture: React.FC<WebcamCaptureProps> = ({ onStudentRecognized }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [webcamError, setWebcamError] = useState<string | null>(null);
  // FIX: Changed useRef to provide an initial value (null) and use the correct type for browser's setInterval (number).
  const detectionInterval = useRef<number | null>(null);

  const startWebcam = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Error accessing webcam:", err);
      setWebcamError("Could not access the webcam. Please grant permission and try again.");
    }
  }, []);

  const runFaceDetection = useCallback(async (faceMatcher: any) => {
    if (videoRef.current && canvasRef.current && window.faceapi) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const displaySize = { width: video.videoWidth, height: video.videoHeight };

      window.faceapi.matchDimensions(canvas, displaySize);

      detectionInterval.current = setInterval(async () => {
        if (video.paused || video.ended) {
          // FIX: Added a check for detectionInterval.current to satisfy TypeScript's strict null checks.
          if (detectionInterval.current) {
            clearInterval(detectionInterval.current);
          }
          return;
        }

        const detections = await window.faceapi.detectAllFaces(video, new window.faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceDescriptors();
        
        if (!detections.length) {
            const context = canvas.getContext('2d');
            context?.clearRect(0, 0, canvas.width, canvas.height);
            return;
        }
        
        const resizedDetections = window.faceapi.resizeResults(detections, displaySize);
        const results = resizedDetections.map((d: any) => faceMatcher.findBestMatch(d.descriptor));

        const context = canvas.getContext('2d');
        context?.clearRect(0, 0, canvas.width, canvas.height);

        results.forEach((result: any, i: number) => {
          const box = resizedDetections[i].detection.box;
          const drawBox = new window.faceapi.draw.DrawBox(box, { 
              label: result.toString(),
              boxColor: result.label === 'unknown' ? 'red' : 'green',
          });
          drawBox.draw(canvas);

          if (result.label !== 'unknown') {
            onStudentRecognized(result.label);
          }
        });
      }, 1000);
    }
  }, [onStudentRecognized]);
  
  const initialize = useCallback(async () => {
    await loadModels();
    const faceMatcher = await getFaceMatcher(INITIAL_STUDENTS);
    setModelsLoaded(true);
    await startWebcam();
    if(faceMatcher){
        runFaceDetection(faceMatcher);
    }
  }, [startWebcam, runFaceDetection]);

  useEffect(() => {
    initialize();
    
    return () => {
      if (detectionInterval.current) {
        clearInterval(detectionInterval.current);
      }
      if (videoRef.current && videoRef.current.srcObject) {
          const stream = videoRef.current.srcObject as MediaStream;
          stream.getTracks().forEach(track => track.stop());
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-md h-full flex flex-col items-center justify-center">
      <h2 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-300">Live Camera Feed</h2>
      <div className="relative w-full max-w-2xl aspect-video rounded-lg overflow-hidden bg-gray-900 flex items-center justify-center">
        {!modelsLoaded && (
          <div className="text-white text-center">
            <svg className="animate-spin h-8 w-8 text-white mx-auto mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Loading AI Models...
          </div>
        )}
        {webcamError && (
          <div className="text-red-400 text-center p-4">
            <p className="font-bold">Webcam Error</p>
            <p>{webcamError}</p>
          </div>
        )}
        <video ref={videoRef} autoPlay muted playsInline className="absolute top-0 left-0 w-full h-full object-cover"></video>
        <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full"></canvas>
      </div>
       <p className="mt-4 text-sm text-center text-gray-500 dark:text-gray-400">
        Position faces in the camera frame to mark attendance. Recognized students are outlined in green.
      </p>
    </div>
  );
};