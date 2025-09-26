import { GoogleAuth } from 'google-auth-library';
import { VeoGenerationRequest, ImagenGenerationRequest } from '@/types';

// Google Cloud AI Platform client
class GoogleAIService {
  private auth: GoogleAuth;
  private projectId: string;

  constructor() {
    this.projectId = process.env.GOOGLE_CLOUD_PROJECT_ID || 'creative-creatives-v2';
    
    // Validate environment variables
    if (!process.env.GOOGLE_CLOUD_CLIENT_EMAIL || !process.env.GOOGLE_CLOUD_PRIVATE_KEY) {
      console.error('Google Cloud credentials missing. Check environment variables.');
    } else {
      console.log(`Google Cloud initialized for project: ${this.projectId}`);
    }
    
    this.auth = new GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLOUD_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_CLOUD_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    });
  }

  private async getAccessToken(): Promise<string> {
    console.log('🔑 Getting Google Cloud access token...');
    const client = await this.auth.getClient();
    const accessToken = await client.getAccessToken();
    console.log('✅ Access token retrieved successfully');
    return accessToken.token || '';
  }

  async generateVideo(request: VeoGenerationRequest): Promise<{ jobId: string }> {
    try {
      console.log('🎬 Starting VEO 3 video generation (using long-running endpoint with approved quota)...');
      console.log('📋 Request:', JSON.stringify(request, null, 2));
      
      const accessToken = await this.getAccessToken();
      
      const apiUrl = `https://us-central1-aiplatform.googleapis.com/v1/projects/${this.projectId}/locations/us-central1/publishers/google/models/veo-3.0-generate-001:predictLongRunning`;
      console.log('🌐 Making request to:', apiUrl);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5 * 60 * 1000); // 5 minutes timeout
      
      // Prepare the request body - support both text-to-video and image-to-video
      const requestBody: any = {
        instances: [{
          prompt: request.prompt
        }],
        parameters: {
          sampleCount: 1,
          resolution: request.resolution || "720p",
          aspect_ratio: request.aspectRatio,
          duration_seconds: request.duration,
          person_generation: request.personGeneration || "allow_adult",
          enhance_prompt: request.enhancePrompt !== false, // Default to true
          generate_audio: request.generateAudio !== false  // Default to true
        }
      };

      // Add image support for image-to-video generation
      if (request.imageUrl || request.imageBytes) {
        console.log('🖼️ [VEO3] Using image-to-video generation');
        console.log('📸 [VEO3] Image URL length:', request.imageUrl?.length || 0);
        console.log('📸 [VEO3] Image URL prefix:', request.imageUrl?.substring(0, 50) + '...');
        
        if (request.imageUrl) {
          if (request.imageUrl.startsWith('data:')) {
            // Base64 data URI - extract the base64 part
            const base64Data = request.imageUrl.split(',')[1];
            console.log('📸 [VEO3] Extracted base64 length:', base64Data?.length || 0);
            
            if (!base64Data || base64Data.length === 0) {
              throw new Error('Invalid base64 image data: extracted data is empty');
            }
            
            requestBody.instances[0].image = {
              imageBytes: base64Data,
              mimeType: request.mimeType || "image/png"
            };
          } else if (request.imageUrl.startsWith('gs://')) {
            // GCS URI
            requestBody.instances[0].image = {
              gcsUri: request.imageUrl,
              mimeType: request.mimeType || "image/png"
            };
          }
        } else if (request.imageBytes) {
          // Direct base64 bytes
          requestBody.instances[0].image = {
            imageBytes: request.imageBytes,
            mimeType: request.mimeType || "image/png"
          };
        }
      } else {
        console.log('📝 [VEO3] Using text-to-video generation');
      }

      console.log('📤 [VEO3] Request body:', JSON.stringify(requestBody, null, 2));

      const response = await fetch(
        apiUrl,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
          signal: controller.signal
        }
      );
      
      clearTimeout(timeoutId);
      console.log('📞 Response received:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('VEO API Error Details:');
        console.error('- Status:', response.status);
        console.error('- Status Text:', response.statusText);
        console.error('- Response Body:', errorText);
        console.error('- Request URL:', `https://us-central1-aiplatform.googleapis.com/v1/projects/${this.projectId}/locations/us-central1/publishers/google/models/veo-3.0-generate-preview:predict`);
        console.error('- Project ID:', this.projectId);
        
        if (response.status === 401) {
          throw new Error(`Authentication failed: ${response.statusText}. Check your Google Cloud credentials.`);
        }
        
        if (response.status === 403) {
          throw new Error(`VEO 3 Preview Access Required: VEO 3 is in controlled preview and requires allowlist access. Apply at Google Cloud Console > Vertex AI > VEO 3 Preview. Your project needs explicit approval to use VEO 3.`);
        }
        
        if (response.status === 404) {
          throw new Error(`VEO 3 model not found: ${response.statusText}. VEO 3 might not be available in us-central1 region for your project.`);
        }
        
        throw new Error(`VEO API error (${response.status}): ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      console.log('📄 Response data:', JSON.stringify(data, null, 2));
      console.log('✅ VEO job started successfully! Job ID:', data.name);
      return { jobId: data.name }; // Returns operation name as job ID
    } catch (error) {
      console.error('❌ [VEO3] Video generation error details:', error);
      
      // Preserve original error message for better debugging
      if (error instanceof Error) {
        console.error('❌ [VEO3] Error message:', error.message);
        console.error('❌ [VEO3] Error stack:', error.stack);
        throw error; // Re-throw the original error with details
      } else {
        console.error('❌ [VEO3] Unknown error type:', typeof error, error);
        throw new Error(`VEO 3 generation failed: ${String(error)}`);
      }
    }
  }

  async generateImage(request: ImagenGenerationRequest): Promise<{ imageUrl: string }> {
    try {
      const accessToken = await this.getAccessToken();
      
      const response = await fetch(
        `https://us-central1-aiplatform.googleapis.com/v1/projects/${this.projectId}/locations/us-central1/publishers/google/models/imagen-3.0-generate-001:predict`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            instances: [{
              prompt: request.prompt,
              config: {
                aspectRatio: request.aspectRatio,
                safetyFilterLevel: request.safetyFilter ? 'block_some' : 'block_few',
                personGeneration: 'dont_allow'
              }
            }],
            parameters: {
              sampleCount: 1
            }
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Imagen API error: ${response.statusText}`);
      }

      const data = await response.json();
      const imageData = data.predictions[0]?.bytesBase64Encoded;
      
      if (!imageData) {
        throw new Error('No image data received from Imagen');
      }

      // Convert base64 to data URL
      const imageUrl = `data:image/png;base64,${imageData}`;
      return { imageUrl };
    } catch (error) {
      console.error('Image generation error:', error);
      throw new Error('Failed to generate image with Imagen');
    }
  }

  async generateAudio(text: string, voiceConfig?: any): Promise<{ audioUrl: string }> {
    try {
      const accessToken = await this.getAccessToken();
      
      const response = await fetch(
        `https://texttospeech.googleapis.com/v1/text:synthesize`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            input: { text },
            voice: {
              languageCode: voiceConfig?.languageCode || 'en-US',
              name: voiceConfig?.voiceName || 'en-US-Journey-D',
              ssmlGender: voiceConfig?.gender || 'NEUTRAL',
            },
            audioConfig: {
              audioEncoding: 'MP3',
              speakingRate: voiceConfig?.speakingRate || 1.0,
              pitch: voiceConfig?.pitch || 0,
              volumeGainDb: voiceConfig?.volumeGain || 0,
            },
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Text-to-Speech API error: ${response.statusText}`);
      }

      const data = await response.json();
      const audioContent = data.audioContent;
      
      if (!audioContent) {
        throw new Error('No audio data received from Text-to-Speech');
      }

      // Convert base64 to data URL
      const audioUrl = `data:audio/mp3;base64,${audioContent}`;
      return { audioUrl };
    } catch (error) {
      console.error('Audio generation error:', error);
      throw new Error('Failed to generate audio');
    }
  }

  async checkVideoStatus(jobId: string): Promise<{ 
    status: 'pending' | 'processing' | 'completed' | 'failed', 
    videoUrl?: string,
    error?: string 
  }> {
    try {
      // Handle development mode mock jobs
      if (jobId.startsWith('dev_job_')) {
        console.log('🚧 [DEV MODE] Mock video status check for:', jobId);
        
        // Simulate video generation completion after 10 seconds
        const jobTimestamp = parseInt(jobId.split('_')[2]);
        const timeElapsed = Date.now() - jobTimestamp;
        
        if (timeElapsed < 5000) {
          return { status: 'pending' };
        } else if (timeElapsed < 10000) {
          return { status: 'processing' };
        } else {
          // Return completed with existing working video
          console.log('🎬 [DEV MODE] Mock video generation completed');
          return { 
            status: 'completed', 
            videoUrl: '/working_video.mp4' // Use existing sample video
          };
        }
      }

      const accessToken = await this.getAccessToken();
      
      const response = await fetch(
        `https://us-central1-aiplatform.googleapis.com/v1/projects/${this.projectId}/locations/us-central1/publishers/google/models/veo-3.0-generate-001:fetchPredictOperation`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            operationName: jobId
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Status check error: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('🔍 Raw VEO status response:', JSON.stringify(data, null, 2));
      
      // Check if operation is done
      if (data.done) {
        console.log('✅ VEO operation is done!');
        if (data.error) {
          return { status: 'failed', error: data.error.message };
        }
        
        const videos = data.response?.videos;
        console.log('🎬 Videos data:', videos);
        if (videos && videos.length > 0) {
          // Check if it's a GCS URI or base64 encoded
          const video = videos[0];
          console.log('📹 Video object keys:', Object.keys(video));
          if (video.gcsUri) {
            console.log('🗂️ Using GCS URI:', video.gcsUri);
            return { status: 'completed', videoUrl: video.gcsUri };
          } else if (video.bytesBase64Encoded) {
            const videoDataSize = video.bytesBase64Encoded.length;
            console.log('💾 Using base64 video data, size:', videoDataSize, 'chars');
            const videoUrl = `data:video/mp4;base64,${video.bytesBase64Encoded}`;
            return { status: 'completed', videoUrl };
          }
        }
      }
      
      // ADDITIONAL CHECK: If we already have videoUrl from previous calls, 
      // the video is complete regardless of the "done" status
      // This handles cases where the status API lags behind actual completion
      if (data.videoUrl && data.videoUrl.length > 1000000) { // 1MB+ of base64 data indicates complete video
        console.log('✅ Found complete video data in response (status override)');
        return { status: 'completed', videoUrl: data.videoUrl };
      }
      
      return { status: 'processing' };
    } catch (error) {
      console.error('Video status check error:', error);
      return { status: 'failed', error: 'Failed to check video status' };
    }
  }

  // Helper method to create optimized prompts for VEO 3 video generation
  // VEO 3 responds well to detailed, specific prompts with visual and technical specifications
  createAdVideoPrompt(concept: string, brand: any, scene: any): string {
    const basePrompt = `Create a professional ${scene.duration}-second advertisement video for ${brand.name}. `;
    const conceptPrompt = `${concept}. `;
    const stylePrompt = `Use ${brand.brandVoice} tone, incorporate brand colors: ${brand.colorPalette?.join(', ')}. `;
    const technicalPrompt = `High-quality commercial production, professional lighting, crisp focus, smooth camera movement, 4K resolution, cinematic composition.`;
    const veo3Optimizations = ` Shot with dynamic camera angles, perfect color grading, engaging visual storytelling.`;
    
    return basePrompt + conceptPrompt + stylePrompt + technicalPrompt + veo3Optimizations;
  }

  createAdImagePrompt(description: string, brand: any): string {
    const basePrompt = `Create a professional advertisement image for ${brand.name}. `;
    const descriptionPrompt = `${description}. `;
    const brandPrompt = `Brand style: ${brand.brandVoice}, colors: ${brand.colorPalette?.join(', ')}. `;
    const qualityPrompt = `High-resolution, commercial photography quality, professional composition.`;
    
    return basePrompt + descriptionPrompt + brandPrompt + qualityPrompt;
  }
}

export const googleAI = new GoogleAIService();
