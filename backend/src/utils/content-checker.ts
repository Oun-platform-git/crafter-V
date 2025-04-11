import { RekognitionClient, DetectModerationLabelsCommand } from '@aws-sdk/client-rekognition';
import { ContentModeratorClient } from '@azure/cognitiveservices-contentmoderator';
import { ApiKeyCredentials } from '@azure/ms-rest-js';
import ffmpeg from 'fluent-ffmpeg';
import { join } from 'path';
import { tmpdir } from 'os';
import { writeFile, unlink } from 'fs/promises';

export interface ContentIssue {
  type: 'inappropriate' | 'copyrighted';
  timestamp: number;
  confidence: number;
  description: string;
}

export class ContentChecker {
  private readonly rekognition: RekognitionClient;
  private readonly moderator: ContentModeratorClient;
  private readonly tempDir: string;

  constructor(config: {
    awsRegion: string;
    azureKey: string;
    azureEndpoint: string;
  }) {
    this.rekognition = new RekognitionClient({
      region: config.awsRegion
    });

    this.moderator = new ContentModeratorClient(
      new ApiKeyCredentials({
        inHeader: {
          'Ocp-Apim-Subscription-Key': config.azureKey
        }
      }),
      config.azureEndpoint
    );

    this.tempDir = join(tmpdir(), 'crafter-content-check');
  }

  async detectInappropriateContent(videoBuffer: Buffer): Promise<ContentIssue[]> {
    const frames = await this.extractFrames(videoBuffer);
    const issues: ContentIssue[] = [];

    for (const frame of frames) {
      try {
        const [awsIssues, azureIssues] = await Promise.all([
          this.checkWithAWS(frame.data),
          this.checkWithAzure(frame.data)
        ]);

        issues.push(
          ...awsIssues.map(issue => ({
            ...issue,
            timestamp: frame.timestamp
          })),
          ...azureIssues.map(issue => ({
            ...issue,
            timestamp: frame.timestamp
          }))
        );
      } catch (error) {
        console.error('Error checking frame:', error);
      }
    }

    return issues;
  }

  private async checkWithAWS(frameBuffer: Buffer): Promise<Omit<ContentIssue, 'timestamp'>[]> {
    const command = new DetectModerationLabelsCommand({
      Image: {
        Bytes: frameBuffer
      }
    });

    const response = await this.rekognition.send(command);
    return (response.ModerationLabels || []).map((label: { Name?: string; Confidence?: number }) => ({
      type: 'inappropriate',
      confidence: label.Confidence || 0,
      description: label.Name || 'Unknown issue'
    }));
  }

  private async checkWithAzure(frameBuffer: Buffer): Promise<Omit<ContentIssue, 'timestamp'>[]> {
    const result = await this.moderator.imageModeration.evaluateFileInput(frameBuffer);
    const issues: Omit<ContentIssue, 'timestamp'>[] = [];

    if (result.isImageAdultClassified || result.isImageRacyClassified) {
      issues.push({
        type: 'inappropriate',
        confidence: Math.max(result.adultClassificationScore || 0, result.racyClassificationScore || 0) * 100,
        description: 'Adult or racy content detected'
      });
    }

    return issues;
  }

  private async extractFrames(videoBuffer: Buffer): Promise<Array<{ timestamp: number; data: Buffer }>> {
    const tempFile = join(this.tempDir, `${Date.now()}.mp4`);
    const frames: Array<{ timestamp: number; data: Buffer }> = [];

    try {
      await writeFile(tempFile, videoBuffer);

      await new Promise<void>((resolve, reject) => {
        const command = ffmpeg()
          .input(tempFile)
          .outputOptions([
            '-vf fps=0.5',
            '-frame_pts 1'
          ])
          .on('end', () => resolve())
          .on('error', (error: Error) => reject(error));

        command.outputFormat('rawvideo')
          .on('data', (chunk: Buffer) => {
            const timestamp = Date.now() / 1000;
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
}
