import { ChatMessage } from '@/types';
import { simpleChatFallback } from './simple-fallback';

export class CreativeExpertLLama {
  async chat(messages: ChatMessage[], context?: any): Promise<string> {
    try {
      console.log('🔄 Calling server-side chat API...');
      
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages,
          context
        })
      });

      if (!response.ok) {
        throw new Error(`API response ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success && result.response) {
        console.log(`✅ Chat API succeeded (${result.provider})`);
        return result.response;
      } else {
        throw new Error('Invalid API response format');
      }
      
    } catch (error: any) {
      console.error('❌ Chat API failed:', error.message);
      console.log('🛡️ Using client-side fallback...');
      
      // Use simple fallback as last resort
      return await simpleChatFallback.chat(messages, context);
    }
  }

  async generateBrandAnalysis(brandInfo: any): Promise<string> {
    return this.chat([{
      id: '1',
      role: 'user',
      content: `Based on the following brand information, provide a comprehensive creative analysis:

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
5. Key messaging themes`,
      timestamp: new Date()
    }]);
  }

  async generateCreativeConcepts(projectInfo: any, brandInfo: any): Promise<string[]> {
    const response = await this.chat([{
      id: '1',
      role: 'user',
      content: `Create 3 unique creative concepts for a 30-second advertisement:

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

Keep each concept distinct and engaging.`,
      timestamp: new Date()
    }]);
    
    // Split concepts (simplified approach)
    return response.split(/(?=Concept \d|Option \d)/i).filter(concept => concept.trim().length > 0);
  }

  async generateVideoPrompts(concept: string, scene: any): Promise<string> {
    return this.chat([{
      id: '1',
      role: 'user',
      content: `Transform this creative concept into a detailed video generation prompt for Google Veo:

Creative Concept: ${concept}
Scene: ${JSON.stringify(scene)}

Generate a clear, detailed prompt that includes:
- Visual description of the scene
- Camera angles and movement
- Lighting and mood
- Character actions (if any)
- Setting and environment
- Style and aesthetic

The prompt should be specific enough for AI video generation while maintaining creative vision.`,
      timestamp: new Date()
    }]);
  }

  async generateImagePrompts(description: string, style: string): Promise<string> {
    return this.chat([{
      id: '1',
      role: 'user',
      content: `Create a detailed image generation prompt for Google's Imagen based on:

Description: ${description}
Style: ${style}

The prompt should be:
- Visually specific and detailed
- Include composition, lighting, color palette
- Specify artistic style or photographic approach
- Mention any brand elements or requirements
- Be optimized for AI image generation`,
      timestamp: new Date()
    }]);
  }
}

export const creativeExpert = new CreativeExpertLLama();