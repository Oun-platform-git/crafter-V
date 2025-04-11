import axios from 'axios';

export interface AISceneSuggestion {
  id: string;
  title: string;
  description: string;
  confidence: number;
  elements: {
    type: 'character' | 'background' | 'prop' | 'effect';
    name: string;
    position?: { x: number; y: number };
    scale?: number;
    rotation?: number;
    color?: string;
    emotionData?: {
      expression?: string;
      intensity?: number;
      mood?: string;
    };
  }[];
  animations: {
    targetElement: string;
    type: string;
    duration: number;
    params: Record<string, any>;
    emotionSync?: {
      mood: string;
      intensity: number;
      timing: { start: number; end: number };
    };
  }[];
  audioSuggestions: {
    type: 'music' | 'sfx' | 'voiceover';
    name: string;
    timing: { start: number; duration: number };
    emotionMatch?: {
      mood: string;
      intensity: number;
      genre?: string;
    };
  }[];
  composition: {
    layout: 'dynamic' | 'symmetric' | 'rule-of-thirds' | 'golden-ratio';
    focusPoints: { x: number; y: number; weight: number }[];
    depthLayers: {
      layer: number;
      elements: string[];
      blur?: number;
    }[];
    colorScheme: {
      primary: string[];
      secondary: string[];
      accent: string[];
      mood: string;
    };
  };
}

export interface StyleTransferOptions {
  style: 'cartoon' | 'anime' | 'watercolor' | 'oil-painting' | 'pixel-art' | 'custom';
  intensity: number;
  preserveColors: boolean;
  customStyle?: {
    imageUrl?: string;
    styleParams?: {
      colorTransfer?: boolean;
      textureTransfer?: boolean;
      strokeStyle?: boolean;
    };
  };
}

export interface CompositionSuggestion {
  id: string;
  title: string;
  description: string;
  confidence: number;
  changes: {
    type: 'position' | 'scale' | 'rotation' | 'color' | 'timing';
    elementId: string;
    from: any;
    to: any;
    reason: string;
  }[];
}

class AIService {
  private apiUrl: string;
  private apiKey: string;

  constructor(apiUrl: string, apiKey: string) {
    this.apiUrl = apiUrl;
    this.apiKey = apiKey;
  }

  async generateSceneSuggestions(
    prompt: string,
    currentScene: any,
    options: {
      maxSuggestions?: number;
      stylePreference?: string;
      mood?: string;
      duration?: number;
    } = {}
  ): Promise<AISceneSuggestion[]> {
    try {
      const response = await axios.post(
        `${this.apiUrl}/ai/scene-suggestions`,
        {
          prompt,
          currentScene,
          options
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`
          }
        }
      );

      return response.data.suggestions;
    } catch (error) {
      console.error('Error generating scene suggestions:', error);
      throw error;
    }
  }

  async applyStyleTransfer(
    videoUrl: string,
    options: StyleTransferOptions
  ): Promise<string> {
    try {
      const response = await axios.post(
        `${this.apiUrl}/ai/style-transfer`,
        {
          videoUrl,
          options
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`
          }
        }
      );

      return response.data.processedVideoUrl;
    } catch (error) {
      console.error('Error applying style transfer:', error);
      throw error;
    }
  }

  async generateCompositionSuggestions(
    timeline: any,
    options: {
      focus?: 'visual-balance' | 'dynamic-flow' | 'emphasis' | 'rhythm';
      strictness?: number;
    } = {}
  ): Promise<CompositionSuggestion[]> {
    try {
      const response = await axios.post(
        `${this.apiUrl}/ai/composition-suggestions`,
        {
          timeline,
          options
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`
          }
        }
      );

      return response.data.suggestions;
    } catch (error) {
      console.error('Error generating composition suggestions:', error);
      throw error;
    }
  }

  async enhanceAudio(
    audioUrl: string,
    options: {
      type: 'denoise' | 'enhance' | 'separate' | 'match-style';
      targetStyle?: string;
      intensity?: number;
    }
  ): Promise<string> {
    try {
      const response = await axios.post(
        `${this.apiUrl}/ai/audio-enhance`,
        {
          audioUrl,
          options
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`
          }
        }
      );

      return response.data.processedAudioUrl;
    } catch (error) {
      console.error('Error enhancing audio:', error);
      throw error;
    }
  }

  async generateStoryboard(
    script: string,
    options: {
      style?: string;
      numberOfShots?: number;
      includeCamera?: boolean;
    } = {}
  ): Promise<{
    shots: {
      id: string;
      description: string;
      duration: number;
      camera: string;
      elements: any[];
      previewImage: string;
    }[];
  }> {
    try {
      const response = await axios.post(
        `${this.apiUrl}/ai/storyboard`,
        {
          script,
          options
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error generating storyboard:', error);
      throw error;
    }
  }

  async generateSmartComposition(
    elements: any[],
    options: {
      style?: 'cinematic' | 'dramatic' | 'minimalist' | 'dynamic';
      mood?: string;
      focusElement?: string;
      colorScheme?: string;
      depthOfField?: boolean;
    } = {}
  ): Promise<{
    layout: AISceneSuggestion['composition'];
    cameraMotion?: {
      type: 'pan' | 'zoom' | 'dolly' | 'track';
      params: Record<string, any>;
      duration: number;
    }[];
  }> {
    try {
      const response = await axios.post(
        `${this.apiUrl}/ai/smart-composition`,
        {
          elements,
          options
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error generating smart composition:', error);
      throw error;
    }
  }

  async analyzeEmotionalContent(
    content: {
      video?: string;
      audio?: string;
      script?: string;
    },
    options: {
      granularity?: 'scene' | 'shot' | 'frame';
      aspects?: ('visual' | 'audio' | 'narrative')[];
    } = {}
  ): Promise<{
    timeline: {
      time: number;
      duration: number;
      emotions: {
        type: string;
        intensity: number;
        confidence: number;
      }[];
      suggestions: {
        type: 'color' | 'music' | 'effect' | 'transition';
        description: string;
        params: Record<string, any>;
      }[];
    }[];
    overall: {
      dominantEmotions: string[];
      emotionalArc: {
        phase: string;
        timing: { start: number; end: number };
      }[];
      consistency: number;
    };
  }> {
    try {
      const response = await axios.post(
        `${this.apiUrl}/ai/emotional-analysis`,
        {
          content,
          options
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error analyzing emotional content:', error);
      throw error;
    }
  }

  async generateContentAwareSuggestions(
    timeline: any,
    options: {
      focus?: 'pacing' | 'engagement' | 'emotional-impact' | 'narrative';
      context?: 'social' | 'professional' | 'educational' | 'entertainment';
      targetDuration?: number;
      style?: string;
    } = {}
  ): Promise<{
    suggestions: {
      type: 'cut' | 'transition' | 'effect' | 'audio' | 'text';
      confidence: number;
      timing: { start: number; end: number };
      description: string;
      reason: string;
      params: Record<string, any>;
      alternatives: {
        description: string;
        params: Record<string, any>;
      }[];
    }[];
    insights: {
      pacing: {
        score: number;
        issues: string[];
        improvements: string[];
      };
      engagement: {
        score: number;
        peakMoments: number[];
        suggestions: string[];
      };
      narrative: {
        structure: string;
        arcs: {
          type: string;
          strength: number;
          timing: { start: number; end: number };
        }[];
      };
    };
  }> {
    try {
      const response = await axios.post(
        `${this.apiUrl}/ai/content-suggestions`,
        {
          timeline,
          options
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error generating content suggestions:', error);
      throw error;
    }
  }

  async enhanceAudioWithEmotion(
    audioUrl: string,
    emotionalData: {
      targetEmotion: string;
      intensity: number;
      timeline: {
        time: number;
        emotion: string;
        intensity: number;
      }[];
    }
  ): Promise<{
    processedAudioUrl: string;
    modifications: {
      type: string;
      params: Record<string, any>;
      timing: { start: number; end: number };
    }[];
  }> {
    try {
      const response = await axios.post(
        `${this.apiUrl}/ai/audio-emotion-enhance`,
        {
          audioUrl,
          emotionalData
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error enhancing audio with emotion:', error);
      throw error;
    }
  }

  async generateEmotionalStoryboard(
    script: string,
    options: {
      emotionalArc?: {
        type: string;
        intensity: number;
        timing: { start: number; end: number };
      }[];
      style?: string;
      visualReferences?: string[];
    } = {}
  ): Promise<{
    scenes: {
      id: string;
      description: string;
      emotion: {
        primary: string;
        secondary?: string;
        intensity: number;
      };
      visualSuggestions: {
        composition: string;
        lighting: string;
        color: string;
        camera: string;
      };
      elements: {
        type: string;
        description: string;
        emotion?: string;
        position?: { x: number; y: number };
      }[];
      duration: number;
      transitions: {
        in?: string;
        out?: string;
        params?: Record<string, any>;
      };
      audioSuggestions: {
        music?: string;
        sfx?: string[];
        mood: string;
      };
      previewImage: string;
    }[];
    emotionalFlow: {
      timeline: {
        time: number;
        emotion: string;
        intensity: number;
      }[];
      peaks: number[];
      resolution: number;
    };
  }> {
    try {
      const response = await axios.post(
        `${this.apiUrl}/ai/emotional-storyboard`,
        {
          script,
          options
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error generating emotional storyboard:', error);
      throw error;
    }
  }
}

export default AIService;
