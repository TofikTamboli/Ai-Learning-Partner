export const POPULAR_TOPICS = [
  { label: 'Web Development', query: 'web development' },
  { label: 'Machine Learning', query: 'machine learning' },
  { label: 'Data Science', query: 'data science' },
  { label: 'Mobile Apps', query: 'mobile app development' },
  { label: 'Cloud Computing', query: 'cloud computing' },
  { label: 'DevOps', query: 'devops engineering' },
  { label: 'Cybersecurity', query: 'cybersecurity' },
  { label: 'UI/UX Design', query: 'ui ux design' },
] as const;

export const STORAGE_KEYS = {
  FAVORITES: 'free-course-finder-favorites',
  CHAT_HISTORY: 'free-course-finder-chat-history',
  AI_SETTINGS: 'free-course-finder-settings',
} as const;

export const API_ENDPOINTS = {
  SEARCH: '/api/search',
  ROADMAP: '/api/roadmap',
  CHAT: '/api/chat',
  SUGGESTIONS: '/api/suggestions',
} as const;
