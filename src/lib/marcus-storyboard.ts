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
As Marcus, an elite creative director with mastery in cinematography and advertising effectiveness science, I need you to create a professional video advertisement storyboard that combines visual excellence with research-backed effectiveness strategies.

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
Plan a ${targetDuration}-second advertisement with 2-4 scenes using elite cinematographic principles. For each scene, specify:

1. Scene duration (4, 6, or 8 seconds - must total ${targetDuration})
2. Scene purpose (hook, problem, solution, call-to-action)
3. Cinematographic approach using Sergio Leone techniques:
   - Camera movement (deliberate dolly/crane vs. slow zoom for tension)
   - Shot contrast (extreme close-up vs. wide shot juxtaposition)
   - Lighting strategy (harsh naturalistic, expressionistic, dramatic)
   - Compositional style (painterly framing, environmental storytelling)
4. Professional Nano Banana prompt with cinematographic details
5. Precise camera work and visual mood

CINEMATOGRAPHIC & ADVERTISING EFFECTIVENESS GUIDELINES:

**Elite Cinematography (Sergio Leone Mastery):**
- Apply "Contrast is King": Use extreme wide shots paired with extreme close-ups for visual tension
- "Movement with Purpose": Every camera movement must serve the story and build emotion  
- "Light as Drama": Use lighting to create mood, atmosphere, and narrative depth
- "Patience in Pacing": Allow shots to breathe and build tension gradually, especially in longer scenes
- "Compositional Precision": Frame each shot like a masterpiece painting
- "Environmental Storytelling": Use setting and landscape as active narrative participants

**Research-Backed Video Ad Effectiveness:**
- **Critical Opening 3 Seconds**: Hook attention immediately with compelling visuals or intrigue
- **Platform Optimization**: Tailor aspect ratio and pacing for target platform:
  * Instagram/TikTok: Vertical (9:16), fast-paced, mobile-optimized
  * YouTube: Horizontal (16:9), longer form, deeper storytelling
  * Facebook: Square (1:1) or horizontal, shareable content focus
- **Emotional Storytelling Priority**: Video is the most effective medium for complex emotional messages
- **Social Interaction Design**: Include elements that encourage likes, shares, comments
- **Personalization Without Invasion**: Relevant to audience without feeling creepy or overly targeted
- **Multi-Platform Synergy**: Ensure consistent brand message across all intended platforms

Ensure visual consistency and cinematic excellence across scenes (same actors, lighting style, brand colors, camera quality).

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
        "lighting": "harsh-naturalistic/expressionistic/dramatic-contrast/soft",
        "mood": "confident/urgent/inspiring/tense/contemplative",
        "cameraAngle": "extreme-close-up/wide-shot/medium/bird's-eye/low-angle",
        "composition": "painterly-centered/rule-of-thirds/juxtaposition-contrast/environmental-storytelling",
        "cameraMovement": "static/slow-zoom/deliberate-dolly/crane-shot/handheld",
        "cinematographyTechnique": "Leone-juxtaposition/psychological-intensity/environmental-character/light-as-drama"
      }
    }
  ],
  "platformOptimization": {
    "primaryPlatform": "Instagram/TikTok/YouTube/Facebook",
    "aspectRatio": "9:16/16:9/1:1",
    "duration": "${targetDuration} seconds",
    "pacing": "fast-mobile/medium-desktop/slow-cinematic",
    "interactionElements": ["What encourages likes/shares/comments"]
  },
  "advertisingEffectiveness": {
    "hookStrategy": "How the first 3 seconds grab attention",
    "emotionalArc": "How emotion builds throughout the ad",
    "personalizedElements": "Audience-relevant details without being invasive",
    "shareabilityFactor": "What makes this likely to be shared",
    "callToActionPower": "Why the CTA will drive action"
  },
  "visualConsistency": {
    "characters": ["main character description"],
    "colorPalette": ["brand color", "accent color"],
    "style": "overall visual style",
    "cinematographicTheme": "Consistent visual theme across scenes"
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
      
      // Convert to StoryboardPlan format with validation
      const rawScenes = parsedResponse.scenes || [];
      console.log(`🔍 [Marcus] Processing ${rawScenes.length} raw scenes`);
      
      // Limit scenes based on target duration
      const maxScenes = request.targetDuration <= 15 ? 3 : 4;
      const limitedScenes = rawScenes.slice(0, maxScenes);
      
      const scenes: StoryboardScene[] = limitedScenes.map((scene: any, index: number) => ({
        id: `scene_${Date.now()}_${index}`,
        sceneNumber: scene.sceneNumber || index + 1,
        title: scene.title || `Scene ${index + 1}`,
        description: scene.description || `Professional scene for ${request.brandInfo.name}`,
        duration: this.validateSceneDuration(scene.duration, request.targetDuration, limitedScenes.length, index),
        prompt: scene.prompt || this.generatePromptFromDescription(scene.description || `Scene ${index + 1}`, request.brandInfo),
        generatedImages: [],
        selectedImageId: undefined,
        visualStyle: scene.visualStyle || {
          lighting: "natural",
          mood: "professional",
          cameraAngle: "medium", 
          composition: "centered"
        }
      }));

      // Ensure total duration doesn't exceed target
      const totalDuration = scenes.reduce((total, scene) => total + scene.duration, 0);
      const adjustedScenes = totalDuration > request.targetDuration 
        ? this.adjustSceneDurations(scenes, request.targetDuration)
        : scenes;

      console.log(`✅ [Marcus] Created ${adjustedScenes.length} scenes with total duration: ${adjustedScenes.reduce((t, s) => t + s.duration, 0)}s`);

      const storyboardPlan: StoryboardPlan = {
        id: `storyboard_${Date.now()}`,
        projectId: 'temp', // Will be updated when project is created
        totalDuration: adjustedScenes.reduce((total, scene) => total + scene.duration, 0),
        scenes: adjustedScenes,
        platformOptimization: parsedResponse.platformOptimization || {
          primaryPlatform: "Instagram",
          aspectRatio: "9:16",
          duration: `${request.targetDuration} seconds`,
          pacing: "fast-mobile",
          interactionElements: ["Strong visual hooks", "Clear brand messaging"]
        },
        advertisingEffectiveness: parsedResponse.advertisingEffectiveness || {
          hookStrategy: "Immediate visual impact in first 3 seconds",
          emotionalArc: "Build from curiosity to desire to action",
          personalizedElements: `Relevant to ${request.brandInfo.targetAudience}`,
          shareabilityFactor: "Memorable visual storytelling",
          callToActionPower: "Clear next step for audience engagement"
        },
        visualConsistency: parsedResponse.visualConsistency || {
          characters: [`Professional representing ${request.brandInfo.targetAudience}`],
          colorPalette: request.brandInfo.colorPalette || ["#3B82F6", "#F8FAFC"],
          style: `${request.brandInfo.brandVoice} commercial style`,
          cinematographicTheme: "Cinematic storytelling with professional polish"
        },
        narrative: parsedResponse.narrative || {
          hook: "Brand introduction",
          solution: "Value proposition", 
          callToAction: "Get started today"
        },
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
    if (!obj || typeof obj !== 'object') {
      return false;
    }
    
    if (!obj.scenes || !Array.isArray(obj.scenes) || obj.scenes.length === 0) {
      return false;
    }
    
    // Check if we have too many scenes (indicates parsing error)
    if (obj.scenes.length > 6) {
      console.log(`⚠️ [Marcus] Too many scenes detected: ${obj.scenes.length}, likely parsing error`);
      return false;
    }
    
    return true;
  }

  /**
   * Validate and adjust scene duration
   */
  private validateSceneDuration(duration: any, targetDuration: number, totalScenes: number, sceneIndex: number): number {
    const optimalDuration = Math.floor(targetDuration / totalScenes);
    
    // If duration is invalid or missing, use optimal duration
    if (typeof duration !== 'number' || duration <= 0 || duration > targetDuration) {
      return optimalDuration;
    }
    
    // Ensure duration is reasonable (between 2 and target duration)
    return Math.min(Math.max(duration, 2), targetDuration);
  }

  /**
   * Adjust scene durations to fit target duration
   */
  private adjustSceneDurations(scenes: StoryboardScene[], targetDuration: number): StoryboardScene[] {
    const totalCurrentDuration = scenes.reduce((total, scene) => total + scene.duration, 0);
    
    if (totalCurrentDuration <= targetDuration) {
      return scenes;
    }
    
    console.log(`🔧 [Marcus] Adjusting scene durations: ${totalCurrentDuration}s → ${targetDuration}s`);
    
    // Proportionally reduce all scene durations
    const ratio = targetDuration / totalCurrentDuration;
    let remainingDuration = targetDuration;
    
    return scenes.map((scene, index) => {
      if (index === scenes.length - 1) {
        // Last scene gets remaining duration
        return { ...scene, duration: Math.max(remainingDuration, 2) };
      } else {
        const adjustedDuration = Math.max(Math.floor(scene.duration * ratio), 2);
        remainingDuration -= adjustedDuration;
        return { ...scene, duration: adjustedDuration };
      }
    });
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
   * Extract scene information from free text with improved logic
   */
  private extractScenesFromText(text: string, request: MarcusStoryboardRequest): any[] {
    console.log('🔍 [Marcus] Extracting scenes from text, target duration:', request.targetDuration);
    
    // Calculate optimal scene count based on duration
    const maxScenes = request.targetDuration <= 15 ? 3 : 4;
    const optimalDuration = Math.floor(request.targetDuration / maxScenes);
    
    // First, try to find properly structured scenes
    const structuredScenes = this.extractStructuredScenes(text, request, maxScenes, optimalDuration);
    if (structuredScenes.length > 0 && structuredScenes.length <= maxScenes) {
      console.log(`✅ [Marcus] Found ${structuredScenes.length} structured scenes`);
      return structuredScenes;
    }
    
    // Fallback to creating default scenes
    console.log(`⚠️ [Marcus] Using default scenes for ${request.targetDuration}s duration`);
    return this.createDefaultScenes(request);
  }

  /**
   * Extract properly structured scenes from text
   */
  private extractStructuredScenes(text: string, request: MarcusStoryboardRequest, maxScenes: number, optimalDuration: number): any[] {
    const scenes = [];
    const scenePatterns = [
      /scene\s*(\d+)[:\-\s]+(.*?)(?=scene\s*\d+|$)/gi,
      /(\d+)\.?\s*\*?\*?(scene|shot|hook|solution|call.to.action)[:\-\s]+(.*?)(?=\d+\.|$)/gi
    ];
    
    for (const pattern of scenePatterns) {
      const matches = [...text.matchAll(pattern)];
      
      if (matches.length > 0 && matches.length <= maxScenes) {
        matches.forEach((match, index) => {
          const sceneText = match[2] || match[3] || match[1];
          if (sceneText && sceneText.length > 10) {
            scenes.push({
              sceneNumber: index + 1,
              title: this.extractSceneTitle(sceneText),
              description: sceneText.trim().substring(0, 150),
              duration: optimalDuration,
              prompt: this.generatePromptFromDescription(sceneText, request.brandInfo),
              visualStyle: {
                lighting: "natural",
                mood: "professional", 
                cameraAngle: "medium",
                composition: "centered"
              }
            });
          }
        });
        
        if (scenes.length > 0) {
          break; // Stop after finding valid scenes
        }
      }
    }
    
    return scenes.slice(0, maxScenes); // Ensure we don't exceed max scenes
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
    const { targetDuration } = request;
    
    // Smart scene count based on duration
    if (targetDuration <= 15) {
      // 15 seconds: 2-3 scenes (5-7 seconds each)
      const sceneDuration = Math.floor(targetDuration / 3);
      return [
        {
          sceneNumber: 1,
          title: "Hook",
          description: "Attention-grabbing opening that introduces the brand",
          duration: sceneDuration,
          prompt: `Professional opening scene for ${request.brandInfo.name}, ${request.brandInfo.brandVoice} style, ${request.brandInfo.industry} setting`,
          visualStyle: { lighting: "natural", mood: "engaging", cameraAngle: "medium", composition: "centered" }
        },
        {
          sceneNumber: 2,
          title: "Solution", 
          description: "Brand solution presentation and key benefits",
          duration: sceneDuration,
          prompt: `${request.brandInfo.name} solution showcase, professional ${request.brandInfo.industry} setting, highlighting benefits`,
          visualStyle: { lighting: "bright", mood: "confident", cameraAngle: "close-up", composition: "rule-of-thirds" }
        },
        {
          sceneNumber: 3,
          title: "Call to Action",
          description: "Final call to action with brand logo", 
          duration: targetDuration - (sceneDuration * 2), // Use remaining time
          prompt: `Call-to-action for ${request.brandInfo.name}, inspiring conclusion with brand logo`,
          visualStyle: { lighting: "warm", mood: "inspiring", cameraAngle: "wide-shot", composition: "dynamic" }
        }
      ];
    } else {
      // 30 seconds: 4 scenes (6-8 seconds each)
      const sceneDuration = Math.floor(targetDuration / 4);
      return [
        {
          sceneNumber: 1,
          title: "Hook",
          description: "Attention-grabbing opening that creates intrigue",
          duration: sceneDuration,
          prompt: `Professional opening hook for ${request.brandInfo.name}, ${request.brandInfo.brandVoice} style, creates immediate interest`,
          visualStyle: { lighting: "dramatic", mood: "engaging", cameraAngle: "close-up", composition: "centered" }
        },
        {
          sceneNumber: 2,
          title: "Problem",
          description: "Present the problem or need the brand solves",
          duration: sceneDuration,
          prompt: `Problem presentation for ${request.brandInfo.name}, relatable ${request.brandInfo.targetAudience} scenario`,
          visualStyle: { lighting: "natural", mood: "empathetic", cameraAngle: "medium", composition: "rule-of-thirds" }
        },
        {
          sceneNumber: 3,
          title: "Solution",
          description: "Brand solution demonstration with key benefits",
          duration: sceneDuration,
          prompt: `${request.brandInfo.name} solution showcase, professional ${request.brandInfo.industry} setting, clear benefits`,
          visualStyle: { lighting: "bright", mood: "confident", cameraAngle: "wide-shot", composition: "dynamic" }
        },
        {
          sceneNumber: 4,
          title: "Call to Action",
          description: "Strong call to action with contact information",
          duration: targetDuration - (sceneDuration * 3), // Use remaining time
          prompt: `Strong call-to-action for ${request.brandInfo.name}, compelling conclusion with clear next steps`,
          visualStyle: { lighting: "warm", mood: "inspiring", cameraAngle: "medium", composition: "centered" }
        }
      ];
    }
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
      platformOptimization: {
        primaryPlatform: "Instagram",
        aspectRatio: "9:16",
        duration: `${request.targetDuration} seconds`,
        pacing: "fast-mobile",
        interactionElements: ["Strong opening hook", "Clear problem-solution narrative", "Compelling CTA"]
      },
      advertisingEffectiveness: {
        hookStrategy: "Immediate problem identification in first 3 seconds",
        emotionalArc: "Problem frustration → solution relief → success satisfaction",
        personalizedElements: `Tailored for ${industry} professionals`,
        shareabilityFactor: "Relatable workplace challenges and transformations",
        callToActionPower: "Clear value proposition with immediate next step"
      },
      visualConsistency: {
        characters: ["professional business person", "diverse team members"],
        colorPalette: [request.brandInfo.colorPalette?.[0] || "#3B82F6", "#F8FAFC", "#1F2937"],
        style: "modern corporate",
        cinematographicTheme: "Professional documentary style with dynamic transitions"
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
      platformOptimization: {
        primaryPlatform: "Instagram",
        aspectRatio: "9:16",
        duration: `${targetDuration} seconds`,
        pacing: "medium-mobile",
        interactionElements: ["Engaging hook", "Clear brand messaging", "Strong CTA"]
      },
      advertisingEffectiveness: {
        hookStrategy: "Relatable opening scenario captures attention",
        emotionalArc: "Curiosity → understanding → motivation to act",
        personalizedElements: `Content relevant to ${brandInfo.targetAudience}`,
        shareabilityFactor: `Professional ${brandInfo.industry} content`,
        callToActionPower: "Clear next step with brand value proposition"
      },
      visualConsistency: {
        characters: [`Professional person representing ${brandInfo.targetAudience}`],
        colorPalette: brandInfo.colorPalette.length > 0 ? brandInfo.colorPalette : ["#4F46E5", "#059669"],
        style: `${brandInfo.brandVoice} commercial photography style`,
        cinematographicTheme: "Clean commercial aesthetic with professional polish"
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
