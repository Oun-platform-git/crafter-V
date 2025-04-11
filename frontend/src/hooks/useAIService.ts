import { useState, useCallback } from 'react';
import axios from 'axios';
import { useCache } from './useCache';

interface GenerationOptions {
  prompt: string;
  style?: string;
  duration?: number;
  resolution?: string;
}

interface EnhancementOptions {
  type: 'quality' | 'style' | 'audio' | 'stabilization';
  params?: Record<string, any>;
}

export const useAIService = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const cache = useCache();

  const generateVideo = useCallback(async (options: GenerationOptions) => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.post('/api/ai/generate/video', options);
      return response.data.generationId;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const enhanceVideo = useCallback(async (
    videoUrl: string,
    options?: EnhancementOptions
  ) => {
    try {
      setLoading(true);
      setError(null);

      const cacheKey = `enhanced_${videoUrl}_${JSON.stringify(options)}`;
      const cached = await cache.get(cacheKey);
      if (cached) return cached;

      const response = await axios.post('/api/ai/enhance/video', {
        url: videoUrl,
        ...options
      });

      await cache.set(cacheKey, response.data.url, 3600);
      return response.data.url;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [cache]);

  const generateAudio = useCallback(async (text: string, voice: string) => {
    try {
      setLoading(true);
      setError(null);

      const cacheKey = `audio_${text}_${voice}`;
      const cached = await cache.get(cacheKey);
      if (cached) return cached;

      const response = await axios.post('/api/ai/generate/audio', {
        text,
        voice
      });

      await cache.set(cacheKey, response.data.url, 3600);
      return response.data.url;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [cache]);

  const analyzeContent = useCallback(async (videoUrl: string) => {
    try {
      setLoading(true);
      setError(null);

      const cacheKey = `analysis_${videoUrl}`;
      const cached = await cache.get(cacheKey);
      if (cached) return cached;

      const response = await axios.post('/api/ai/analyze/content', {
        url: videoUrl
      });

      await cache.set(cacheKey, response.data, 3600);
      return response.data;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [cache]);

  const detectHighlights = useCallback(async (videoUrl: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.post('/api/ai/detect/highlights', {
        url: videoUrl
      });

      return response.data.highlights;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const translateContent = useCallback(async (
    content: string,
    targetLanguage: string
  ) => {
    try {
      setLoading(true);
      setError(null);

      const cacheKey = `translation_${content}_${targetLanguage}`;
      const cached = await cache.get(cacheKey);
      if (cached) return cached;

      const response = await axios.post('/api/ai/translate', {
        content,
        targetLanguage
      });

      await cache.set(cacheKey, response.data.translation, 3600);
      return response.data.translation;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [cache]);

  const generateBackgroundMusic = useCallback(async (
    mood: string,
    duration: number
  ) => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.post('/api/ai/generate/music', {
        mood,
        duration
      });

      return response.data.url;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    generateVideo,
    enhanceVideo,
    generateAudio,
    analyzeContent,
    detectHighlights,
    translateContent,
    generateBackgroundMusic,
    loading,
    error
  };
};
