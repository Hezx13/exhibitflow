import { Server } from '@hocuspocus/server';
import { Router } from 'express';
import { MongoDB } from './document/extensions/mongo-extesion';
import WebSocket from 'ws';
import { IncomingMessage } from 'http';
import { Duplex } from 'stream';
import { decodeToken } from 'server/middleware/authenticate';

class HocuspocusService {
  public router = Router();
  public hocuspocusServer: typeof Server;
  private wss: WebSocket.Server;
  
  constructor() {
    console.log('📝 Initializing Hocuspocus service');
    this.hocuspocusServer = Server.configure({
      async onAuthenticate(data) {
        const { token } = data;

        const authInfo = decodeToken(token);
        if (!authInfo) {
          console.error('❌ Authentication failed: unauthorized');
          throw new Error('Not authorized!');
        }

        data.connection.readOnly = authInfo?.userRole === 'User';
      },

      extensions: [new MongoDB()],

      // TODO: for good security, make sure that either:
      // - incoming updates to the "thread" map within the Y.Doc are denied (these should only be made via the thread API)
      // - alternatively, use a separate Y.Doc for the thread data that can only be written to via the thread API
    });
    console.log('⚙️ Hocuspocus server configured');
    
    this.wss = new WebSocket.Server({ noServer: true });
    this.wss.on('connection', this.initConnection.bind(this));
    
    console.log('🚀 Hocuspocus service initialized and ready');
  }

  public handleUpgrade(request: IncomingMessage, socket: Duplex, head: Buffer): boolean {
    const pathname = new URL(request.url || '', `http://${request.headers.host}`).pathname;
    
    if (pathname === '/hocuspocus') {
      this.wss.handleUpgrade(request, socket, head, (ws) => {
        
        // Add close and error listeners to debug
        ws.on('close', (code, reason) => {
          console.log(`WebSocket closed: code=${code}, reason=${reason}`);
        });
        
        ws.on('error', (error) => {
          console.error('WebSocket error:', error);
        });
        
        this.wss.emit('connection', ws, request);
      });
      return true;
    }
    
    return false;
  }

  private initConnection(ws: WebSocket, request: IncomingMessage) {
    console.log(
      `📡 New WebSocket connection established from ${request.socket.remoteAddress || request.socket.localAddress || 'unknown'
      }`
    );
    this.hocuspocusServer.handleConnection(ws, request);
  }
}

export default HocuspocusService;
