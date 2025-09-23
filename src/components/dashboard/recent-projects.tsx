'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { 
  Play, 
  Edit, 
  Download, 
  MoreHorizontal,
  Clock,
  Eye,
  Heart,
  Plus,
  FileVideo,
  Sparkles
} from 'lucide-react';
import Link from 'next/link';

interface RecentProjectsProps {
  showEmpty?: boolean; // For testing empty states
}

export const RecentProjects: React.FC<RecentProjectsProps> = ({ showEmpty = false }) => {
  // Mock data - in a real app, this would come from an API
  const projects = showEmpty ? [] : [
    {
      id: '1',
      title: 'Summer Fashion Campaign',
      description: 'Vibrant 30-second ad for new summer collection',
      status: 'completed',
      thumbnail: '/api/placeholder/300/200',
      createdAt: '2 days ago',
      duration: '30s',
      views: '1.2K',
      likes: 45,
      progress: 100
    },
    {
      id: '2',
      title: 'Tech Product Launch',
      description: 'Product showcase for new smartphone features',
      status: 'generating',
      thumbnail: '/api/placeholder/300/200',
      createdAt: '1 hour ago',
      duration: '30s',
      views: '0',
      likes: 0,
      progress: 75
    },
    {
      id: '3',
      title: 'Restaurant Grand Opening',
      description: 'Local restaurant promotional advertisement',
      status: 'draft',
      thumbnail: '/api/placeholder/300/200',
      createdAt: '3 days ago',
      duration: '30s',
      views: '0',
      likes: 0,
      progress: 25
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'generating':
        return 'bg-blue-100 text-blue-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'generating':
        return 'Generating';
      case 'draft':
        return 'Draft';
      default:
        return 'Unknown';
    }
  };

  const EmptyState = () => (
    <div className="text-center py-12">
      <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full flex items-center justify-center">
        <FileVideo className="w-8 h-8 text-purple-600" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        No projects yet
      </h3>
      <p className="text-gray-600 mb-6 max-w-sm mx-auto">
        Create your first AI-powered advertisement to get started. Our creative expert Marcus will help guide you!
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link href="/create">
          <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Create Your First Ad
          </Button>
        </Link>
        <Button variant="outline" onClick={() => {/* This would open the Marcus chat */}}>
          <Sparkles className="w-4 h-4 mr-2" />
          Chat with Marcus
        </Button>
      </div>
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Recent Projects</CardTitle>
            <CardDescription>
              {projects.length === 0 
                ? "Your advertisement projects will appear here" 
                : "Your latest advertisement projects"
              }
            </CardDescription>
          </div>
          {projects.length > 0 && (
            <Link href="/projects">
              <Button variant="outline" size="sm">
                View All
              </Button>
            </Link>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {projects.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-4">
            {projects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
            >
              {/* Thumbnail */}
              <div className="w-20 h-16 bg-gradient-to-br from-purple-400 to-blue-500 rounded-lg flex items-center justify-center">
                <Play className="w-6 h-6 text-white" />
              </div>

              {/* Project Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <h3 className="font-semibold text-gray-900 truncate">
                    {project.title}
                  </h3>
                  <Badge className={getStatusColor(project.status)}>
                    {getStatusText(project.status)}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 truncate mb-2">
                  {project.description}
                </p>
                <div className="flex items-center space-x-4 text-xs text-gray-500">
                  <div className="flex items-center space-x-1">
                    <Clock className="w-3 h-3" />
                    <span>{project.createdAt}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Eye className="w-3 h-3" />
                    <span>{project.views}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Heart className="w-3 h-3" />
                    <span>{project.likes}</span>
                  </div>
                </div>
                
                {/* Progress Bar */}
                {project.status === 'generating' && (
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div 
                        className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${project.progress}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {project.progress}% complete
                    </p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-2">
                {project.status === 'completed' && (
                  <>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Play className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Download className="w-4 h-4" />
                    </Button>
                  </>
                )}
                {project.status === 'draft' && (
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Edit className="w-4 h-4" />
                  </Button>
                )}
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
