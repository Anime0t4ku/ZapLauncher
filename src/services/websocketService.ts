import { v4 as uuidv4 } from 'uuid';

export interface WebSocketMessage {
  jsonrpc: '2.0';
  method: string;
  params: any;
  id: string;
}

export class WebSocketService {
  private ws: WebSocket | null = null;
  private url: string;

  constructor(ip: string) {
    this.url = `ws://${ip}:7497`;
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.url);
        
        this.ws.onopen = () => {
          console.log('Connected to WebSocket');
          resolve();
        };

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          reject(error);
        };

        this.ws.onclose = () => {
          console.log('WebSocket connection closed');
        };

      } catch (error) {
        reject(error);
      }
    });
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  send(method: string, params: any): void {
    if (!this.ws) throw new Error('WebSocket not connected');

    const message: WebSocketMessage = {
      jsonrpc: '2.0',
      method,
      params,
      id: uuidv4(),
    };

    this.ws.send(JSON.stringify(message));
  }

  onMessage(callback: (data: any) => void) {
    if (!this.ws) throw new Error('WebSocket not connected');

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        callback(data);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };
  }
}