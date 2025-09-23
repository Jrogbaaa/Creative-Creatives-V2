'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/components/providers/auth-provider';
import { Navigation } from '@/components/layout/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DashboardStats } from '@/components/dashboard/dashboard-stats';
import { RecentProjects } from '@/components/dashboard/recent-projects';
import { QuickActions } from '@/components/dashboard/quick-actions';
import { CreativeExpertChat } from '@/components/creative/creative-expert-chat';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { 
  Plus, 
  MessageSquare, 
  Video, 
  Image as ImageIcon,
  BarChart3,
  Settings
} from 'lucide-react';
import Link from 'next/link';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [showChat, setShowChat] = React.useState(false);
  const [showEmptyProjects, setShowEmptyProjects] = React.useState(false); // For testing empty states

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Please sign in to continue</h1>
          <Link href="/">
            <Button>Go Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Navigation />
      
      <main className="pt-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Welcome back, {user.displayName || user.email?.split('@')[0]}! 👋
          </h1>
          <p className="text-lg text-gray-600">
            Ready to create some amazing advertisements today?
          </p>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-8"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="/create">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 mx-auto mb-4 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Plus className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900">New Ad</h3>
                  <p className="text-sm text-gray-600">Start creating</p>
                </CardContent>
              </Card>
            </Link>

            <Card 
              className="hover:shadow-lg transition-shadow cursor-pointer group"
              onClick={() => setShowChat(true)}
            >
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 mx-auto mb-4 bg-gradient-to-r from-green-600 to-teal-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                  <MessageSquare className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900">Chat with Marcus</h3>
                <p className="text-sm text-gray-600">Creative expert</p>
              </CardContent>
            </Card>

            <Link href="/projects">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 mx-auto mb-4 bg-gradient-to-r from-orange-600 to-red-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Video className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900">My Projects</h3>
                  <p className="text-sm text-gray-600">View all</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/analytics">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 mx-auto mb-4 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <BarChart3 className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900">Analytics</h3>
                  <p className="text-sm text-gray-600">View insights</p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </motion.div>

        {/* Dashboard Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-8"
        >
          <DashboardStats />
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Recent Projects */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="lg:col-span-2"
          >
            <ErrorBoundary>
              <RecentProjects showEmpty={showEmptyProjects} />
            </ErrorBoundary>
          </motion.div>

          {/* Quick Actions & Tips */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="space-y-6"
          >
            <QuickActions />
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Pro Tips</CardTitle>
                <CardDescription>
                  Maximize your ad performance
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-1">
                    Brand Consistency
                  </h4>
                  <p className="text-sm text-blue-700">
                    Upload your brand assets for consistent visual identity across all ads.
                  </p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <h4 className="font-medium text-green-900 mb-1">
                    A/B Testing
                  </h4>
                  <p className="text-sm text-green-700">
                    Create multiple versions to see what resonates best with your audience.
                  </p>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg">
                  <h4 className="font-medium text-purple-900 mb-1">
                    Chat with Marcus
                  </h4>
                  <p className="text-sm text-purple-700">
                    Our AI creative expert can help refine your concepts and suggest improvements.
                  </p>
                </div>
                
                {/* Debug: Toggle empty state */}
                <div className="mt-4">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setShowEmptyProjects(!showEmptyProjects)}
                    className="text-xs text-gray-500 hover:text-gray-700"
                  >
                    {showEmptyProjects ? '✅ Show Projects' : '🔄 Test Empty State'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>

      {/* Creative Expert Chat Modal */}
      {showChat && (
        <ErrorBoundary>
          <CreativeExpertChat onClose={() => setShowChat(false)} />
        </ErrorBoundary>
      )}
    </div>
  );
};

export default DashboardPage;
