'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/components/providers/auth-provider';
import { Navigation } from '@/components/layout/navigation';
import { 
  ArrowLeft, 
  Sparkles, 
  Play, 
  Download, 
  Share2, 
  Clock,
  Camera,
  Palette,
  Target,
  Zap,
  CheckCircle,
  Loader2,
  Video,
  Wand2,
  Image as ImageIcon,
  RefreshCw,
  Trash2,
  Eye,
  X,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';
import Link from 'next/link';
import { 
  VeoGenerationRequest, 
  NanoBananaGenerationRequest, 
  ImageAsset, 
  StoryboardPlan,
  StoryboardScene,
  MarcusStoryboardRequest,
  ChatMessage
} from '@/types';

interface BrandInfo {
  name: string;
  industry: string;
  targetAudience: string;
  brandVoice: 'professional' | 'casual' | 'friendly' | 'authoritative' | 'playful';
  colorPalette: string[];
  description: string;
}

interface VideoConfig {
  duration: number;
  aspectRatio: '16:9' | '9:16' | '1:1';
  style: string;
  concept: string;
}

interface GenerationStatus {
  status: 'idle' | 'generating' | 'processing' | 'completed' | 'failed' | 'quota_exceeded';
  progress: number;
  message: string;
  jobId?: string;
  videoUrl?: string;
  error?: string;
  retryAfter?: string;
  quotaLink?: string;
}

interface StoryboardState {
  plan: StoryboardPlan | null;
  isGeneratingPlan: boolean;
  isGeneratingImages: boolean;
  currentGeneratingScene: number | null;
  chatMessages: ChatMessage[];
  planGenerated: boolean;
}

const CreateAdPage: React.FC = () => {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [brandInfo, setBrandInfo] = useState<BrandInfo>({
    name: '',
    industry: '',
    targetAudience: '',
    brandVoice: 'friendly',
    colorPalette: [],
    description: ''
  });
  const [videoConfig, setVideoConfig] = useState<VideoConfig>({
    duration: 30,
    aspectRatio: '16:9',
    style: 'cinematic',
    concept: ''
  });
  const [generationStatus, setGenerationStatus] = useState<GenerationStatus>({
    status: 'idle',
    progress: 0,
    message: 'Ready to create your video ad'
  });

  const [storyboard, setStoryboard] = useState<StoryboardState>({
    plan: null,
    isGeneratingPlan: false,
    isGeneratingImages: false,
    currentGeneratingScene: null,
    chatMessages: [],
    planGenerated: false
  });

  const steps = [
    { number: 1, title: 'Brand Info', icon: <Target className="w-5 h-5" /> },
    { number: 2, title: 'Marcus Chat & Plan', icon: <Wand2 className="w-5 h-5" /> },
    { number:3, title: 'Storyboard Selection', icon: <ImageIcon className="w-5 h-5" /> },
    { number: 4, title: 'Generate Video', icon: <Sparkles className="w-5 h-5" /> }
  ];

  const aspectRatios = [
    { value: '16:9', label: 'Landscape (YouTube, Facebook)', description: '1920x1080' },
    { value: '9:16', label: 'Portrait (Instagram Stories, TikTok)', description: '1080x1920' },
    { value: '1:1', label: 'Square (Instagram Feed)', description: '1080x1080' }
  ] as const;

  const videoStyles = [
    'cinematic', 'documentary', 'commercial', 'lifestyle', 'tech', 'minimal', 'vibrant', 'dramatic'
  ];

  const brandVoices = [
    { value: 'professional', label: 'Professional', description: 'Formal, authoritative, trustworthy' },
    { value: 'casual', label: 'Casual', description: 'Relaxed, approachable, conversational' },
    { value: 'friendly', label: 'Friendly', description: 'Warm, welcoming, personable' },
    { value: 'authoritative', label: 'Authoritative', description: 'Expert, confident, commanding' },
    { value: 'playful', label: 'Playful', description: 'Fun, energetic, creative' }
  ] as const;

  const handleNextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Marcus Storyboard functions
  const handleGenerateStoryboard = async (chatMessages: ChatMessage[], adGoals: string[]) => {
    try {
      setStoryboard(prev => ({ ...prev, isGeneratingPlan: true }));
      
      const storyboardRequest: MarcusStoryboardRequest = {
        brandInfo,
        chatContext: chatMessages.map(msg => `${msg.role}: ${msg.content}`),
        adGoals,
        targetDuration: videoConfig.duration
      };

      const response = await fetch('/api/generate-storyboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(storyboardRequest),
      });

      const data = await response.json();

      if (data.success && data.storyboard) {
        setStoryboard(prev => ({
          ...prev,
          plan: data.storyboard,
          isGeneratingPlan: false,
          planGenerated: true
        }));
      } else {
        throw new Error(data.error || 'Failed to generate storyboard');
      }

    } catch (error) {
      console.error('Storyboard generation error:', error);
      setStoryboard(prev => ({ ...prev, isGeneratingPlan: false }));
    }
  };

  const handleGenerateSceneImages = async (sceneId: string) => {
    try {
      const scene = storyboard.plan?.scenes.find(s => s.id === sceneId);
      if (!scene) return;

      setStoryboard(prev => ({ 
        ...prev, 
        isGeneratingImages: true,
        currentGeneratingScene: scene.sceneNumber
      }));

      // Generate 3 image options for this scene
      const promises = Array.from({ length: 3 }, async (_, index) => {
        const imageRequest: NanoBananaGenerationRequest = {
          prompt: `${scene.prompt}. Professional commercial photography, ${scene.visualStyle.lighting} lighting, ${scene.visualStyle.mood} mood, ${scene.visualStyle.cameraAngle} shot, ${scene.visualStyle.composition} composition. Consistent with ${storyboard.plan?.visualConsistency.style}.`
        };

        const response = await fetch('/api/generate-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(imageRequest),
        });

        const data = await response.json();

        if (data.success && data.images?.[0]) {
          const imageAsset: ImageAsset = {
            id: `${sceneId}_option_${index}_${Date.now()}`,
            projectId: 'temp',
            url: `data:${data.images[0].mimeType};base64,${data.images[0].data}`,
            prompt: scene.prompt,
            approved: false,
            generatedBy: 'nano-banana',
            metadata: { aspectRatio: videoConfig.aspectRatio, editHistory: [] },
            createdAt: new Date()
          };
          return imageAsset;
        }
        return null;
      });

      const generatedImages = (await Promise.all(promises)).filter(Boolean) as ImageAsset[];

      // Update the scene with generated images
      setStoryboard(prev => ({
        ...prev,
        plan: prev.plan ? {
          ...prev.plan,
          scenes: prev.plan.scenes.map(s => 
            s.id === sceneId 
              ? { ...s, generatedImages } 
              : s
          )
        } : null,
        isGeneratingImages: false,
        currentGeneratingScene: null
      }));

    } catch (error) {
      console.error('Scene image generation error:', error);
      setStoryboard(prev => ({ 
        ...prev, 
        isGeneratingImages: false, 
        currentGeneratingScene: null 
      }));
    }
  };

  const handleSelectSceneImage = (sceneId: string, imageId: string) => {
    setStoryboard(prev => ({
      ...prev,
      plan: prev.plan ? {
        ...prev.plan,
        scenes: prev.plan.scenes.map(scene => 
          scene.id === sceneId 
            ? { 
                ...scene, 
                selectedImageId: imageId,
                generatedImages: scene.generatedImages.map(img => ({
                  ...img,
                  approved: img.id === imageId
                }))
              }
            : scene
        )
      } : null
    }));
  };

  const handleEditSceneImage = async (sceneId: string, imageId: string, editPrompt: string) => {
    try {
      const scene = storyboard.plan?.scenes.find(s => s.id === sceneId);
      const imageToEdit = scene?.generatedImages.find(img => img.id === imageId);
      if (!imageToEdit) return;

      // Extract base64 data from data URL
      const base64Data = imageToEdit.url.split(',')[1];

      const response = await fetch('/api/generate-image', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: editPrompt,
          inputImages: [base64Data],
          editMode: 'edit'
        }),
      });

      const data = await response.json();

      if (data.success && data.images?.[0]) {
        const editedImage: ImageAsset = {
          ...imageToEdit,
          id: `edited_${imageId}_${Date.now()}`,
          url: `data:${data.images[0].mimeType};base64,${data.images[0].data}`,
          prompt: `${imageToEdit.prompt} | Edited: ${editPrompt}`,
          metadata: {
            ...imageToEdit.metadata,
            editHistory: [...(imageToEdit.metadata.editHistory || []), editPrompt]
          }
        };

        // Add edited image to the scene
        setStoryboard(prev => ({
          ...prev,
          plan: prev.plan ? {
            ...prev.plan,
            scenes: prev.plan.scenes.map(s => 
              s.id === sceneId 
                ? { 
                    ...s, 
                    generatedImages: [...s.generatedImages, editedImage]
                  }
                : s
            )
          } : null
        }));
      }

    } catch (error) {
      console.error('Scene image editing error:', error);
    }
  };

  const handleGenerateVideo = async () => {
    try {
      setGenerationStatus({
        status: 'generating',
        progress: 10,
        message: 'Creating video from your storyboard...'
      });

      if (!storyboard.plan) {
        throw new Error('No storyboard plan available');
      }

      // Create scene-by-scene video prompt with timing
      const selectedScenes = storyboard.plan.scenes
        .filter(scene => scene.selectedImageId)
        .map(scene => {
          const selectedImage = scene.generatedImages.find(img => img.id === scene.selectedImageId);
          return {
            ...scene,
            selectedImage
          };
        });

      if (selectedScenes.length === 0) {
        throw new Error('Please select at least one image from each scene');
      }

      // Build comprehensive VEO 3 prompt with storyboard structure
      const storyboardPrompt = `
Professional ${videoConfig.duration}-second advertisement for ${brandInfo.name} (${brandInfo.industry}).

STORYBOARD SEQUENCE:
${selectedScenes.map((scene, index) => `
Scene ${scene.sceneNumber} (${scene.duration} seconds): ${scene.title}
- Visual: ${scene.description}
- Style: ${scene.visualStyle.lighting} lighting, ${scene.visualStyle.mood} mood, ${scene.visualStyle.cameraAngle} shot
- Reference: ${scene.selectedImage?.prompt || scene.prompt}
${index < selectedScenes.length - 1 ? '- Transition: Smooth cut to next scene\n' : ''}
`).join('')}

BRAND CONTEXT: ${brandInfo.brandVoice} tone, targeting ${brandInfo.targetAudience}
VISUAL CONSISTENCY: ${storyboard.plan.visualConsistency.style}
NARRATIVE: ${storyboard.plan.narrative.hook} → ${storyboard.plan.narrative.solution} → ${storyboard.plan.narrative.callToAction}

Create seamless video with talking characters, synchronized audio, professional sound effects, and smooth transitions between scenes.
      `.trim();

      const veoRequest: VeoGenerationRequest = {
        prompt: storyboardPrompt,
        duration: videoConfig.duration,
        aspectRatio: videoConfig.aspectRatio,
        style: videoConfig.style
      };

      const response = await fetch('/api/generate-video', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(veoRequest),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        if (errorData.setup_required) {
          throw new Error(`Setup Required: ${errorData.details || 'Google Cloud credentials not configured'}`);
        }
        
        throw new Error(errorData.details || 'Failed to start video generation');
      }

      const { jobId } = await response.json();
      
      setGenerationStatus({
        status: 'processing',
        progress: 30,
        message: 'VEO 3 is creating your video...',
        jobId
      });

      // Poll for completion
      await pollVideoStatus(jobId);

    } catch (error) {
      console.error('Video generation error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      // Check for quota exceeded or rate limit errors
      if (errorMessage.includes('Quota exceeded') || 
          errorMessage.includes('429') || 
          errorMessage.includes('Too Many Requests') ||
          errorMessage.includes('RESOURCE_EXHAUSTED')) {
        setGenerationStatus({
          status: 'quota_exceeded',
          progress: 0,
          message: '🚫 VEO 3 quota exceeded. Google Cloud has reached its limit for video generation requests.',
          error: errorMessage,
          retryAfter: 'Please try again in a few hours or contact support to increase your quota.',
          quotaLink: 'https://cloud.google.com/vertex-ai/docs/generative-ai/quotas-genai'
        });
      } else {
        setGenerationStatus({
          status: 'failed',
          progress: 0,
          message: 'Failed to generate video. Please try again.',
          error: errorMessage
        });
      }
    }
  };

  const pollVideoStatus = async (jobId: string) => {
    const maxAttempts = 30; // 5 minutes max
    let attempts = 0;

    const poll = async () => {
      attempts++;
      
      try {
        const response = await fetch(`/api/video-status/${jobId}`);
        const data = await response.json();
        
        const progressPercentage = Math.min(30 + (attempts * 2), 90);
        
        if (data.status === 'completed' && data.videoUrl) {
          setGenerationStatus({
            status: 'completed',
            progress: 100,
            message: 'Your video ad is ready!',
            jobId,
            videoUrl: data.videoUrl
          });
          return;
        }
        
        if (data.status === 'failed') {
          throw new Error(data.error || 'Video generation failed');
        }
        
        setGenerationStatus(prev => ({
          ...prev,
          progress: progressPercentage,
          message: 'VEO 3 is processing your video...'
        }));
        
        if (attempts < maxAttempts) {
          setTimeout(poll, 10000); // Poll every 10 seconds
        } else {
          throw new Error('Video generation timed out');
        }
      } catch (error) {
        setGenerationStatus({
          status: 'failed',
          progress: 0,
          message: 'Video generation failed',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    };

    poll();
  };

  const createOptimizedPrompt = (): string => {
    const basePrompt = `Create a professional ${videoConfig.duration}-second advertisement video for ${brandInfo.name}. `;
    const conceptPrompt = `${videoConfig.concept}. `;
    const industryPrompt = `This is a ${brandInfo.industry} company targeting ${brandInfo.targetAudience}. `;
    const stylePrompt = `Video style: ${videoConfig.style}, brand voice: ${brandInfo.brandVoice}. `;
    const brandPrompt = brandInfo.colorPalette.length > 0 ? `Brand colors: ${brandInfo.colorPalette.join(', ')}. ` : '';
    const qualityPrompt = `High-quality commercial production, professional lighting, crisp focus, smooth camera movement, engaging visuals.`;
    
    return basePrompt + conceptPrompt + industryPrompt + stylePrompt + brandPrompt + qualityPrompt;
  };

  const addColorToPalette = (color: string) => {
    if (color && !brandInfo.colorPalette.includes(color)) {
      setBrandInfo(prev => ({
        ...prev,
        colorPalette: [...prev.colorPalette, color]
      }));
    }
  };

  const removeColorFromPalette = (color: string) => {
    setBrandInfo(prev => ({
      ...prev,
      colorPalette: prev.colorPalette.filter(c => c !== color)
    }));
  };

  // Redirect to dashboard if not authenticated
  useEffect(() => {
    if (!user) {
      window.location.href = '/';
    }
  }, [user]);

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Navigation />
      
      <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Link href="/dashboard" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Link>
            
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Create New <span className="text-gradient">Video Ad</span>
            </h1>
            <p className="text-xl text-gray-600">
              Use VEO 3 to generate stunning video advertisements in minutes
            </p>
          </motion.div>

          {/* Progress Steps */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <div className="flex items-center justify-center space-x-4 md:space-x-8">
              {steps.map((step, index) => (
                <div key={step.number} className="flex items-center">
                  <div className={`flex items-center justify-center w-12 h-12 rounded-full border-2 transition-colors ${
                    currentStep >= step.number 
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 border-transparent text-white' 
                      : 'border-gray-300 text-gray-500'
                  }`}>
                    {currentStep > step.number ? (
                      <CheckCircle className="w-6 h-6" />
                    ) : (
                      step.icon
                    )}
                  </div>
                  <div className="ml-3 hidden sm:block">
                    <p className={`text-sm font-medium ${
                      currentStep >= step.number ? 'text-gray-900' : 'text-gray-500'
                    }`}>
                      {step.title}
                    </p>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-8 md:w-16 h-1 mx-4 rounded-full ${
                      currentStep > step.number ? 'bg-gradient-to-r from-purple-600 to-blue-600' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </motion.div>

          {/* Step Content */}
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="mb-8">
              <CardContent className="p-8">
                {currentStep === 1 && (
                  <div className="space-y-6">
                    <div className="text-center mb-6">
                      <Target className="w-12 h-12 mx-auto mb-4 text-purple-600" />
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">Tell us about your brand</h2>
                      <p className="text-gray-600">This helps VEO 3 create ads that perfectly match your identity</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="brandName">Brand Name *</Label>
                        <Input
                          id="brandName"
                          value={brandInfo.name}
                          onChange={(e) => setBrandInfo(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="Enter your brand name"
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <Label htmlFor="industry">Industry *</Label>
                        <Input
                          id="industry"
                          value={brandInfo.industry}
                          onChange={(e) => setBrandInfo(prev => ({ ...prev, industry: e.target.value }))}
                          placeholder="e.g., Technology, Fashion, Food"
                          className="mt-1"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <Label htmlFor="targetAudience">Target Audience *</Label>
                        <Input
                          id="targetAudience"
                          value={brandInfo.targetAudience}
                          onChange={(e) => setBrandInfo(prev => ({ ...prev, targetAudience: e.target.value }))}
                          placeholder="e.g., Young professionals aged 25-35"
                          className="mt-1"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <Label htmlFor="description">Brand Description</Label>
                        <Textarea
                          id="description"
                          value={brandInfo.description}
                          onChange={(e) => setBrandInfo(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="Describe what makes your brand unique..."
                          className="mt-1"
                          rows={3}
                        />
                      </div>

                      <div>
                        <Label>Brand Voice *</Label>
                        <div className="mt-2 space-y-2">
                          {brandVoices.map((voice) => (
                            <label key={voice.value} className="flex items-center space-x-3 cursor-pointer">
                              <input
                                type="radio"
                                name="brandVoice"
                                value={voice.value}
                                checked={brandInfo.brandVoice === voice.value}
                                onChange={(e) => setBrandInfo(prev => ({ 
                                  ...prev, 
                                  brandVoice: e.target.value as any 
                                }))}
                                className="w-4 h-4 text-purple-600"
                              />
                              <div>
                                <p className="font-medium text-gray-900">{voice.label}</p>
                                <p className="text-sm text-gray-600">{voice.description}</p>
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>

                      <div>
                        <Label>Brand Colors (Optional)</Label>
                        <div className="mt-2">
                          <div className="flex items-center space-x-2 mb-3">
                            <input
                              type="color"
                              className="w-10 h-10 rounded border border-gray-300"
                              onChange={(e) => addColorToPalette(e.target.value)}
                            />
                            <span className="text-sm text-gray-600">Click to add colors</span>
                          </div>
                          {brandInfo.colorPalette.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {brandInfo.colorPalette.map((color, index) => (
                                <Badge
                                  key={index}
                                  className="cursor-pointer hover:bg-red-100"
                                  style={{ backgroundColor: color, color: '#fff' }}
                                  onClick={() => removeColorFromPalette(color)}
                                >
                                  {color} ✕
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 2: Marcus Chat & Storyboard Planning */}
                {currentStep === 2 && (
                  <div className="space-y-6">
                    <div className="text-center mb-6">
                      <Wand2 className="w-12 h-12 mx-auto mb-4 text-purple-600" />
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">Chat with Marcus & Plan Storyboard</h2>
                      <p className="text-gray-600">Our creative director will plan the perfect advertisement structure</p>
                    </div>

                    <MarcusChatAndPlanning 
                      brandInfo={brandInfo}
                      onGenerateStoryboard={handleGenerateStoryboard}
                      isGenerating={storyboard.isGeneratingPlan}
                      planGenerated={storyboard.planGenerated}
                      storyboardPlan={storyboard.plan}
                    />
                  </div>
                )}

                {currentStep === 3 && (
                  <div className="space-y-6">
                    <div className="text-center mb-6">
                      <ImageIcon className="w-12 h-12 mx-auto mb-4 text-purple-600" />
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">Select Your Storyboard Images</h2>
                      <p className="text-gray-600">Choose the best image for each scene of your advertisement</p>
                    </div>

                    {storyboard.plan && (
                      <StoryboardSelection 
                        storyboardPlan={storyboard.plan}
                        onGenerateSceneImages={handleGenerateSceneImages}
                        onSelectImage={handleSelectSceneImage}
                        onEditImage={handleEditSceneImage}
                        isGeneratingImages={storyboard.isGeneratingImages}
                        currentGeneratingScene={storyboard.currentGeneratingScene}
                      />
                    )}
                  </div>
                )}

                {currentStep === 4 && (
                  <div className="space-y-6">
                    <div className="text-center mb-6">
                      <Sparkles className="w-12 h-12 mx-auto mb-4 text-purple-600" />
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">Generate Your Video Ad</h2>
                      <p className="text-gray-600">Using your approved images, let VEO 3 create your masterpiece with sound and talking characters</p>
                    </div>

                    {/* Summary */}
                    <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-lg">
                      <h3 className="font-semibold text-gray-900 mb-4">Video Summary</h3>
                      <div className="grid md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <strong>Brand:</strong> {brandInfo.name}
                          <br />
                          <strong>Industry:</strong> {brandInfo.industry}
                          <br />
                          <strong>Voice:</strong> {brandInfo.brandVoice}
                        </div>
                        <div>
                          <strong>Duration:</strong> {videoConfig.duration} seconds
                          <br />
                          <strong>Format:</strong> {videoConfig.aspectRatio}
                          <br />
                          <strong>Style:</strong> {videoConfig.style}
                        </div>
                      </div>
                      <div className="mt-4">
                        <strong>Concept:</strong>
                        <p className="text-gray-700 mt-1">{videoConfig.concept}</p>
                      </div>
                    </div>

                    {/* Generation Status */}
                    <AnimatePresence>
                      {generationStatus.status !== 'idle' && (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          className="bg-white p-6 rounded-lg border"
                        >
                          <div className="flex items-center space-x-3 mb-4">
                            {generationStatus.status === 'generating' || generationStatus.status === 'processing' ? (
                              <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
                            ) : generationStatus.status === 'completed' ? (
                              <CheckCircle className="w-6 h-6 text-green-600" />
                            ) : generationStatus.status === 'quota_exceeded' ? (
                              <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center">
                                <span className="text-amber-600 font-bold text-sm">⏳</span>
                              </div>
                            ) : (
                              <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center">
                                <span className="text-red-600 font-bold text-sm">!</span>
                              </div>
                            )}
                            <h4 className="font-medium text-gray-900">{generationStatus.message}</h4>
                          </div>

                          {/* Progress Bar */}
                          <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                            <div 
                              className="bg-gradient-to-r from-purple-600 to-blue-600 h-2 rounded-full transition-all duration-500"
                              style={{ width: `${generationStatus.progress}%` }}
                            />
                          </div>

                          {/* Video Preview */}
                          {generationStatus.videoUrl && (
                            <div className="mt-4">
                              <video 
                                controls 
                                className="w-full max-w-md mx-auto rounded-lg shadow-lg"
                                poster="/api/placeholder/400/225"
                              >
                                <source src={generationStatus.videoUrl} type="video/mp4" />
                                Your browser does not support the video tag.
                              </video>
                              
                              <div className="flex justify-center space-x-4 mt-4">
                                <Button>
                                  <Download className="w-4 h-4 mr-2" />
                                  Download Video
                                </Button>
                                <Button variant="outline">
                                  <Share2 className="w-4 h-4 mr-2" />
                                  Share
                                </Button>
                              </div>
                            </div>
                          )}

                          {generationStatus.error && (
                            <div className="mt-4 p-4 bg-red-50 rounded-lg border border-red-200">
                              <div className="flex items-start space-x-3">
                                <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center mt-0.5">
                                  <span className="text-red-600 font-bold text-xs">!</span>
                                </div>
                                <div className="flex-1">
                                  <h4 className="font-medium text-red-800 mb-1">Generation Failed</h4>
                                  <p className="text-red-700 text-sm">{generationStatus.error}</p>
                                  
                                  {generationStatus.error.includes('Setup Required') && (
                                    <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                      <h5 className="font-medium text-blue-800 mb-2">Quick Setup Guide:</h5>
                                      <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
                                        <li>Go to <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer" className="underline">Google Cloud Console</a></li>
                                        <li>Create or select your project</li>
                                        <li>Enable Vertex AI API</li>
                                        <li>Create a service account with AI Platform permissions</li>
                                        <li>Add credentials to your <code className="bg-blue-100 px-1 rounded">.env.local</code> file</li>
                                        <li>Restart your development server</li>
                                      </ol>
                                      <p className="text-blue-600 text-xs mt-2">
                                        See <code>GOOGLE_CLOUD_SETUP.md</code> for detailed instructions
                                      </p>
                                    </div>
                                  )}

                                  {generationStatus.status === 'quota_exceeded' && (
                                    <div className="mt-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
                                      <h5 className="font-medium text-amber-800 mb-2">🚫 VEO 3 Quota Exceeded</h5>
                                      <p className="text-sm text-amber-700 mb-3">
                                        {generationStatus.retryAfter || 'Your Google Cloud project has reached its VEO 3 usage limit.'}
                                      </p>
                                      <div className="space-y-2 text-sm text-amber-700">
                                        <p><strong>Options to resolve:</strong></p>
                                        <ul className="list-disc list-inside space-y-1 ml-2">
                                          <li>Wait a few hours for quota to reset</li>
                                          <li>Request quota increase from Google Cloud</li>
                                          <li>Try using a different Google Cloud project</li>
                                        </ul>
                                      </div>
                                      {generationStatus.quotaLink && (
                                        <div className="mt-3">
                                          <a 
                                            href={generationStatus.quotaLink} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center text-sm bg-amber-100 hover:bg-amber-200 text-amber-800 px-3 py-2 rounded-md transition-colors"
                                          >
                                            📈 Request Quota Increase
                                          </a>
                                        </div>
                                      )}
                                    </div>
                                  )}

                                  {generationStatus.error.includes('Preview Access Required') && (
                                    <div className="mt-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
                                      <h5 className="font-medium text-purple-800 mb-2">🎬 VEO 3 Preview Access Required</h5>
                                      <p className="text-purple-700 text-sm mb-3">
                                        VEO 3 is currently in controlled preview. Your setup is perfect - you just need Google's approval!
                                      </p>
                                      <div className="space-y-2">
                                        <div className="flex items-center space-x-2">
                                          <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                                          <span className="text-sm text-purple-700">Apply for VEO 3 preview access in Google Cloud Console</span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                          <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                                          <span className="text-sm text-purple-700">Approval typically takes 1-7 business days</span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                          <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                                          <span className="text-sm text-purple-700">Once approved, video generation works instantly</span>
                                        </div>
                                      </div>
                                      <div className="mt-3 flex flex-col sm:flex-row gap-2">
                                        <a 
                                          href="https://console.cloud.google.com/" 
                                          target="_blank" 
                                          rel="noopener noreferrer"
                                          className="inline-flex items-center px-3 py-2 text-sm font-medium text-purple-700 bg-purple-100 rounded-md hover:bg-purple-200 transition-colors"
                                        >
                                          Apply for VEO 3 Access
                                          <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                          </svg>
                                        </a>
                                        <button 
                                          className="inline-flex items-center px-3 py-2 text-sm font-medium text-purple-600 hover:text-purple-800 transition-colors"
                                          onClick={() => {/* Could open detailed instructions */}}
                                        >
                                          View Detailed Guide
                                        </button>
                                      </div>
                                      <p className="text-purple-600 text-xs mt-3">
                                        See <code>VEO3_PREVIEW_ACCESS.md</code> for complete instructions
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {generationStatus.status === 'idle' && (
                      <div className="text-center">
                        <Button 
                          onClick={handleGenerateVideo}
                          disabled={!storyboard.plan || storyboard.plan.scenes.some(scene => !scene.selectedImageId)}
                          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 px-8 py-3 text-lg"
                        >
                          <Video className="w-5 h-5 mr-2" />
                          Generate Video with VEO 3
                        </Button>
                        <div className="mt-3 text-sm">
                          {!storyboard.plan || storyboard.plan.scenes.some(scene => !scene.selectedImageId) ? (
                            <p className="text-amber-600 mb-2">
                              ⚠️ Please select an image for each scene before generating video
                            </p>
                          ) : (
                            <p className="text-green-600 mb-2">
                              ✅ All scenes ready! You can generate your video now
                            </p>
                          )}
                          <p className="text-gray-600">
                            Video generation typically takes 2-5 minutes
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Navigation Buttons */}
          {generationStatus.status === 'idle' && currentStep < 4 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-between"
            >
              <Button 
                variant="outline" 
                onClick={handlePrevStep}
                disabled={currentStep === 1}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>
              
              <Button 
                onClick={handleNextStep}
                disabled={
                  (currentStep === 1 && (!brandInfo.name || !brandInfo.industry || !brandInfo.targetAudience)) ||
                  (currentStep === 2 && !storyboard.planGenerated) ||
                  (currentStep === 3 && (!storyboard.plan || storyboard.plan.scenes.every(s => !s.selectedImageId)))
                }
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                Next
                <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
              </Button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

// Marcus Chat and Storyboard Components

interface MarcusChatAndPlanningProps {
  brandInfo: BrandInfo;
  onGenerateStoryboard: (chatMessages: ChatMessage[], adGoals: string[]) => void;
  isGenerating: boolean;
  planGenerated: boolean;
  storyboardPlan: StoryboardPlan | null;
}

const MarcusChatAndPlanning: React.FC<MarcusChatAndPlanningProps> = ({ 
  brandInfo, 
  onGenerateStoryboard, 
  isGenerating, 
  planGenerated, 
  storyboardPlan 
}) => {
  const [message, setMessage] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [adGoals, setAdGoals] = useState<string[]>([]);

  const handleSendMessage = () => {
    if (message.trim()) {
      const newMessage: ChatMessage = {
        id: `msg_${Date.now()}`,
        role: 'user',
        content: message.trim(),
        timestamp: new Date()
      };

      setChatMessages(prev => [...prev, newMessage]);
      setMessage('');
    }
  };

  const handleAddGoal = (goal: string) => {
    if (goal && !adGoals.includes(goal)) {
      setAdGoals(prev => [...prev, goal]);
    }
  };

  const commonGoals = [
    'Increase brand awareness',
    'Drive website traffic',
    'Generate leads',
    'Boost sales',
    'Build trust',
    'Launch new product',
    'Educate customers',
    'Improve brand perception'
  ];

  return (
    <div className="space-y-6">
      {/* Chat with Marcus */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Wand2 className="w-5 h-5 text-purple-600" />
            <span>Chat with Marcus</span>
          </CardTitle>
          <p className="text-sm text-gray-600">
            Tell Marcus about your advertisement goals and vision
          </p>
        </CardHeader>
        <CardContent>
          {chatMessages.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-4 mb-4 max-h-40 overflow-y-auto">
              {chatMessages.map(msg => (
                <div key={msg.id} className={`mb-2 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                  <div className={`inline-block px-3 py-2 rounded-lg text-sm ${
                    msg.role === 'user' 
                      ? 'bg-purple-600 text-white' 
                      : 'bg-white border border-gray-200'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <div className="flex space-x-2">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Tell Marcus about your advertisement vision..."
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            />
            <Button onClick={handleSendMessage} disabled={!message.trim()}>
              Send
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Ad Goals Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Advertisement Goals</CardTitle>
          <p className="text-sm text-gray-600">
            What do you want this advertisement to achieve?
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-3 mb-4">
            {commonGoals.map(goal => (
              <button
                key={goal}
                onClick={() => handleAddGoal(goal)}
                className={`text-left p-3 rounded-lg border transition-colors ${
                  adGoals.includes(goal)
                    ? 'bg-purple-50 border-purple-300 text-purple-700'
                    : 'bg-white border-gray-300 hover:bg-gray-50'
                }`}
              >
                {goal}
              </button>
            ))}
          </div>

          {adGoals.length > 0 && (
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Selected Goals:</p>
              <div className="flex flex-wrap gap-2">
                {adGoals.map(goal => (
                  <Badge key={goal} variant="secondary" className="bg-purple-100 text-purple-700">
                    {goal}
                    <button 
                      onClick={() => setAdGoals(prev => prev.filter(g => g !== goal))}
                      className="ml-2 text-purple-500 hover:text-purple-700"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Generate Storyboard */}
      <div className="text-center">
        {!planGenerated ? (
          <Button
            onClick={() => onGenerateStoryboard(chatMessages, adGoals)}
            disabled={isGenerating || chatMessages.length === 0 || adGoals.length === 0}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 px-8 py-3"
            size="lg"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Marcus is planning your storyboard...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                Generate Storyboard Plan
              </>
            )}
          </Button>
        ) : (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-600" />
            <h3 className="text-lg font-semibold text-green-800 mb-2">
              Storyboard Plan Ready! 🎬
            </h3>
            <p className="text-green-700 mb-4">
              Marcus created a {storyboardPlan?.scenes.length}-scene storyboard for your {storyboardPlan?.totalDuration}-second advertisement
            </p>
            {storyboardPlan && (
              <div className="text-left bg-white rounded-lg p-4 text-sm">
                <p className="font-medium mb-2">Narrative Structure:</p>
                <p className="text-gray-700">{storyboardPlan.narrative.hook} → {storyboardPlan.narrative.solution} → {storyboardPlan.narrative.callToAction}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

interface StoryboardSelectionProps {
  storyboardPlan: StoryboardPlan;
  onGenerateSceneImages: (sceneId: string) => void;
  onSelectImage: (sceneId: string, imageId: string) => void;
  onEditImage: (sceneId: string, imageId: string, editPrompt: string) => void;
  isGeneratingImages: boolean;
  currentGeneratingScene: number | null;
}

const StoryboardSelection: React.FC<StoryboardSelectionProps> = ({
  storyboardPlan,
  onGenerateSceneImages,
  onSelectImage,
  onEditImage,
  isGeneratingImages,
  currentGeneratingScene
}) => {
  const [editPrompts, setEditPrompts] = useState<Record<string, string>>({});
  const [previewImage, setPreviewImage] = useState<{ url: string; title: string } | null>(null);

  const handleEditSubmit = (sceneId: string, imageId: string) => {
    const key = `${sceneId}_${imageId}`;
    const prompt = editPrompts[key];
    if (prompt?.trim()) {
      onEditImage(sceneId, imageId, prompt);
      setEditPrompts(prev => ({ ...prev, [key]: '' }));
    }
  };

  return (
    <div className="space-y-8">
      {/* Storyboard Overview */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {storyboardPlan.scenes.length}-Scene Storyboard ({storyboardPlan.totalDuration} seconds)
        </h3>
        <div className="grid md:grid-cols-3 gap-4 text-sm">
          <div>
            <strong>Narrative:</strong>
            <p className="text-gray-700">{storyboardPlan.narrative.hook} → {storyboardPlan.narrative.solution}</p>
          </div>
          <div>
            <strong>Visual Style:</strong>
            <p className="text-gray-700">{storyboardPlan.visualConsistency.style}</p>
          </div>
          <div>
            <strong>Characters:</strong>
            <p className="text-gray-700">{storyboardPlan.visualConsistency.characters.join(', ')}</p>
          </div>
        </div>
      </div>

      {/* Scene-by-Scene Selection */}
      {storyboardPlan.scenes.map((scene, index) => (
        <Card key={scene.id} className="overflow-hidden">
          <CardHeader className="bg-gray-50">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                  {scene.sceneNumber}
                </div>
                <div>
                  <h4 className="font-semibold">{scene.title}</h4>
                  <p className="text-sm text-gray-600 font-normal">{scene.duration} seconds</p>
                </div>
              </div>
              <Badge variant="outline">
                {scene.visualStyle.lighting} • {scene.visualStyle.mood}
              </Badge>
            </CardTitle>
            <p className="text-gray-700">{scene.description}</p>
          </CardHeader>
          
          <CardContent className="p-6">
            {scene.generatedImages.length === 0 ? (
              <div className="text-center py-8">
                <ImageIcon className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600 mb-4">Generate image options for this scene</p>
                <Button
                  onClick={() => onGenerateSceneImages(scene.id)}
                  disabled={isGeneratingImages}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                >
                  {isGeneratingImages && currentGeneratingScene === scene.sceneNumber ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating Scene {scene.sceneNumber}...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Generate Scene Images
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <h5 className="font-medium text-gray-900">Choose your favorite image:</h5>
                
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {scene.generatedImages.map((image, imgIndex) => (
                    <div key={image.id} className="space-y-3">
                      {/* Larger Preview Image */}
                      <div
                        className={`relative rounded-lg overflow-hidden border-2 cursor-pointer transition-all group ${
                          image.approved 
                            ? 'border-green-500 ring-2 ring-green-200' 
                            : 'border-gray-200 hover:border-purple-300 hover:shadow-lg'
                        }`}
                        onClick={() => setPreviewImage({ 
                          url: image.url, 
                          title: `Scene ${scene.sceneNumber} - Option ${imgIndex + 1}` 
                        })}
                      >
                        <div className="aspect-[4/3] min-h-[200px]">
                          <img
                            src={image.url}
                            alt={`Scene ${scene.sceneNumber} Option ${imgIndex + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        
                        {/* Preview Overlay */}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center">
                          <div className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-all">
                            <Eye className="w-4 h-4 inline mr-1" />
                            <span className="text-sm font-medium">Preview</span>
                          </div>
                        </div>
                        
                        {image.approved && (
                          <div className="absolute top-3 right-3 bg-green-500 text-white rounded-full p-2 shadow-lg">
                            <CheckCircle className="w-5 h-5" />
                          </div>
                        )}
                        
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                          <p className="text-white text-sm font-medium">Option {imgIndex + 1}</p>
                          <p className="text-gray-200 text-xs">Click to preview</p>
                        </div>
                      </div>
                      
                      {/* Select Button */}
                      <Button
                        onClick={() => onSelectImage(scene.id, image.id)}
                        className={`w-full transition-all ${
                          image.approved 
                            ? 'bg-green-600 hover:bg-green-700 text-white' 
                            : 'bg-gray-100 hover:bg-purple-600 hover:text-white text-gray-700'
                        }`}
                        size="sm"
                      >
                        {image.approved ? (
                          <>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Selected
                          </>
                        ) : (
                          `Select Option ${imgIndex + 1}`
                        )}
                      </Button>
                    </div>
                  ))}
                </div>

                {scene.selectedImageId && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="flex items-center space-x-2 text-green-700 text-sm">
                      <CheckCircle className="w-4 h-4" />
                      <span>Scene {scene.sceneNumber} image selected!</span>
                    </div>
                  </div>
                )}

                {/* Edit Options */}
                {scene.generatedImages.length > 0 && (
                  <div className="border-t pt-4 space-y-3">
                    <p className="text-sm font-medium text-gray-700">Need adjustments? Edit any image:</p>
                    {scene.generatedImages.map((image, imgIndex) => (
                      <div key={`edit_${image.id}`} className="flex space-x-2">
                        <Input
                          placeholder={`Edit Option ${imgIndex + 1} (e.g., "make brighter", "add smile")`}
                          value={editPrompts[`${scene.id}_${image.id}`] || ''}
                          onChange={(e) => setEditPrompts(prev => ({ 
                            ...prev, 
                            [`${scene.id}_${image.id}`]: e.target.value 
                          }))}
                          className="text-sm"
                        />
                        <Button
                          onClick={() => handleEditSubmit(scene.id, image.id)}
                          size="sm"
                          variant="outline"
                          disabled={!editPrompts[`${scene.id}_${image.id}`]?.trim()}
                        >
                          Make Edits
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      ))}

      {/* Progress Summary */}
      <div className="text-center">
        {storyboardPlan.scenes.filter(s => s.selectedImageId).length === storyboardPlan.scenes.length ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-600" />
            <h3 className="text-lg font-semibold text-green-800 mb-2">
              Storyboard Complete! 🎬
            </h3>
            <p className="text-green-700">
              All {storyboardPlan.scenes.length} scenes have selected images. Ready to generate your video!
            </p>
          </div>
        ) : (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-700">
              Progress: {storyboardPlan.scenes.filter(s => s.selectedImageId).length} of {storyboardPlan.scenes.length} scenes complete
            </p>
          </div>
        )}
      </div>

      {/* Image Preview Modal */}
      {previewImage && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] w-full h-full">
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 text-white rounded-full p-2 z-10 transition-all"
            >
              <X className="w-6 h-6" />
            </button>
            
            <div className="bg-white rounded-lg overflow-hidden h-full flex flex-col">
              <div className="bg-gray-50 px-6 py-4 border-b">
                <h3 className="text-lg font-semibold text-gray-900">{previewImage.title}</h3>
              </div>
              
              <div className="flex-1 overflow-auto">
                <div className="p-6 min-h-full flex items-start justify-center">
                  <img
                    src={previewImage.url}
                    alt={previewImage.title}
                    className="block rounded-lg shadow-lg cursor-grab active:cursor-grabbing"
                    style={{ 
                      maxWidth: 'none', 
                      maxHeight: 'none',
                      minWidth: 'auto',
                      minHeight: 'auto',
                      width: 'auto',
                      height: 'auto'
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                  />
                </div>
              </div>
              
              <div className="bg-gray-50 px-6 py-4 border-t">
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-600">
                    <p>💡 Scroll to see full image • Click outside to close</p>
                  </div>
                  <Button
                    onClick={() => setPreviewImage(null)}
                    variant="outline"
                    size="sm"
                  >
                    Close Preview
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateAdPage;
