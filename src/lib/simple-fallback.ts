// Simple fallback for when LLM providers fail
import { ChatMessage } from '@/types';
import { logger, getUserId } from './logger';

export class SimpleChatFallback {
  private systemPrompt = `You are Marcus, a creative director helping with advertising. I'm currently experiencing technical issues with my AI backend, but I can still provide helpful guidance.`;

  async chat(messages: ChatMessage[], context?: any): Promise<string> {
    const userMessage = messages[messages.length - 1]?.content || '';
    
    try {
      const userId = getUserId();
      
      logger.uiInteraction('simple_fallback', 'chat_attempt', userId, {
        messageLength: userMessage.length,
        messageCount: messages.length
      });
      
      console.log(`🎭 Marcus fallback processing: "${userMessage.substring(0, 50)}..."`);
      
    } catch (logError) {
      console.warn('Logger error in fallback, continuing...', logError);
    }

    // Provide helpful responses based on common patterns
    if (this.isGreeting(userMessage)) {
      return this.getGreetingResponse();
    } else if (this.isBrandQuestion(userMessage)) {
      return this.getBrandResponse();
    } else if (this.isVideoQuestion(userMessage)) {
      return this.getVideoResponse();
    } else if (this.isCreativeQuestion(userMessage)) {
      return this.getCreativeResponse();
    } else {
      return this.getGeneralResponse(userMessage);
    }
  }

  private isGreeting(message: string): boolean {
    const greetings = ['hi', 'hello', 'hey', 'start', 'begin'];
    return greetings.some(greeting => 
      message.toLowerCase().includes(greeting)
    );
  }

  private isBrandQuestion(message: string): boolean {
    const brandKeywords = ['brand', 'company', 'business', 'industry', 'target audience'];
    return brandKeywords.some(keyword => 
      message.toLowerCase().includes(keyword)
    );
  }

  private isVideoQuestion(message: string): boolean {
    const videoKeywords = ['video', 'commercial', 'ad', 'advertisement', '30 second'];
    return videoKeywords.some(keyword => 
      message.toLowerCase().includes(keyword)
    );
  }

  private isCreativeQuestion(message: string): boolean {
    const creativeKeywords = ['creative', 'concept', 'idea', 'campaign', 'messaging'];
    return creativeKeywords.some(keyword => 
      message.toLowerCase().includes(keyword)
    );
  }

  private getGreetingResponse(): string {
    return `Hi there! I'm Marcus, your creative director. I'm excited to help you create amazing advertisements! 

I'm currently running on backup systems due to some technical issues with my main AI backend, but I can still provide great creative guidance.

Tell me about your brand:
• What industry are you in?
• Who's your target audience?
• What kind of ad are you looking to create?

Let's get started! 🎬`;
  }

  private getBrandResponse(): string {
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

What specific aspect of your brand would you like to explore first? I can help even while my main AI systems are being repaired.`;
  }

  private getVideoResponse(): string {
    return `Perfect! Video advertising is my specialty. Here's my tried-and-true framework for 30-second commercials:

**The Creative Brief Approach:**
• **Opening Hook:** What stops the scroll? (surprise, emotion, question)
• **Problem/Solution:** What pain point does your product solve?
• **Demonstration:** Show, don't just tell
• **Social Proof:** Quick testimonial or statistic
• **Clear CTA:** What action should viewers take?

**Production Tips:**
• Keep text minimal and readable
• Use high-quality visuals
• Match music to brand personality
• Test on mobile first (where most will watch)

What's your product/service? I can give you specific creative direction even while my main systems are offline.`;
  }

  private getCreativeResponse(): string {
    return `Creative development is all about connecting emotionally with your audience! Here's my approach:

**The Marcus Method:**
1. **Insight First:** What truth about your audience can we tap into?
2. **Emotional Hook:** Joy? Fear? Pride? What emotion drives action?
3. **Visual Storytelling:** Every frame should advance the story
4. **Memorable Moment:** What will they remember 24 hours later?

**Common Creative Strategies:**
• Before/After transformation
• Day-in-the-life scenarios
• Problem-solution narrative
• Aspirational lifestyle
• Behind-the-scenes authenticity

I may be running on backup systems, but 25+ years of creative experience doesn't need WiFi! What's your creative challenge?`;
  }

  private getGeneralResponse(userMessage: string): string {
    return `Thanks for that! I'm Marcus, and I'd love to help you with "${userMessage.substring(0, 50)}${userMessage.length > 50 ? '...' : ''}"

I'm currently experiencing some technical issues with my main AI backend, but my creative expertise is always available! Here's what I can definitely help with:

**Immediate Support:**
• Brand strategy and positioning
• Creative concept development  
• 30-second ad structure and flow
• Visual storytelling techniques
• Target audience insights

**My Recommendation:**
Let's start with the basics - tell me about your brand and what kind of advertisement you're looking to create. I can provide detailed creative guidance even while my systems are being repaired.

What's your biggest creative challenge right now? Let's tackle it together! 🎯`;
  }

  async generateBrandAnalysis(brandInfo: any): Promise<string> {
    return `I'd love to analyze ${brandInfo.name} in detail! While my main AI systems are temporarily offline, here's my initial creative assessment:

**Quick Brand Insights:**
• Strong brands solve real problems for real people
• Your unique value should be obvious in 5 seconds
• Emotional connection beats features every time

I'll give you a comprehensive analysis once my full systems are back online. For now, what's your biggest brand challenge?`;
  }

  async generateCreativeConcepts(projectInfo: any, brandInfo: any): Promise<string[]> {
    return [
      `I'm ready to create amazing concepts for ${projectInfo.title}! While my main creative AI is offline, my 25+ years of experience is working perfectly.

Let me develop detailed concepts once my systems are back online. Meanwhile, what's your key message?`
    ];
  }
}

export const simpleChatFallback = new SimpleChatFallback();
