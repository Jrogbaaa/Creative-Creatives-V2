# Creative Creatives V2 - Setup Instructions

## 🚀 Quick Setup Guide

This guide will help you set up the Creative Creatives V2 platform locally and deploy it to production.

## ✅ Prerequisites

Before you begin, ensure you have:

- **Node.js 18+** installed
- **npm** or **yarn** package manager
- **Git** for version control
- **Firebase project** with services enabled
- **Google Cloud project** with AI Platform APIs enabled
- **Hugging Face account** for LLaMA API access

## 🛠️ Local Development Setup

### 1. Clone the Repository

```bash
git clone git@github.com:Jrogbaaa/Creative-Creatives-V2.git
cd Creative-Creatives-V2
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Copy the example environment file:

```bash
cp env.example .env.local
```

Edit `.env.local` with your actual API keys and configuration:

```env
# Firebase Configuration (from your Firebase console)
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyCN57SiQKUSZ-5vgVLAvdmpI89be0vXWJ4
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=creative-creatives-v2.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=creative-creatives-v2
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=creative-creatives-v2.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=918663847472
NEXT_PUBLIC_FIREBASE_APP_ID=1:918663847472:web:4b111fa62f950a066717f5
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-YBL8239S34

# Add your service account details from Firebase console
FIREBASE_PRIVATE_KEY=your_private_key_here
FIREBASE_CLIENT_EMAIL=your_client_email_here

# Google Cloud credentials for AI APIs
GOOGLE_CLOUD_PROJECT_ID=creative-creatives-v2
GOOGLE_CLOUD_PRIVATE_KEY=your_google_cloud_private_key
GOOGLE_CLOUD_CLIENT_EMAIL=your_google_cloud_client_email

# Google AI Platform API keys
GOOGLE_AI_API_KEY=your_google_ai_api_key
VEO_API_ENDPOINT=your_veo_api_endpoint
IMAGEN_API_ENDPOINT=your_imagen_api_endpoint

# Hugging Face API for LLaMA access
HUGGINGFACE_API_KEY=your_huggingface_api_key

# NextJS configuration
NEXTAUTH_SECRET=your_secure_secret_key
NEXTAUTH_URL=http://localhost:3000
```

### 4. Firebase Setup

1. **Create Firebase Project**:
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project or use existing "creative-creatives-v2"

2. **Enable Required Services**:
   - Authentication (Email/Password)
   - Cloud Firestore
   - Cloud Storage
   - Cloud Functions
   - Analytics

3. **Configure Security Rules**:

   **Firestore Rules** (`firestore.rules`):
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       // Users can read/write their own data
       match /users/{userId} {
         allow read, write: if request.auth != null && request.auth.uid == userId;
       }
       
       // Users can read/write their own projects
       match /projects/{projectId} {
         allow read, write: if request.auth != null && 
           resource.data.userId == request.auth.uid;
       }
       
       // Users can read/write their own chat sessions
       match /chatSessions/{sessionId} {
         allow read, write: if request.auth != null && 
           resource.data.userId == request.auth.uid;
       }
     }
   }
   ```

   **Storage Rules** (`storage.rules`):
   ```javascript
   rules_version = '2';
   service firebase.storage {
     match /b/{bucket}/o {
       // Users can upload to their own folders
       match /users/{userId}/{allPaths=**} {
         allow read, write: if request.auth != null && request.auth.uid == userId;
       }
       
       // Public assets (generated content)
       match /public/{allPaths=**} {
         allow read: if true;
         allow write: if request.auth != null;
       }
     }
   }
   ```

### 5. Google Cloud Setup

1. **Enable APIs**:
   - AI Platform API
   - Vertex AI API
   - Text-to-Speech API
   - Cloud Storage API

2. **Create Service Account**:
   - Go to IAM & Admin > Service Accounts
   - Create new service account
   - Download JSON key file
   - Extract `private_key` and `client_email` for environment variables

3. **Set Permissions**:
   - AI Platform User
   - Vertex AI User
   - Cloud Storage Admin

### 6. Google Cloud Vertex AI API Configuration

Based on the [official Vertex AI documentation](https://cloud.google.com/vertex-ai/generative-ai/docs/model-reference/veo-video-generation), the correct endpoints are:

**Veo Video Generation**:
```
https://us-central1-aiplatform.googleapis.com/v1/projects/PROJECT_ID/locations/us-central1/publishers/google/models/veo-001:predict
```

**Imagen Image Generation**:
```
https://us-central1-aiplatform.googleapis.com/v1/projects/PROJECT_ID/locations/us-central1/publishers/google/models/imagen-3.0-generate-001:predict
```

**Operation Status Check**:
```
https://us-central1-aiplatform.googleapis.com/v1/projects/PROJECT_ID/locations/us-central1/publishers/google/models/veo-001:fetchPredictOperation
```

**Request Format for Veo Video Generation**:
```json
{
  "instances": [{
    "prompt": "Your video description here",
    "config": {
      "aspectRatio": "16:9",
      "durationSeconds": 30
    }
  }],
  "parameters": {
    "sampleCount": 1
  }
}
```

**Request Format for Imagen Image Generation**:
```json
{
  "instances": [{
    "prompt": "Your image description here",
    "config": {
      "aspectRatio": "16:9",
      "safetyFilterLevel": "block_few",
      "personGeneration": "dont_allow"
    }
  }],
  "parameters": {
    "sampleCount": 1
  }
}
```

### 7. Hugging Face Setup

**⚠️ CRITICAL**: The Hugging Face API token is essential for the LLaMA creative expert (Marcus) to function.

#### 7.1 Create Account
Sign up at [Hugging Face](https://huggingface.co) if you don't have an account.

#### 7.2 Create READ Token (Required)

1. **Visit Token Settings**: https://huggingface.co/settings/tokens
2. **Click "Create new token"**
3. **Configure Token**:
   - **Name**: `Creative-Creatives-V2-LLaMA`
   - **Type**: **READ** (Not write, not fine-grained)
   - **Description**: Token for Creative Creatives V2 LLaMA inference
4. **Click "Create token"**
5. **Copy the token immediately** (it's only shown once!)

#### 7.3 Verify Token

Test your token immediately:

```bash
# Test your token with curl
curl -H "Authorization: Bearer hf_your_token_here" \
     https://api-inference.huggingface.co/models/meta-llama/Llama-3.1-8B-Instruct
```

**Expected Response**: JSON with model information  
**Error Response**: "Not Found%" indicates invalid token

#### 7.4 Model Access
Ensure you have access to [meta-llama/Llama-3.1-8B-Instruct](https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct). This is a public model that should be accessible with any READ token.

#### 7.5 Common Token Issues

| Error | Cause | Solution |
|-------|-------|----------|
| "An error occurred while fetching the blob" | Invalid/expired token | Create new READ token |
| "Not Found%" | Token authentication failed | Verify token format and permissions |
| "Rate limited" | Too many requests | Wait or upgrade to Pro account |
| "Model not found" | Insufficient permissions | Ensure READ access to public models |

### 8. Test API Integrations

**Before starting the development server**, verify all APIs are working:

```bash
# Run comprehensive API tests
node test-simple.js
```

**Expected Output**:
```
🎯 Overall: 4/4 tests passed
🎉 ALL TESTS PASSED! Your APIs are ready to go!
```

**If tests fail**:
- Review error messages carefully
- Check your `.env.local` file for correct values
- Verify API keys and permissions
- See troubleshooting section below

### 9. Start Development Server

Once all tests pass:

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the application.

## 🚀 Production Deployment

### Vercel Deployment (Recommended)

1. **Connect Repository**:
   - Import project in Vercel dashboard
   - Connect to GitHub repository

2. **Set Environment Variables**:
   - Add all variables from `.env.local` to Vercel environment settings
   - Ensure production URLs are used

3. **Deploy**:
   - Automatic deployment on push to main branch
   - Domain will be provided by Vercel

### Manual Deployment

```bash
# Build the application
npm run build

# Start production server
npm start
```

## 🧪 Testing the Setup

### 1. Authentication Test
- Visit the homepage
- Click "Get Started" or "Sign In"
- Create a new account
- Verify email authentication works

### 2. Creative Expert Test
- Sign in to dashboard
- Click "Chat with Marcus"
- Send a message about your brand
- Verify LLaMA responses work

### 3. Firebase Integration Test
- Check browser dev tools for Firebase connection
- Verify user data is saved to Firestore
- Test file upload functionality

## 🐛 Troubleshooting

### Common Issues

1. **Firebase Connection Error**:
   - Verify API keys in environment variables
   - Check Firebase project configuration
   - Ensure domain is added to authorized domains

2. **LLaMA API Error** ("An error occurred while fetching the blob"):
   - **Most Common**: Invalid or expired Hugging Face token
   - **Solution**: Create new READ token at https://huggingface.co/settings/tokens
   - **Test token**: `curl -H "Authorization: Bearer YOUR_TOKEN" https://api-inference.huggingface.co/models/meta-llama/Llama-3.1-8B-Instruct`
   - **Verify model access**: Ensure you can access meta-llama/Llama-3.1-8B-Instruct
   - **Check API quota**: Verify sufficient quota remaining

3. **Google AI API Error**:
   - Verify Google Cloud project setup
   - Check service account permissions
   - Ensure APIs are enabled

4. **Build Errors**:
   - Run `npm install` to ensure dependencies
   - Check TypeScript errors with `npm run type-check`
   - Verify environment variables are set

### Debug Commands

```bash
# Test all API integrations
node test-simple.js

# Test individual Hugging Face token
curl -H "Authorization: Bearer $(grep HUGGINGFACE_API_KEY .env.local | cut -d'=' -f2)" \
     https://api-inference.huggingface.co/models/meta-llama/Llama-3.1-8B-Instruct

# Check for linting issues
npm run lint

# Type checking
npm run type-check

# Build verification
npm run build

# Dependency audit
npm audit

# Clear Next.js cache
rm -rf .next
npm run build
```

## 📊 Monitoring & Analytics

### Firebase Analytics
- User engagement tracking
- Feature usage metrics
- Error reporting

### Performance Monitoring
- Page load times
- API response times
- User experience metrics

### Custom Analytics
- AI generation success rates
- User session duration
- Feature adoption rates

## 🔒 Security Considerations

### API Key Security
- Never commit API keys to version control
- Use environment variables for all sensitive data
- Rotate keys regularly

### Firebase Security
- Implement proper Firestore rules
- Use Firebase Auth for all protected routes
- Enable security monitoring

### User Data Protection
- Encrypt sensitive user data
- Implement data retention policies
- Provide data export/deletion options

## 📈 Scaling Considerations

### Performance Optimization
- Implement CDN for static assets
- Use Firebase hosting for global distribution
- Optimize image and video delivery

### Database Scaling
- Plan Firestore index strategy
- Implement data archiving
- Monitor usage quotas

### API Limits
- Implement rate limiting
- Cache API responses
- Plan for quota increases

## 🆘 Support

If you encounter issues:

1. Check the [troubleshooting section](#troubleshooting)
2. Review [GitHub Issues](https://github.com/Jrogbaaa/Creative-Creatives-V2/issues)
3. Create a new issue with detailed information
4. Contact support at support@creative-creatives.com

---

**Happy Creating! 🎬✨**
