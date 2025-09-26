import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  getDoc, 
  query, 
  where, 
  orderBy, 
  limit as firestoreLimit,
  Timestamp 
} from 'firebase/firestore';
import { 
  getStorage, 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject 
} from 'firebase/storage';

// Import Firebase configurations
import firebaseApp, { db as firebaseDb } from './firebase';

// Only import admin SDK on server-side to avoid client-side module resolution errors
let adminDb: any = null;
if (typeof window === 'undefined') {
  try {
    const { adminDb: importedAdminDb } = require('./firebase-admin');
    adminDb = importedAdminDb;
  } catch (error) {
    console.warn('Firebase Admin SDK not available:', error.message);
  }
}

// Detect if running on server-side (for API routes) or client-side
const isServerSide = typeof window === 'undefined';

// Try to use proper Firebase configuration
const db = isServerSide ? adminDb : firebaseDb;
const app = isServerSide ? null : firebaseApp;
const storage = !isServerSide && app ? getStorage(app) : null;
const isFirebaseConfigured = !!db;

console.log('🔧 Firebase Video Service - Configuration status:', { 
  isServerSide,
  isFirebaseConfigured,
  usingAdminSDK: isServerSide && !!adminDb,
  usingClientSDK: !isServerSide && !!firebaseDb,
  hasDb: !!db,
  hasStorage: !!storage
});

// If Firebase is not configured, we'll fall back to development storage
if (!isFirebaseConfigured) {
  console.warn('⚠️ Firebase not properly configured, using development storage');
}

// Development fallback storage
const devStorage = new Map<string, StoredVideo>();

// Add some sample videos for development testing
if (!isFirebaseConfigured) {
  // Sample video data for testing
  const sampleVideos: StoredVideo[] = [
    {
      id: 'sample_video_1',
      userId: '7gRRSlbgBjg0klsSERzJid5fVqd2', // Use the user ID from logs
      title: 'Tech Startup Ad - Demo',
      description: '30s technology advertisement for developers and entrepreneurs',
      status: 'completed',
      jobId: 'sample_job_1',
      videoUrl: `/working_video.mp4`, // Use actual generated video file
      storyboardId: 'sample_storyboard_1',
      generatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      metadata: {
        duration: 30,
        resolution: '720p',
        aspectRatio: '16:9',
        fileSize: 5242880, // ~5MB
        brandInfo: {
          name: 'TechFlow',
          industry: 'Technology',
          targetAudience: 'Developers and entrepreneurs'
        },
        sceneCount: 4
      }
    },
    {
      id: 'sample_video_2',
      userId: '7gRRSlbgBjg0klsSERzJid5fVqd2',
      title: 'Fashion Brand Ad - Creative',
      description: '15s fashion advertisement for young adults',
      status: 'completed',
      jobId: 'sample_job_2',
      videoUrl: 'data:video/mp4;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
      storyboardId: 'sample_storyboard_2',
      generatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      metadata: {
        duration: 15,
        resolution: '720p',
        aspectRatio: '9:16',
        fileSize: 3145728, // ~3MB
        brandInfo: {
          name: 'StyleWave',
          industry: 'Fashion',
          targetAudience: 'Young adults 18-25'
        },
        sceneCount: 2
      }
    },
    {
      id: 'sample_video_3',
      userId: '7gRRSlbgBjg0klsSERzJid5fVqd2',
      title: 'Restaurant Promo - Appetizing',
      description: '30s restaurant advertisement for food lovers',
      status: 'processing',
      jobId: 'sample_job_3',
      storyboardId: 'sample_storyboard_3',
      generatedAt: new Date(Date.now() - 10 * 60 * 1000), // 10 minutes ago
      updatedAt: new Date(Date.now() - 5 * 60 * 1000),
      metadata: {
        duration: 30,
        resolution: '720p',
        aspectRatio: '1:1',
        fileSize: 0,
        brandInfo: {
          name: 'Bistro Delights',
          industry: 'Food & Beverage',
          targetAudience: 'Food lovers and local diners'
        },
        sceneCount: 3
      }
    }
  ];

  // Add sample videos to dev storage
  sampleVideos.forEach(video => {
    devStorage.set(video.id, video);
  });
  
  console.log(`🎬 Added ${sampleVideos.length} sample videos to development storage`);
}

// Types
export interface StoredVideo {
  id: string;
  userId: string;
  projectId?: string;
  title: string;
  description: string;
  status: 'processing' | 'completed' | 'failed';
  jobId: string; // VEO3 operation ID
  videoUrl?: string; // Firebase Storage URL or base64 data URI
  storyboardId?: string;
  generatedAt: Date;
  updatedAt: Date;
  metadata: {
    duration: number;
    resolution: string;
    aspectRatio: string;
    fileSize?: number;
    brandInfo: {
      name: string;
      industry: string;
      targetAudience: string;
    };
    sceneCount?: number;
  };
}

export interface VideoFilter {
  userId: string;
  status?: 'processing' | 'completed' | 'failed';
  projectId?: string;
  limit?: number;
}

class FirebaseVideoService {
  
  /**
   * Save a new video record to Firestore or development storage
   */
  async saveVideo(video: Omit<StoredVideo, 'id' | 'generatedAt' | 'updatedAt'>): Promise<string> {
    try {
      console.log('💾 Saving video:', video.title);
      
      const videoId = `video_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const now = new Date();
      
      if (isFirebaseConfigured && db) {
        // Prepare data differently for Admin SDK vs Client SDK
        const firestoreData = isServerSide 
          ? {
              // Admin SDK - use regular Date objects
              ...video,
              generatedAt: now,
              updatedAt: now
            }
          : {
              // Client SDK - use Timestamp objects
              ...video,
              generatedAt: Timestamp.fromDate(now),
              updatedAt: Timestamp.fromDate(now)
            };

        const docRef = await addDoc(collection(db as any, 'videos'), firestoreData);
        console.log('✅ Video saved to Firebase with ID:', docRef.id);
        return docRef.id;
      } else {
        // Development storage
        const videoData = {
          ...video,
          id: videoId,
          generatedAt: now,
          updatedAt: now
        };
        devStorage.set(videoId, videoData);
        console.log('✅ Video saved to dev storage with ID:', videoId);
        return videoId;
      }
    } catch (error) {
      console.error('❌ Error saving video:', error);
      throw new Error(`Failed to save video: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Update video status and metadata
   */
  async updateVideo(videoId: string, updates: Partial<StoredVideo>): Promise<void> {
    try {
      console.log('🔄 Updating video:', videoId, updates);
      
      const videoRef = doc(db, 'videos', videoId);
      const updateData = {
        ...updates,
        updatedAt: Timestamp.fromDate(new Date())
      };

      await updateDoc(videoRef, updateData);
      console.log('✅ Video updated successfully');
    } catch (error) {
      console.error('❌ Error updating video:', error);
      throw new Error(`Failed to update video: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Upload video file to Firebase Storage and return URL
   */
  async uploadVideoFile(videoId: string, videoData: string, userId: string): Promise<string> {
    try {
      console.log('📤 Uploading video file to Firebase Storage...');
      
      // Check if storage is available
      if (!storage) {
        console.warn('⚠️ Firebase Storage not available, keeping base64 data URI');
        return videoData; // Return original base64 data URI
      }
      
      // Convert base64 data URI to blob
      const response = await fetch(videoData);
      const blob = await response.blob();
      
      // Create storage reference
      const storageRef = ref(storage, `videos/${userId}/${videoId}.mp4`);
      
      // Upload the file
      const snapshot = await uploadBytes(storageRef, blob);
      console.log('📤 Upload completed, getting download URL...');
      
      // Get download URL
      const downloadURL = await getDownloadURL(snapshot.ref);
      console.log('✅ Video uploaded successfully:', downloadURL);
      
      return downloadURL;
    } catch (error) {
      console.error('❌ Error uploading video file:', error);
      console.warn('⚠️ Falling back to base64 data URI due to upload failure');
      return videoData; // Fallback to original base64 data URI
    }
  }

  /**
   * Get all videos for a user
   */
  async getUserVideos(filter: VideoFilter): Promise<StoredVideo[]> {
    try {
      console.log('📋 Fetching user videos:', filter);
      console.log('🔧 Firebase status:', { isFirebaseConfigured, hasDb: !!db });
      
      if (isFirebaseConfigured && db) {
        let q = query(
          collection(db, 'videos'),
          where('userId', '==', filter.userId),
          orderBy('generatedAt', 'desc')
        );

        if (filter.status) {
          q = query(q, where('status', '==', filter.status));
        }

        if (filter.projectId) {
          q = query(q, where('projectId', '==', filter.projectId));
        }

        if (filter.limit) {
          q = query(q, firestoreLimit(filter.limit));
        }

        const querySnapshot = await getDocs(q);
        const videos: StoredVideo[] = [];

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          videos.push({
            id: doc.id,
            ...data,
            // Handle date conversion based on SDK type
            generatedAt: isServerSide 
              ? data.generatedAt  // Admin SDK returns Date objects directly
              : data.generatedAt.toDate(), // Client SDK returns Timestamp objects
            updatedAt: isServerSide 
              ? data.updatedAt 
              : data.updatedAt.toDate()
          } as StoredVideo);
        });

        console.log(`✅ Found ${videos.length} videos for user in Firebase`);
        return videos;
      } else {
        // Development storage
        const allVideos = Array.from(devStorage.values())
          .filter(video => video.userId === filter.userId)
          .filter(video => !filter.status || video.status === filter.status)
          .filter(video => !filter.projectId || video.projectId === filter.projectId)
          .sort((a, b) => b.generatedAt.getTime() - a.generatedAt.getTime())
          .slice(0, filter.limit || Infinity);

        console.log(`✅ Found ${allVideos.length} videos for user in dev storage`);
        return allVideos;
      }
    } catch (error) {
      console.error('❌ Error fetching user videos:', error);
      throw new Error(`Failed to fetch videos: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get a specific video by ID
   */
  async getVideo(videoId: string): Promise<StoredVideo | null> {
    try {
      if (isFirebaseConfigured && db) {
        const docRef = doc(db, 'videos', videoId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          return {
            id: docSnap.id,
            ...data,
            generatedAt: data.generatedAt.toDate(),
            updatedAt: data.updatedAt.toDate()
          } as StoredVideo;
        } else {
          return null;
        }
      } else {
        // Development storage
        return devStorage.get(videoId) || null;
      }
    } catch (error) {
      console.error('❌ Error fetching video:', error);
      throw new Error(`Failed to fetch video: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Delete a video and its associated file
   */
  async deleteVideo(videoId: string, userId: string): Promise<void> {
    try {
      console.log('🗑️ Deleting video:', videoId);
      
      // Get video data first
      const video = await this.getVideo(videoId);
      if (!video) {
        throw new Error('Video not found');
      }

      // Verify user owns the video
      if (video.userId !== userId) {
        throw new Error('Unauthorized: You can only delete your own videos');
      }

      if (isFirebaseConfigured && db) {
        // Delete file from Storage if it exists and storage is available
        if (storage && video.videoUrl && !video.videoUrl.startsWith('data:')) {
          try {
            const storageRef = ref(storage, `videos/${userId}/${videoId}.mp4`);
            await deleteObject(storageRef);
            console.log('🗑️ Video file deleted from Storage');
          } catch (storageError) {
            console.warn('⚠️ Could not delete video file (may not exist):', storageError);
          }
        }

        // Delete Firestore document
        const docRef = doc(db, 'videos', videoId);
        await deleteDoc(docRef);
      } else {
        // Development storage
        devStorage.delete(videoId);
      }
      
      console.log('✅ Video deleted successfully');
    } catch (error) {
      console.error('❌ Error deleting video:', error);
      throw new Error(`Failed to delete video: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get video statistics for a user
   */
  async getVideoStats(userId: string): Promise<{
    total: number;
    completed: number;
    processing: number;
    failed: number;
  }> {
    try {
      const allVideos = await this.getUserVideos({ userId });
      
      const stats = {
        total: allVideos.length,
        completed: allVideos.filter(v => v.status === 'completed').length,
        processing: allVideos.filter(v => v.status === 'processing').length,
        failed: allVideos.filter(v => v.status === 'failed').length
      };

      console.log('📊 Video stats for user:', stats);
      return stats;
    } catch (error) {
      console.error('❌ Error getting video stats:', error);
      throw new Error(`Failed to get video stats: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

// Export singleton instance
export const firebaseVideos = new FirebaseVideoService();

// Utility functions
export const convertBase64ToSize = (base64String: string): number => {
  const base64Data = base64String.split(',')[1] || base64String;
  const sizeInBytes = (base64Data.length * 3) / 4;
  return Math.round(sizeInBytes);
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};
