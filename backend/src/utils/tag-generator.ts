import { MediaAnalyzer } from './media-analyzer';
import { ImageAnalyzer } from '@tensorflow/tfjs-node';

interface TagGeneratorResult {
  tags: string[];
  mood: string[];
  genre?: string;
}

export class TagGenerator {
  private mediaAnalyzer: MediaAnalyzer;
  private imageAnalyzer: ImageAnalyzer;

  constructor() {
    this.mediaAnalyzer = new MediaAnalyzer();
    this.imageAnalyzer = new ImageAnalyzer();
  }

  async generateTags(file: Buffer, type: 'music' | 'sfx' | 'video' | 'image'): Promise<TagGeneratorResult> {
    try {
      switch (type) {
        case 'music':
          return this.generateMusicTags(file);
        case 'sfx':
          return this.generateSfxTags(file);
        case 'video':
          return this.generateVideoTags(file);
        case 'image':
          return this.generateImageTags(file);
        default:
          throw new Error('Invalid media type');
      }
    } catch (error) {
      console.error('Error generating tags:', error);
      throw new Error('Failed to generate tags');
    }
  }

  private async generateMusicTags(file: Buffer): Promise<TagGeneratorResult> {
    const analysis = await this.mediaAnalyzer.analyzeAudio(file);
    
    return {
      tags: [
        `${analysis.bpm}bpm`,
        analysis.key.toLowerCase(),
        ...analysis.segments.map(s => s.type)
      ],
      mood: analysis.mood,
      genre: analysis.genre[0]
    };
  }

  private async generateSfxTags(file: Buffer): Promise<TagGeneratorResult> {
    const analysis = await this.mediaAnalyzer.analyzeAudio(file);
    
    return {
      tags: [
        'sfx',
        ...analysis.segments.map(s => s.type),
        analysis.mood[0]
      ],
      mood: analysis.mood
    };
  }

  private async generateVideoTags(file: Buffer): Promise<TagGeneratorResult> {
    // Extract video frames and analyze them
    const frames = await this.extractKeyFrames(file);
    const imageTags = await Promise.all(
      frames.map(frame => this.generateImageTags(frame))
    );

    // Combine tags from all frames
    const allTags = new Set<string>();
    const allMoods = new Set<string>();

    imageTags.forEach(result => {
      result.tags.forEach(tag => allTags.add(tag));
      result.mood.forEach(mood => allMoods.add(mood));
    });

    return {
      tags: Array.from(allTags),
      mood: Array.from(allMoods)
    };
  }

  private async generateImageTags(file: Buffer): Promise<TagGeneratorResult> {
    const predictions = await this.imageAnalyzer.classify(file);
    const tags = predictions
      .filter(p => p.probability > 0.5)
      .map(p => p.className.toLowerCase());

    const mood = this.inferMoodFromTags(tags);

    return {
      tags,
      mood
    };
  }

  private async extractKeyFrames(videoBuffer: Buffer): Promise<Buffer[]> {
    // Implementation would use ffmpeg to extract key frames
    // This is a placeholder
    return [];
  }

  private inferMoodFromTags(tags: string[]): string[] {
    const moodMap: { [key: string]: string[] } = {
      'sunset': ['peaceful', 'calm'],
      'beach': ['relaxing', 'peaceful'],
      'mountain': ['majestic', 'inspiring'],
      'city': ['energetic', 'busy'],
      'forest': ['calm', 'natural'],
      'party': ['energetic', 'fun'],
      'concert': ['exciting', 'energetic']
    };

    const moods = new Set<string>();
    tags.forEach(tag => {
      const associatedMoods = moodMap[tag];
      if (associatedMoods) {
        associatedMoods.forEach(mood => moods.add(mood));
      }
    });

    return Array.from(moods);
  }
}
