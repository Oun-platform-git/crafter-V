import * as tf from '@tensorflow/tfjs-node';

interface Prediction {
  className: string;
  probability: number;
}

export class ImageAnalyzer {
  private model: tf.GraphModel | null = null;

  constructor() {
    this.loadModel();
  }

  private async loadModel() {
    try {
      // Load MobileNet model
      this.model = await tf.loadGraphModel(
        'https://tfhub.dev/google/imagenet/mobilenet_v2_100_224/classification/4'
      );
    } catch (error) {
      console.error('Error loading model:', error);
      throw new Error('Failed to load image analysis model');
    }
  }

  async classify(imageBuffer: Buffer): Promise<Prediction[]> {
    try {
      if (!this.model) {
        throw new Error('Model not loaded');
      }

      // Convert buffer to tensor
      const tensor = tf.node.decodeImage(imageBuffer);
      const resized = tf.image.resizeBilinear(tensor, [224, 224]);
      const expanded = resized.expandDims(0);
      const normalized = expanded.div(255.0);

      // Run inference
      const predictions = await this.model.predict(normalized) as tf.Tensor;
      const values = await predictions.data();

      // Get top predictions
      const topK = 5;
      const indices = this.findTopKIndices(Array.from(values), topK);

      // Clean up tensors
      tf.dispose([tensor, resized, expanded, normalized, predictions]);

      return indices.map(index => ({
        className: this.getClassName(index),
        probability: values[index]
      }));
    } catch (error) {
      console.error('Error classifying image:', error);
      throw new Error('Failed to classify image');
    }
  }

  private findTopKIndices(array: number[], k: number): number[] {
    return array
      .map((value, index) => ({ value, index }))
      .sort((a, b) => b.value - a.value)
      .slice(0, k)
      .map(item => item.index);
  }

  private getClassName(index: number): string {
    // This would normally use a mapping of indices to class names
    // For now, return a placeholder
    return `class_${index}`;
  }

  async detectObjects(imageBuffer: Buffer): Promise<Array<{
    box: [number, number, number, number];
    class: string;
    score: number;
  }>> {
    try {
      // This would use a model like COCO-SSD for object detection
      // For now, return a placeholder
      return [];
    } catch (error) {
      console.error('Error detecting objects:', error);
      throw new Error('Failed to detect objects in image');
    }
  }

  async analyzeColors(imageBuffer: Buffer): Promise<Array<{
    color: string;
    percentage: number;
  }>> {
    try {
      // Convert buffer to tensor
      const tensor = tf.node.decodeImage(imageBuffer);
      const resized = tf.image.resizeBilinear(tensor, [50, 50]);
      const values = await resized.data();

      // Calculate color distribution
      const colors = new Map<string, number>();
      for (let i = 0; i < values.length; i += 3) {
        const r = values[i];
        const g = values[i + 1];
        const b = values[i + 2];
        const color = this.rgbToHex(r, g, b);
        colors.set(color, (colors.get(color) || 0) + 1);
      }

      // Clean up tensors
      tf.dispose([tensor, resized]);

      // Convert to percentages
      const total = Array.from(colors.values()).reduce((a, b) => a + b, 0);
      return Array.from(colors.entries())
        .map(([color, count]) => ({
          color,
          percentage: (count / total) * 100
        }))
        .sort((a, b) => b.percentage - a.percentage)
        .slice(0, 5);
    } catch (error) {
      console.error('Error analyzing colors:', error);
      throw new Error('Failed to analyze image colors');
    }
  }

  private rgbToHex(r: number, g: number, b: number): string {
    const toHex = (n: number) => Math.round(n).toString(16).padStart(2, '0');
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }
}
