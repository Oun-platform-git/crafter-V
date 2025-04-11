import ffmpeg from 'fluent-ffmpeg';
import path from 'path';
import { promises as fs } from 'fs';
import { v4 as uuidv4 } from 'uuid';

interface Effect {
  id: string;
  name: string;
  command: (input: string, output: string) => Promise<void>;
}

interface Transition {
  id: string;
  name: string;
  command: (input1: string, input2: string, output: string, duration: number) => Promise<void>;
}

const TEMP_DIR = path.join(__dirname, '../../temp');
const OUTPUT_DIR = path.join(__dirname, '../../public/processed');

// Ensure directories exist
(async () => {
  await fs.mkdir(TEMP_DIR, { recursive: true });
  await fs.mkdir(OUTPUT_DIR, { recursive: true });
})();

const EFFECTS: Record<string, Effect> = {
  blur: {
    id: 'blur',
    name: 'Blur',
    command: async (input: string, output: string) => {
      return new Promise((resolve, reject) => {
        ffmpeg(input)
          .videoFilter('boxblur=10:1')
          .save(output)
          .on('end', resolve)
          .on('error', reject);
      });
    }
  },
  flash: {
    id: 'flash',
    name: 'Flash',
    command: async (input: string, output: string) => {
      return new Promise((resolve, reject) => {
        ffmpeg(input)
          .videoFilter('curves=lighter')
          .save(output)
          .on('end', resolve)
          .on('error', reject);
      });
    }
  },
  shake: {
    id: 'shake',
    name: 'Shake',
    command: async (input: string, output: string) => {
      return new Promise((resolve, reject) => {
        ffmpeg(input)
          .videoFilter('crop=in_w-4:in_h-4:random(4):random(4)')
          .save(output)
          .on('end', resolve)
          .on('error', reject);
      });
    }
  },
  zoom: {
    id: 'zoom',
    name: 'Zoom',
    command: async (input: string, output: string) => {
      return new Promise((resolve, reject) => {
        ffmpeg(input)
          .videoFilter('scale=2*iw:-1,crop=iw/2:ih/2')
          .save(output)
          .on('end', resolve)
          .on('error', reject);
      });
    }
  }
};

const TRANSITIONS: Record<string, Transition> = {
  fade: {
    id: 'fade',
    name: 'Fade',
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
          .on('end', resolve)
          .on('error', reject);
      });
    }
  },
  wipe: {
    id: 'wipe',
    name: 'Wipe',
    command: async (input1: string, input2: string, output: string, duration: number) => {
      return new Promise((resolve, reject) => {
        ffmpeg()
          .input(input1)
          .input(input2)
          .complexFilter([
            `[1:v][0:v]blend=all_expr='if(gte(X,W*T/${duration}),A,B)':shortest=1`
          ])
          .save(output)
          .on('end', resolve)
          .on('error', reject);
      });
    }
  },
  zoom: {
    id: 'zoom',
    name: 'Zoom',
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
          .on('end', resolve)
          .on('error', reject);
      });
    }
  }
};

export class VideoEffectsService {
  async applyEffect(videoPath: string, effectId: string): Promise<string> {
    const effect = EFFECTS[effectId];
    if (!effect) {
      throw new Error(`Effect ${effectId} not found`);
    }

    const outputFileName = `${uuidv4()}.mp4`;
    const outputPath = path.join(OUTPUT_DIR, outputFileName);

    await effect.command(videoPath, outputPath);
    return `/processed/${outputFileName}`;
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

    await transition.command(video1Path, video2Path, outputPath, duration);
    return `/processed/${outputFileName}`;
  }

  async cleanup(): Promise<void> {
    // Clean up temporary files older than 1 hour
    const files = await fs.readdir(TEMP_DIR);
    const now = Date.now();
    const oneHour = 60 * 60 * 1000;

    for (const file of files) {
      const filePath = path.join(TEMP_DIR, file);
      const stats = await fs.stat(filePath);
      if (now - stats.mtimeMs > oneHour) {
        await fs.unlink(filePath);
      }
    }
  }
}

export const videoEffectsService = new VideoEffectsService();
