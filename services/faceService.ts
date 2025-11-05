import type { Student } from '../types';

// Extend the Window interface to include faceapi
declare global {
  interface Window {
    faceapi: any;
  }
}

const MODELS_URL = 'https://cdn.jsdelivr.net/gh/justadudewhohacks/face-api.js@master/weights';

export async function loadModels() {
  if (!window.faceapi) {
    console.error("face-api.js not loaded");
    return;
  }
  try {
    await Promise.all([
      window.faceapi.nets.tinyFaceDetector.loadFromUri(MODELS_URL),
      window.faceapi.nets.faceLandmark68Net.loadFromUri(MODELS_URL),
      window.faceapi.nets.faceRecognitionNet.loadFromUri(MODELS_URL),
    ]);
  } catch (error) {
    console.error("Error loading face-api models:", error);
  }
}

async function getLabeledFaceDescriptions(students: Student[]) {
  return Promise.all(
    students.map(async (student) => {
      const descriptions = [];
      try {
        const img = await window.faceapi.fetchImage(student.imageUrl);
        const detection = await window.faceapi
          .detectSingleFace(img, new window.faceapi.TinyFaceDetectorOptions())
          .withFaceLandmarks()
          .withFaceDescriptor();
        
        if (detection) {
          descriptions.push(detection.descriptor);
          return new window.faceapi.LabeledFaceDescriptors(student.name, descriptions);
        } else {
          console.warn(`Could not detect face for ${student.name}`);
          return null;
        }

      } catch (e) {
        console.error(`Error processing image for ${student.name}:`, e);
        return null;
      }
    })
  );
}

export async function getFaceMatcher(students: Student[]) {
  if (!window.faceapi) {
    console.error("face-api.js not loaded");
    return null;
  }
  
  const labeledFaceDescriptors = (await getLabeledFaceDescriptions(students)).filter(Boolean);

  if (labeledFaceDescriptors.length === 0) {
      console.error("No valid labeled face descriptors could be created.");
      return null;
  }

  return new window.faceapi.FaceMatcher(labeledFaceDescriptors, 0.6);
}