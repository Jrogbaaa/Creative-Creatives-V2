import { GoogleAuth } from 'google-auth-library';
import { VeoGenerationRequest, ImagenGenerationRequest } from '@/types';

// Google Cloud AI Platform client
class GoogleAIService {
  private auth: GoogleAuth;
  private projectId: string;

  constructor() {
    this.projectId = process.env.GOOGLE_CLOUD_PROJECT_ID || 'creative-creatives-v2';
    this.auth = new GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLOUD_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_CLOUD_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    });
  }

  private async getAccessToken(): Promise<string> {
    const client = await this.auth.getClient();
    const accessToken = await client.getAccessToken();
    return accessToken.token || '';
  }

  async generateVideo(request: VeoGenerationRequest): Promise<{ jobId: string }> {
    try {
      const accessToken = await this.getAccessToken();
      
      const response = await fetch(
        `https://us-central1-aiplatform.googleapis.com/v1/projects/${this.projectId}/locations/us-central1/publishers/google/models/veo-001:predict`,
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
                durationSeconds: request.duration
              }
            }],
            parameters: {
              sampleCount: 1
            }
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Veo API error: ${response.statusText}`);
      }

      const data = await response.json();
      return { jobId: data.name }; // Returns operation name as job ID
    } catch (error) {
      console.error('Video generation error:', error);
      throw new Error('Failed to generate video with Veo');
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
      const accessToken = await this.getAccessToken();
      
      const response = await fetch(
        `https://us-central1-aiplatform.googleapis.com/v1/projects/${this.projectId}/locations/us-central1/publishers/google/models/veo-001:fetchPredictOperation`,
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
      
      if (data.done) {
        if (data.error) {
          return { status: 'failed', error: data.error.message };
        }
        
        const videos = data.response?.videos;
        if (videos && videos.length > 0) {
          // Check if it's a GCS URI or base64 encoded
          const video = videos[0];
          if (video.gcsUri) {
            return { status: 'completed', videoUrl: video.gcsUri };
          } else if (video.bytesBase64Encoded) {
            const videoUrl = `data:video/mp4;base64,${video.bytesBase64Encoded}`;
            return { status: 'completed', videoUrl };
          }
        }
      }
      
      return { status: 'processing' };
    } catch (error) {
      console.error('Video status check error:', error);
      return { status: 'failed', error: 'Failed to check video status' };
    }
  }

  // Helper method to create optimized prompts for different use cases
  createAdVideoPrompt(concept: string, brand: any, scene: any): string {
    const basePrompt = `Create a professional ${scene.duration}-second advertisement video for ${brand.name}. `;
    const conceptPrompt = `${concept}. `;
    const stylePrompt = `Use ${brand.brandVoice} tone, incorporate brand colors: ${brand.colorPalette?.join(', ')}. `;
    const technicalPrompt = `High-quality commercial production, professional lighting, crisp focus, smooth camera movement.`;
    
    return basePrompt + conceptPrompt + stylePrompt + technicalPrompt;
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
