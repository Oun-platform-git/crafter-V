import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

export class AIService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }

  async generateVideoScript(prompt: string): Promise<string> {
    try {
      const completion = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are a professional video script writer. Create engaging and creative video scripts based on the given prompt."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 1000
      });

      return completion.choices[0].message.content || '';
    } catch (error) {
      console.error('Error generating video script:', error);
      throw new Error('Failed to generate video script');
    }
  }

  async generateSceneDescriptions(script: string): Promise<any[]> {
    try {
      const completion = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "Convert the video script into a series of detailed scene descriptions. Each scene should include visual elements, transitions, and timing."
          },
          {
            role: "user",
            content: script
          }
        ],
        max_tokens: 1500
      });

      const scenes = JSON.parse(completion.choices[0].message.content || '[]');
      return scenes;
    } catch (error) {
      console.error('Error generating scene descriptions:', error);
      throw new Error('Failed to generate scene descriptions');
    }
  }

  async generateImagePrompts(scenes: any[]): Promise<string[]> {
    try {
      const completion = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "Convert scene descriptions into detailed image generation prompts that will work well with DALL-E."
          },
          {
            role: "user",
            content: JSON.stringify(scenes)
          }
        ],
        max_tokens: 1000
      });

      const content = completion.choices[0].message.content;
      if (!content) {
        return [];
      }
      const prompts = JSON.parse(content) as string[];
      return prompts;
    } catch (error) {
      console.error('Error generating image prompts:', error);
      throw new Error('Failed to generate image prompts');
    }
  }

  async generateImages(prompts: string[]): Promise<string[]> {
    try {
      const images = await Promise.all(
        prompts.map(async (prompt) => {
          const response = await this.openai.images.generate({
            model: "dall-e-3",
            prompt: prompt,
            n: 1,
            size: "1024x1024"
          });
          return response.data[0].url || '';
        })
      );
      return images.filter((url): url is string => url !== '');
    } catch (error) {
      console.error('Error generating images:', error);
      throw new Error('Failed to generate images');
    }
  }

  async enhanceVideoMetadata(title: string, description: string): Promise<{
    title: string;
    description: string;
    tags: string[];
    category: string;
  }> {
    try {
      const completion = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "Enhance the video metadata by suggesting an improved title, description, relevant tags, and category."
          },
          {
            role: "user",
            content: JSON.stringify({ title, description })
          }
        ],
        max_tokens: 500
      });

      const content = completion.choices[0].message.content;
      if (!content) {
        return {
          title,
          description,
          tags: [],
          category: 'Uncategorized'
        };
      }

      return JSON.parse(content);
    } catch (error) {
      console.error('Error enhancing video metadata:', error);
      throw new Error('Failed to enhance video metadata');
    }
  }
}
