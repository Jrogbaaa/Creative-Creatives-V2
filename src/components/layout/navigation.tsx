'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/providers/auth-provider';
import { AuthModal } from '@/components/auth/auth-modal';
import { Sparkles, Menu, X, Video, Plus } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

export const Navigation: React.FC = () => {
  const { user, logout } = useAuth();
  const [showAuthModal, setShowAuthModal] = React.useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const handleAuthAction = () => {
    if (user) {
      logout();
    } else {
      setShowAuthModal(true);
    }
  };

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/features', label: 'Features' },
    { href: '/pricing', label: 'Pricing' },
    { href: '/about', label: 'About' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 creative-gradient rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">Creative Creatives</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-gray-600 hover:text-gray-900 transition-colors font-medium"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                <Link href="/create">
                  <Button variant="ghost" className="flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Create Video
                  </Button>
                </Link>
                <Link href="/gallery">
                  <Button variant="ghost" className="flex items-center gap-2">
                    <Video className="w-4 h-4" />
                    Gallery
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  onClick={handleAuthAction}
                >
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  onClick={handleAuthAction}
                >
                  Sign In
                </Button>
                <Button
                  onClick={handleAuthAction}
                  className="creative-gradient text-white"
                >
                  Get Started
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-b border-gray-200"
          >
            <div className="px-4 py-4 space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block text-gray-600 hover:text-gray-900 transition-colors font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <div className="pt-4 border-t border-gray-200">
                {user ? (
                  <>
                    <Link href="/create" className="block mb-2">
                      <Button variant="ghost" className="w-full justify-start flex items-center gap-2">
                        <Plus className="w-4 h-4" />
                        Create Video
                      </Button>
                    </Link>
                    <Link href="/gallery" className="block mb-2">
                      <Button variant="ghost" className="w-full justify-start flex items-center gap-2">
                        <Video className="w-4 h-4" />
                        Gallery
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      onClick={handleAuthAction}
                      className="w-full"
                    >
                      Sign Out
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="ghost"
                      onClick={handleAuthAction}
                      className="w-full mb-2"
                    >
                      Sign In
                    </Button>
                    <Button
                      onClick={handleAuthAction}
                      className="w-full creative-gradient text-white"
                      data-testid="nav-get-started-btn"
                    >
                      Get Started
                    </Button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {showAuthModal && (
        <AuthModal onClose={() => setShowAuthModal(false)} />
      )}
    </nav>
  );
};
