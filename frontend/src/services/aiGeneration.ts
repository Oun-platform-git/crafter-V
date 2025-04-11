import { config } from '../config/api';

export interface GenerationPrompt {
  description: string;
  style?: string;
  duration: number;
  resolution: {
    width: number;
    height: number;
  };
  audio?: {
    type: 'music' | 'voiceover';
    prompt?: string;
  };
}

export interface GenerationResult {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  url?: string;
  error?: string;
  progress?: number;
}

class AIGenerationService {
  async generateVideo(prompt: GenerationPrompt): Promise<string> {
    const response = await fetch(`${config.API_URL}/api/generate/video`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(prompt),
    });

    if (!response.ok) {
      throw new Error('Failed to generate video');
    }

    const { generationId } = await response.json();
    return generationId;
  }

  async checkGenerationStatus(generationId: string): Promise<GenerationResult> {
    const response = await fetch(`${config.API_URL}/api/generate/status/${generationId}`);
    
    if (!response.ok) {
      throw new Error('Failed to check generation status');
    }

    return response.json();
  }

  async enhanceVideo(videoUrl: string, enhancements: string[]): Promise<string> {
    const response = await fetch(`${config.API_URL}/api/enhance/video`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        videoUrl,
        enhancements,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to enhance video');
    }

    const { enhancedUrl } = await response.json();
    return enhancedUrl;
  }

  async generateAudio(prompt: string, type: 'music' | 'voiceover'): Promise<string> {
    const response = await fetch(`${config.API_URL}/api/generate/audio`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        type,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate audio');
    }

    const { audioUrl } = await response.json();
    return audioUrl;
  }
}

export const aiGenerationService = new AIGenerationService();
