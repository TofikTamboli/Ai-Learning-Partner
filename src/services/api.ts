import { AISettings, Course, Roadmap } from '@/types';
import { API_ENDPOINTS } from '@/constants';

export async function searchCourses(
  query: string,
  settings: AISettings
): Promise<{ success: boolean; courses?: Course[]; error?: string }> {
  const response = await fetch(API_ENDPOINTS.SEARCH, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, settings }),
  });
  return response.json();
}

export async function generateRoadmap(
  topic: string,
  settings: AISettings
): Promise<{ success: boolean; roadmap?: Roadmap; error?: string }> {
  const response = await fetch(API_ENDPOINTS.ROADMAP, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ topic, settings }),
  });
  return response.json();
}

export async function getSuggestions(
  favorites: { title: string; url: string }[]
): Promise<{ success: boolean; courses?: Course[]; error?: string }> {
  const response = await fetch(API_ENDPOINTS.SUGGESTIONS, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ favorites }),
  });
  return response.json();
}

export async function sendChatMessage(
  message: string,
  history: { role: string; content: string }[],
  settings: AISettings
): Promise<Response> {
  return fetch(API_ENDPOINTS.CHAT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, history, settings }),
  });
}
