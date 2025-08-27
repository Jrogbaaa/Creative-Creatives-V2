# Deployment Guide - Creative Creatives V2

## 🚀 Production Deployment Instructions

This guide covers deploying your Creative Creatives V2 platform to production environments.

## ✅ Pre-Deployment Checklist

- [x] All APIs tested and working (Firebase, LLaMA, Google Cloud)
- [x] Environment variables configured
- [x] Production Firebase project set up
- [x] Google Cloud permissions configured
- [x] Code committed to GitHub repository
- [x] Documentation completed

## 🌐 Deployment Options

### Option 1: Vercel (Recommended)

**Why Vercel?**
- Optimized for Next.js applications
- Automatic deployments from GitHub
- Global CDN and edge functions
- Built-in analytics and monitoring

**Steps:**

1. **Connect GitHub Repository**
   ```bash
   # Repository is already set up at:
   # git@github.com:Jrogbaaa/Creative-Creatives-V2.git
   ```

2. **Deploy to Vercel**
   - Visit [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Vercel will auto-detect Next.js configuration

3. **Configure Environment Variables**
   In Vercel dashboard, add these environment variables:
   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyCN57SiQKUSZ-5vgVLAvdmpI89be0vXWJ4
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=creative-creatives-v2.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=creative-creatives-v2
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=creative-creatives-v2.firebasestorage.app
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=918663847472
   NEXT_PUBLIC_FIREBASE_APP_ID=1:918663847472:web:4b111fa62f950a066717f5
   NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-YBL8239S34
   
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n[YOUR_PRIVATE_KEY]\n-----END PRIVATE KEY-----\n"
   FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@creative-creatives-v2.iam.gserviceaccount.com
   
   GOOGLE_CLOUD_PROJECT_ID=creative-creatives-v2
   GOOGLE_CLOUD_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n[YOUR_PRIVATE_KEY]\n-----END PRIVATE KEY-----\n"
   GOOGLE_CLOUD_CLIENT_EMAIL=firebase-adminsdk-fbsvc@creative-creatives-v2.iam.gserviceaccount.com
   
   GOOGLE_AI_API_KEY=AIzaSyB4CnhJ2DOlEaBkmEYBOKmB5MTE_37MRjs
   VEO_API_ENDPOINT=https://us-central1-aiplatform.googleapis.com/v1/projects/creative-creatives-v2/locations/us-central1/publishers/google/models/veo-001:predict
   IMAGEN_API_ENDPOINT=https://us-central1-aiplatform.googleapis.com/v1/projects/creative-creatives-v2/locations/us-central1/publishers/google/models/imagen-3.0-generate-001:predict
   
   HUGGINGFACE_API_KEY=your_huggingface_api_key_here
   LLAMA_MODEL_ENDPOINT=https://api-inference.huggingface.co/models/meta-llama/Llama-3.1-8B-Instruct
   
   NEXTAUTH_SECRET=b1e2f3a4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2
   NEXTAUTH_URL=https://your-domain.vercel.app
   ```

4. **Deploy**
   - Vercel will automatically build and deploy
   - Your app will be available at `https://your-project.vercel.app`

### Option 2: Google Cloud Run

**Steps:**

1. **Build Docker Image**
   ```bash
   # Create Dockerfile (if needed)
   docker build -t creative-creatives-v2 .
   ```

2. **Deploy to Cloud Run**
   ```bash
   gcloud run deploy creative-creatives-v2 \
     --source . \
     --platform managed \
     --region us-central1 \
     --allow-unauthenticated
   ```

### Option 3: AWS Amplify

**Steps:**

1. **Connect Repository**
   - Connect your GitHub repository in AWS Amplify console

2. **Configure Build Settings**
   ```yaml
   version: 1
   frontend:
     phases:
       preBuild:
         commands:
           - npm install
       build:
         commands:
           - npm run build
     artifacts:
       baseDirectory: .next
       files:
         - '**/*'
     cache:
       paths:
         - node_modules/**/*
   ```

## 🔧 Production Configuration

### 1. Firebase Security Rules

**Firestore Rules:**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Projects access control
    match /projects/{projectId} {
      allow read, write: if request.auth != null && 
        resource.data.userId == request.auth.uid;
    }
    
    // Chat sessions
    match /chatSessions/{sessionId} {
      allow read, write: if request.auth != null && 
        resource.data.userId == request.auth.uid;
    }
    
    // Generated assets
    match /assets/{assetId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        resource.data.userId == request.auth.uid;
    }
  }
}
```

**Storage Rules:**
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // User-specific uploads
    match /users/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId
        && resource.size < 100 * 1024 * 1024; // 100MB limit
    }
    
    // Public generated content
    match /generated/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

### 2. Performance Optimizations

**Next.js Configuration:**
```javascript
// next.config.js
module.exports = {
  images: {
    domains: [
      'firebasestorage.googleapis.com',
      'storage.googleapis.com',
    ],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  compress: true,
  poweredByHeader: false,
  generateEtags: false,
  httpAgentOptions: {
    keepAlive: true,
  },
}
```

### 3. Monitoring & Analytics

**Firebase Analytics Configuration:**
```typescript
// Enable enhanced analytics
import { getAnalytics, logEvent } from 'firebase/analytics';

// Track user interactions
logEvent(analytics, 'ad_creation_started');
logEvent(analytics, 'marcus_chat_initiated');
logEvent(analytics, 'video_generation_completed');
```

## 🔐 Security Considerations

### 1. API Key Management
- Never expose private keys in client-side code
- Use environment variables for all sensitive data
- Implement API key rotation strategy
- Monitor API usage and set quotas

### 2. Authentication Security
- Enable MFA for admin accounts
- Implement session management
- Use HTTPS everywhere
- Regular security audits

### 3. Data Protection
- Encrypt sensitive user data
- Implement data retention policies
- GDPR compliance for EU users
- Regular security updates

## 📊 Monitoring & Maintenance

### 1. Performance Monitoring
- **Vercel Analytics**: Built-in performance monitoring
- **Firebase Performance**: Track app performance
- **Google Cloud Monitoring**: API usage and errors
- **Custom Metrics**: Track business KPIs

### 2. Error Tracking
- **Sentry Integration**: Real-time error tracking
- **Firebase Crashlytics**: Mobile app crashes
- **Custom Logging**: Business logic errors

### 3. Backup Strategy
- **Firebase Backups**: Regular Firestore exports
- **Code Backups**: GitHub repository protection
- **Asset Backups**: Cloud Storage versioning
- **Configuration Backups**: Environment variable storage

## 🚀 Go-Live Checklist

- [ ] Domain configured and SSL enabled
- [ ] All environment variables set in production
- [ ] Firebase security rules deployed
- [ ] Google Cloud permissions verified
- [ ] Performance monitoring configured
- [ ] Error tracking enabled
- [ ] Backup strategy implemented
- [ ] Load testing completed
- [ ] Documentation updated
- [ ] Team training completed

## 📞 Support & Maintenance

### Post-Deployment Tasks
1. **Monitor Performance**: Check metrics daily for first week
2. **User Feedback**: Collect and analyze user feedback
3. **Bug Fixes**: Address any production issues quickly
4. **Feature Updates**: Plan next iteration based on usage data

### Scaling Considerations
- **Auto-scaling**: Configure based on traffic patterns
- **CDN Optimization**: Global content delivery
- **Database Optimization**: Index optimization for Firestore
- **API Rate Limiting**: Implement throttling for fair usage

---

**🎉 Your Creative Creatives V2 platform is ready for production!**

The platform is fully implemented with all AI integrations, beautiful UI, and comprehensive documentation. Ready to help advertisers create amazing 30-second ads! 🎬✨
