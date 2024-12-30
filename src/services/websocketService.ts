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
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectDelay: number = 1000;

  constructor(ip: string) {
    // Remove protocol if included
    const cleanIp = ip.replace(/(^\w+:|^)\/\//, '');
    this.url = `ws://${cleanIp}:7497`;
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.url);
        
        // Connection timeout
        const timeout = setTimeout(() => {
          if (this.ws?.readyState !== WebSocket.OPEN) {
            this.ws?.close();
            reject(new Error('Connection timeout'));
          }
        }, 5000);
        
        this.ws.onopen = () => {
          console.log('Connected to WebSocket');
          clearTimeout(timeout);
          this.reconnectAttempts = 0;
          resolve();
        };

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          clearTimeout(timeout);
          reject(error);
        };

        this.ws.onclose = () => {
          console.log('WebSocket connection closed');
          this.handleReconnect();
        };

      } catch (error) {
        reject(error);
      }
    });
  }

  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
      
      setTimeout(() => {
        this.connect().catch(error => {
          console.error('Reconnection failed:', error);
        });
      }, this.reconnectDelay * this.reconnectAttempts);
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
      this.reconnectAttempts = this.maxReconnectAttempts; // Prevent auto-reconnect
    }
  }

  send(method: string, params: any): void {
    if (!this.ws) throw new Error('WebSocket not connected');
    if (this.ws.readyState !== WebSocket.OPEN) {
      throw new Error('WebSocket connection not open');
    }

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