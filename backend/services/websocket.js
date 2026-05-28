import { WebSocketServer } from 'ws';

let wss = null;
const clients = new Set();

export const initWebSocket = (server) => {
  wss = new WebSocketServer({ server });
  
  wss.on('connection', (ws) => {
    console.log('[WebSocket] New SaaS dashboard client connected');
    clients.add(ws);
    
    ws.send(JSON.stringify({ 
      type: 'CONNECTED', 
      payload: { message: 'Real-time WebSocket connection synchronized successfully.' } 
    }));
    
    ws.on('close', () => {
      console.log('[WebSocket] Client disconnected');
      clients.delete(ws);
    });
    
    ws.on('error', (err) => {
      console.error('[WebSocket] Socket error:', err);
      clients.delete(ws);
    });
  });
};

export const broadcast = (type, payload) => {
  if (!wss) {
    console.warn('[WebSocket] Cannot broadcast: Server not initialized.');
    return;
  }
  
  console.log(`[WebSocket] Broadcasting real-time sync event: ${type}`);
  const message = JSON.stringify({ type, payload });
  
  for (const client of clients) {
    if (client.readyState === 1) { // WebSocket.OPEN
      try {
        client.send(message);
      } catch (err) {
        console.error('[WebSocket] Broadcast fail to client:', err.message);
        clients.delete(client);
      }
    }
  }
};
