import { Server } from '@hocuspocus/server';
import { Router } from 'express';
import { MongoDB } from './document/extensions/mongo-extesion';
import WebSocket from 'ws';
import { Server as HTTPServer, IncomingMessage } from 'http';
import { decodeToken } from 'server/middleware/authenticate';

class HocuspocusService {
  public router = Router();
  public hocuspocusServer: typeof Server;
  private wss: WebSocket.Server;
  constructor(server: HTTPServer) {
    console.log('📝 Initializing Hocuspocus service');
    this.hocuspocusServer = Server.configure({
      async onAuthenticate(data) {
        const { token } = data;
        console.log(token);
        console.log(`🔐 Authenticating connection for document: ${data.documentName}`);

        const authInfo = decodeToken(token);
        console.log(authInfo);
        if (!authInfo) {
          console.error('❌ Authentication failed: unauthorized');
          throw new Error('Not authorized!');
        }

        data.connection.readOnly = authInfo?.userRole === 'User';
        console.log(`✅ Authentication successful for user ${authInfo?.userName} with role: ${authInfo?.userRole}`);
      },

      extensions: [new MongoDB()],

      // TODO: for good security, make sure that either:
      // - incoming updates to the "thread" map within the Y.Doc are denied (these should only be made via the thread API)
      // - alternatively, use a separate Y.Doc for the thread data that can only be written to via the thread API
    });
    console.log('⚙️ Hocuspocus server configured');
    this.wss = new WebSocket.Server({ noServer: true });
    server.on('upgrade', this.onUpgrade.bind(this));
    this.initializeRoutes();
    console.log('🚀 Hocuspocus service initialized and ready');
  }

  private initializeRoutes() {
    this.wss.on('connection', this.initConnection.bind(this));
  }

  private onUpgrade(request: IncomingMessage, socket: any, head: any) {
    const pathname = new URL(request.url || '', `http://${request.headers.host}`).pathname;
    console.log(`🔄 WebSocket upgrade request for path: ${pathname}`);
    if (pathname === '/hocuspocus') {
      this.wss.handleUpgrade(request, socket, head, (ws) => {
        console.log('🔌 WebSocket connection upgraded successfully');
        this.wss.emit('connection', ws, request);
      });
    } else {
      console.log('❌ Invalid WebSocket path, closing connection');
      socket.destroy();
    }
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
