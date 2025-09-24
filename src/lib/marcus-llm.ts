import Replicate from 'replicate';
import { ChatMessage } from '@/types';
import { aiCache, withCache } from './ai-cache';

// Initialize Replicate with server-side token
const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

export async function callMarcusLLM(messages: ChatMessage[], context?: any): Promise<string> {
  return withCache.marcus(messages, context, async () => {
    try {
      // System prompt for Marcus
      const systemPrompt = `You are Marcus, a world-renowned creative director and advertising genius with 25+ years of experience creating award-winning campaigns for Fortune 500 companies. You've worked with brands like Nike, Apple, Coca-Cola, and Tesla.

Your expertise includes:
- Brand strategy and positioning
- Creative concept development
- Visual storytelling
- Consumer psychology
- Multi-platform campaign design
- Video production and direction
- Copywriting and messaging
- Professional storyboard planning and scene timing optimization

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
4. Creating professional storyboard plans with optimal timing
5. Generating high-quality prompts for image generation
6. Ensuring visual consistency across all scenes

Always ask thoughtful questions to uncover insights. Be specific in your recommendations and explain your creative reasoning. Think like both an artist and a strategist.`;

    // Format messages for Replicate
    const formattedMessages = [
      { role: 'system', content: systemPrompt },
      ...messages.map((msg: ChatMessage) => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content
      }))
    ];

    // Add context if available
    if (context) {
      const contextMessage = formatContext(context);
      formattedMessages.splice(1, 0, {
        role: 'system',
        content: contextMessage
      });
    }

    console.log('🔄 [Marcus LLM] Calling Replicate...');

    // Convert to prompt format for Replicate
    const prompt = formattedMessages.map(msg => {
      const role = msg.role === 'system' ? 'System' : 
                   msg.role === 'user' ? 'Human' : 'Assistant';
      return `${role}: ${msg.content}`;
    }).join('\n\n') + '\n\nAssistant:';

    // Call Replicate API
    const model = process.env.REPLICATE_MODEL || 'meta/meta-llama-3-8b-instruct';
    
    const output = await replicate.run(model as `${string}/${string}`, {
      input: {
        prompt,
        max_tokens: 1500,
        temperature: 0.7,
        top_p: 0.9,
        repetition_penalty: 1.1,
      }
    }) as string[];

    // Process response
    const content = Array.isArray(output) ? output.join('') : output;
    
    if (typeof content === 'string' && content.trim()) {
      console.log('✅ [Marcus LLM] Replicate succeeded');
      return content.trim();
    } else {
      throw new Error('Empty response from Replicate');
    }

    } catch (error: any) {
      console.error('❌ [Marcus LLM] Replicate error:', error.message);
      
      // Fallback response for storyboard planning
      const lastMessage = messages?.[messages.length - 1]?.content || '';
      if (lastMessage.toLowerCase().includes('storyboard')) {
        return getFallbackStoryboardResponse();
      }
      
      throw new Error(`Marcus LLM failed: ${error.message}`);
    }
  });
}

function formatContext(context: any): string {
  let contextString = 'Current conversation context:\n';
  
  if (context.brand) {
    contextString += `Brand: ${context.brand.name} - ${context.brand.description}\n`;
    if (context.brand.industry) contextString += `Industry: ${context.brand.industry}\n`;
    if (context.brand.targetAudience) contextString += `Target Audience: ${context.brand.targetAudience}\n`;
    if (context.brand.brandVoice) contextString += `Brand Voice: ${context.brand.brandVoice}\n`;
  }
  
  if (context.currentGoal) {
    contextString += `Current Goal: ${context.currentGoal}\n`;
  }
  
  if (context.extractedInfo && Object.keys(context.extractedInfo).length > 0) {
    contextString += `Extracted Information: ${JSON.stringify(context.extractedInfo)}\n`;
  }
  
  return contextString;
}

function getFallbackStoryboardResponse(): string {
  return `{
  "narrative": {
    "hook": "Capture attention with compelling opening",
    "solution": "Present brand as the perfect solution",
    "callToAction": "Drive immediate engagement"
  },
  "scenes": [
    {
      "sceneNumber": 1,
      "title": "Hook",
      "description": "Attention-grabbing opening scene",
      "duration": 10,
      "prompt": "Professional commercial opening, engaging visuals, modern style",
      "visualStyle": {
        "lighting": "natural",
        "mood": "engaging",
        "cameraAngle": "medium",
        "composition": "centered"
      }
    },
    {
      "sceneNumber": 2,
      "title": "Solution",
      "description": "Brand solution presentation",
      "duration": 12,
      "prompt": "Professional product showcase, clean presentation, confident presentation",
      "visualStyle": {
        "lighting": "bright",
        "mood": "confident",
        "cameraAngle": "close-up",
        "composition": "rule-of-thirds"
      }
    },
    {
      "sceneNumber": 3,
      "title": "Call to Action",
      "description": "Final call to action",
      "duration": 8,
      "prompt": "Call-to-action scene, results-focused, inspiring conclusion",
      "visualStyle": {
        "lighting": "warm",
        "mood": "inspiring",
        "cameraAngle": "wide-shot",
        "composition": "dynamic"
      }
    }
  ],
  "visualConsistency": {
    "characters": ["Professional representative"],
    "colorPalette": ["#4F46E5", "#059669"],
    "style": "Professional commercial photography"
  }
}`;
}
