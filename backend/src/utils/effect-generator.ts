import { createFFmpeg, fetchFile, FFmpeg } from '@ffmpeg/ffmpeg';

interface BeatSyncOptions {
  timing: number[];
  effect: 'flash' | 'zoom' | 'shake';
  intensity?: number;
}

interface ParticleEffect {
  type: 'sparkle' | 'confetti' | 'rain' | 'snow';
  density?: number;
  duration?: number;
  color?: string;
}

type TransitionType = 'fade' | 'wipe' | 'dissolve';

interface FilterConfig {
  filter: string;
  options?: string;
}

type FFmpegArgs = string[];

export class EffectGenerator {
  private ffmpeg: FFmpeg;
  private initialized: boolean;
  private readonly defaultIntensity = 1.0;
  private readonly defaultDensity = 0.5;
  private readonly defaultDuration = 1.0;
  private readonly defaultColor = 'white';

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
        throw new Error('Failed to initialize effect generator');
      }
    }
  }

  private async ensureInitialized(): Promise<void> {
    if (!this.initialized) {
      throw new Error('Effect generator not initialized');
    }
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

  private buildBeatSyncFilter(options: BeatSyncOptions): string {
    const intensity = options.intensity || this.defaultIntensity;
    
    switch (options.effect) {
      case 'flash':
        return options.timing
          .map(time => `eq=brightness=${intensity}:enable='between(t,${time},${time + 0.1})'`)
          .join(',');
      case 'zoom':
        return options.timing
          .map(time => `zoompan=z='if(between(t,${time},${time + 0.2}),1.5,1)':d=1:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)'`)
          .join(',');
      case 'shake':
        return options.timing
          .map(time => `rotate=t*${intensity}*sin(t*10):c=none:enable='between(t,${time},${time + 0.2})'`)
          .join(',');
      default:
        throw new Error(`Unsupported beat sync effect: ${options.effect}`);
    }
  }

  private buildParticleFilter(effect: ParticleEffect): string {
    const density = effect.density || this.defaultDensity;
    const duration = effect.duration || this.defaultDuration;
    const color = effect.color || this.defaultColor;

    switch (effect.type) {
      case 'sparkle':
        return `gblur=sigma=${density}:steps=6:planes=1:enable='between(t,0,${duration})'`;
      case 'confetti':
        return `colorkey=color=${color}:similarity=0.3,format=rgba,boxblur=2:enable='between(t,0,${duration})'`;
      case 'rain':
        return `format=gray,curves=preset=negative:enable='between(t,0,${duration})'`;
      case 'snow':
        return `noise=alls=${density * 100}:allf=t+u:enable='between(t,0,${duration})'`;
      default:
        throw new Error(`Unsupported particle effect: ${effect.type}`);
    }
  }

  private buildTransitionFilter(type: TransitionType, duration: number): string {
    switch (type) {
      case 'fade':
        return `[0:v][1:v]xfade=transition=fade:duration=${duration}:offset=0[v]`;
      case 'wipe':
        return `[0:v][1:v]xfade=transition=wiperight:duration=${duration}:offset=0[v]`;
      case 'dissolve':
        return `[0:v][1:v]xfade=transition=dissolve:duration=${duration}:offset=0[v]`;
      default:
        throw new Error(`Unsupported transition type: ${type}`);
    }
  }

  async generateBeatSyncEffect(videoBuffer: Buffer, options: BeatSyncOptions): Promise<Buffer> {
    await this.ensureInitialized();

    const inputFileName = 'input.mp4';
    const outputFileName = 'output.mp4';
    const filesToCleanup = [inputFileName, outputFileName];

    try {
      await this.ffmpeg.FS('writeFile', inputFileName, await fetchFile(videoBuffer));

      const filterComplex = this.buildBeatSyncFilter(options);
      const args: FFmpegArgs = [
        '-i', inputFileName,
        '-vf', filterComplex,
        '-c:v', 'libx264',
        '-preset', 'medium',
        '-crf', '23',
        '-c:a', 'copy',
        outputFileName
      ];

      await this.ffmpeg.run(...args);
      const data = await this.ffmpeg.FS('readFile', outputFileName);
      await this.cleanup(filesToCleanup);

      return Buffer.from(data);
    } catch (error) {
      await this.cleanup(filesToCleanup);
      console.error('Error generating beat sync effect:', error);
      throw new Error('Beat sync effect generation failed');
    }
  }

  async generateParticleEffect(videoBuffer: Buffer, effect: ParticleEffect): Promise<Buffer> {
    await this.ensureInitialized();

    const inputFileName = 'input.mp4';
    const outputFileName = 'output.mp4';
    const filesToCleanup = [inputFileName, outputFileName];

    try {
      await this.ffmpeg.FS('writeFile', inputFileName, await fetchFile(videoBuffer));

      const filterComplex = this.buildParticleFilter(effect);
      const args: FFmpegArgs = [
        '-i', inputFileName,
        '-vf', filterComplex,
        '-c:v', 'libx264',
        '-preset', 'medium',
        '-crf', '23',
        '-c:a', 'copy',
        outputFileName
      ];

      await this.ffmpeg.run(...args);
      const data = await this.ffmpeg.FS('readFile', outputFileName);
      await this.cleanup(filesToCleanup);

      return Buffer.from(data);
    } catch (error) {
      await this.cleanup(filesToCleanup);
      console.error('Error generating particle effect:', error);
      throw new Error('Particle effect generation failed');
    }
  }

  async generateTransitionEffect(video1: Buffer, video2: Buffer, type: TransitionType, duration: number = this.defaultDuration): Promise<Buffer> {
    await this.ensureInitialized();

    const input1FileName = 'input1.mp4';
    const input2FileName = 'input2.mp4';
    const outputFileName = 'output.mp4';
    const filesToCleanup = [input1FileName, input2FileName, outputFileName];

    try {
      await Promise.all([
        this.ffmpeg.FS('writeFile', input1FileName, await fetchFile(video1)),
        this.ffmpeg.FS('writeFile', input2FileName, await fetchFile(video2))
      ]);

      const filterComplex = this.buildTransitionFilter(type, duration);
      const args: FFmpegArgs = [
        '-i', input1FileName,
        '-i', input2FileName,
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
      console.error('Error generating transition effect:', error);
      throw new Error('Transition effect generation failed');
    }
  }
}
