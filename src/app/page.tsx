'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/components/providers/auth-provider';
import { AuthModal } from '@/components/auth/auth-modal';
import { Navigation } from '@/components/layout/navigation';
import { 
  Sparkles, 
  Video, 
  Image as ImageIcon, 
  MessageSquare, 
  Zap,
  Users,
  Target,
  PlayCircle
} from 'lucide-react';
import Link from 'next/link';

const HomePage: React.FC = () => {
  const { user } = useAuth();
  const [showAuthModal, setShowAuthModal] = React.useState(false);

  const features = [
    {
      icon: <Video className="w-8 h-8 text-blue-600" />,
      title: 'AI Video Generation',
      description: 'Create stunning 30-second video ads using Google Veo technology with professional quality and cinematic effects.',
    },
    {
      icon: <ImageIcon className="w-8 h-8 text-purple-600" />,
      title: 'Smart Image Creation',
      description: 'Generate high-quality images and graphics using Google Imagen for your ad campaigns and brand materials.',
    },
    {
      icon: <MessageSquare className="w-8 h-8 text-green-600" />,
      title: 'Creative Expert AI',
      description: 'Chat with Marcus, your AI creative director powered by LLaMA, for professional advertising insights and guidance.',
    },
    {
      icon: <Target className="w-8 h-8 text-red-600" />,
      title: 'Brand Analysis',
      description: 'Deep brand understanding through intelligent conversation to create ads that perfectly match your identity.',
    },
    {
      icon: <Zap className="w-8 h-8 text-yellow-600" />,
      title: 'Rapid Production',
      description: 'Go from concept to finished ad in minutes, not weeks. Perfect for impatient advertisers who need results fast.',
    },
    {
      icon: <Users className="w-8 h-8 text-indigo-600" />,
      title: 'Audience Targeting',
      description: 'AI-powered audience analysis ensures your ads resonate with the right people at the right time.',
    },
  ];

  const handleGetStarted = () => {
    if (user) {
      window.location.href = '/dashboard';
    } else {
      setShowAuthModal(true);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6">
              Create <span className="text-gradient">Stunning Ads</span>
              <br />in Seconds, Not Days
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-4xl mx-auto">
              Transform your advertising with AI-powered video generation, intelligent image creation, 
              and a creative expert that understands your brand better than you do.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12"
          >
            <Button
              size="lg"
              onClick={handleGetStarted}
              className="creative-gradient text-white px-8 py-4 text-lg font-semibold hover:shadow-lg transition-all duration-300"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Start Creating Now
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-2 border-gray-300 px-8 py-4 text-lg font-semibold"
            >
              <PlayCircle className="w-5 h-5 mr-2" />
              Watch Demo
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="relative max-w-4xl mx-auto"
          >
            <div className="glass-effect rounded-2xl p-8 shadow-2xl">
              <div className="aspect-video bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                <PlayCircle className="w-24 h-24 text-white opacity-80" />
              </div>
              <p className="text-sm text-gray-600 mt-4">
                Preview: AI-generated advertisement created in under 60 seconds
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Powered by <span className="text-gradient">Cutting-Edge AI</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We combine the best AI technologies from Google and Meta to deliver 
              professional-quality advertisements that convert.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow duration-300 border-0 shadow-md">
                  <CardHeader>
                    <div className="flex items-center space-x-4">
                      <div className="p-2 rounded-lg bg-gray-50">
                        {feature.icon}
                      </div>
                      <CardTitle className="text-xl">{feature.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-gray-600 leading-relaxed">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white/50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              From Idea to Ad in <span className="text-gradient">3 Simple Steps</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              {
                step: '01',
                title: 'Brand Discovery',
                description: 'Chat with our AI creative expert to understand your brand, audience, and goals. Upload existing materials for deeper insights.',
                color: 'from-blue-500 to-purple-600'
              },
              {
                step: '02',
                title: 'Creative Development',
                description: 'Our AI generates multiple creative concepts, video scenes, and visual elements tailored to your brand voice and target audience.',
                color: 'from-purple-500 to-pink-600'
              },
              {
                step: '03',
                title: 'Ad Production',
                description: 'Google Veo creates your video, Imagen generates supporting visuals, and AI adds perfect audio for a complete 30-second ad.',
                color: 'from-pink-500 to-red-600'
              }
            ].map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className={`w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r ${step.color} flex items-center justify-center text-white font-bold text-2xl`}>
                  {step.step}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{step.title}</h3>
                <p className="text-gray-600 leading-relaxed">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Ready to Create Your First <span className="text-gradient">AI Advertisement</span>?
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Join thousands of marketers who are already creating professional ads 
              in minutes instead of weeks.
            </p>
            <Button
              size="lg"
              onClick={handleGetStarted}
              className="creative-gradient text-white px-12 py-6 text-xl font-semibold hover:shadow-xl transition-all duration-300 pulse-glow"
              data-testid="hero-get-started-free-btn"
            >
              <Sparkles className="w-6 h-6 mr-3" />
              Get Started Free
            </Button>
          </motion.div>
        </div>
      </section>

      {showAuthModal && (
        <AuthModal onClose={() => setShowAuthModal(false)} />
      )}
    </div>
  );
};

export default HomePage;
