import { useState, useCallback } from 'react';
import axios from 'axios';

export interface MediaItem {
  id: string;
  title: string;
  type: 'music' | 'sfx' | 'video' | 'image';
  url: string;
  thumbnail?: string;
  duration?: number;
  bpm?: number;
  resolution?: string;
  tags: string[];
  license: string;
}

interface SearchParams {
  type: string;
  query: string;
  page: number;
  mood?: string[];
  genre?: string;
  duration?: { min: number; max: number };
  bpm?: { min: number; max: number };
  resolution?: string;
}

interface DownloadResponse {
  downloadUrl: string;
  license: string;
}

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

export const useStockMedia = () => {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const searchMedia = useCallback(async (params: SearchParams) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get(`${API_BASE_URL}/stock-media/search`, {
        params: {
          ...params,
          mood: params.mood?.join(','),
        }
      });

      const { data, hasMore: moreResults } = response.data;
      
      if (params.page === 1) {
        setMedia(data);
      } else {
        setMedia(prev => [...prev, ...data]);
      }
      
      setHasMore(moreResults);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch media'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const addToFavorites = useCallback(async (mediaId: string) => {
    try {
      await axios.post(`${API_BASE_URL}/stock-media/${mediaId}/favorite`);
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to add to favorites');
    }
  }, []);

  const downloadMedia = useCallback(async (mediaId: string): Promise<DownloadResponse> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/stock-media/${mediaId}/download`);
      return response.data;
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to download media');
    }
  }, []);

  return {
    media,
    loading,
    error,
    hasMore,
    searchMedia,
    addToFavorites,
    downloadMedia
  };
};
