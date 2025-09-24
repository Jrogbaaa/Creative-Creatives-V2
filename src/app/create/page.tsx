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
  Wand2
} from 'lucide-react';
import Link from 'next/link';
import { VeoGenerationRequest } from '@/types';

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
  status: 'idle' | 'generating' | 'processing' | 'completed' | 'failed';
  progress: number;
  message: string;
  jobId?: string;
  videoUrl?: string;
  error?: string;
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

  const steps = [
    { number: 1, title: 'Brand Info', icon: <Target className="w-5 h-5" /> },
    { number: 2, title: 'Video Concept', icon: <Wand2 className="w-5 h-5" /> },
    { number: 3, title: 'Generate', icon: <Sparkles className="w-5 h-5" /> }
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
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleGenerateVideo = async () => {
    try {
      setGenerationStatus({
        status: 'generating',
        progress: 10,
        message: 'Preparing your video generation...'
      });

      const veoRequest: VeoGenerationRequest = {
        prompt: createOptimizedPrompt(),
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
      setGenerationStatus({
        status: 'failed',
        progress: 0,
        message: 'Failed to generate video. Please try again.',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
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

                {currentStep === 2 && (
                  <div className="space-y-6">
                    <div className="text-center mb-6">
                      <Wand2 className="w-12 h-12 mx-auto mb-4 text-purple-600" />
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">Design your video concept</h2>
                      <p className="text-gray-600">Configure how VEO 3 will create your advertisement</p>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <Label htmlFor="concept">Video Concept & Message *</Label>
                        <Textarea
                          id="concept"
                          value={videoConfig.concept}
                          onChange={(e) => setVideoConfig(prev => ({ ...prev, concept: e.target.value }))}
                          placeholder="Describe your video concept, key message, and what you want viewers to feel or do..."
                          className="mt-1"
                          rows={4}
                        />
                        <p className="text-sm text-gray-600 mt-1">
                          Be specific about scenes, emotions, actions, and your call-to-action
                        </p>
                      </div>

                      <div className="grid md:grid-cols-3 gap-6">
                        <div>
                          <Label>Aspect Ratio</Label>
                          <div className="mt-2 space-y-2">
                            {aspectRatios.map((ratio) => (
                              <label key={ratio.value} className="flex items-start space-x-3 cursor-pointer">
                                <input
                                  type="radio"
                                  name="aspectRatio"
                                  value={ratio.value}
                                  checked={videoConfig.aspectRatio === ratio.value}
                                  onChange={(e) => setVideoConfig(prev => ({ 
                                    ...prev, 
                                    aspectRatio: e.target.value as any 
                                  }))}
                                  className="w-4 h-4 text-purple-600 mt-1"
                                />
                                <div>
                                  <p className="font-medium text-gray-900">{ratio.label}</p>
                                  <p className="text-sm text-gray-600">{ratio.description}</p>
                                </div>
                              </label>
                            ))}
                          </div>
                        </div>

                        <div>
                          <Label>Duration</Label>
                          <div className="mt-2">
                            <select
                              value={videoConfig.duration}
                              onChange={(e) => setVideoConfig(prev => ({ 
                                ...prev, 
                                duration: parseInt(e.target.value) 
                              }))}
                              className="w-full p-2 border border-gray-300 rounded-md"
                            >
                              <option value={15}>15 seconds</option>
                              <option value={30}>30 seconds</option>
                              <option value={60}>60 seconds</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <Label>Video Style</Label>
                          <div className="mt-2">
                            <select
                              value={videoConfig.style}
                              onChange={(e) => setVideoConfig(prev => ({ 
                                ...prev, 
                                style: e.target.value 
                              }))}
                              className="w-full p-2 border border-gray-300 rounded-md"
                            >
                              {videoStyles.map((style) => (
                                <option key={style} value={style}>
                                  {style.charAt(0).toUpperCase() + style.slice(1)}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>

                      {/* Preview of the generated prompt */}
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-medium text-gray-900 mb-2">Generated Prompt Preview:</h4>
                        <p className="text-sm text-gray-700">
                          {createOptimizedPrompt()}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {currentStep === 3 && (
                  <div className="space-y-6">
                    <div className="text-center mb-6">
                      <Sparkles className="w-12 h-12 mx-auto mb-4 text-purple-600" />
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">Generate Your Video Ad</h2>
                      <p className="text-gray-600">Review your settings and let VEO 3 create your masterpiece</p>
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
                          disabled={!brandInfo.name || !brandInfo.industry || !videoConfig.concept}
                          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 px-8 py-3 text-lg"
                        >
                          <Video className="w-5 h-5 mr-2" />
                          Generate Video with VEO 3
                        </Button>
                        <p className="text-sm text-gray-600 mt-2">
                          Video generation typically takes 2-5 minutes
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Navigation Buttons */}
          {generationStatus.status === 'idle' && currentStep < 3 && (
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
                  (currentStep === 2 && !videoConfig.concept)
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

export default CreateAdPage;
