import { NextRequest, NextResponse } from 'next/server';
import { nanoBanana } from '@/lib/nano-banana';
import { NanoBananaGenerationRequest } from '@/types';

export async function POST(request: NextRequest) {
  try {
    // Check if Gemini API key is configured
    if (!process.env.GEMINI_API_KEY) {
      console.log('🚧 [DEV MODE] GEMINI_API_KEY not configured - using mock image generation');
      
      // Development mode: Return mock generated images
      if (process.env.NODE_ENV === 'development') {
        const mockImages = [{
          id: `mock_img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          data: 'PHN2ZyB3aWR0aD0iNTAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI0MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNCIgZmlsbD0iIzY2NzA4NSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk1vY2sgR2VuZXJhdGVkIEltYWdlPC90ZXh0Pjx0ZXh0IHg9IjUwJSIgeT0iNjAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5Y2E0YWYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj4oRGV2ZWxvcG1lbnQgTW9kZSk8L3RleHQ+PHRleHQgeD0iNTAlIiB5PSI3NSUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMiIgZmlsbD0iIzljYTNhZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkNvbmZpZ3VyZSBHRU1JTklfQVBJX0tFWSBmb3IgcmVhbCBnZW5lcmF0aW9uPC90ZXh0Pjwvc3ZnPg==',
          mimeType: 'image/svg+xml'
        }];

        console.log('🎨 [DEV MODE] Mock image generation completed');
        
        return NextResponse.json({
          success: true,
          images: mockImages,
          message: 'Mock image generated successfully (development mode)',
          development_mode: true,
          setup_instructions: {
            description: 'To enable real image generation, configure Gemini API key:',
            required_vars: ['GEMINI_API_KEY'],
            docs_url: 'https://ai.google.dev/gemini-api/docs/api-key'
          }
        });
      }

      return NextResponse.json(
        { 
          error: 'Gemini API key not configured',
          details: 'Please set up GEMINI_API_KEY environment variable for Nano Banana image generation',
          setup_required: true
        },
        { status: 500 }
      );
    }

    const body: NanoBananaGenerationRequest = await request.json();
    
    // Validate required fields
    if (!body.prompt) {
      return NextResponse.json(
        { error: 'Missing required field: prompt' },
        { status: 400 }
      );
    }

    console.log('🍌 [API] Starting Nano Banana image generation...');

    // Generate image(s) with Nano Banana
    const result = await nanoBanana.generateImage(body);
    
    if (!result.success) {
      throw new Error(result.error || 'Image generation failed');
    }

    console.log('✅ [API] Nano Banana generation successful');
    
    return NextResponse.json({
      success: true,
      images: result.images,
      message: `Successfully generated ${result.images?.length || 0} image(s)`
    });

  } catch (error) {
    console.error('❌ [API] Nano Banana generation error:', error);
    
    // Check if it's an API key or auth error
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const isAuthError = errorMessage.includes('API key') || errorMessage.includes('auth') || errorMessage.includes('credentials');
    
    return NextResponse.json(
      { 
        error: isAuthError ? 'Gemini API authentication failed' : 'Failed to generate image',
        details: errorMessage,
        setup_required: isAuthError
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Image editing endpoint - Edit existing images with text prompts
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
      prompt: string; 
      inputImages: string[];
      editMode?: 'edit' | 'compose';
    } = await request.json();
    
    // Validate required fields
    if (!body.prompt || !body.inputImages || body.inputImages.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields: prompt and inputImages' },
        { status: 400 }
      );
    }

    console.log('🖌️ [API] Starting Nano Banana image editing...');

    let result;
    if (body.editMode === 'compose') {
      result = await nanoBanana.composeImages(body.prompt, body.inputImages);
    } else {
      result = await nanoBanana.editImage(body.prompt, body.inputImages);
    }
    
    if (!result.success) {
      throw new Error(result.error || 'Image editing failed');
    }

    console.log('✅ [API] Nano Banana editing successful');
    
    return NextResponse.json({
      success: true,
      images: result.images,
      message: `Successfully edited/composed ${result.images?.length || 0} image(s)`
    });

  } catch (error) {
    console.error('❌ [API] Nano Banana editing error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const isAuthError = errorMessage.includes('API key') || errorMessage.includes('auth');
    
    return NextResponse.json(
      { 
        error: isAuthError ? 'Gemini API authentication failed' : 'Failed to edit image',
        details: errorMessage,
        setup_required: isAuthError
      },
      { status: 500 }
    );
  }
}
