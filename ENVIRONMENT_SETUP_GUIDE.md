# Environment Setup Guide

## Current Status: Development Mode Active 🚧

Your application is currently running in **development mode** with mock AI services because the required API keys are not configured. This allows you to test all functionality with mock responses while you set up the real services.

## Required Environment Variables

Create a `.env.local` file in your project root with the following variables:

### 1. Google Cloud (Required for VEO 3 Video Generation)

```bash
GOOGLE_CLOUD_PROJECT_ID=your-project-id
GOOGLE_CLOUD_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
GOOGLE_CLOUD_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour-Private-Key-Here\n-----END PRIVATE KEY-----"
```

**How to get these:**
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing one
3. Enable the Vertex AI API
4. Create a service account with Vertex AI permissions
5. Download the JSON key file
6. Extract the values from the JSON file

### 2. Gemini API (Required for Nano Banana Character Replacement)

```bash
GEMINI_API_KEY=your-gemini-api-key-here
```

**How to get this:**
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated key

## Development Mode Features

While in development mode, you'll see:

- ✅ **Character Upload & Management**: Fully functional
- ✅ **Storyboard Generation**: Using mock Marcus AI responses
- ✅ **Character Replacement**: Mock image replacement with placeholders
- ✅ **Batch Character Application**: Mock batch processing
- ✅ **Video Generation**: Mock video with existing sample video
- ✅ **All UI Components**: Fully functional with mock data

## What Gets Unlocked With Real API Keys

### With GEMINI_API_KEY:
- Real AI-powered character replacement in images
- Real batch character application across scenes
- Enhanced image generation with Nano Banana

### With Google Cloud Credentials:
- Real VEO 3 video generation (60s videos)
- High-quality text-to-video and image-to-video
- Professional video output with audio

## Testing Without API Keys

You can fully test the character replacement workflow:

1. **Upload a character image** - This works completely
2. **Generate a storyboard** - Mock scenes are generated
3. **Apply character to scenes** - Mock replaced images are shown
4. **Generate video** - Mock video generation with sample output
5. **Test batch operations** - Mock batch character application

## VEO 3 Preview Access

VEO 3 is currently in controlled preview. After setting up Google Cloud credentials, you may need to:

1. Apply for VEO 3 preview access in Google Cloud Console
2. Navigate to Vertex AI → VEO 3 Preview
3. Request access for your project
4. Wait for approval (can take 1-3 business days)

## Environment File Example

Create `.env.local`:

```bash
# Google Cloud for VEO 3 Video Generation
GOOGLE_CLOUD_PROJECT_ID=creative-creatives-v2
GOOGLE_CLOUD_CLIENT_EMAIL=veo-service@creative-creatives-v2.iam.gserviceaccount.com
GOOGLE_CLOUD_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----"

# Gemini API for Nano Banana Character Replacement
GEMINI_API_KEY=AIzaSyA...your-actual-api-key...

# Optional: Firebase for production video storage
FIREBASE_API_KEY=your-firebase-api-key
FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
FIREBASE_PROJECT_ID=your-project-id
```

## Quick Start

1. **Test character replacement now** - Everything works in development mode
2. **Add GEMINI_API_KEY** - For real character replacement
3. **Add Google Cloud credentials** - For real video generation
4. **Apply for VEO 3 access** - For production video creation

## Support

If you encounter issues:

1. Check the browser console for detailed error messages
2. Look for development mode indicators in the logs
3. Verify environment variable names and formatting
4. Ensure API keys have the correct permissions

---

**Current Server**: Running on http://localhost:3001 (development mode active)
