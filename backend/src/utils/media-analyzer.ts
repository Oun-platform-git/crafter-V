import { AudioContext } from 'node-web-audio-api';
import { Essentia, EssentiaWASM } from 'essentia.js';

interface AudioFeatures {
  danceability: number;
  dynamicComplexity: number;
  averageLoudness: number;
  dissonance: number;
}

interface SegmentFeatures {
  loudness: number;
  dissonance: number;
  spectralCentroid: number;
}

interface KeyAnalysis {
  key: string;
  scale: string;
}

interface RhythmAnalysis {
  bpm: number;
}

interface SegmentationAnalysis {
  boundaries: number[];
  features: SegmentFeatures[];
}

interface AudioSegment {
  start: number;
  end: number;
  type: string;
}

interface AudioAnalysisResult {
  bpm: number;
  key: string;
  mood: string[];
  genre: string[];
  segments: AudioSegment[];
}

type MusicExtractorResult = {
  danceability: number;
  dynamicComplexity: number;
  averageLoudness: number;
  dissonance: number;
  segmentation: SegmentationAnalysis;
};

export class MediaAnalyzer {
  private essentia: Essentia | null = null;
  private audioContext: AudioContext;
  private readonly defaultBPM = 120;
  private readonly defaultKey = 'C major';

  constructor() {
    this.audioContext = new AudioContext();
    this.initializeEssentia().catch(error => {
      console.error('Failed to initialize Essentia:', error);
    });
  }

  private async initializeEssentia(): Promise<void> {
    try {
      const wasmModule = await EssentiaWASM();
      this.essentia = new Essentia(wasmModule);
    } catch (error) {
      console.error('Error initializing Essentia:', error);
      throw new Error('Failed to initialize audio analysis engine');
    }
  }

  async analyzeAudio(buffer: Buffer): Promise<AudioAnalysisResult> {
    try {
      if (!this.essentia) {
        throw new Error('Audio analysis engine not initialized');
      }

      // Convert buffer to AudioBuffer
      const audioBuffer = await this.audioContext.decodeAudioData(buffer);
      const audioData = audioBuffer.getChannelData(0); // Get first channel

      // Run all analyses in parallel for better performance
      const [bpm, key, mood, genre, segments] = await Promise.all([
        this.analyzeBPM(audioData),
        this.analyzeKey(audioData),
        this.analyzeMood(audioData),
        this.analyzeGenre(audioData),
        this.analyzeSegments(audioData)
      ]);

      return {
        bpm,
        key,
        mood,
        genre,
        segments
      };
    } catch (error) {
      console.error('Error analyzing audio:', error);
      throw new Error('Failed to analyze audio');
    }
  }

  private async analyzeBPM(audioData: Float32Array): Promise<number> {
    try {
      if (!this.essentia) {
        throw new Error('Audio analysis engine not initialized');
      }

      const rhythm = this.essentia.RhythmExtractor2013(audioData) as RhythmAnalysis;
      return Math.round(rhythm.bpm);
    } catch (error) {
      console.error('Error analyzing BPM:', error);
      return this.defaultBPM;
    }
  }

  private async analyzeKey(audioData: Float32Array): Promise<string> {
    try {
      if (!this.essentia) {
        throw new Error('Audio analysis engine not initialized');
      }

      const key = this.essentia.KeyExtractor(audioData) as KeyAnalysis;
      return `${key.key} ${key.scale}`;
    } catch (error) {
      console.error('Error analyzing key:', error);
      return this.defaultKey;
    }
  }

  private async analyzeMood(audioData: Float32Array): Promise<string[]> {
    try {
      if (!this.essentia) {
        throw new Error('Audio analysis engine not initialized');
      }

      const features = this.essentia.MusicExtractor(audioData) as MusicExtractorResult;
      const moods: string[] = [];

      // Map audio features to moods using threshold values
      if (features.danceability > 0.7) moods.push('energetic');
      if (features.dynamicComplexity > 0.7) moods.push('dramatic');
      if (features.averageLoudness < 0.3) moods.push('calm');
      if (features.dissonance > 0.7) moods.push('tense');

      return moods.length > 0 ? moods : ['neutral'];
    } catch (error) {
      console.error('Error analyzing mood:', error);
      return ['neutral'];
    }
  }

  private async analyzeGenre(audioData: Float32Array): Promise<string[]> {
    try {
      if (!this.essentia) {
        throw new Error('Audio analysis engine not initialized');
      }

      const features = this.essentia.MusicExtractor(audioData) as MusicExtractorResult;
      const genres: string[] = [];

      // Genre classification based on audio features
      if (features.danceability > 0.8) genres.push('electronic');
      if (features.averageLoudness > 0.8) genres.push('rock');
      if (features.dynamicComplexity < 0.3) genres.push('ambient');
      if (features.dissonance < 0.3) genres.push('classical');

      return genres.length > 0 ? genres : ['unknown'];
    } catch (error) {
      console.error('Error analyzing genre:', error);
      return ['unknown'];
    }
  }

  private async analyzeSegments(audioData: Float32Array): Promise<AudioSegment[]> {
    try {
      if (!this.essentia) {
        throw new Error('Audio analysis engine not initialized');
      }

      const { segmentation } = this.essentia.MusicExtractor(audioData) as MusicExtractorResult;
      const duration = audioData.length / this.audioContext.sampleRate;

      return segmentation.boundaries.map((boundary: number, index: number) => ({
        start: boundary,
        end: segmentation.boundaries[index + 1] || duration,
        type: this.classifySegment(segmentation.features[index])
      }));
    } catch (error) {
      console.error('Error analyzing segments:', error);
      return [{
        start: 0,
        end: audioData.length / this.audioContext.sampleRate,
        type: 'unknown'
      }];
    }
  }

  private classifySegment(features: SegmentFeatures): string {
    if (features.loudness > 0.8) return 'loud';
    if (features.dissonance > 0.7) return 'complex';
    if (features.spectralCentroid < 0.3) return 'bass';
    return 'mid';
  }
}
