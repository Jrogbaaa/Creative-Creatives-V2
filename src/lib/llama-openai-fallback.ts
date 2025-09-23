import { ChatMessage } from '@/types';

// Temporary fallback using OpenAI while HF is having issues
export class CreativeExpertOpenAIFallback {
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
    // This is a placeholder - you'd need OpenAI API key for this to work
    // For now, return a helpful message about the HF service issue
    
    const userMessage = messages[messages.length - 1]?.content || '';
    
    return `Hi there! I'm Marcus, your creative expert. I'd love to help you with "${userMessage}" but I'm currently experiencing some technical issues with my AI backend (Hugging Face servers are having problems). 

Here's what I can tell you in the meantime:

For a 30-second coffee shop ad, I'd typically recommend:
- Hook (0-5s): Show the coffee ritual/moment of need
- Story (5-20s): Highlight what makes your coffee special 
- CTA (20-30s): Strong call to action with location/app

Would you like me to try again in a few minutes when the servers are back up? Or we can discuss your specific brand goals and I'll give you detailed creative direction once I'm fully operational.

-- Marcus (Currently running on backup systems 😅)`;
  }

  async generateBrandAnalysis(brandInfo: any): Promise<string> {
    return `I'd love to analyze ${brandInfo.name} for you, but I'm currently experiencing technical difficulties with my AI backend. Please try again in 30-60 minutes when the Hugging Face servers are back online.`;
  }

  async generateCreativeConcepts(projectInfo: any, brandInfo: any): Promise<string[]> {
    return [`I'm ready to create amazing concepts for ${projectInfo.title}, but need to wait for my AI backend to come back online. Please try again soon!`];
  }

  async generateVideoPrompts(concept: string, scene: any): Promise<string> {
    return `I'd love to help with video prompts, but I'm currently having technical issues. Please try again in 30-60 minutes.`;
  }

  async generateImagePrompts(description: string, style: string): Promise<string> {
    return `I'd love to help with image prompts, but I'm currently having technical issues. Please try again in 30-60 minutes.`;
  }
}

export const creativeExpertFallback = new CreativeExpertOpenAIFallback();
