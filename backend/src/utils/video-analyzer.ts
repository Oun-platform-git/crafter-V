import * as tf from '@tensorflow/tfjs-node';
import ffmpeg from 'fluent-ffmpeg';
import { spawn } from 'child_process';
import { createReadStream } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { promisify } from 'util';
import { mkdir, writeFile, unlink } from 'fs/promises';

export interface SceneChange {
  timestamp: number;
  confidence: number;
}

export interface EngagementMetrics {
  timestamp: number;
  score: number;
  type: 'high' | 'medium' | 'low';
}

export class VideoAnalyzer {
  private model: tf.LayersModel | null = null;
  private readonly tempDir: string;

  constructor() {
    this.tempDir = join(tmpdir(), 'crafter-video-analysis');
    this.initializeModel();
    this.ensureTempDir();
  }

  private async ensureTempDir() {
    try {
      await mkdir(this.tempDir, { recursive: true });
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'EEXIST') {
        throw error;
      }
    }
  }

  private async initializeModel() {
    try {
      // Load pre-trained model for engagement prediction
      this.model = await tf.loadLayersModel('file://path/to/engagement-model/model.json');
    } catch (error) {
      console.error('Error loading engagement model:', error);
      throw new Error('Failed to initialize video analysis model');
    }
  }

  async detectSceneChanges(videoBuffer: Buffer): Promise<SceneChange[]> {
    const tempFile = join(this.tempDir, `${Date.now()}.mp4`);
    const sceneChanges: SceneChange[] = [];

    try {
      await writeFile(tempFile, videoBuffer);

      await new Promise<void>((resolve, reject) => {
        ffmpeg()
          .input(tempFile)
          .outputOptions([
            '-vf "select=gt(scene\\,0.3)"',
            '-f null'
          ])
          .on('stderr', (stderrLine: string) => {
            const match = stderrLine.match(/scene:(\d+\.\d+)/);
            if (match) {
              const confidence = parseFloat(match[1]);
              const timestamp = this.parseTimestamp(stderrLine);
              sceneChanges.push({ timestamp, confidence });
            }
          })
          .on('end', () => resolve())
          .on('error', (error: Error) => reject(error))
          .save('pipe:1');
      });

      return sceneChanges;
    } finally {
      try {
        await unlink(tempFile);
      } catch (error) {
        console.error('Error cleaning up temp file:', error);
      }
    }
  }

  async analyzeEngagement(videoBuffer: Buffer): Promise<EngagementMetrics[]> {
    if (!this.model) {
      throw new Error('Engagement analysis model not initialized');
    }

    const frames = await this.extractKeyFrames(videoBuffer);
    const metrics: EngagementMetrics[] = [];

    for (const frame of frames) {
      const tensor = await this.preprocessFrame(frame.data);
      const prediction = this.model.predict(tensor) as tf.Tensor;
      const score = (await prediction.data())[0];

      metrics.push({
        timestamp: frame.timestamp,
        score,
        type: this.getEngagementType(score)
      });

      tensor.dispose();
      prediction.dispose();
    }

    return metrics;
  }

  private async extractKeyFrames(videoBuffer: Buffer): Promise<Array<{ timestamp: number; data: Buffer }>> {
    const tempFile = join(this.tempDir, `${Date.now()}.mp4`);
    const frames: Array<{ timestamp: number; data: Buffer }> = [];

    try {
      await writeFile(tempFile, videoBuffer);

      await new Promise<void>((resolve, reject) => {
        const command = ffmpeg()
          .input(tempFile)
          .outputOptions([
            '-vf fps=1',
            '-frame_pts 1'
          ])
          .on('end', () => resolve())
          .on('error', (error: Error) => reject(error));

        command.outputFormat('rawvideo')
          .on('data', (chunk: Buffer) => {
            const timestamp = Date.now() / 1000; // Current time in seconds
            frames.push({ timestamp, data: chunk });
          })
          .pipe();
      });

      return frames;
    } finally {
      try {
        await unlink(tempFile);
      } catch (error) {
        console.error('Error cleaning up temp file:', error);
      }
    }
  }

  private async preprocessFrame(frameBuffer: Buffer): Promise<tf.Tensor> {
    const tensor = tf.node.decodeImage(frameBuffer);
    return tf.image.resizeBilinear(tensor, [224, 224])
      .expandDims(0)
      .toFloat()
      .div(255.0);
  }

  private getEngagementType(score: number): 'high' | 'medium' | 'low' {
    if (score >= 0.7) return 'high';
    if (score >= 0.4) return 'medium';
    return 'low';
  }

  private parseTimestamp(ffmpegOutput: string): number {
    const timeMatch = ffmpegOutput.match(/time=(\d+:\d+:\d+\.\d+)/);
    if (!timeMatch) return 0;

    const [hours, minutes, seconds] = timeMatch[1].split(':').map(Number);
    return hours * 3600 + minutes * 60 + seconds;
  }
}
