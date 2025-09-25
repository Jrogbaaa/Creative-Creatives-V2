# 🎬 Video Management & Firebase Implementation Plan

**Date:** September 25, 2025  
**Status:** 📋 **IMPLEMENTATION REQUIRED**

## 🚨 **Current Issues Identified:**

### **1. Video Persistence Problem**
- ❌ **No Storage**: Videos only exist as base64 data URIs in API responses
- ❌ **No Database**: No Firebase storage for videos
- ❌ **No User Management**: No per-user video organization
- ❌ **No Deletion**: No capability to delete individual videos

### **2. Generation Process Clarification**
- ⚠️ **Current**: TEXT-to-video only (VEO3 gets text prompts)
- 🎯 **Desired**: IMAGE-to-video (storyboard → images → videos)
- 📊 **Components**: Marcus (storyboard) + Nano Banana (images) + VEO3 (videos)

### **3. Video Access Problem**
- ❌ **No Gallery**: No way to see all generated videos
- ❌ **No History**: Videos disappear after session
- ❌ **No Organization**: No project-based organization

## ✅ **Implementation Plan:**

### **Phase 1: Firebase Video Storage (PRIORITY 1)**

**1.1 Database Schema:**
```typescript
// Firestore Collections
/users/{userId}/videos/{videoId}
{
  id: string,
  userId: string,
  projectId?: string,
  title: string,
  description: string,
  status: 'processing' | 'completed' | 'failed',
  jobId: string, // VEO3 operation ID
  videoUrl?: string, // base64 or Firebase Storage URL
  storyboardId?: string,
  generatedAt: Timestamp,
  updatedAt: Timestamp,
  metadata: {
    duration: number,
    resolution: string,
    fileSize: number,
    brandInfo: object
  }
}
```

**1.2 Storage Strategy:**
- **Option A**: Store base64 data in Firestore (simple, but expensive for large videos)
- **Option B**: Upload videos to Firebase Storage, store URLs in Firestore (recommended)
- **Option C**: Hybrid - small videos in Firestore, large ones in Storage

**1.3 Required API Changes:**
```typescript
// New endpoints needed:
POST /api/user/videos - Save video after generation
GET /api/user/videos - List user's videos
DELETE /api/user/videos/{videoId} - Delete specific video
GET /api/user/videos/{videoId} - Get specific video
PUT /api/user/videos/{videoId} - Update video metadata
```

### **Phase 2: Video Gallery UI (PRIORITY 2)**

**2.1 Gallery Component:**
- Video thumbnails with play/delete options
- Filter by date, project, status
- Search functionality
- Pagination for large collections

**2.2 Video Player Component:**
- Built-in player with controls
- Download capability
- Share/export options
- Metadata display

### **Phase 3: Image-to-Video Implementation (PRIORITY 3)**

**3.1 Enhanced Generation Flow:**
```
User Input → Marcus (storyboard) → Nano Banana (scene images) → VEO3 (image-to-video)
```

**3.2 VEO3 Image-to-Video Support:**
- Modify `generateVideo()` to accept image inputs
- Update API calls to include image data
- Handle both text-to-video and image-to-video modes

**3.3 Storyboard-Image Integration:**
- Generate images for each storyboard scene
- Pass images + text prompts to VEO3
- Maintain visual consistency across scenes

## 📊 **Technical Requirements:**

### **Firebase Setup:**
- Enable Firestore Database
- Enable Firebase Storage (for large video files)
- Set up Authentication (if not already done)
- Configure security rules for user-specific access

### **Dependencies:**
```bash
npm install firebase firebase-admin
```

### **Environment Variables:**
```
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-service-account-email
FIREBASE_PRIVATE_KEY=your-private-key
FIREBASE_STORAGE_BUCKET=your-storage-bucket
```

## 🎯 **Success Metrics:**

### **Phase 1 Complete:**
- ✅ Videos persist after browser refresh
- ✅ User can see all their videos
- ✅ User can delete specific videos
- ✅ Videos organized by user account

### **Phase 2 Complete:**
- ✅ Beautiful video gallery interface
- ✅ Smooth video playback experience
- ✅ Easy video management (delete, organize, search)

### **Phase 3 Complete:**
- ✅ True image-to-video generation
- ✅ Higher quality, more consistent videos
- ✅ Better alignment with storyboard vision

## 🚀 **Next Steps:**

1. **IMMEDIATE**: Extract all current videos for user review
2. **TODAY**: Implement Firebase video storage
3. **THIS WEEK**: Build video gallery UI
4. **NEXT WEEK**: Upgrade to image-to-video generation

---

**Ready to implement? Let's start with Phase 1 - Firebase video storage!**
