import { useState, useCallback } from 'react';
import { FavoriteCourse, Course } from '@/types';
import { getSuggestions as getSuggestionsApi } from '@/services/api';

export function useSuggestions() {
  const [suggestions, setSuggestions] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getSuggestions = useCallback(async (favorites: FavoriteCourse[]) => {
    if (favorites.length === 0) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await getSuggestionsApi(favorites);
      if (data.success && data.courses) {
        setSuggestions(data.courses);
      } else {
        setError(data.error || 'Failed to get suggestions');
      }
    } catch {
      setError('Failed to get suggestions. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearSuggestions = useCallback(() => {
    setSuggestions([]);
    setError(null);
  }, []);

  return { suggestions, isLoading, error, getSuggestions, clearSuggestions };
}
