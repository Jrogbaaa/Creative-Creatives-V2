import { NextRequest, NextResponse } from 'next/server';
import { nanoBanana } from '@/lib/nano-banana';
import { HumanCharacterReference, ImageAsset, BatchCharacterApplicationResult } from '@/types';

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const performanceMetrics = {
    startTime,
    validationTime: 0,
    batchProcessingTime: 0,
    totalScenes: 0,
    averageSceneTime: 0,
    totalTime: 0
  };

  try {
    // Check if Gemini API key is configured
    if (!process.env.GEMINI_API_KEY) {
      console.log('🚧 [DEV MODE] GEMINI_API_KEY not configured - using mock batch character application');
      
      // Development mode: Return mock batch replacement results
      if (process.env.NODE_ENV === 'development') {
        const body = await request.json();
        const mockResults: BatchCharacterApplicationResult = {
          characterId: body.characterReference.id,
          results: body.sceneData.map((scene: any, index: number) => ({
            sceneId: scene.sceneId,
            success: true,
            replacedImages: [{
              id: `mock_batch_${Date.now()}_${index}_${Math.random().toString(36).substr(2, 9)}`,
              data: 'PHN2ZyB3aWR0aD0iNTAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZmVmM2M3Ii8+PHRleHQgeD0iNTAlIiB5PSI0MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNCIgZmlsbD0iI2Q5NzcwNCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk1vY2sgQmF0Y2ggUmVwbGFjZW1lbnQ8L3RleHQ+PHRleHQgeD0iNTAlIiB5PSI2MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iI2Y1OWUwYiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPihEZXZlbG9wbWVudCBNb2RlKTwvdGV4dD48L3N2Zz4=',
              mimeType: 'image/svg+xml'
            } as ImageAsset]
          })),
          totalScenes: body.sceneData.length,
          successfulScenes: body.sceneData.length,
          failedScenes: 0
        };

        console.log('👥 [DEV MODE] Mock batch character application completed for', mockResults.totalScenes, 'scenes');
        
        return NextResponse.json({
          ...mockResults,
          success: true,
          message: 'Mock batch character application successful (development mode)',
          development_mode: true,
          setup_instructions: {
            description: 'To enable real batch character replacement, configure Gemini API key:',
            required_vars: ['GEMINI_API_KEY'],
            docs_url: 'https://ai.google.dev/gemini-api/docs/api-key'
          }
        });
      }

      return NextResponse.json(
        { 
          error: 'Gemini API key not configured',
          details: 'Please set up GEMINI_API_KEY environment variable for batch character application',
          setup_required: true
        },
        { status: 500 }
      );
    }

    const body: {
      characterReference: HumanCharacterReference;
      sceneData: {
        sceneId: string;
        selectedImageData: string; // base64 encoded
        sceneTitle: string;
        sceneDescription: string;
      }[];
      prompt?: string;
    } = await request.json();
    
    // Validate required fields
    const validationStartTime = Date.now();
    if (!body.characterReference || !body.sceneData || body.sceneData.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields: characterReference and sceneData' },
        { status: 400 }
      );
    }
    performanceMetrics.validationTime = Date.now() - validationStartTime;
    performanceMetrics.totalScenes = body.sceneData.length;

    console.log('👥 [API] Starting batch character application...');
    console.log('📝 Character:', body.characterReference.name);
    console.log('📊 Scenes:', body.sceneData.length);

    const basePrompt = body.prompt || `Replace the main character in this scene with ${body.characterReference.name}`;
    
    const results: BatchCharacterApplicationResult = {
      characterId: body.characterReference.id,
      results: [],
      totalScenes: body.sceneData.length,
      successfulScenes: 0,
      failedScenes: 0
    };

    // Start batch processing timer
    const batchProcessingStartTime = Date.now();
    const sceneProcessingTimes: number[] = [];

    // Process each scene
    for (const sceneInfo of body.sceneData) {
      const sceneStartTime = Date.now();
      try {
        console.log(`🔄 Processing scene: ${sceneInfo.sceneTitle}`);

        // Create context-aware prompt for this specific scene
        const contextualPrompt = `${basePrompt}. Scene context: ${sceneInfo.sceneDescription}. Maintain the scene's mood, lighting, and composition while seamlessly integrating ${body.characterReference.name}.`;

        // Use Nano Banana's character replacement method
        const result = await nanoBanana.replaceCharacter(
          sceneInfo.selectedImageData,
          body.characterReference.imageData,
          contextualPrompt,
          {
            preserveStyle: true,
            characterDescription: body.characterReference.description
          }
        );
        
        if (result.success && result.images && result.images.length > 0) {
          // Create new image assets from the replaced images
          const replacedImages: ImageAsset[] = result.images.map((img, index) => ({
            id: `batch_replaced_${Date.now()}_${sceneInfo.sceneId}_${index}_${Math.random().toString(36).substr(2, 9)}`,
            projectId: sceneInfo.sceneId, // Using scene ID as project reference
            url: `data:${img.mimeType};base64,${img.data}`,
            prompt: `${sceneInfo.sceneDescription} [Character replaced with ${body.characterReference.name}]`,
            approved: false,
            generatedBy: 'nano-banana' as const,
            metadata: {
              aspectRatio: '16:9', // Default aspect ratio
              editHistory: [`Batch character replacement: ${contextualPrompt}`]
            },
            createdAt: new Date()
          }));

          results.results.push({
            sceneId: sceneInfo.sceneId,
            success: true,
            replacedImages
          });
          results.successfulScenes++;
          
          console.log(`✅ Scene ${sceneInfo.sceneTitle} completed successfully`);
        } else {
          results.results.push({
            sceneId: sceneInfo.sceneId,
            success: false,
            error: result.error || 'Character replacement failed'
          });
          results.failedScenes++;
          
          console.log(`❌ Scene ${sceneInfo.sceneTitle} failed:`, result.error);
        }

        const sceneProcessingTime = Date.now() - sceneStartTime;
        sceneProcessingTimes.push(sceneProcessingTime);
        console.log(`⏱️  Scene processing time: ${sceneProcessingTime}ms`);

        // Add a small delay between requests to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (error) {
        console.error(`❌ Error processing scene ${sceneInfo.sceneId}:`, error);
        const sceneProcessingTime = Date.now() - sceneStartTime;
        sceneProcessingTimes.push(sceneProcessingTime);
        
        results.results.push({
          sceneId: sceneInfo.sceneId,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
        results.failedScenes++;
      }
    }

    // Calculate final performance metrics
    performanceMetrics.batchProcessingTime = Date.now() - batchProcessingStartTime;
    performanceMetrics.totalTime = Date.now() - startTime;
    performanceMetrics.averageSceneTime = sceneProcessingTimes.length > 0 
      ? Math.round(sceneProcessingTimes.reduce((a, b) => a + b, 0) / sceneProcessingTimes.length)
      : 0;

    console.log(`✅ [API] Batch application completed: ${results.successfulScenes}/${results.totalScenes} successful`);
    console.log(`⏱️  [PERF] Total batch processing time: ${performanceMetrics.batchProcessingTime}ms`);
    console.log(`⏱️  [PERF] Average scene time: ${performanceMetrics.averageSceneTime}ms`);
    
    return NextResponse.json({
      success: true,
      data: results,
      message: `Processed ${results.totalScenes} scenes: ${results.successfulScenes} successful, ${results.failedScenes} failed`,
      performance: {
        validationTime: performanceMetrics.validationTime,
        batchProcessingTime: performanceMetrics.batchProcessingTime,
        totalTime: performanceMetrics.totalTime,
        totalScenes: performanceMetrics.totalScenes,
        averageSceneTime: performanceMetrics.averageSceneTime,
        sceneProcessingTimes,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ [API] Batch character application error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const isAuthError = errorMessage.includes('API key') || errorMessage.includes('auth');
    
    return NextResponse.json(
      { 
        error: isAuthError ? 'Gemini API authentication failed' : 'Failed to process batch character application',
        details: errorMessage,
        setup_required: isAuthError
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  // Health check endpoint
  return NextResponse.json({ 
    status: 'ready',
    endpoint: 'batch-character-application',
    gemini_configured: !!process.env.GEMINI_API_KEY
  });
}
