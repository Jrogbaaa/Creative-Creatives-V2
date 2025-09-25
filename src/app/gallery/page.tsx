'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/components/providers/auth-provider';
import { Navigation } from '@/components/layout/navigation';
import { 
  Play, 
  Download, 
  Trash2,
  RefreshCw,
  Video,
  Clock,
  Eye,
  Calendar,
  Filter,
  Search,
  Grid,
  List
} from 'lucide-react';
import { StoredVideo } from '@/lib/firebase-videos';

interface VideoGalleryState {
  videos: StoredVideo[];
  loading: boolean;
  error: string | null;
  filter: 'all' | 'processing' | 'completed' | 'failed';
  viewMode: 'grid' | 'list';
  searchTerm: string;
}

const VideoGalleryPage: React.FC = () => {
  const { user } = useAuth();
  const [state, setState] = useState<VideoGalleryState>({
    videos: [],
    loading: true,
    error: null,
    filter: 'all',
    viewMode: 'grid',
    searchTerm: ''
  });

  const loadVideos = async () => {
    if (!user) return;

    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const params = new URLSearchParams({
        userId: user.uid,
        ...(state.filter !== 'all' && { status: state.filter })
      });

      const response = await fetch(`/api/user/videos?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to load videos');
      }

      const data = await response.json();
      
      setState(prev => ({
        ...prev,
        videos: data.videos || [],
        loading: false
      }));

    } catch (error) {
      console.error('❌ Error loading videos:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to load videos',
        loading: false
      }));
    }
  };

  const deleteVideo = async (videoId: string) => {
    if (!user || !confirm('Are you sure you want to delete this video? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/user/videos/${videoId}?userId=${user.uid}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete video');
      }

      // Remove from local state
      setState(prev => ({
        ...prev,
        videos: prev.videos.filter(v => v.id !== videoId)
      }));

      console.log('✅ Video deleted successfully');
    } catch (error) {
      console.error('❌ Error deleting video:', error);
      alert('Failed to delete video. Please try again.');
    }
  };

  const downloadVideo = (video: StoredVideo) => {
    if (!video.videoUrl) return;

    try {
      const link = document.createElement('a');
      link.href = video.videoUrl;
      link.download = `${video.title}.mp4`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('❌ Error downloading video:', error);
      alert('Failed to download video. Please try again.');
    }
  };

  const filteredVideos = state.videos.filter(video => {
    const matchesSearch = video.title.toLowerCase().includes(state.searchTerm.toLowerCase()) ||
                         video.description.toLowerCase().includes(state.searchTerm.toLowerCase());
    return matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'processing': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (!bytes) return 'Unknown size';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  useEffect(() => {
    if (user) {
      loadVideos();
    }
  }, [user, state.filter]);

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Please sign in to view your videos</h1>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">🎬 Video Gallery</h1>
          <p className="text-gray-600">Manage all your generated videos in one place</p>
        </div>

        {/* Controls */}
        <div className="mb-8 bg-white rounded-lg p-6 shadow-sm">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex flex-wrap gap-4">
              {/* Filter Buttons */}
              <div className="flex gap-2">
                {[
                  { key: 'all', label: 'All', icon: Video },
                  { key: 'completed', label: 'Completed', icon: Play },
                  { key: 'processing', label: 'Processing', icon: Clock },
                  { key: 'failed', label: 'Failed', icon: RefreshCw }
                ].map(({ key, label, icon: Icon }) => (
                  <Button
                    key={key}
                    variant={state.filter === key ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setState(prev => ({ ...prev, filter: key as any }))}
                    className="flex items-center gap-2"
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </Button>
                ))}
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search videos..."
                  value={state.searchTerm}
                  onChange={(e) => setState(prev => ({ ...prev, searchTerm: e.target.value }))}
                  className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex gap-2">
              {/* View Mode Toggle */}
              <div className="flex border border-gray-200 rounded-lg overflow-hidden">
                <Button
                  variant={state.viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setState(prev => ({ ...prev, viewMode: 'grid' }))}
                  className="rounded-none"
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button
                  variant={state.viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setState(prev => ({ ...prev, viewMode: 'list' }))}
                  className="rounded-none"
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>

              {/* Refresh */}
              <Button
                variant="outline"
                size="sm"
                onClick={loadVideos}
                disabled={state.loading}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${state.loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {state.loading && (
          <div className="text-center py-12">
            <RefreshCw className="w-8 h-8 mx-auto mb-4 animate-spin text-purple-600" />
            <p className="text-gray-600">Loading your videos...</p>
          </div>
        )}

        {/* Error State */}
        {state.error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
            <h3 className="text-red-800 font-semibold mb-2">Error Loading Videos</h3>
            <p className="text-red-700">{state.error}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={loadVideos}
              className="mt-3 text-red-700 border-red-300 hover:bg-red-100"
            >
              Try Again
            </Button>
          </div>
        )}

        {/* Videos Grid/List */}
        {!state.loading && !state.error && (
          <>
            {filteredVideos.length === 0 ? (
              <div className="text-center py-12">
                <Video className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No videos found</h3>
                <p className="text-gray-600 mb-4">
                  {state.searchTerm ? 'No videos match your search.' : 'Start creating videos to see them here!'}
                </p>
                <Button asChild className="bg-gradient-to-r from-purple-600 to-blue-600">
                  <a href="/create">Create Your First Video</a>
                </Button>
              </div>
            ) : (
              <div className={`grid gap-6 ${
                state.viewMode === 'grid' 
                  ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
                  : 'grid-cols-1'
              }`}>
                {filteredVideos.map((video, index) => (
                  <motion.div
                    key={video.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="hover:shadow-lg transition-all duration-200">
                      <CardHeader>
                        <div className="flex justify-between items-start mb-2">
                          <CardTitle className="text-lg">{video.title}</CardTitle>
                          <Badge className={getStatusColor(video.status)}>
                            {video.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">{video.description}</p>
                      </CardHeader>

                      <CardContent>
                        {/* Video Player */}
                        {video.status === 'completed' && video.videoUrl && (
                          <div className="mb-4">
                            <video
                              controls
                              className="w-full h-48 object-cover rounded-lg bg-black"
                              poster="/api/placeholder/400/300"
                            >
                              <source src={video.videoUrl} type="video/mp4" />
                              Your browser does not support the video tag.
                            </video>
                          </div>
                        )}

                        {/* Video Info */}
                        <div className="space-y-2 text-sm text-gray-600 mb-4">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            Duration: {video.metadata.duration}s
                          </div>
                          <div className="flex items-center gap-2">
                            <Eye className="w-4 h-4" />
                            Resolution: {video.metadata.resolution}
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            Created: {video.generatedAt.toLocaleDateString()}
                          </div>
                          {video.metadata.fileSize && (
                            <div className="flex items-center gap-2">
                              <Video className="w-4 h-4" />
                              Size: {formatFileSize(video.metadata.fileSize)}
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                          {video.status === 'completed' && video.videoUrl && (
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => downloadVideo(video)}
                              className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600"
                            >
                              <Download className="w-4 h-4 mr-2" />
                              Download
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteVideo(video.id)}
                            className="text-red-600 border-red-300 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Statistics */}
            {filteredVideos.length > 0 && (
              <div className="mt-8 text-center text-sm text-gray-500">
                Showing {filteredVideos.length} of {state.videos.length} videos
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default VideoGalleryPage;
