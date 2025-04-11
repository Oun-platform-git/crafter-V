import axios from 'axios';

interface ProcessVideoOptions {
  effect?: string;
  trim?: { start: number; end: number };
  filters?: string[];
  outputFormat?: string;
}

class VideoProcessingService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.VITE_API_URL || 'http://localhost:3000/api';
  }

  async uploadVideo(videoBlob: Blob): Promise<string> {
    const formData = new FormData();
    formData.append('video', videoBlob);

    const response = await axios.post(`${this.baseUrl}/videos/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data.videoId;
  }

  async processVideo(videoId: string, options: ProcessVideoOptions): Promise<string> {
    const response = await axios.post(`${this.baseUrl}/videos/process`, {
      videoId,
      ...options,
    });

    return response.data.processedVideoUrl;
  }

  async applyEffect(videoId: string, effect: string): Promise<string> {
    return this.processVideo(videoId, { effect });
  }

  async trimVideo(videoId: string, start: number, end: number): Promise<string> {
    return this.processVideo(videoId, { trim: { start, end } });
  }

  async applyFilters(videoId: string, filters: string[]): Promise<string> {
    return this.processVideo(videoId, { filters });
  }

  async generateThumbnail(videoId: string): Promise<string> {
    const response = await axios.get(`${this.baseUrl}/videos/${videoId}/thumbnail`);
    return response.data.thumbnailUrl;
  }

  async addCaption(videoId: string, text: string, timestamp: number): Promise<void> {
    await axios.post(`${this.baseUrl}/videos/${videoId}/captions`, {
      text,
      timestamp,
    });
  }

  async addAudioTrack(videoId: string, audioBlob: Blob): Promise<string> {
    const formData = new FormData();
    formData.append('audio', audioBlob);

    const response = await axios.post(
      `${this.baseUrl}/videos/${videoId}/audio`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return response.data.processedVideoUrl;
  }

  async exportVideo(videoId: string, format: string): Promise<string> {
    const response = await axios.post(`${this.baseUrl}/videos/${videoId}/export`, {
      format,
    });

    return response.data.exportUrl;
  }
}

export const videoProcessingService = new VideoProcessingService();
