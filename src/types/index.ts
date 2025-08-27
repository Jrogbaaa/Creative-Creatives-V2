export interface User {
  id: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Brand {
  id: string;
  userId: string;
  name: string;
  description?: string;
  industry: string;
  targetAudience: string;
  brandValues: string[];
  colorPalette: string[];
  logoUrl?: string;
  brandVoice: 'professional' | 'casual' | 'friendly' | 'authoritative' | 'playful';
  createdAt: Date;
  updatedAt: Date;
}

export interface AdProject {
  id: string;
  userId: string;
  brandId: string;
  title: string;
  description?: string;
  duration: number; // in seconds (30)
  status: 'draft' | 'generating' | 'completed' | 'failed';
  goals: string[];
  targetDemographic: {
    ageRange: string;
    gender: string;
    interests: string[];
    location?: string;
  };
  budget?: number;
  deadline?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface AdAsset {
  id: string;
  projectId: string;
  type: 'image' | 'video' | 'audio' | 'text';
  url?: string;
  content?: string;
  metadata: {
    prompt?: string;
    generatedBy: 'veo' | 'imagen' | 'llama' | 'user';
    duration?: number; // for video/audio
    resolution?: string; // for images/video
    fileSize?: number;
  };
  createdAt: Date;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  metadata?: {
    tokens?: number;
    model?: string;
    attachments?: string[];
  };
}

export interface CreativeExpertSession {
  id: string;
  userId: string;
  projectId?: string;
  messages: ChatMessage[];
  context: {
    brand?: Brand;
    currentGoal: 'brand_analysis' | 'concept_development' | 'asset_creation' | 'refinement';
    extractedInfo: Record<string, any>;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface MediaFile {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  userId: string;
  projectId?: string;
  uploadedAt: Date;
}

export interface GenerationRequest {
  id: string;
  projectId: string;
  type: 'image' | 'video' | 'audio';
  prompt: string;
  parameters: Record<string, any>;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  resultUrl?: string;
  error?: string;
  createdAt: Date;
  completedAt?: Date;
}

export interface AdTemplate {
  id: string;
  name: string;
  description: string;
  industry: string[];
  structure: {
    scenes: {
      duration: number;
      type: 'intro' | 'product_showcase' | 'testimonial' | 'call_to_action';
      elements: string[];
    }[];
  };
  isPublic: boolean;
  createdBy: string;
  createdAt: Date;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Google AI API Types
export interface VeoGenerationRequest {
  prompt: string;
  duration: number;
  aspectRatio: '16:9' | '9:16' | '1:1';
  style?: string;
  camera?: string;
  lighting?: string;
}

export interface ImagenGenerationRequest {
  prompt: string;
  aspectRatio: '1:1' | '16:9' | '9:16' | '4:3';
  style?: string;
  quality?: 'standard' | 'high';
  safetyFilter?: boolean;
}

// LLaMA Types
export interface LlamaRequest {
  messages: {
    role: 'user' | 'assistant' | 'system';
    content: string;
  }[];
  max_tokens?: number;
  temperature?: number;
  top_p?: number;
  stream?: boolean;
}

export interface LlamaResponse {
  choices: {
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}
