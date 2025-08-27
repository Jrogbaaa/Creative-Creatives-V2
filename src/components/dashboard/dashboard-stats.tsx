'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { 
  Video, 
  Image as ImageIcon, 
  BarChart3, 
  Clock,
  TrendingUp,
  Users,
  Play,
  Download
} from 'lucide-react';

export const DashboardStats: React.FC = () => {
  // Mock data - in a real app, this would come from an API
  const stats = [
    {
      title: 'Total Ads Created',
      value: '12',
      change: '+3 this week',
      icon: <Video className="w-5 h-5 text-blue-600" />,
      color: 'from-blue-500 to-blue-600'
    },
    {
      title: 'Images Generated',
      value: '48',
      change: '+12 this week',
      icon: <ImageIcon className="w-5 h-5 text-purple-600" />,
      color: 'from-purple-500 to-purple-600'
    },
    {
      title: 'Views Generated',
      value: '15.2K',
      change: '+2.3K this week',
      icon: <Play className="w-5 h-5 text-green-600" />,
      color: 'from-green-500 to-green-600'
    },
    {
      title: 'Engagement Rate',
      value: '8.4%',
      change: '+1.2% this week',
      icon: <TrendingUp className="w-5 h-5 text-orange-600" />,
      color: 'from-orange-500 to-orange-600'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
        >
          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2 rounded-lg bg-gradient-to-r ${stat.color}`}>
                  {stat.icon}
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-sm text-green-600 font-medium">{stat.change}</p>
                </div>
              </div>
              <h3 className="text-sm font-medium text-gray-600">{stat.title}</h3>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};
