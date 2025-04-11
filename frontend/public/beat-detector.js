class BeatDetectorProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.lastEnergy = 0;
    this.energyHistory = new Float32Array(43); // About 1s at 44.1kHz
    this.energyIndex = 0;
    this.lastBeatTime = 0;
  }

  process(inputs, outputs, parameters) {
    const input = inputs[0];
    if (!input || !input.length) return true;

    const channel = input[0];
    let energy = 0;

    // Calculate energy (sum of squares)
    for (let i = 0; i < channel.length; i++) {
      energy += channel[i] * channel[i];
    }
    energy = Math.sqrt(energy / channel.length);

    // Add energy to history
    this.energyHistory[this.energyIndex] = energy;
    this.energyIndex = (this.energyIndex + 1) % this.energyHistory.length;

    // Calculate local average
    let avgEnergy = 0;
    for (let i = 0; i < this.energyHistory.length; i++) {
      avgEnergy += this.energyHistory[i];
    }
    avgEnergy /= this.energyHistory.length;

    // Calculate variance
    let variance = 0;
    for (let i = 0; i < this.energyHistory.length; i++) {
      const diff = this.energyHistory[i] - avgEnergy;
      variance += diff * diff;
    }
    variance /= this.energyHistory.length;
    const standardDeviation = Math.sqrt(variance);

    // Beat detection
    const currentTime = currentTime;
    const timeSinceLastBeat = currentTime - this.lastBeatTime;
    const energyDelta = energy - this.lastEnergy;
    const beatThreshold = avgEnergy + 0.8 * standardDeviation;

    if (energy > beatThreshold && energyDelta > 0 && timeSinceLastBeat > 0.2) {
      this.lastBeatTime = currentTime;
      const confidence = (energy - avgEnergy) / standardDeviation;
      
      this.port.postMessage({
        type: 'beat',
        timestamp: currentTime,
        confidence: Math.min(confidence, 1.0),
        energy: energy,
        threshold: beatThreshold
      });
    }

    this.lastEnergy = energy;
    return true;
  }
}

registerProcessor('beat-detector', BeatDetectorProcessor);
