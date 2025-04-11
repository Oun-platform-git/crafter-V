import { createFFmpeg, fetchFile, FFmpeg } from '@ffmpeg/ffmpeg';

interface VideoProcessorOptions {
  stabilize?: boolean;
  denoise?: boolean;
  enhanceQuality?: boolean;
  fps?: number;
  resolution?: string;
}

interface FilterConfig {
  filter: string;
  options?: string;
}

type FFmpegArgs = string[];

export class VideoProcessor {
  private ffmpeg: FFmpeg;
  private initialized: boolean;
  private readonly defaultFPS = 30;
  private readonly defaultResolution = '1920x1080';

  constructor() {
    this.ffmpeg = createFFmpeg({ 
      log: true,
      corePath: 'https://unpkg.com/@ffmpeg/core@0.11.0/dist/ffmpeg-core.js'
    });
    this.initialized = false;
    this.init().catch(error => {
      console.error('Failed to initialize FFmpeg:', error);
    });
  }

  private async init(): Promise<void> {
    if (!this.initialized) {
      try {
        await this.ffmpeg.load();
        this.initialized = true;
      } catch (error) {
        console.error('Error initializing FFmpeg:', error);
        throw new Error('Failed to initialize video processor');
      }
    }
  }

  private async ensureInitialized(): Promise<void> {
    if (!this.initialized) {
      throw new Error('Video processor not initialized');
    }
  }

  private buildFilterComplex(filters: FilterConfig[]): string {
    return filters
      .filter(f => f.filter)
      .map(f => f.options ? `${f.filter}=${f.options}` : f.filter)
      .join(',');
  }

  private async cleanup(files: string[]): Promise<void> {
    try {
      for (const file of files) {
        try {
          await this.ffmpeg.FS('unlink', file);
        } catch (error) {
          console.error(`Error cleaning up file ${file}:`, error);
        }
      }
    } catch (error) {
      console.error('Error during cleanup:', error);
    }
  }

  async processVideo(inputBuffer: Buffer, options: VideoProcessorOptions): Promise<Buffer> {
    await this.ensureInitialized();

    const inputFileName = 'input.mp4';
    const outputFileName = 'output.mp4';
    const filesToCleanup: string[] = [inputFileName, outputFileName];

    try {
      await this.ffmpeg.FS('writeFile', inputFileName, await fetchFile(inputBuffer));

      const filters: FilterConfig[] = [];
      if (options.stabilize) {
        filters.push({ filter: 'deshake' });
      }
      if (options.denoise) {
        filters.push({ filter: 'nlmeans', options: 'strength=7:patch=3:patch_distance=3' });
      }
      if (options.enhanceQuality) {
        filters.push({ filter: 'unsharp', options: '5:5:1.0:5:5:0.0' });
      }

      const args: FFmpegArgs = ['-i', inputFileName];

      if (filters.length > 0) {
        args.push('-vf', this.buildFilterComplex(filters));
      }

      args.push(
        '-r', `${options.fps || this.defaultFPS}`,
        '-s', options.resolution || this.defaultResolution,
        '-c:a', 'copy',
        outputFileName
      );

      await this.ffmpeg.run(...args);
      const data = await this.ffmpeg.FS('readFile', outputFileName);
      await this.cleanup(filesToCleanup);

      return Buffer.from(data);
    } catch (error) {
      await this.cleanup(filesToCleanup);
      console.error('Error processing video:', error);
      throw new Error('Video processing failed');
    }
  }

  async generateSplitScreen(videos: Buffer[]): Promise<Buffer> {
    if (videos.length < 2 || videos.length > 4) {
      throw new Error('Split screen requires 2-4 videos');
    }

    await this.ensureInitialized();

    const filesToCleanup: string[] = [];
    const outputFileName = 'output.mp4';
    filesToCleanup.push(outputFileName);

    try {
      // Write input files
      const inputs = await Promise.all(videos.map(async (video, i) => {
        const fileName = `input${i}.mp4`;
        filesToCleanup.push(fileName);
        await this.ffmpeg.FS('writeFile', fileName, await fetchFile(video));
        return fileName;
      }));

      let filterComplex: string;
      switch (videos.length) {
        case 2:
          filterComplex = '[0:v][1:v]hstack=inputs=2[v]';
          break;
        case 3:
          filterComplex = '[0:v][1:v]hstack=inputs=2[top];[top][2:v]vstack=inputs=2[v]';
          break;
        case 4:
          filterComplex = '[0:v][1:v]hstack=inputs=2[top];[2:v][3:v]hstack=inputs=2[bottom];[top][bottom]vstack=inputs=2[v]';
          break;
        default:
          throw new Error('Unsupported number of videos');
      }

      const args: FFmpegArgs = [
        ...inputs.flatMap(input => ['-i', input]),
        '-filter_complex', filterComplex,
        '-map', '[v]',
        '-c:v', 'libx264',
        '-preset', 'medium',
        '-crf', '23',
        outputFileName
      ];

      await this.ffmpeg.run(...args);
      const data = await this.ffmpeg.FS('readFile', outputFileName);
      await this.cleanup(filesToCleanup);

      return Buffer.from(data);
    } catch (error) {
      await this.cleanup(filesToCleanup);
      console.error('Error generating split screen:', error);
      throw new Error('Split screen generation failed');
    }
  }

  async stabilizeVideo(inputBuffer: Buffer): Promise<Buffer> {
    await this.ensureInitialized();

    const inputFileName = 'input.mp4';
    const outputFileName = 'output.mp4';
    const transformFileName = 'transforms.trf';
    const filesToCleanup = [inputFileName, outputFileName, transformFileName];

    try {
      await this.ffmpeg.FS('writeFile', inputFileName, await fetchFile(inputBuffer));

      // First pass: Analyze video and generate transform file
      const detectArgs: FFmpegArgs = [
        '-i', inputFileName,
        '-vf', 'vidstabdetect=shakiness=10:accuracy=15:result=transforms.trf',
        '-f', 'null',
        '-'
      ];
      await this.ffmpeg.run(...detectArgs);

      // Second pass: Apply stabilization
      const stabilizeArgs: FFmpegArgs = [
        '-i', inputFileName,
        '-vf', 'vidstabtransform=smoothing=30:input=transforms.trf,unsharp=5:5:0.8:3:3:0.4',
        '-c:v', 'libx264',
        '-preset', 'medium',
        '-crf', '23',
        '-c:a', 'copy',
        outputFileName
      ];
      await this.ffmpeg.run(...stabilizeArgs);

      const data = await this.ffmpeg.FS('readFile', outputFileName);
      await this.cleanup(filesToCleanup);

      return Buffer.from(data);
    } catch (error) {
      await this.cleanup(filesToCleanup);
      console.error('Error stabilizing video:', error);
      throw new Error('Video stabilization failed');
    }
  }
}
