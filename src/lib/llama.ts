import { HfInference } from '@huggingface/inference';
import { LlamaRequest, LlamaResponse, ChatMessage } from '@/types';

const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

export class CreativeExpertLLama {
  private model = 'meta-llama/Llama-3.1-8B-Instruct';
  
  private systemPrompt = `You are Marcus, a world-renowned creative director and advertising genius with 25+ years of experience creating award-winning campaigns for Fortune 500 companies. You've worked with brands like Nike, Apple, Coca-Cola, and Tesla.

Your expertise includes:
- Brand strategy and positioning
- Creative concept development
- Visual storytelling
- Consumer psychology
- Multi-platform campaign design
- Video production and direction
- Copywriting and messaging

Your personality:
- Enthusiastic and passionate about great creative work
- Direct and honest feedback, but always constructive
- Collaborative and enjoys bouncing ideas around
- Quick to spot what makes brands unique
- Thinks visually and in terms of emotional impact

Your goal is to help users create compelling 30-second advertisements by:
1. Understanding their brand deeply through conversation
2. Identifying their target audience and goals
3. Developing creative concepts that resonate
4. Guiding the technical execution (video, images, audio)
5. Refining and polishing the final product

Always ask thoughtful questions to uncover insights. Be specific in your recommendations and explain your creative reasoning. Think like both an artist and a strategist.`;

  async chat(messages: ChatMessage[], context?: any): Promise<string> {
    try {
      const formattedMessages = [
        { role: 'system', content: this.systemPrompt },
        ...messages.map(msg => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content
        }))
      ];

      // Add context if available
      if (context) {
        const contextMessage = this.formatContext(context);
        formattedMessages.splice(1, 0, {
          role: 'system',
          content: contextMessage
        });
      }

      const response = await hf.chatCompletion({
        model: this.model,
        messages: formattedMessages,
        max_tokens: 1000,
        temperature: 0.7,
        top_p: 0.9,
      });

      return response.choices[0]?.message?.content || 'I apologize, but I encountered an issue. Could you please try again?';
    } catch (error) {
      console.error('LLaMA chat error:', error);
      throw new Error('Failed to generate response from creative expert');
    }
  }

  async generateBrandAnalysis(brandInfo: any): Promise<string> {
    const prompt = `Based on the following brand information, provide a comprehensive creative analysis:

Brand: ${brandInfo.name}
Industry: ${brandInfo.industry}
Description: ${brandInfo.description}
Target Audience: ${brandInfo.targetAudience}
Brand Values: ${brandInfo.brandValues?.join(', ')}

Please provide:
1. Creative opportunities and strengths
2. Potential challenges or gaps
3. Recommended advertising approaches
4. Visual and tonal direction suggestions
5. Key messaging themes`;

    try {
      const response = await hf.chatCompletion({
        model: this.model,
        messages: [
          { role: 'system', content: this.systemPrompt },
          { role: 'user', content: prompt }
        ],
        max_tokens: 1200,
        temperature: 0.6,
      });

      return response.choices[0]?.message?.content || 'Unable to generate brand analysis';
    } catch (error) {
      console.error('Brand analysis error:', error);
      throw new Error('Failed to generate brand analysis');
    }
  }

  async generateCreativeConcepts(projectInfo: any, brandInfo: any): Promise<string[]> {
    const prompt = `Create 3 unique creative concepts for a 30-second advertisement:

Project: ${projectInfo.title}
Brand: ${brandInfo.name} (${brandInfo.industry})
Goals: ${projectInfo.goals?.join(', ')}
Target Demographic: ${JSON.stringify(projectInfo.targetDemographic)}
Brand Voice: ${brandInfo.brandVoice}

For each concept, provide:
1. A compelling hook/opening (0-5 seconds)
2. Main story/demonstration (5-20 seconds)
3. Strong call-to-action/close (20-30 seconds)
4. Visual style recommendation
5. Music/audio direction

Keep each concept distinct and engaging.`;

    try {
      const response = await hf.chatCompletion({
        model: this.model,
        messages: [
          { role: 'system', content: this.systemPrompt },
          { role: 'user', content: prompt }
        ],
        max_tokens: 1500,
        temperature: 0.8,
      });

      const content = response.choices[0]?.message?.content || '';
      // Split concepts (this is a simplified approach)
      return content.split(/(?=Concept \d|Option \d)/i).filter(concept => concept.trim().length > 0);
    } catch (error) {
      console.error('Creative concepts error:', error);
      throw new Error('Failed to generate creative concepts');
    }
  }

  async generateVideoPrompts(concept: string, scene: any): Promise<string> {
    const prompt = `Transform this creative concept into a detailed video generation prompt for Google Veo:

Creative Concept: ${concept}
Scene: ${JSON.stringify(scene)}

Generate a clear, detailed prompt that includes:
- Visual description of the scene
- Camera angles and movement
- Lighting and mood
- Character actions (if any)
- Setting and environment
- Style and aesthetic

The prompt should be specific enough for AI video generation while maintaining creative vision.`;

    try {
      const response = await hf.chatCompletion({
        model: this.model,
        messages: [
          { role: 'system', content: this.systemPrompt },
          { role: 'user', content: prompt }
        ],
        max_tokens: 800,
        temperature: 0.6,
      });

      return response.choices[0]?.message?.content || 'Unable to generate video prompt';
    } catch (error) {
      console.error('Video prompt generation error:', error);
      throw new Error('Failed to generate video prompt');
    }
  }

  async generateImagePrompts(description: string, style: string): Promise<string> {
    const prompt = `Create a detailed image generation prompt for Google's Imagen based on:

Description: ${description}
Style: ${style}

The prompt should be:
- Visually specific and detailed
- Include composition, lighting, color palette
- Specify artistic style or photographic approach
- Mention any brand elements or requirements
- Be optimized for AI image generation`;

    try {
      const response = await hf.chatCompletion({
        model: this.model,
        messages: [
          { role: 'system', content: this.systemPrompt },
          { role: 'user', content: prompt }
        ],
        max_tokens: 600,
        temperature: 0.6,
      });

      return response.choices[0]?.message?.content || 'Unable to generate image prompt';
    } catch (error) {
      console.error('Image prompt generation error:', error);
      throw new Error('Failed to generate image prompt');
    }
  }

  private formatContext(context: any): string {
    let contextString = 'Current conversation context:\n';
    
    if (context.brand) {
      contextString += `Brand: ${context.brand.name} - ${context.brand.description}\n`;
    }
    
    if (context.currentGoal) {
      contextString += `Current Goal: ${context.currentGoal}\n`;
    }
    
    if (context.extractedInfo && Object.keys(context.extractedInfo).length > 0) {
      contextString += `Extracted Information: ${JSON.stringify(context.extractedInfo)}\n`;
    }
    
    return contextString;
  }
}

export const creativeExpert = new CreativeExpertLLama();
