export interface Memory {
  id: string;
  content: string;
  author?: string;
  createdAt: number;
  mood: 'happy' | 'sad' | 'angry' | 'neutral' | 'romantic' | 'excited';
  color: string;
  rotation: number; // For visual randomness
}

export type MoodType = Memory['mood'];

export interface StoredMemory extends Memory {}

export const COLORS = {
  happy: '#fef3c7', // yellow-100
  sad: '#e0f2fe',   // sky-100
  angry: '#fee2e2', // red-100
  neutral: '#f3f4f6', // gray-100
  romantic: '#fce7f3', // pink-100
  excited: '#d1fae5', // emerald-100
};