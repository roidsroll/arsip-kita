import { GoogleGenAI, Type } from "@google/genai";
import { MoodType } from "../types";

const apiKey = process.env.API_KEY || '';

// Mock response for when API key is missing or fails, to keep the app functional
const fallbackAnalysis = (text: string): { mood: MoodType; color: string } => {
  return { mood: 'neutral', color: '#f3f4f6' };
};

export const analyzeSentiment = async (text: string): Promise<{ mood: MoodType; color: string }> => {
  if (!apiKey) {
    console.warn("No API Key provided. Using fallback.");
    return fallbackAnalysis(text);
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    
    // We ask Gemini to categorize the text into one of our predefined moods
    // and assign a hex color code that matches the emotion (soft pastel tones).
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Analyze the following text and determine its emotional mood. 
      Text: "${text}"
      
      Return a JSON object with:
      1. 'mood': one of ['happy', 'sad', 'angry', 'neutral', 'romantic', 'excited']
      2. 'color': a valid hex code string for a pastel background color representing that mood.
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            mood: {
              type: Type.STRING,
              enum: ['happy', 'sad', 'angry', 'neutral', 'romantic', 'excited'],
            },
            color: {
              type: Type.STRING,
            },
          },
          required: ['mood', 'color'],
        }
      }
    });

    const result = JSON.parse(response.text || '{}');
    
    return {
      mood: (result.mood as MoodType) || 'neutral',
      color: result.color || '#f3f4f6'
    };

  } catch (error) {
    console.error("Gemini analysis failed", error);
    return fallbackAnalysis(text);
  }
};
