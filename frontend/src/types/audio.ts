export type AudioEffectType = keyof AudioEffectParams;

export interface AudioEffectParams {
  equalizer: {
    lowGain: number;
    midGain: number;
    highGain: number;
    lowFreq: number;
    highFreq: number;
    q: number;
  };
  compressor: {
    threshold: number;
    ratio: number;
    attack: number;
    release: number;
    knee: number;
  };
  reverb: {
    roomSize: number;
    dampening: number;
    wetLevel: number;
    dryLevel: number;
  };
  delay: {
    delayTime: number;
    feedback: number;
    mix: number;
  };
  distortion: {
    amount: number;
    tone: number;
  };
}

export interface AudioEffect {
  id: string;
  type: AudioEffectType;
  params: Record<string, number>;
  enabled: boolean;
}

export interface AudioClip {
  id: string;
  src: string;
  volume: number;
  pan?: number;
  effects?: AudioEffect[];
}
