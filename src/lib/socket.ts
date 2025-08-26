import { Server } from 'socket.io';

interface UserSocket {
  userId: string;
  socketId: string;
  rooms: string[];
}

interface ChatMessage {
  id: string;
  content: string;
  senderId: string;
  senderName: string;
  threadId: string;
  timestamp: Date;
  type: 'TEXT' | 'SYSTEM' | 'ACTION';
}

interface ScheduleUpdate {
  id: string;
  title: string;
  action: 'CREATED' | 'UPDATED' | 'DELETED';
  userId: string;
  timestamp: Date;
}

interface GoalProgress {
  goalId: string;
  progress: number;
  userId: string;
  timestamp: Date;
}

interface UserStatus {
  userId: string;
  status: 'ONLINE' | 'OFFLINE' | 'AWAY';
  lastSeen: Date;
}

class NexusSocketService {
  private connectedUsers: Map<string, UserSocket> = new Map();
  private userStatus: Map<string, UserStatus> = new Map();

  setup(io: Server) {
    io.on('connection', (socket) => {
      console.log('Client connected:', socket.id);

      // Handle user authentication
      socket.on('authenticate', (data: { userId: string; token: string }) => {
        // In a real implementation, validate the token
        const { userId } = data;
        
        // Store user connection info
        this.connectedUsers.set(userId, {
          userId,
          socketId: socket.id,
          rooms: []
        });

        // Update user status
        this.userStatus.set(userId, {
          userId,
          status: 'ONLINE',
          lastSeen: new Date()
        });

        // Join user to their personal room
        socket.join(`user:${userId}`);

        // Broadcast user online status
        this.broadcastUserStatus(io, userId, 'ONLINE');

        // Send connection confirmation
        socket.emit('authenticated', {
          success: true,
          message: 'Successfully connected to Nexus real-time services'
        });
      });

      // Handle joining rooms (chat threads, teams, etc.)
      socket.on('join-room', (data: { roomId: string; userId: string }) => {
        const { roomId, userId } = data;
        const userSocket = this.connectedUsers.get(userId);
        
        if (userSocket) {
          socket.join(roomId);
          userSocket.rooms.push(roomId);
          
          // Notify room members
          socket.to(roomId).emit('user-joined', {
            userId,
            roomId,
            timestamp: new Date()
          });
        }
      });

      // Handle leaving rooms
      socket.on('leave-room', (data: { roomId: string; userId: string }) => {
        const { roomId, userId } = data;
        const userSocket = this.connectedUsers.get(userId);
        
        if (userSocket) {
          socket.leave(roomId);
          userSocket.rooms = userSocket.rooms.filter(room => room !== roomId);
          
          // Notify room members
          socket.to(roomId).emit('user-left', {
            userId,
            roomId,
            timestamp: new Date()
          });
        }
      });

      // Handle chat messages
      socket.on('send-message', (data: ChatMessage) => {
        const { threadId, senderId, content, type = 'TEXT' } = data;
        
        // Create message object
        const message: ChatMessage = {
          id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          content,
          senderId,
          senderName: data.senderName || 'Unknown',
          threadId,
          timestamp: new Date(),
          type
        };

        // Broadcast to all users in the room
        io.to(threadId).emit('new-message', message);
        
        // Store message in database (in real implementation)
        console.log('Message stored:', message);
      });

      // Handle typing indicators
      socket.on('typing', (data: { threadId: string; userId: string; isTyping: boolean }) => {
        const { threadId, userId, isTyping } = data;
        
        socket.to(threadId).emit('user-typing', {
          userId,
          threadId,
          isTyping,
          timestamp: new Date()
        });
      });

      // Handle schedule updates
      socket.on('schedule-update', (data: ScheduleUpdate) => {
        const { id, title, action, userId } = data;
        
        // Broadcast to user's personal room and relevant teams
        io.to(`user:${userId}`).emit('schedule-updated', {
          id,
          title,
          action,
          userId,
          timestamp: new Date()
        });
      });

      // Handle goal progress updates
      socket.on('goal-progress', (data: GoalProgress) => {
        const { goalId, progress, userId } = data;
        
        // Broadcast to user's personal room
        io.to(`user:${userId}`).emit('goal-updated', {
          goalId,
          progress,
          userId,
          timestamp: new Date()
        });
      });

      // Handle user status updates
      socket.on('update-status', (data: { userId: string; status: UserStatus['status'] }) => {
        const { userId, status } = data;
        
        this.userStatus.set(userId, {
          userId,
          status,
          lastSeen: new Date()
        });

        this.broadcastUserStatus(io, userId, status);
      });

      // Handle real-time collaboration requests
      socket.on('collaboration-request', (data: { 
        type: 'SCHEDULE' | 'GOAL' | 'CHAT'; 
        targetUserId: string; 
        requestorId: string; 
        details: any 
      }) => {
        const { targetUserId, requestorId, type, details } = data;
        
        // Send request to target user
        io.to(`user:${targetUserId}`).emit('collaboration-request', {
          type,
          requestorId,
          details,
          timestamp: new Date()
        });
      });

      // Handle AI assistant responses
      socket.on('ai-response', (data: { 
        threadId: string; 
        response: string; 
        userId: string;
        confidence?: number;
        actions?: Array<{ label: string; action: string }>
      }) => {
        const { threadId, response, userId, confidence, actions } = data;
        
        // Broadcast AI response to the chat thread
        io.to(threadId).emit('ai-message', {
          id: `ai_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          content: response,
          senderId: 'ai-assistant',
          senderName: 'Nexus AI',
          threadId,
          timestamp: new Date(),
          type: 'AI',
          confidence,
          actions
        });
      });

      // Handle team collaboration events
      socket.on('team-event', (data: { 
        teamId: string; 
        event: 'MEMBER_JOINED' | 'MEMBER_LEFT' | 'SCHEDULE_CREATED' | 'GOAL_UPDATED';
        userId: string;
        details: any 
      }) => {
        const { teamId, event, userId, details } = data;
        
        // Broadcast to team room
        io.to(`team:${teamId}`).emit('team-event', {
          teamId,
          event,
          userId,
          details,
          timestamp: new Date()
        });
      });

      // Handle disconnect
      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
        
        // Find and remove user from connected users
        for (const [userId, userSocket] of this.connectedUsers.entries()) {
          if (userSocket.socketId === socket.id) {
            this.connectedUsers.delete(userId);
            
            // Update user status to offline
            this.userStatus.set(userId, {
              userId,
              status: 'OFFLINE',
              lastSeen: new Date()
            });
            
            // Broadcast user offline status
            this.broadcastUserStatus(io, userId, 'OFFLINE');
            
            // Remove user from all rooms
            userSocket.rooms.forEach(room => {
              socket.leave(room);
              socket.to(room).emit('user-left', {
                userId,
                roomId: room,
                timestamp: new Date()
              });
            });
            
            break;
          }
        }
      });

      // Handle errors
      socket.on('error', (error) => {
        console.error('Socket error:', error);
      });

      // Send welcome message
      socket.emit('connected', {
        message: 'Connected to Nexus real-time services',
        timestamp: new Date()
      });
    });
  }

  private broadcastUserStatus(io: Server, userId: string, status: UserStatus['status']) {
    const userStatusData = this.userStatus.get(userId);
    if (userStatusData) {
      io.emit('user-status-changed', {
        userId,
        status: userStatusData.status,
        lastSeen: userStatusData.lastSeen
      });
    }
  }

  // Utility methods
  getConnectedUsers(): UserSocket[] {
    return Array.from(this.connectedUsers.values());
  }

  getUserStatus(userId: string): UserStatus | undefined {
    return this.userStatus.get(userId);
  }

  isUserOnline(userId: string): boolean {
    const status = this.userStatus.get(userId);
    return status?.status === 'ONLINE';
  }

  sendToUser(io: Server, userId: string, event: string, data: any) {
    io.to(`user:${userId}`).emit(event, data);
  }

  broadcastToRoom(io: Server, roomId: string, event: string, data: any) {
    io.to(roomId).emit(event, data);
  }
}

export const nexusSocketService = new NexusSocketService();
