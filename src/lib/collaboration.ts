'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/components/providers/auth-provider';
import { logger } from './logger';
import { featureFlags } from './feature-flags';

// Collaboration types
export interface CollaborationSession {
  id: string;
  projectId: string;
  participants: CollaborationUser[];
  owner: CollaborationUser;
  createdAt: Date;
  lastActivity: Date;
  isActive: boolean;
}

export interface CollaborationUser {
  id: string;
  email: string;
  displayName: string;
  avatar?: string;
  cursor?: { x: number; y: number; };
  lastSeen: Date;
  role: 'owner' | 'editor' | 'viewer' | 'commenter';
  color: string; // Assigned color for UI differentiation
}

export interface CollaborationEvent {
  id: string;
  type: 'cursor_move' | 'scene_edit' | 'comment_add' | 'user_join' | 'user_leave' | 'project_update';
  userId: string;
  sessionId: string;
  timestamp: Date;
  data: any;
}

export interface Comment {
  id: string;
  userId: string;
  content: string;
  position?: { x: number; y: number; };
  sceneId?: string;
  replies: Comment[];
  timestamp: Date;
  resolved: boolean;
  reactions: { emoji: string; userIds: string[]; }[];
}

export interface ProjectPermission {
  userId: string;
  role: CollaborationUser['role'];
  grantedBy: string;
  grantedAt: Date;
}

/**
 * Real-time Collaboration Service
 * Handles WebSocket connections, cursor tracking, comments, and live updates
 */
class CollaborationService {
  private socket: WebSocket | null = null;
  private currentSession: CollaborationSession | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private participants: Map<string, CollaborationUser> = new Map();
  private comments: Map<string, Comment> = new Map();
  private eventListeners: Map<string, ((event: CollaborationEvent) => void)[]> = new Map();

  constructor() {
    this.setupEventListeners();
  }

  /**
   * Initialize collaboration session
   */
  async initSession(projectId: string, userId: string): Promise<CollaborationSession | null> {
    try {
      if (!featureFlags.isEnabled('real_time_collaboration')) {
        console.log('Real-time collaboration is disabled');
        return null;
      }

      // Check if WebSocket is supported
      if (typeof WebSocket === 'undefined') {
        console.warn('WebSocket not supported');
        return null;
      }

      await this.connectWebSocket(projectId, userId);
      
      logger.info('ui', 'collaboration_session_started', {
        projectId,
        userId
      });

      return this.currentSession;
    } catch (error) {
      logger.error('ui', 'collaboration_init_failed', {
        projectId,
        userId,
        error: (error as Error).message
      });
      return null;
    }
  }

  /**
   * Connect to WebSocket server
   */
  private async connectWebSocket(projectId: string, userId: string): Promise<void> {
    const wsUrl = this.getWebSocketUrl(projectId, userId);
    
    this.socket = new WebSocket(wsUrl);
    
    this.socket.onopen = () => {
      console.log('🔗 [Collaboration] WebSocket connected');
      this.reconnectAttempts = 0;
      this.startHeartbeat();
    };

    this.socket.onmessage = (event) => {
      this.handleWebSocketMessage(event);
    };

    this.socket.onerror = (error) => {
      console.error('❌ [Collaboration] WebSocket error:', error);
    };

    this.socket.onclose = () => {
      console.log('🔌 [Collaboration] WebSocket disconnected');
      this.stopHeartbeat();
      this.attemptReconnect(projectId, userId);
    };
  }

  /**
   * Get WebSocket URL
   */
  private getWebSocketUrl(projectId: string, userId: string): string {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = process.env.NEXT_PUBLIC_WS_HOST || window.location.host;
    return `${protocol}//${host}/ws/collaboration?projectId=${projectId}&userId=${userId}`;
  }

  /**
   * Handle WebSocket messages
   */
  private handleWebSocketMessage(event: MessageEvent): void {
    try {
      const data = JSON.parse(event.data);
      const collaborationEvent: CollaborationEvent = {
        ...data,
        timestamp: new Date(data.timestamp)
      };

      this.processCollaborationEvent(collaborationEvent);
    } catch (error) {
      console.error('Failed to parse WebSocket message:', error);
    }
  }

  /**
   * Process collaboration events
   */
  private processCollaborationEvent(event: CollaborationEvent): void {
    switch (event.type) {
      case 'user_join':
        this.handleUserJoin(event);
        break;
      case 'user_leave':
        this.handleUserLeave(event);
        break;
      case 'cursor_move':
        this.handleCursorMove(event);
        break;
      case 'scene_edit':
        this.handleSceneEdit(event);
        break;
      case 'comment_add':
        this.handleCommentAdd(event);
        break;
      case 'project_update':
        this.handleProjectUpdate(event);
        break;
    }

    // Notify event listeners
    this.notifyEventListeners(event.type, event);
  }

  /**
   * Handle user joining
   */
  private handleUserJoin(event: CollaborationEvent): void {
    const user: CollaborationUser = event.data.user;
    this.participants.set(user.id, user);
    
    logger.info('ui', 'user_joined_collaboration', {
      userId: user.id,
      displayName: user.displayName,
      sessionId: event.sessionId
    });
  }

  /**
   * Handle user leaving
   */
  private handleUserLeave(event: CollaborationEvent): void {
    const userId = event.data.userId;
    this.participants.delete(userId);
    
    logger.info('ui', 'user_left_collaboration', {
      userId,
      sessionId: event.sessionId
    });
  }

  /**
   * Handle cursor movement
   */
  private handleCursorMove(event: CollaborationEvent): void {
    const { userId, cursor } = event.data;
    const user = this.participants.get(userId);
    
    if (user) {
      user.cursor = cursor;
      user.lastSeen = new Date();
      this.participants.set(userId, user);
    }
  }

  /**
   * Handle scene editing
   */
  private handleSceneEdit(event: CollaborationEvent): void {
    logger.info('ui', 'scene_edit_received', {
      sceneId: event.data.sceneId,
      changes: event.data.changes,
      editor: event.userId
    });
  }

  /**
   * Handle comment addition
   */
  private handleCommentAdd(event: CollaborationEvent): void {
    const comment: Comment = {
      ...event.data.comment,
      timestamp: new Date(event.data.comment.timestamp)
    };
    
    this.comments.set(comment.id, comment);
    
    logger.info('ui', 'comment_added', {
      commentId: comment.id,
      author: event.userId,
      sceneId: comment.sceneId
    });
  }

  /**
   * Handle project updates
   */
  private handleProjectUpdate(event: CollaborationEvent): void {
    logger.info('ui', 'project_updated', {
      updateType: event.data.updateType,
      updatedBy: event.userId
    });
  }

  /**
   * Send collaboration event
   */
  sendEvent(type: CollaborationEvent['type'], data: any): void {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      console.warn('Cannot send event: WebSocket not connected');
      return;
    }

    const event = {
      type,
      data,
      timestamp: new Date().toISOString()
    };

    this.socket.send(JSON.stringify(event));
  }

  /**
   * Update cursor position
   */
  updateCursor(x: number, y: number): void {
    this.sendEvent('cursor_move', { cursor: { x, y } });
  }

  /**
   * Add comment
   */
  addComment(content: string, position?: { x: number; y: number }, sceneId?: string): void {
    const comment: Omit<Comment, 'id' | 'timestamp'> = {
      userId: 'current-user', // Should be actual user ID
      content,
      position,
      sceneId,
      replies: [],
      resolved: false,
      reactions: []
    };

    this.sendEvent('comment_add', { comment });
  }

  /**
   * Update scene
   */
  updateScene(sceneId: string, changes: any): void {
    this.sendEvent('scene_edit', { sceneId, changes });
  }

  /**
   * Get participants
   */
  getParticipants(): CollaborationUser[] {
    return Array.from(this.participants.values());
  }

  /**
   * Get comments
   */
  getComments(sceneId?: string): Comment[] {
    const allComments = Array.from(this.comments.values());
    return sceneId 
      ? allComments.filter(comment => comment.sceneId === sceneId)
      : allComments;
  }

  /**
   * Event listener management
   */
  addEventListener(eventType: string, callback: (event: CollaborationEvent) => void): void {
    if (!this.eventListeners.has(eventType)) {
      this.eventListeners.set(eventType, []);
    }
    this.eventListeners.get(eventType)!.push(callback);
  }

  removeEventListener(eventType: string, callback: (event: CollaborationEvent) => void): void {
    const listeners = this.eventListeners.get(eventType);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  private notifyEventListeners(eventType: string, event: CollaborationEvent): void {
    const listeners = this.eventListeners.get(eventType);
    if (listeners) {
      listeners.forEach(callback => callback(event));
    }
  }

  /**
   * Setup global event listeners
   */
  private setupEventListeners(): void {
    if (typeof window === 'undefined') return;

    // Track mouse movement for cursor sharing
    let lastCursorUpdate = 0;
    window.addEventListener('mousemove', (event) => {
      const now = Date.now();
      if (now - lastCursorUpdate > 100) { // Throttle to 10fps
        this.updateCursor(event.clientX, event.clientY);
        lastCursorUpdate = now;
      }
    });
  }

  /**
   * Start heartbeat to keep connection alive
   */
  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      if (this.socket?.readyState === WebSocket.OPEN) {
        this.socket.send(JSON.stringify({ type: 'heartbeat' }));
      }
    }, 30000); // Every 30 seconds
  }

  /**
   * Stop heartbeat
   */
  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  /**
   * Attempt to reconnect
   */
  private attemptReconnect(projectId: string, userId: string): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      return;
    }

    const delay = Math.pow(2, this.reconnectAttempts) * 1000; // Exponential backoff
    console.log(`Attempting to reconnect in ${delay}ms...`);

    setTimeout(() => {
      this.reconnectAttempts++;
      this.connectWebSocket(projectId, userId);
    }, delay);
  }

  /**
   * Disconnect and cleanup
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    
    this.stopHeartbeat();
    this.participants.clear();
    this.comments.clear();
    this.eventListeners.clear();
    this.currentSession = null;
  }
}

// Global collaboration instance
export const collaboration = new CollaborationService();

// React Context
interface CollaborationContextType {
  session: CollaborationSession | null;
  participants: CollaborationUser[];
  comments: Comment[];
  isConnected: boolean;
  initSession: (projectId: string) => Promise<void>;
  addComment: (content: string, position?: { x: number; y: number }, sceneId?: string) => void;
  updateScene: (sceneId: string, changes: any) => void;
}

const CollaborationContext = createContext<CollaborationContextType | undefined>(undefined);

// Provider component
export const CollaborationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [session, setSession] = useState<CollaborationSession | null>(null);
  const [participants, setParticipants] = useState<CollaborationUser[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  // Update participants when they change
  useEffect(() => {
    const updateParticipants = () => {
      setParticipants(collaboration.getParticipants());
    };

    collaboration.addEventListener('user_join', updateParticipants);
    collaboration.addEventListener('user_leave', updateParticipants);

    return () => {
      collaboration.removeEventListener('user_join', updateParticipants);
      collaboration.removeEventListener('user_leave', updateParticipants);
    };
  }, []);

  // Update comments when they change
  useEffect(() => {
    const updateComments = () => {
      setComments(collaboration.getComments());
    };

    collaboration.addEventListener('comment_add', updateComments);

    return () => {
      collaboration.removeEventListener('comment_add', updateComments);
    };
  }, []);

  const initSession = useCallback(async (projectId: string) => {
    if (!user) return;

    const newSession = await collaboration.initSession(projectId, user.uid);
    if (newSession) {
      setSession(newSession);
      setIsConnected(true);
    }
  }, [user]);

  const contextValue: CollaborationContextType = {
    session,
    participants,
    comments,
    isConnected,
    initSession,
    addComment: collaboration.addComment.bind(collaboration),
    updateScene: collaboration.updateScene.bind(collaboration)
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      collaboration.disconnect();
    };
  }, []);

  return (
    <CollaborationContext.Provider value={contextValue}>
      {children}
    </CollaborationContext.Provider>
  );
};

// Hook for using collaboration
export const useCollaboration = () => {
  const context = useContext(CollaborationContext);
  if (!context) {
    throw new Error('useCollaboration must be used within a CollaborationProvider');
  }
  return context;
};

// Collaboration UI Components
export const ParticipantCursors: React.FC = () => {
  const { participants } = useCollaboration();

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {participants.map(participant => {
        if (!participant.cursor) return null;
        
        return (
          <div
            key={participant.id}
            className="absolute transition-all duration-100 ease-out"
            style={{
              left: participant.cursor.x,
              top: participant.cursor.y,
              transform: 'translate(-2px, -2px)'
            }}
          >
            <div 
              className="w-4 h-4 rounded-full border-2 border-white shadow-lg"
              style={{ backgroundColor: participant.color }}
            />
            <div 
              className="mt-1 px-2 py-1 text-xs text-white rounded shadow-lg whitespace-nowrap"
              style={{ backgroundColor: participant.color }}
            >
              {participant.displayName}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export const ParticipantList: React.FC = () => {
  const { participants } = useCollaboration();

  return (
    <div className="flex items-center space-x-2">
      {participants.slice(0, 3).map(participant => (
        <div
          key={participant.id}
          className="flex items-center justify-center w-8 h-8 rounded-full border-2 border-white shadow-lg text-xs font-medium text-white"
          style={{ backgroundColor: participant.color }}
          title={participant.displayName}
        >
          {participant.displayName.charAt(0).toUpperCase()}
        </div>
      ))}
      {participants.length > 3 && (
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-500 border-2 border-white shadow-lg text-xs font-medium text-white">
          +{participants.length - 3}
        </div>
      )}
    </div>
  );
};
