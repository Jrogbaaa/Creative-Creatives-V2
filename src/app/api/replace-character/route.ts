import { NextRequest, NextResponse } from 'next/server';
import { nanoBanana } from '@/lib/nano-banana';
import { HumanCharacterReference } from '@/types';

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const performanceMetrics = {
    startTime,
    validationTime: 0,
    processingTime: 0,
    totalTime: 0
  };

  try {
    // Check if Gemini API key is configured
    if (!process.env.GEMINI_API_KEY) {
      console.log('🚧 [DEV MODE] GEMINI_API_KEY not configured - using mock character replacement');
      
      // Development mode: Return mock replaced images
      if (process.env.NODE_ENV === 'development') {
        const mockImages = [{
          id: `mock_replacement_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          data: 'PHN2ZyB3aWR0aD0iNTAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZWZmNmZmIi8+PHRleHQgeD0iNTAlIiB5PSI0MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNCIgZmlsbD0iIzhjNTU5NSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk1vY2sgQ2hhcmFjdGVyIFJlcGxhY2VtZW50PC90ZXh0Pjx0ZXh0IHg9IjUwJSIgeT0iNjAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiNhZDdhOWYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj4oRGV2ZWxvcG1lbnQgTW9kZSk8L3RleHQ+PHRleHQgeD0iNTAlIiB5PSI3NSUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMiIgZmlsbD0iI2FkN2E5ZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkNvbmZpZ3VyZSBHRU1JTklfQVBJX0tFWSBmb3IgcmVhbCByZXBsYWNlbWVudDwvdGV4dD48L3N2Zz4=',
          mimeType: 'image/svg+xml'
        }];

        console.log('👤 [DEV MODE] Mock character replacement completed');
        
        return NextResponse.json({
          success: true,
          images: mockImages,
          message: 'Mock character replacement successful (development mode)',
          development_mode: true,
          setup_instructions: {
            description: 'To enable real character replacement, configure Gemini API key:',
            required_vars: ['GEMINI_API_KEY'],
            docs_url: 'https://ai.google.dev/gemini-api/docs/api-key'
          }
        });
      }

      return NextResponse.json(
        { 
          error: 'Gemini API key not configured',
          details: 'Please set up GEMINI_API_KEY environment variable for character replacement',
          setup_required: true
        },
        { status: 500 }
      );
    }

    const body: {
      originalImageData: string; // base64 encoded original image
      characterReference: HumanCharacterReference;
      replacementPrompt: string;
      targetDescription?: string;
    } = await request.json();
    
    // Validate required fields
    const validationStartTime = Date.now();
    if (!body.originalImageData || !body.characterReference || !body.replacementPrompt) {
      return NextResponse.json(
        { error: 'Missing required fields: originalImageData, characterReference, and replacementPrompt' },
        { status: 400 }
      );
    }
    performanceMetrics.validationTime = Date.now() - validationStartTime;

    console.log('👤 [API] Starting character replacement...');
    console.log('📝 Character:', body.characterReference.name);
    console.log('📝 Prompt:', body.replacementPrompt);

    // Start processing timer
    const processingStartTime = Date.now();

    // Use Nano Banana's specialized character replacement method
    const result = await nanoBanana.replaceCharacter(
      body.originalImageData,
      body.characterReference.imageData,
      body.replacementPrompt,
      {
        targetDescription: body.targetDescription,
        preserveStyle: true,
        characterDescription: body.characterReference.description
      }
    );
    
    performanceMetrics.processingTime = Date.now() - processingStartTime;
    performanceMetrics.totalTime = Date.now() - startTime;
    
    if (!result.success) {
      throw new Error(result.error || 'Character replacement failed');
    }

    console.log('✅ [API] Character replacement successful');
    console.log('⏱️  [PERF] Processing time:', performanceMetrics.processingTime + 'ms');
    
      return NextResponse.json({
        success: true,
        images: result.images,
        originalPrompt: body.replacementPrompt,
        characterUsed: {
          name: body.characterReference.name,
          description: body.characterReference.description
        },
        message: `Successfully replaced character with ${body.characterReference.name}`,
        performance: {
          validationTime: performanceMetrics.validationTime,
          processingTime: performanceMetrics.processingTime,
          totalTime: performanceMetrics.totalTime,
          timestamp: new Date().toISOString()
        }
      });

  } catch (error) {
    console.error('❌ [API] Character replacement error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const isAuthError = errorMessage.includes('API key') || errorMessage.includes('auth');
    
    return NextResponse.json(
      { 
        error: isAuthError ? 'Gemini API authentication failed' : 'Failed to replace character',
        details: errorMessage,
        setup_required: isAuthError
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Batch character replacement endpoint
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { 
          error: 'Gemini API key not configured',
          details: 'Please set up GEMINI_API_KEY environment variable',
          setup_required: true
        },
        { status: 500 }
      );
    }

    const body: {
      requests: {
        id: string;
        originalImageData: string;
        characterReference: HumanCharacterReference;
        replacementPrompt: string;
        targetDescription?: string;
      }[];
    } = await request.json();
    
    if (!body.requests || !Array.isArray(body.requests) || body.requests.length === 0) {
      return NextResponse.json(
        { error: 'Missing required field: requests array' },
        { status: 400 }
      );
    }

    console.log('👥 [API] Starting batch character replacement...');
    console.log('📊 Processing', body.requests.length, 'requests');

    const results = [];

    // Process each replacement request
    for (const req of body.requests) {
      try {
        const result = await nanoBanana.replaceCharacter(
          req.originalImageData,
          req.characterReference.imageData,
          req.replacementPrompt,
          {
            targetDescription: req.targetDescription,
            preserveStyle: true,
            characterDescription: req.characterReference.description
          }
        );
        
        results.push({
          id: req.id,
          success: result.success,
          images: result.images,
          error: result.error,
          characterUsed: {
            name: req.characterReference.name,
            description: req.characterReference.description
          }
        });

      } catch (error) {
        console.error(`❌ Error processing request ${req.id}:`, error);
        results.push({
          id: req.id,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          images: []
        });
      }
    }

    const successCount = results.filter(r => r.success).length;
    console.log(`✅ [API] Batch replacement completed: ${successCount}/${body.requests.length} successful`);
    
    return NextResponse.json({
      success: true,
      results,
      summary: {
        total: body.requests.length,
        successful: successCount,
        failed: body.requests.length - successCount
      },
      message: `Processed ${body.requests.length} character replacement requests`
    });

  } catch (error) {
    console.error('❌ [API] Batch character replacement error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const isAuthError = errorMessage.includes('API key') || errorMessage.includes('auth');
    
    return NextResponse.json(
      { 
        error: isAuthError ? 'Gemini API authentication failed' : 'Failed to process batch character replacement',
        details: errorMessage,
        setup_required: isAuthError
      },
      { status: 500 }
    );
  }
}
