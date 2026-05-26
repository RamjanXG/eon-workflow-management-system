import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export async function analyzeResume(resumeText: string) {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `
        Analyze the following resume text and extract information in JSON format:
        {
          "name": "string",
          "skills": ["string"],
          "summary": "string",
          "experienceYears": number
        }
        Resume: ${resumeText}
      `,
      config: {
        responseMimeType: 'application/json'
      }
    });

    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("AI Analysis error:", error);
    return null;
  }
}

export async function matchCandidateToJob(candidateProfile: string, jobDescription: string) {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `
        Compare the candidate profile with the job description.
        Provide a match score (0-100) and a brief justification.
        Format: JSON { "score": number, "justification": "string" }
        Candidate: ${candidateProfile}
        Job: ${jobDescription}
      `,
      config: {
        responseMimeType: 'application/json'
      }
    });

    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Matching error:", error);
    return null;
  }
}
