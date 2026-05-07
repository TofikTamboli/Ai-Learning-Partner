import { AISettings, Course, Roadmap } from '@/types';
import { API_ENDPOINTS } from '@/constants';

export async function searchCourses(
  query: string,
  settings: AISettings
): Promise<{ success: boolean; courses?: Course[]; error?: string }> {
  try {
    const response = await fetch(API_ENDPOINTS.SEARCH, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, settings }),
    });
    if (!response.ok) {
      const text = await response.text();
      return { success: false, error: `Server Error (${response.status}): ${text.substring(0, 100)}` };
    }
    return await response.json();
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function generateRoadmap(
  topic: string,
  settings: AISettings
): Promise<{ success: boolean; roadmap?: Roadmap; error?: string }> {
  try {
    const response = await fetch(API_ENDPOINTS.ROADMAP, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic, settings }),
    });
    if (!response.ok) {
      const text = await response.text();
      return { success: false, error: `Server Error (${response.status}): ${text.substring(0, 100)}` };
    }
    return await response.json();
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getSuggestions(
  favorites: { title: string; url: string }[]
): Promise<{ success: boolean; courses?: Course[]; error?: string }> {
  try {
    const response = await fetch(API_ENDPOINTS.SUGGESTIONS, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ favorites }),
    });
    if (!response.ok) {
      const text = await response.text();
      return { success: false, error: `Server Error (${response.status}): ${text.substring(0, 100)}` };
    }
    return await response.json();
  } catch (error: any) {
    return { success: false, error: error.message };
  }
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
