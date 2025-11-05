
import { GoogleGenAI } from "@google/genai";
import type { Student } from '../types';

export async function generateAttendanceSummary(students: Student[]): Promise<string> {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const presentStudents = students.filter(s => s.status === 'Present').map(s => s.name);
  const absentStudents = students.filter(s => s.status === 'Absent').map(s => s.name);

  const prompt = `
    Generate a brief, professional, and encouraging attendance summary for a class session.
    
    Total students: ${students.length}
    Present (${presentStudents.length}): ${presentStudents.join(', ') || 'None'}
    Absent (${absentStudents.length}): ${absentStudents.join(', ') || 'None'}

    Format the summary with a positive opening and a concluding remark. For example: "Great turnout today! Let's get started." or "We're missing a few people, but let's make it a productive session for everyone here."
    Do not use markdown formatting. Just return plain text.
    `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error generating summary with Gemini:", error);
    throw new Error("Failed to communicate with the Gemini API.");
  }
}
