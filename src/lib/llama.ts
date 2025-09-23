import { HfInference } from '@huggingface/inference';
import Replicate from 'replicate';
import { LlamaRequest, LlamaResponse, ChatMessage } from '@/types';

// Replicate client (primary provider)
const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

// Support both HF_TOKEN (preferred) and HUGGINGFACE_TOKEN (legacy) as fallback
const hfToken = process.env.HF_TOKEN || process.env.HUGGINGFACE_TOKEN;
const hfProvider = process.env.HF_PROVIDER; // e.g. 'sambanova', 'together', etc.
const hf = hfToken ? new HfInference(hfToken) : null;

export class CreativeExpertLLama {
  private replicateModel = process.env.REPLICATE_MODEL || 'meta/llama-2-70b-chat';
  private replicateFallback = 'meta/llama-2-13b-chat'; // Smaller Replicate model fallback
  private openRouterModel = process.env.OPENROUTER_MODEL || 'openai/gpt-4o-mini';
  private hfModel = 'meta-llama/Llama-3.1-8B-Instruct'; // HF fallback if available
  
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

    // Try providers in priority order: Replicate → OpenRouter → HF
    return await this.tryAllProviders(formattedMessages, {
      max_tokens: 1500,
      temperature: 0.7,
      top_p: 0.9,
      frequency_penalty: 0.1,
    });
  }

  private async tryModelsSequentially(messages: any[], params: any): Promise<string> {
    if (!hf) throw new Error('HF client not available');
    
    const modelsToTry = [this.hfModel];
    
    for (const model of modelsToTry) {
      try {
        console.log(`Attempting to use HF model: ${model}`);
        
        const response = await hf.chatCompletion({
          model,
          provider: hfProvider, // leverage Inference Providers if configured
          messages,
          ...params
        });

        const content = response.choices[0]?.message?.content;
        if (content) {
          console.log('✅ HF model succeeded');
          return content;
        }
      } catch (error: any) {
        console.error(`Error with HF model ${model}:`, error.message);
        throw new Error(`HF failed: ${error.message}`);
      }
    }
    
    return 'I apologize, but I encountered an issue with HF models.';
  }

  private async sendChatViaReplicate(messages: any[], params: any): Promise<string> {
    // Convert messages to Replicate format (prompt-based)
    const prompt = this.formatMessagesAsPrompt(messages);
    
    const modelsToTry = [this.replicateModel, this.replicateFallback];
    
    for (const model of modelsToTry) {
      try {
        console.log(`Trying Replicate model: ${model}`);
        
        const output = await replicate.run(model as `${string}/${string}`, {
          input: {
            prompt,
            max_tokens: params?.max_tokens ?? 1500,
            temperature: params?.temperature ?? 0.7,
            top_p: params?.top_p ?? 0.9,
            repetition_penalty: 1.1, // Replicate uses repetition_penalty instead of frequency_penalty
          }
        }) as string[];

        // Replicate returns an array of strings for streaming models
        const content = Array.isArray(output) ? output.join('') : output;
        if (typeof content === 'string' && content.trim()) {
          console.log(`✅ Replicate model ${model} succeeded`);
          return content.trim();
        }
        
        console.log(`⚠️ ${model} returned empty content, trying next model...`);
      } catch (error: any) {
        console.error(`Replicate model ${model} error:`, error.message);
        if (model === modelsToTry[modelsToTry.length - 1]) {
          throw error; // Last model, propagate error
        }
        continue; // Try next model
      }
    }
    
    throw new Error('All Replicate models failed');
  }

  private formatMessagesAsPrompt(messages: any[]): string {
    // Convert chat messages to a single prompt format for Replicate
    return messages.map(msg => {
      const role = msg.role === 'system' ? 'System' : 
                   msg.role === 'user' ? 'Human' : 'Assistant';
      return `${role}: ${msg.content}`;
    }).join('\n\n') + '\n\nAssistant:';
  }

  private async tryAllProviders(messages: any[], params: any): Promise<string> {
    // 1) Try Replicate first (most reliable)
    if (process.env.REPLICATE_API_TOKEN) {
      try {
        console.log('🔄 Trying Replicate...');
        const content = await this.sendChatViaReplicate(messages, params);
        if (content) {
          console.log('✅ Replicate succeeded');
          return content;
        }
      } catch (error: any) {
        console.error('Replicate error:', error.message);
      }
    }

    // 2) Try OpenRouter as secondary
    if (process.env.OPENROUTER_TOKEN) {
      try {
        console.log('🔄 Trying OpenRouter fallback...');
        const content = await this.sendChatViaOpenRouter(messages, params);
        if (content) {
          console.log('✅ OpenRouter succeeded');
          return content;
        }
      } catch (error: any) {
        console.error('OpenRouter error:', error.message);
      }
    }

    // 3) Try Hugging Face as last resort (if available)
    if (hf) {
      try {
        console.log('🔄 Trying HF as last resort...');
        return await this.tryModelsSequentially(messages, params);
      } catch (error: any) {
        console.error('HF error:', error.message);
      }
    }

    throw new Error('All providers failed - no working chat provider available');
  }

  private async sendChatViaOpenRouter(messages: any[], params: any): Promise<string> {
    const url = 'https://openrouter.ai/api/v1/chat/completions';
    const headers: Record<string, string> = {
      'Authorization': `Bearer ${process.env.OPENROUTER_TOKEN}`,
      'Content-Type': 'application/json',
    };

    const body = JSON.stringify({
      model: this.openRouterModel,
      messages,
      max_tokens: params?.max_tokens ?? 1000,
      temperature: params?.temperature ?? 0.7,
      top_p: params?.top_p ?? 0.9,
      frequency_penalty: params?.frequency_penalty ?? 0.0,
    });

    const response = await fetch(url, { method: 'POST', headers, body });
    if (!response.ok) {
      const text = await response.text();
      throw new Error(`OpenRouter HTTP ${response.status}: ${text.slice(0, 200)}`);
    }

    const json = await response.json();
    const content = json?.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error('OpenRouter returned no content');
    }
    return content;
  }

  private isKnownScoutIssue(error: any): boolean {
    const knownErrors = [
      'blob',
      '404',
      'not found',
      'model not available',
      'service unavailable',
      '503'
    ];
    
    return knownErrors.some(err => 
      error.message?.toLowerCase().includes(err.toLowerCase())
    );
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

    const messages = [
      { role: 'system', content: this.systemPrompt },
      { role: 'user', content: prompt }
    ];

    try {
      return await this.tryAllProviders(messages, {
        max_tokens: 1500,
        temperature: 0.6,
        top_p: 0.9,
        frequency_penalty: 0.1,
      });
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

    const messages = [
      { role: 'system', content: this.systemPrompt },
      { role: 'user', content: prompt }
    ];

    try {
      const content = await this.tryAllProviders(messages, {
        max_tokens: 2000,
        temperature: 0.8,
        top_p: 0.9,
        frequency_penalty: 0.2,
      });
      
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

    const messages = [
      { role: 'system', content: this.systemPrompt },
      { role: 'user', content: prompt }
    ];

    try {
      return await this.tryAllProviders(messages, {
        max_tokens: 1000,
        temperature: 0.6,
        top_p: 0.9,
        frequency_penalty: 0.1,
      });
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

    const messages = [
      { role: 'system', content: this.systemPrompt },
      { role: 'user', content: prompt }
    ];

    try {
      return await this.tryAllProviders(messages, {
        max_tokens: 800,
        temperature: 0.6,
        top_p: 0.9,
        frequency_penalty: 0.1,
      });
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
