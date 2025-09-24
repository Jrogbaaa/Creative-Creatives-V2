import { 
  StoryboardPlan, 
  StoryboardScene, 
  MarcusStoryboardRequest 
} from '@/types';
import { callMarcusLLM } from '@/lib/marcus-llm';
import { withCache } from '@/lib/ai-cache';

/**
 * Marcus Storyboard Planning Service
 * Uses the creative director AI to plan professional advertisement storyboards
 */
class MarcusStoryboardService {
  
  /**
   * Generate a complete storyboard plan based on brand info and chat context
   */
  async generateStoryboardPlan(request: MarcusStoryboardRequest): Promise<StoryboardPlan> {
    return withCache.storyboard(request, async () => {
    try {
      console.log('🎬 [Marcus] Generating storyboard plan...');
      
      // Enhanced Marcus prompt for storyboard planning
      const storyboardPrompt = this.createStoryboardPrompt(request);
      
        // Call Marcus directly through the LLM service
        const marcusResponse = await callMarcusLLM([
          { 
            id: `msg_${Date.now()}`,
            role: 'user', 
            content: storyboardPrompt,
            timestamp: new Date()
          }
        ], {
        brand: request.brandInfo,
        currentGoal: 'storyboard_planning',
        extractedInfo: {
          chatHistory: request.chatContext,
          adGoals: request.adGoals,
          duration: request.targetDuration
        }
      });

      if (!marcusResponse) {
        throw new Error('Marcus did not provide a response');
      }

      // Parse Marcus's response into a structured storyboard plan
      const storyboardPlan = this.parseStoryboardResponse(marcusResponse, request);
      
      console.log('✅ [Marcus] Storyboard plan generated');
      return storyboardPlan;

    } catch (error) {
      console.error('❌ [Marcus] Storyboard planning error:', error);
      throw error;
    }
    });
  }

  /**
   * Create a professional storyboard planning prompt for Marcus
   */
  private createStoryboardPrompt(request: MarcusStoryboardRequest): string {
    const { brandInfo, chatContext, adGoals, targetDuration } = request;
    
    return `
As Marcus, a world-renowned creative director, I need you to create a professional advertisement storyboard plan.

BRAND CONTEXT:
- Brand: ${brandInfo.name}
- Industry: ${brandInfo.industry}
- Voice: ${brandInfo.brandVoice}
- Target Audience: ${brandInfo.targetAudience}
- Description: ${brandInfo.description}

CHAT CONTEXT:
${chatContext.length > 0 ? chatContext.join('\n') : 'No previous conversation'}

AD REQUIREMENTS:
- Goals: ${adGoals.join(', ')}
- Duration: ${targetDuration} seconds total
- Format: Professional commercial advertisement

STORYBOARD TASK:
Plan a ${targetDuration}-second advertisement with 2-4 scenes. For each scene, specify:

1. Scene duration (4, 6, or 8 seconds - must total ${targetDuration})
2. Scene purpose (hook, problem, solution, call-to-action)
3. Visual description for image generation
4. Professional Nano Banana prompt
5. Camera angle and mood

Ensure visual consistency across scenes (same actors, lighting style, brand colors).

Respond in this exact JSON format:
{
  "narrative": {
    "hook": "Opening hook strategy",
    "problem": "Problem/pain point (optional)",
    "solution": "Brand solution presentation", 
    "callToAction": "Final CTA message"
  },
  "scenes": [
    {
      "sceneNumber": 1,
      "title": "Scene title",
      "description": "What happens in this scene",
      "duration": 6,
      "prompt": "Professional image generation prompt",
      "visualStyle": {
        "lighting": "natural/dramatic/soft",
        "mood": "confident/urgent/inspiring",
        "cameraAngle": "close-up/wide-shot/medium",
        "composition": "centered/rule-of-thirds/dynamic"
      }
    }
  ],
  "visualConsistency": {
    "characters": ["main character description"],
    "colorPalette": ["brand color", "accent color"],
    "style": "overall visual style"
  }
}
`;
  }

  /**
   * Parse Marcus's JSON response into a StoryboardPlan
   */
  private parseStoryboardResponse(
    response: string, 
    request: MarcusStoryboardRequest
  ): StoryboardPlan {
    try {
      console.log('🔍 [Marcus] Raw response length:', response.length);
      console.log('📝 [Marcus] First 200 chars:', response.substring(0, 200));
      
      let parsedResponse: any = null;
      
      // Enhanced Method 1: Try to find JSON code block with multiple patterns
      const codeBlockPatterns = [
        /```(?:json)?\s*(\{[\s\S]*?\})\s*```/,
        /```(?:json)?\s*([\s\S]*?)\s*```/,
        /```\s*(\{[\s\S]*?\})\s*```/
      ];
      
      for (const pattern of codeBlockPatterns) {
        const match = response.match(pattern);
        if (match) {
          try {
            const jsonStr = match[1].trim();
            // Clean up any markdown or extra text
            const cleanedJson = this.cleanJsonString(jsonStr);
            parsedResponse = JSON.parse(cleanedJson);
            if (this.validateStoryboardStructure(parsedResponse)) {
              console.log('✅ [Marcus] Found valid JSON in code block');
              break;
            }
          } catch (e) {
            console.log('⚠️ [Marcus] Code block JSON parse failed, trying next pattern');
            continue;
          }
        }
      }
      
      // Enhanced Method 2: Try to find nested JSON objects with better regex
      if (!parsedResponse) {
        const nestedJsonRegex = /\{(?:[^{}]|\{(?:[^{}]|\{[^{}]*\})*\})*\}/g;
        const jsonMatches = response.match(nestedJsonRegex);
        
        if (jsonMatches) {
          console.log(`🔍 [Marcus] Found ${jsonMatches.length} potential JSON objects`);
          
          // Sort by length (longer is likely more complete)
          const sortedMatches = jsonMatches.sort((a, b) => b.length - a.length);
          
          for (const jsonMatch of sortedMatches) {
            try {
              const cleanedJson = this.cleanJsonString(jsonMatch);
              const testParse = JSON.parse(cleanedJson);
              if (this.validateStoryboardStructure(testParse)) {
                console.log('✅ [Marcus] Found valid storyboard JSON');
                parsedResponse = testParse;
                break;
              }
            } catch (e) {
              continue;
            }
          }
        }
      }
      
      // Enhanced Method 3: Try line-by-line JSON reconstruction
      if (!parsedResponse) {
        console.log('🔄 [Marcus] Attempting line-by-line JSON reconstruction');
        parsedResponse = this.reconstructJsonFromResponse(response);
      }
      
      // Method 4: Extract key information and create structured response
      if (!parsedResponse || !this.validateStoryboardStructure(parsedResponse)) {
        console.log('🚨 [Marcus] Creating intelligent fallback from response content');
        parsedResponse = this.createIntelligentFallback(request, response);
      }
      
      // Convert to StoryboardPlan format
      const scenes: StoryboardScene[] = parsedResponse.scenes.map((scene: any, index: number) => ({
        id: `scene_${Date.now()}_${index}`,
        sceneNumber: scene.sceneNumber || index + 1,
        title: scene.title,
        description: scene.description,
        duration: scene.duration,
        prompt: scene.prompt,
        generatedImages: [],
        selectedImageId: undefined,
        visualStyle: scene.visualStyle
      }));

      const storyboardPlan: StoryboardPlan = {
        id: `storyboard_${Date.now()}`,
        projectId: 'temp', // Will be updated when project is created
        totalDuration: scenes.reduce((total, scene) => total + scene.duration, 0),
        scenes,
        visualConsistency: parsedResponse.visualConsistency,
        narrative: parsedResponse.narrative,
        createdBy: 'marcus',
        createdAt: new Date()
      };

      return storyboardPlan;

    } catch (error) {
      console.error('❌ [Marcus] Failed to parse storyboard response:', error);
      
      // Enhanced Fallback: Create intelligent storyboard based on available context
      return this.createFallbackStoryboard(request, '');
    }
  }

  /**
   * Clean JSON string by removing common formatting issues
   */
  private cleanJsonString(jsonStr: string): string {
    return jsonStr
      .replace(/^[^{]*/, '') // Remove text before first {
      .replace(/[^}]*$/, '') // Remove text after last }
      .replace(/,\s*}/g, '}') // Remove trailing commas
      .replace(/,\s*]/g, ']') // Remove trailing commas in arrays
      .replace(/\n\s*/g, ' ') // Replace newlines with spaces
      .trim();
  }

  /**
   * Validate storyboard structure
   */
  private validateStoryboardStructure(obj: any): boolean {
    return obj && 
           typeof obj === 'object' &&
           obj.scenes && 
           Array.isArray(obj.scenes) && 
           obj.scenes.length > 0 &&
           obj.narrative &&
           typeof obj.narrative === 'object';
  }

  /**
   * Attempt to reconstruct JSON from response by finding key sections
   */
  private reconstructJsonFromResponse(response: string): any | null {
    try {
      // Look for key storyboard elements in the response
      const sceneMatches = response.match(/"scenes"\s*:\s*\[[\s\S]*?\]/i);
      const narrativeMatches = response.match(/"narrative"\s*:\s*\{[\s\S]*?\}/i);
      const visualMatches = response.match(/"visualConsistency"\s*:\s*\{[\s\S]*?\}/i);
      
      if (sceneMatches) {
        let reconstructed = '{';
        
        if (narrativeMatches) {
          reconstructed += '"narrative":' + narrativeMatches[0].split(':').slice(1).join(':').trim() + ',';
        }
        
        reconstructed += '"scenes":' + sceneMatches[0].split(':').slice(1).join(':').trim();
        
        if (visualMatches) {
          reconstructed += ',"visualConsistency":' + visualMatches[0].split(':').slice(1).join(':').trim();
        }
        
        reconstructed += '}';
        
        // Clean and parse
        const cleaned = this.cleanJsonString(reconstructed);
        return JSON.parse(cleaned);
      }
    } catch (e) {
      console.log('⚠️ [Marcus] JSON reconstruction failed');
    }
    return null;
  }

  /**
   * Create intelligent fallback by parsing response content
   */
  private createIntelligentFallback(request: MarcusStoryboardRequest, response: string): any {
    console.log('🧠 [Marcus] Creating intelligent fallback from response analysis');
    
    // Extract any scene information from the response
    const scenes = this.extractScenesFromText(response, request);
    const narrative = this.extractNarrativeFromText(response, request);
    
    return {
      scenes,
      narrative,
      visualConsistency: {
        characters: [`Professional representing ${request.brandInfo.targetAudience}`],
        colorPalette: request.brandInfo.colorPalette || ["#3B82F6", "#F8FAFC"],
        style: `${request.brandInfo.brandVoice} commercial style`
      }
    };
  }

  /**
   * Extract scene information from free text
   */
  private extractScenesFromText(text: string, request: MarcusStoryboardRequest): any[] {
    const sceneKeywords = ['scene', 'shot', 'opening', 'hook', 'solution', 'call to action', 'cta'];
    const lines = text.split('\n').filter(line => line.trim().length > 0);
    
    const scenes = [];
    let currentScene = null;
    
    for (const line of lines) {
      const lowerLine = line.toLowerCase();
      
      // Check if this line might be starting a new scene
      if (sceneKeywords.some(keyword => lowerLine.includes(keyword))) {
        if (currentScene) {
          scenes.push(currentScene);
        }
        
        currentScene = {
          sceneNumber: scenes.length + 1,
          title: this.extractSceneTitle(line),
          description: line.trim(),
          duration: Math.floor(request.targetDuration / 3), // Default split
          prompt: this.generatePromptFromDescription(line, request.brandInfo),
          visualStyle: {
            lighting: "natural",
            mood: "professional",
            cameraAngle: "medium",
            composition: "balanced"
          }
        };
      } else if (currentScene && line.trim().length > 20) {
        // Add to current scene description
        currentScene.description += ' ' + line.trim();
      }
    }
    
    if (currentScene) {
      scenes.push(currentScene);
    }
    
    // If no scenes extracted, create default structure
    if (scenes.length === 0) {
      return this.createDefaultScenes(request);
    }
    
    return scenes;
  }

  /**
   * Extract narrative structure from text
   */
  private extractNarrativeFromText(text: string, request: MarcusStoryboardRequest): any {
    return {
      hook: this.extractByKeywords(text, ['hook', 'opening', 'attention']) || `Engage ${request.brandInfo.targetAudience}`,
      problem: this.extractByKeywords(text, ['problem', 'challenge', 'pain']) || undefined,
      solution: this.extractByKeywords(text, ['solution', 'benefit']) || `${request.brandInfo.name} provides the solution`,
      callToAction: this.extractByKeywords(text, ['cta', 'call to action', 'action']) || `Choose ${request.brandInfo.name} today`
    };
  }

  /**
   * Extract content by keywords
   */
  private extractByKeywords(text: string, keywords: string[]): string | null {
    for (const keyword of keywords) {
      const regex = new RegExp(`${keyword}[^.!?]*[.!?]`, 'i');
      const match = text.match(regex);
      if (match) {
        return match[0].trim();
      }
    }
    return null;
  }

  /**
   * Extract scene title from line
   */
  private extractSceneTitle(line: string): string {
    const cleaned = line.replace(/^[^a-zA-Z]*/, '').trim();
    const firstSentence = cleaned.split('.')[0];
    return firstSentence.length > 50 ? firstSentence.substring(0, 47) + '...' : firstSentence;
  }

  /**
   * Generate prompt from description
   */
  private generatePromptFromDescription(description: string, brandInfo: any): string {
    return `Professional ${brandInfo.industry} advertisement scene: ${description}. ${brandInfo.brandVoice} tone, high-quality commercial photography.`;
  }

  /**
   * Create default scenes when extraction fails
   */
  private createDefaultScenes(request: MarcusStoryboardRequest): any[] {
    const sceneDuration = Math.floor(request.targetDuration / 3);
    
    return [
      {
        sceneNumber: 1,
        title: "Hook",
        description: "Attention-grabbing opening",
        duration: sceneDuration,
        prompt: `Professional opening scene for ${request.brandInfo.name}, ${request.brandInfo.brandVoice} style`,
        visualStyle: { lighting: "natural", mood: "engaging", cameraAngle: "medium", composition: "centered" }
      },
      {
        sceneNumber: 2,
        title: "Solution", 
        description: "Brand solution presentation",
        duration: sceneDuration,
        prompt: `${request.brandInfo.name} solution showcase, professional ${request.brandInfo.industry} setting`,
        visualStyle: { lighting: "bright", mood: "confident", cameraAngle: "close-up", composition: "rule-of-thirds" }
      },
      {
        sceneNumber: 3,
        title: "Call to Action",
        description: "Final call to action", 
        duration: sceneDuration,
        prompt: `Call-to-action for ${request.brandInfo.name}, inspiring conclusion`,
        visualStyle: { lighting: "warm", mood: "inspiring", cameraAngle: "wide-shot", composition: "dynamic" }
      }
    ];
  }

  /**
   * Create a fallback storyboard when JSON parsing fails (legacy method)
   */
  private createFallbackStoryboard(request: MarcusStoryboardRequest, response: string) {
    console.log('🛠️ [Marcus] Creating fallback storyboard structure');
    
    // Analyze response to extract key themes or create generic structure
    const brandName = request.brandInfo.name || 'Your Brand';
    const industry = request.brandInfo.industry || 'business';
    
    // Create 3 generic scenes that total 30 seconds
    const fallbackScenes = [
      {
        sceneNumber: 1,
        title: "Hook & Problem",
        description: `Opening scene showing the challenge faced by ${industry} professionals`,
        duration: 8,
        prompt: `Professional scene showing busy ${industry} workers struggling with manual processes, dynamic lighting, corporate environment`,
        visualStyle: {
          lighting: "natural office lighting",
          mood: "focused but overwhelmed", 
          cameraAngle: "medium shot",
          composition: "dynamic workplace"
        }
      },
      {
        sceneNumber: 2,
        title: "Solution Introduction",
        description: `Introducing ${brandName} as the solution`,
        duration: 12,
        prompt: `Clean, modern scene showcasing ${brandName} software interface, bright optimistic lighting, technology focus`,
        visualStyle: {
          lighting: "bright, clean lighting",
          mood: "optimistic and innovative",
          cameraAngle: "screen focus with human interaction",
          composition: "technology-centered"
        }
      },
      {
        sceneNumber: 3,
        title: "Transformation & CTA",
        description: `Happy, productive professionals using the solution`,
        duration: 10,
        prompt: `Satisfied professionals efficiently working with ${brandName}, warm lighting, success and productivity theme`,
        visualStyle: {
          lighting: "warm, successful ambiance",
          mood: "satisfied and productive",
          cameraAngle: "wide shot showing transformation",
          composition: "success-oriented"
        }
      }
    ];

    return {
      id: `storyboard_fallback_${Date.now()}`,
      projectId: 'temp',
      totalDuration: fallbackScenes.reduce((total, scene) => total + scene.duration, 0),
      scenes: fallbackScenes,
      visualConsistency: {
        characters: ["professional business person", "diverse team members"],
        colorPalette: [request.brandInfo.colorPalette?.[0] || "#3B82F6", "#F8FAFC", "#1F2937"],
        style: "modern corporate"
      },
      narrative: {
        hook: `${industry} professionals waste hours on manual tasks`,
        problem: "Current processes are inefficient and time-consuming",
        solution: `${brandName} automates and streamlines your workflow`,
        callToAction: `Transform your productivity with ${brandName} today`
      },
      createdBy: 'marcus',
      createdAt: new Date()
    };
  }

  /**
   * Create a default storyboard if parsing fails (legacy method)
   */
  private createDefaultStoryboard(request: MarcusStoryboardRequest): StoryboardPlan {
    const { brandInfo, targetDuration } = request;
    
    // Default 3-scene structure for 30-second ad
    const sceneDuration = Math.floor(targetDuration / 3);
    
    const scenes: StoryboardScene[] = [
      {
        id: `scene_${Date.now()}_1`,
        sceneNumber: 1,
        title: "Hook",
        description: "Attention-grabbing opening",
        duration: sceneDuration as 4 | 6 | 8,
        prompt: `Professional commercial opening scene featuring ${brandInfo.industry} context, ${brandInfo.brandVoice} tone, targeting ${brandInfo.targetAudience}`,
        generatedImages: [],
        visualStyle: {
          lighting: "natural",
          mood: "engaging",
          cameraAngle: "medium",
          composition: "centered"
        }
      },
      {
        id: `scene_${Date.now()}_2`,
        sceneNumber: 2,
        title: "Solution",
        description: "Brand solution presentation",
        duration: sceneDuration as 4 | 6 | 8,
        prompt: `${brandInfo.name} product/service showcase, professional ${brandInfo.industry} setting, ${brandInfo.brandVoice} presentation style`,
        generatedImages: [],
        visualStyle: {
          lighting: "bright",
          mood: "confident",
          cameraAngle: "close-up",
          composition: "rule-of-thirds"
        }
      },
      {
        id: `scene_${Date.now()}_3`,
        sceneNumber: 3,
        title: "Call to Action",
        description: "Final call to action",
        duration: sceneDuration as 4 | 6 | 8,
        prompt: `Call-to-action scene for ${brandInfo.name}, results-focused, ${brandInfo.brandVoice} brand voice, ${brandInfo.targetAudience} appeal`,
        generatedImages: [],
        visualStyle: {
          lighting: "warm",
          mood: "inspiring",
          cameraAngle: "wide-shot",
          composition: "dynamic"
        }
      }
    ];

    return {
      id: `storyboard_${Date.now()}`,
      projectId: 'temp',
      totalDuration: targetDuration,
      scenes,
      visualConsistency: {
        characters: [`Professional person representing ${brandInfo.targetAudience}`],
        colorPalette: brandInfo.colorPalette.length > 0 ? brandInfo.colorPalette : ["#4F46E5", "#059669"],
        style: `${brandInfo.brandVoice} commercial photography style`
      },
      narrative: {
        hook: "Capture attention with relatable scenario",
        solution: `Introduce ${brandInfo.name} as the solution`,
        callToAction: "Encourage immediate action"
      },
      createdBy: 'marcus',
      createdAt: new Date()
    };
  }
}

// Export singleton instance
export const marcusStoryboard = new MarcusStoryboardService();
