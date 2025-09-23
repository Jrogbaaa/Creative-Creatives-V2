import { NextRequest, NextResponse } from 'next/server';
import Replicate from 'replicate';
import { ChatMessage } from '@/types';
import { logger } from '@/lib/logger';

// Initialize Replicate with server-side token
const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages, context } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Messages array is required' },
        { status: 400 }
      );
    }

    // System prompt
    const systemPrompt = `You are Marcus, a world-renowned creative director and advertising genius with 25+ years of experience creating award-winning campaigns for Fortune 500 companies. You've worked with brands like Nike, Apple, Coca-Cola, and Tesla.

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

    console.log('🔄 [API] Calling Replicate from server...');

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
      console.log('✅ [API] Replicate succeeded');
      
      return NextResponse.json({
        success: true,
        response: content.trim(),
        provider: 'replicate',
        model
      });
    } else {
      throw new Error('Empty response from Replicate');
    }

  } catch (error: any) {
    console.error('❌ [API] Replicate error:', error.message);
    
    // Fallback to simple responses
    const lastMessage = messages?.[messages.length - 1]?.content || '';
    const fallbackResponse = getFallbackResponse(lastMessage);
    
    return NextResponse.json({
      success: true,
      response: fallbackResponse,
      provider: 'fallback',
      model: 'marcus-backup'
    });
  }
}

function formatContext(context: any): string {
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

function getFallbackResponse(userMessage: string): string {
  const message = userMessage.toLowerCase();
  
  if (message.includes('hi') || message.includes('hello') || message.includes('hey')) {
    return `Hi there! I'm Marcus, your creative director. I'm excited to help you create amazing advertisements! 

Tell me about your brand:
• What industry are you in?
• Who's your target audience?
• What kind of ad are you looking to create?

Let's get started! 🎬`;
  }
  
  if (message.includes('brand') || message.includes('company') || message.includes('business')) {
    return `Great! Understanding your brand is crucial for creating effective advertising. Here's what I typically help with:

**Brand Strategy:**
• Identifying your unique value proposition
• Understanding your target demographic
• Defining your brand voice and personality
• Positioning against competitors

**For a strong 30-second ad, I usually recommend:**
1. **Hook (0-5s):** Grab attention immediately
2. **Story (5-20s):** Show your product/service benefit
3. **Call-to-Action (20-30s):** Clear next step for viewers

What specific aspect of your brand would you like to explore first?`;
  }
  
  return `Thanks for that! I'm Marcus, and I'd love to help you with your creative project.

I'm currently experiencing some technical issues with my main AI backend, but my creative expertise is always available! Here's what I can definitely help with:

**Immediate Support:**
• Brand strategy and positioning
• Creative concept development  
• 30-second ad structure and flow
• Visual storytelling techniques
• Target audience insights

What's your biggest creative challenge right now? Let's tackle it together! 🎯`;
}
