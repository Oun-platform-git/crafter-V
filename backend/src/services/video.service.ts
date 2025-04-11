import { createFFmpeg, fetchFile, FFmpeg } from '@ffmpeg/ffmpeg';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

const mkdir = promisify(fs.mkdir);
const writeFile = promisify(fs.writeFile);
const unlink = promisify(fs.unlink);

interface VideoProcessingOptions {
  format?: 'mp4' | 'webm' | 'mov';
  resolution?: '1080p' | '720p' | '480p' | '360p';
  fps?: number;
  startTime?: number;
  duration?: number;
}

const RESOLUTION_MAP = {
  '1080p': '1920x1080',
  '720p': '1280x720',
  '480p': '854x480',
  '360p': '640x360'
};

export class VideoService {
  private ffmpeg: FFmpeg;
  private initialized: boolean;

  constructor() {
    this.ffmpeg = createFFmpeg({ log: true });
    this.initialized = false;
    this.init().catch(error => {
      console.error('Failed to initialize FFmpeg:', error);
    });
  }

  private async init(): Promise<void> {
    if (!this.initialized) {
      await this.ffmpeg.load();
      this.initialized = true;
    }
  }

  async processVideo(inputBuffer: Buffer, options: VideoProcessingOptions): Promise<Buffer> {
    await this.init();

    const format = options.format || 'mp4';
    const inputFileName = `input.${format}`;
    const outputFileName = `output.${format}`;

    try {
      // Write input file to memory
      this.ffmpeg.FS('writeFile', inputFileName, await fetchFile(inputBuffer));

      // Build FFmpeg command
      const args: string[] = ['-i', inputFileName];
      
      if (options.resolution) {
        const resolution = RESOLUTION_MAP[options.resolution];
        if (resolution) {
          args.push('-s', resolution);
        }
      }
      
      if (options.fps && options.fps > 0) {
        args.push('-r', options.fps.toString());
      }
      
      if (options.startTime !== undefined && options.startTime >= 0) {
        args.push('-ss', options.startTime.toString());
      }
      
      if (options.duration !== undefined && options.duration > 0) {
        args.push('-t', options.duration.toString());
      }
      
      args.push(outputFileName);

      // Run FFmpeg command
      await this.ffmpeg.run(...args);

      // Read the output file
      const data = this.ffmpeg.FS('readFile', outputFileName);

      // Clean up files
      this.ffmpeg.FS('unlink', inputFileName);
      this.ffmpeg.FS('unlink', outputFileName);

      return Buffer.from(data);
    } catch (error) {
      console.error('Error processing video:', error);
      throw new Error('Video processing failed');
    }
  }

  async extractThumbnail(videoBuffer: Buffer, timestamp: number = 0): Promise<Buffer> {
    if (timestamp < 0) {
      throw new Error('Timestamp must be non-negative');
    }

    await this.init();

    const inputFileName = 'input.mp4';
    const outputFileName = 'thumbnail.jpg';

    try {
      this.ffmpeg.FS('writeFile', inputFileName, await fetchFile(videoBuffer));

      await this.ffmpeg.run(
        '-i', inputFileName,
        '-ss', timestamp.toString(),
        '-frames:v', '1',
        '-f', 'image2',
        '-q:v', '2', // High quality
        outputFileName
      );

      const data = this.ffmpeg.FS('readFile', outputFileName);

      this.ffmpeg.FS('unlink', inputFileName);
      this.ffmpeg.FS('unlink', outputFileName);

      return Buffer.from(data);
    } catch (error) {
      console.error('Error extracting thumbnail:', error);
      throw new Error('Thumbnail extraction failed');
    }
  }

  async mergeVideos(videoBuffers: Buffer[]): Promise<Buffer> {
    if (!videoBuffers.length) {
      throw new Error('No videos provided for merging');
    }

    await this.init();

    try {
      // Create a temporary file list
      const fileList = videoBuffers.map((_, i) => `file 'input${i}.mp4'`).join('\n');
      
      // Write input files
      await Promise.all(videoBuffers.map(async (buffer, i) => {
        const fileName = `input${i}.mp4`;
        this.ffmpeg.FS('writeFile', fileName, await fetchFile(buffer));
      }));

      // Write the file list
      this.ffmpeg.FS('writeFile', 'list.txt', new TextEncoder().encode(fileList));

      // Merge videos
      await this.ffmpeg.run(
        '-f', 'concat',
        '-safe', '0',
        '-i', 'list.txt',
        '-c', 'copy',
        'output.mp4'
      );

      // Read the output
      const data = this.ffmpeg.FS('readFile', 'output.mp4');

      // Clean up
      videoBuffers.forEach((_, i) => {
        this.ffmpeg.FS('unlink', `input${i}.mp4`);
      });
      this.ffmpeg.FS('unlink', 'list.txt');
      this.ffmpeg.FS('unlink', 'output.mp4');

      return Buffer.from(data);
    } catch (error) {
      console.error('Error merging videos:', error);
      throw new Error('Video merge failed');
    }
  }
}
