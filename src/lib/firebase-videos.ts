import { initializeApp } from 'firebase/app';
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

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Check if Firebase is configured
const isFirebaseConfigured = Object.values(firebaseConfig).every(val => val);

// Initialize Firebase only if configured
let app: any = null;
let db: any = null;
let storage: any = null;

if (isFirebaseConfigured) {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  storage = getStorage(app);
}

// Development fallback storage
const devStorage = new Map<string, StoredVideo>();

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
      const videoData = {
        ...video,
        id: videoId,
        generatedAt: new Date(),
        updatedAt: new Date()
      };

      if (isFirebaseConfigured && db) {
        const firestoreData = {
          ...video,
          generatedAt: Timestamp.fromDate(new Date()),
          updatedAt: Timestamp.fromDate(new Date())
        };
        const docRef = await addDoc(collection(db, 'videos'), firestoreData);
        console.log('✅ Video saved to Firebase with ID:', docRef.id);
        return docRef.id;
      } else {
        // Development storage
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
      throw new Error(`Failed to upload video: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get all videos for a user
   */
  async getUserVideos(filter: VideoFilter): Promise<StoredVideo[]> {
    try {
      console.log('📋 Fetching user videos:', filter);
      
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
            generatedAt: data.generatedAt.toDate(),
            updatedAt: data.updatedAt.toDate()
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

      if (isFirebaseConfigured && db && storage) {
        // Delete file from Storage if it exists
        if (video.videoUrl && !video.videoUrl.startsWith('data:')) {
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
