'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/providers/toast-provider';
import { creativeExpert } from '@/lib/llama';
import { ChatMessage } from '@/types';
import { logger, getUserId } from '@/lib/logger';
import { useAuth } from '@/components/providers/auth-provider';
import { useOnlineStatus } from '@/hooks/use-online-status';
import { 
  X, 
  Send, 
  Paperclip, 
  Sparkles,
  User,
  Bot,
  Loader2
} from 'lucide-react';

interface CreativeExpertChatProps {
  onClose: () => void;
}

export const CreativeExpertChat: React.FC<CreativeExpertChatProps> = ({ onClose }) => {
  const { user } = useAuth();
  const { isOnline } = useOnlineStatus();
  const [messages, setMessages] = React.useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hi! I'm Marcus, your creative director and advertising expert. I've been creating award-winning campaigns for over 25 years. I'm here to help you develop amazing advertisements that truly connect with your audience.\n\nTo get started, tell me about your brand - what industry are you in, who's your target audience, and what kind of ad are you looking to create?",
      timestamp: new Date(),
    }
  ]);
  const [inputMessage, setInputMessage] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const { addToast } = useToast();
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const modalRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const closeButtonRef = React.useRef<HTMLButtonElement>(null);
  
  // Log modal opening
  React.useEffect(() => {
    logger.uiInteraction('creative_chat', 'modal_opened', user?.uid, {
      messageCount: messages.length - 1 // Exclude welcome message
    });
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;
    
    // Check if user is offline
    if (!isOnline) {
      addToast('You\'re offline. Please check your internet connection to chat with Marcus.', 'error');
      logger.uiInteraction('creative_chat', 'message_blocked_offline', user?.uid, {
        messageLength: inputMessage.length
      });
      return;
    }

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date(),
    };

    // Log message sending
    logger.uiInteraction('creative_chat', 'message_sent', user?.uid, {
      messageLength: inputMessage.length,
      messageCount: messages.length,
      isFirstUserMessage: messages.filter(m => m.role === 'user').length === 0
    });

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    const startTime = Date.now();
    try {
      const response = await creativeExpert.chat([...messages, userMessage]);
      const responseTime = Date.now() - startTime;
      
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
      
      // Log successful response
      logger.uiInteraction('creative_chat', 'message_received', user?.uid, {
        responseTime,
        responseLength: response.length,
        totalMessages: messages.length + 2 // +1 for user message, +1 for assistant
      });
    } catch (error: any) {
      const responseTime = Date.now() - startTime;
      console.error('Chat error:', error);
      
      // Log chat error
      logger.uiInteraction('creative_chat', 'message_error', user?.uid, {
        error: error.message,
        responseTime
      });
      
      addToast('Failed to get response from creative expert', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Handle modal keyboard navigation
    if (e.key === 'Escape') {
      logger.uiInteraction('creative_chat', 'modal_closed_escape', user?.uid, {
        messageCount: messages.filter(m => m.role === 'user').length,
        sessionDuration: Date.now() - (messages[0]?.timestamp?.getTime() || Date.now())
      });
      onClose();
    }
    
    // Focus trap for modal
    if (e.key === 'Tab') {
      const modal = modalRef.current;
      if (!modal) return;
      
      const focusableElements = modal.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
      
      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    }
  };

  // Focus management
  React.useEffect(() => {
    const handleFocus = () => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    };
    
    // Focus input when modal opens
    const timer = setTimeout(handleFocus, 100);
    
    return () => clearTimeout(timer);
  }, []);

  // Prevent body scroll when modal is open
  React.useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      logger.uiInteraction('creative_chat', 'modal_closed_backdrop', user?.uid, {
        messageCount: messages.filter(m => m.role === 'user').length,
        sessionDuration: Date.now() - (messages[0]?.timestamp?.getTime() || Date.now())
      });
      onClose();
    }
  };

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={handleBackdropClick}
        role="dialog"
        aria-modal="true"
        aria-labelledby="chat-title"
        aria-describedby="chat-description"
        onKeyDown={handleKeyDown}
      >
        <motion.div
          ref={modalRef}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="w-full max-w-4xl h-[80vh] max-h-[600px]"
        >
          <Card className="h-full flex flex-col border-0 shadow-2xl">
            <CardHeader className="border-b bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-t-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <CardTitle id="chat-title" className="text-lg">Marcus - Creative Expert</CardTitle>
                    <p id="chat-description" className="text-sm text-white/80">Your AI Creative Director</p>
                  </div>
                </div>
                <Button
                  ref={closeButtonRef}
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    logger.uiInteraction('creative_chat', 'modal_closed_button', user?.uid, {
                      messageCount: messages.filter(m => m.role === 'user').length,
                      sessionDuration: Date.now() - (messages[0]?.timestamp?.getTime() || Date.now())
                    });
                    onClose();
                  }}
                  className="text-white hover:bg-white/20"
                  aria-label="Close chat with Marcus"
                >
                  <X className="w-5 h-5" />
                  <span className="sr-only">Close chat</span>
                </Button>
              </div>
            </CardHeader>

            <CardContent className="flex-1 overflow-hidden p-0">
              {/* Messages */}
              <div className="h-full flex flex-col">
                <div className="flex-1 overflow-y-auto p-4 space-y-4" role="log" aria-live="polite" aria-label="Chat conversation">
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`flex items-start space-x-3 max-w-[80%] ${message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          message.role === 'user' 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-purple-600 text-white'
                        }`} aria-hidden="true">
                          {message.role === 'user' ? (
                            <User className="w-4 h-4" />
                          ) : (
                            <Bot className="w-4 h-4" />
                          )}
                        </div>
                        <div className={`p-3 rounded-lg ${
                          message.role === 'user'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`} role="article" aria-label={`Message from ${message.role === 'user' ? 'you' : 'Marcus'}`}>
                          <p className="whitespace-pre-wrap text-sm">{message.content}</p>
                          <p className={`text-xs mt-2 ${
                            message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                          }`} aria-label={`Sent at ${message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}>
                            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  
                  {isLoading && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex justify-start"
                    >
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                          <Bot className="w-4 h-4 text-white" />
                        </div>
                        <div className="bg-gray-100 p-3 rounded-lg">
                          <div className="flex items-center space-x-2">
                            <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
                            <p className="text-sm text-gray-600">Marcus is thinking...</p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="border-t p-4">
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="icon" className="text-gray-400">
                      <Paperclip className="w-4 h-4" />
                    </Button>
                    <Input
                      ref={inputRef}
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Ask Marcus about your brand, target audience, creative ideas..."
                      disabled={isLoading}
                      className="flex-1"
                      aria-label="Chat message input"
                      aria-describedby="chat-help"
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={!inputMessage.trim() || isLoading || !isOnline}
                      className={`${isOnline ? 'bg-purple-600 hover:bg-purple-700' : 'bg-gray-400'} text-white`}
                      aria-label={!isOnline ? "You're offline - unable to send" : isLoading ? "Sending message..." : "Send message to Marcus"}
                      title={!isOnline ? "You're offline. Please check your internet connection." : undefined}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span className="sr-only">Sending message...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span className="sr-only">Send message</span>
                        </>
                      )}
                    </Button>
                  </div>
                  <p id="chat-help" className="text-xs text-gray-500 mt-2">
                    {!isOnline ? (
                      <span className="text-orange-600 font-medium">
                        ⚠️ You're offline - unable to chat with Marcus
                      </span>
                    ) : (
                      "Pro tip: Be specific about your brand, goals, and target audience for better insights"
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
