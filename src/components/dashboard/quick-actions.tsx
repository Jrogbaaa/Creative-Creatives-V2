'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { 
  Upload, 
  Palette, 
  Settings, 
  HelpCircle,
  Lightbulb,
  Zap
} from 'lucide-react';
import Link from 'next/link';

export const QuickActions: React.FC = () => {
  const actions = [
    {
      icon: <Upload className="w-4 h-4" />,
      label: 'Upload Assets',
      description: 'Add brand materials',
      href: '/assets',
      color: 'text-blue-600'
    },
    {
      icon: <Palette className="w-4 h-4" />,
      label: 'Brand Settings',
      description: 'Update brand identity',
      href: '/brand',
      color: 'text-purple-600'
    },
    {
      icon: <Lightbulb className="w-4 h-4" />,
      label: 'Get Inspiration',
      description: 'Browse ad templates',
      href: '/templates',
      color: 'text-yellow-600'
    },
    {
      icon: <HelpCircle className="w-4 h-4" />,
      label: 'Help & Support',
      description: 'Get assistance',
      href: '/help',
      color: 'text-green-600'
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Zap className="w-5 h-5 text-orange-600" />
          <span>Quick Actions</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {actions.map((action, index) => (
            <motion.div
              key={action.label}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Link href={action.href}>
                <Button
                  variant="ghost"
                  className="w-full justify-start h-auto p-3 hover:bg-gray-50"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`${action.color}`}>
                      {action.icon}
                    </div>
                    <div className="text-left">
                      <div className="font-medium text-gray-900">
                        {action.label}
                      </div>
                      <div className="text-sm text-gray-500">
                        {action.description}
                      </div>
                    </div>
                  </div>
                </Button>
              </Link>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
