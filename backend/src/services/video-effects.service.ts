import ffmpeg from 'fluent-ffmpeg';
import path from 'path';
import { promises as fs } from 'fs';
import { v4 as uuidv4 } from 'uuid';

interface Effect {
  id: string;
  name: string;
  icon: string;
  category: 'basic' | 'advanced' | 'motion' | 'audio';
  command: (input: string, output: string, options?: any) => Promise<string>;
}

interface Transition {
  id: string;
  name: string;
  icon: string;
  duration: number;
  category: 'basic' | 'motion' | 'fancy';
  command: (input1: string, input2: string, output: string, duration: number) => Promise<string>;
}

interface MotionTrackingOptions {
  targetObject?: string;
  sensitivity?: number;
  smoothing?: number;
}

interface AudioProcessingOptions {
  volume?: number;
  bass?: number;
  treble?: number;
  normalize?: boolean;
}

const TEMP_DIR = path.join(__dirname, '../../temp');
const OUTPUT_DIR = path.join(__dirname, '../../public/processed');

// Ensure directories exist
(async () => {
  await fs.mkdir(TEMP_DIR, { recursive: true });
  await fs.mkdir(OUTPUT_DIR, { recursive: true });
})();

const EFFECTS: Record<string, Effect> = {
  // Basic Effects
  blur: {
    id: 'blur',
    name: 'Blur',
    icon: '🌫️',
    category: 'basic',
    command: async (input: string, output: string, options?: { strength?: number }) => {
      const strength = options?.strength || 10;
      return new Promise((resolve, reject) => {
        ffmpeg(input)
          .videoFilter(`boxblur=${strength}:1`)
          .save(output)
          .on('end', () => resolve(output))
          .on('error', reject);
      });
    }
  },
  flash: {
    id: 'flash',
    name: 'Flash',
    icon: '⚡',
    category: 'basic',
    command: async (input: string, output: string) => {
      return new Promise((resolve, reject) => {
        ffmpeg(input)
          .videoFilter('curves=lighter')
          .save(output)
          .on('end', () => resolve(output))
          .on('error', reject);
      });
    }
  },

  // Motion Effects
  motionTrack: {
    id: 'motionTrack',
    name: 'Motion Track',
    icon: '🎯',
    category: 'motion',
    command: async (input: string, output: string, options?: MotionTrackingOptions) => {
      const sensitivity = options?.sensitivity || 0.5;
      const smoothing = options?.smoothing || 0.3;
      return new Promise((resolve, reject) => {
        ffmpeg(input)
          .videoFilter([
            'select=gt(scene,0.1)',
            `vidstabdetect=shakiness=10:accuracy=15:stepsize=6:mincontrast=0.3:show=0`,
            `vidstabtransform=smoothing=${smoothing}:maxangle=0:maxshift=0:maxangle=0:crop=black:optzoom=0`
          ])
          .save(output)
          .on('end', () => resolve(output))
          .on('error', reject);
      });
    }
  },
  zoom: {
    id: 'zoom',
    name: 'Smart Zoom',
    icon: '🔍',
    category: 'motion',
    command: async (input: string, output: string, options?: { zoomSpeed?: number }) => {
      const zoomSpeed = options?.zoomSpeed || 1;
      return new Promise((resolve, reject) => {
        ffmpeg(input)
          .videoFilter(`zoompan=z='min(zoom+${zoomSpeed}*0.002,1.5)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)'`)
          .save(output)
          .on('end', () => resolve(output))
          .on('error', reject);
      });
    }
  },

  // Audio Effects
  bassBoost: {
    id: 'bassBoost',
    name: 'Bass Boost',
    icon: '🎵',
    category: 'audio',
    command: async (input: string, output: string, options?: AudioProcessingOptions) => {
      const bass = options?.bass || 10;
      return new Promise((resolve, reject) => {
        ffmpeg(input)
          .audioFilter(`bass=g=${bass}`)
          .save(output)
          .on('end', () => resolve(output))
          .on('error', reject);
      });
    }
  },
  normalize: {
    id: 'normalize',
    name: 'Normalize Audio',
    icon: '🔊',
    category: 'audio',
    command: async (input: string, output: string) => {
      return new Promise((resolve, reject) => {
        ffmpeg(input)
          .audioFilter('loudnorm')
          .save(output)
          .on('end', () => resolve(output))
          .on('error', reject);
      });
    }
  }
};

const TRANSITIONS: Record<string, Transition> = {
  // Basic Transitions
  fade: {
    id: 'fade',
    name: 'Fade',
    icon: '🌫️',
    duration: 0.5,
    category: 'basic',
    command: async (input1: string, input2: string, output: string, duration: number) => {
      return new Promise((resolve, reject) => {
        ffmpeg()
          .input(input1)
          .input(input2)
          .complexFilter([
            `[0:v]fade=t=out:st=${duration-0.5}:d=0.5[v0]`,
            `[1:v]fade=t=in:st=0:d=0.5[v1]`,
            '[v0][v1]concat=n=2:v=1:a=0'
          ])
          .save(output)
          .on('end', () => resolve(output))
          .on('error', reject);
      });
    }
  },

  // Motion Transitions
  zoom: {
    id: 'zoom',
    name: 'Zoom Transition',
    icon: '🔍',
    duration: 0.6,
    category: 'motion',
    command: async (input1: string, input2: string, output: string, duration: number) => {
      return new Promise((resolve, reject) => {
        ffmpeg()
          .input(input1)
          .input(input2)
          .complexFilter([
            `[0:v]scale=2*iw:-1,crop=iw/2:ih/2[v0]`,
            `[1:v]scale=2*iw:-1,crop=iw/2:ih/2[v1]`,
            '[v0][v1]concat=n=2:v=1:a=0'
          ])
          .save(output)
          .on('end', () => resolve(output))
          .on('error', reject);
      });
    }
  },

  // Fancy Transitions
  glitch: {
    id: 'glitch',
    name: 'Glitch',
    icon: '⚡',
    duration: 0.4,
    category: 'fancy',
    command: async (input1: string, input2: string, output: string, duration: number) => {
      return new Promise((resolve, reject) => {
        ffmpeg()
          .input(input1)
          .input(input2)
          .complexFilter([
            `[0:v]gblur=sigma=10,chromakey=color=black:similarity=0.01[v0]`,
            `[1:v]gblur=sigma=10[v1]`,
            '[v0][v1]blend=all_expr=\'if(gte(random(0), 0.5), A, B)\''
          ])
          .save(output)
          .on('end', () => resolve(output))
          .on('error', reject);
      });
    }
  }
};

export class VideoEffectsService {
  async getEffects(): Promise<Effect[]> {
    return Object.values(EFFECTS);
  }

  async getEffectsByCategory(category: Effect['category']): Promise<Effect[]> {
    return Object.values(EFFECTS).filter(effect => effect.category === category);
  }

  async getTransitions(): Promise<Transition[]> {
    return Object.values(TRANSITIONS);
  }

  async getTransitionsByCategory(category: Transition['category']): Promise<Transition[]> {
    return Object.values(TRANSITIONS).filter(transition => transition.category === category);
  }

  async applyEffect(videoPath: string, effectId: string, options?: any): Promise<string> {
    const effect = EFFECTS[effectId];
    if (!effect) {
      throw new Error(`Effect ${effectId} not found`);
    }

    const outputFileName = `${uuidv4()}.mp4`;
    const outputPath = path.join(OUTPUT_DIR, outputFileName);

    try {
      await effect.command(videoPath, outputPath, options);
      return `/processed/${outputFileName}`;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`Failed to apply effect: ${errorMessage}`);
    }
  }

  async applyTransition(
    video1Path: string,
    video2Path: string,
    transitionId: string,
    duration: number
  ): Promise<string> {
    const transition = TRANSITIONS[transitionId];
    if (!transition) {
      throw new Error(`Transition ${transitionId} not found`);
    }

    const outputFileName = `${uuidv4()}.mp4`;
    const outputPath = path.join(OUTPUT_DIR, outputFileName);

    try {
      await transition.command(video1Path, video2Path, outputPath, duration);
      return `/processed/${outputFileName}`;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`Failed to apply transition: ${errorMessage}`);
    }
  }

  async applyBatchEffects(videoPath: string, effects: Array<{ id: string; options?: any }>): Promise<string> {
    let currentVideoPath = videoPath;
    
    for (const { id, options } of effects) {
      const effect = EFFECTS[id];
      if (!effect) {
        throw new Error(`Effect ${id} not found`);
      }

      const outputFileName = `${uuidv4()}.mp4`;
      const outputPath = path.join(TEMP_DIR, outputFileName);

      try {
        await effect.command(currentVideoPath, outputPath, options);
        if (currentVideoPath !== videoPath) {
          await fs.unlink(currentVideoPath);
        }
        currentVideoPath = outputPath;
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        throw new Error(`Failed to apply effect ${id}: ${errorMessage}`);
      }
    }

    const finalOutputFileName = `${uuidv4()}.mp4`;
    const finalOutputPath = path.join(OUTPUT_DIR, finalOutputFileName);
    await fs.copyFile(currentVideoPath, finalOutputPath);
    await fs.unlink(currentVideoPath);

    return `/processed/${finalOutputFileName}`;
  }

  async generatePreview(videoPath: string, effectId: string, options?: any): Promise<string> {
    const effect = EFFECTS[effectId];
    if (!effect) {
      throw new Error(`Effect ${effectId} not found`);
    }

    const outputFileName = `preview_${uuidv4()}.mp4`;
    const outputPath = path.join(TEMP_DIR, outputFileName);

    try {
      // Generate a short preview (3 seconds from the middle of the video)
      await new Promise((resolve, reject) => {
        ffmpeg(videoPath)
          .setStartTime('00:00:03')
          .setDuration(3)
          .output(outputPath)
          .on('end', resolve)
          .on('error', reject)
          .run();
      });

      const previewOutputFileName = `${uuidv4()}.mp4`;
      const previewOutputPath = path.join(OUTPUT_DIR, previewOutputFileName);
      
      await effect.command(outputPath, previewOutputPath, options);
      await fs.unlink(outputPath);

      return `/processed/${previewOutputFileName}`;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`Failed to generate preview: ${errorMessage}`);
    }
  }

  async cleanup(): Promise<void> {
    try {
      const [tempFiles, outputFiles] = await Promise.all([
        fs.readdir(TEMP_DIR),
        fs.readdir(OUTPUT_DIR)
      ]);

      const now = Date.now();
      const oneHour = 60 * 60 * 1000;
      const oneDay = 24 * oneHour;

      // Clean up temp files older than 1 hour
      for (const file of tempFiles) {
        const filePath = path.join(TEMP_DIR, file);
        const stats = await fs.stat(filePath);
        if (now - stats.mtimeMs > oneHour) {
          try {
            await fs.unlink(filePath);
          } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            console.error(`Failed to delete temp file: ${errorMessage}`);
          }
        }
      }

      // Clean up processed files older than 1 day
      for (const file of outputFiles) {
        const filePath = path.join(OUTPUT_DIR, file);
        const stats = await fs.stat(filePath);
        if (now - stats.mtimeMs > oneDay) {
          try {
            await fs.unlink(filePath);
          } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            console.error(`Failed to delete processed file: ${errorMessage}`);
          }
        }
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error(`Cleanup error: ${errorMessage}`);
    }
  }
}
