import React, { FC, useEffect, useRef, useState } from 'react';

interface AudioWaveformProps {
  audioUrl: string;
  width: number;
  height: number;
  color?: string;
  backgroundColor?: string;
  progress?: number;
}

const AudioWaveform: FC<AudioWaveformProps> = ({
  audioUrl,
  width,
  height,
  color = '#3B82F6',
  backgroundColor = '#1F2937',
  progress = 0
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [waveformData, setWaveformData] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadAudio = async () => {
      try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const response = await fetch(audioUrl);
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        
        // Get the raw audio data
        const channelData = audioBuffer.getChannelData(0);
        const samples = width;
        const blockSize = Math.floor(channelData.length / samples);
        const filteredData = [];

        for (let i = 0; i < samples; i++) {
          const blockStart = blockSize * i;
          let sum = 0;
          
          // Calculate the average amplitude for this block
          for (let j = 0; j < blockSize; j++) {
            sum += Math.abs(channelData[blockStart + j]);
          }
          
          filteredData.push(sum / blockSize);
        }

        // Normalize the data
        const multiplier = Math.pow(Math.max(...filteredData), -1);
        const normalizedData = filteredData.map(n => n * multiplier);
        
        setWaveformData(normalizedData);
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading audio:', error);
        setIsLoading(false);
      }
    };

    loadAudio();
  }, [audioUrl, width]);

  useEffect(() => {
    if (!canvasRef.current || isLoading || waveformData.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear the canvas
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, width, height);

    // Draw the waveform
    const middle = height / 2;
    const barWidth = 1;
    const gap = 1;
    const totalBars = Math.floor(width / (barWidth + gap));
    const samplesPerBar = Math.floor(waveformData.length / totalBars);

    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = barWidth;

    for (let i = 0; i < totalBars; i++) {
      const x = i * (barWidth + gap);
      const sampleIndex = Math.floor(i * samplesPerBar);
      const amplitude = waveformData[sampleIndex] * (height / 2);

      // Draw the bar
      ctx.moveTo(x, middle - amplitude);
      ctx.lineTo(x, middle + amplitude);
    }
    ctx.stroke();

    // Draw progress overlay
    if (progress > 0) {
      const progressX = width * progress;
      ctx.fillStyle = `${color}33`; // 20% opacity
      ctx.fillRect(0, 0, progressX, height);
    }
  }, [waveformData, width, height, color, backgroundColor, progress, isLoading]);

  return (
    <div className="relative">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-500 border-t-transparent"></div>
        </div>
      )}
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="rounded"
      />
    </div>
  );
};

export default AudioWaveform;
