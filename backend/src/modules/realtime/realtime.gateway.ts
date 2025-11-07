import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

export interface AttendanceUpdate {
  sessionId: string;
  studentId: string;
  status: string;
  markedBy: string;
  markedAt: Date;
}

@WebSocketGateway({
  cors: {
    origin: '*', // Configure appropriately for production
  },
})
export class RealtimeGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private sessions = new Map<string, Set<string>>(); // sessionId -> Set of socket IDs

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
    
    // Remove client from all session rooms
    this.sessions.forEach((clients, sessionId) => {
      clients.delete(client.id);
      if (clients.size === 0) {
        this.sessions.delete(sessionId);
      }
    });
  }

  @SubscribeMessage('subscribe:session')
  handleSubscribeSession(client: Socket, sessionId: string) {
    if (!this.sessions.has(sessionId)) {
      this.sessions.set(sessionId, new Set());
    }
    
    this.sessions.get(sessionId).add(client.id);
    client.join(`session:${sessionId}`);
    
    console.log(`Client ${client.id} subscribed to session ${sessionId}`);
    
    return { event: 'subscribed', data: { sessionId } };
  }

  @SubscribeMessage('unsubscribe:session')
  handleUnsubscribeSession(client: Socket, sessionId: string) {
    const sessionClients = this.sessions.get(sessionId);
    if (sessionClients) {
      sessionClients.delete(client.id);
      if (sessionClients.size === 0) {
        this.sessions.delete(sessionId);
      }
    }
    
    client.leave(`session:${sessionId}`);
    
    console.log(`Client ${client.id} unsubscribed from session ${sessionId}`);
    
    return { event: 'unsubscribed', data: { sessionId } };
  }

  // Broadcast attendance update to all clients watching a session
  broadcastAttendanceUpdate(sessionId: string, update: AttendanceUpdate) {
    this.server.to(`session:${sessionId}`).emit('attendance:update', update);
  }

  // Broadcast session count updates (for dashboard)
  broadcastSessionStats(sessionId: string, stats: any) {
    this.server.to(`session:${sessionId}`).emit('session:stats', stats);
  }

  // Broadcast to all connected clients (for global notifications)
  broadcastGlobal(event: string, data: any) {
    this.server.emit(event, data);
  }
}
