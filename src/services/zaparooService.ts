import { v4 as uuidv4 } from 'uuid';

export interface ZaparooRequest {
  jsonrpc: '2.0';
  id: string;
  method: string;
  params?: any;
}

export interface ZaparooResponse {
  jsonrpc: '2.0';
  id: string;
  result?: any;
  error?: {
    code: number;
    message: string;
  };
}

export interface ZaparooNotification {
  jsonrpc: '2.0';
  method: string;
  params?: any;
}

export class ZaparooService {
  private ws: WebSocket | null = null;
  private url: string;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectDelay: number = 1000;
  private pendingRequests: Map<string, {
    resolve: (value: any) => void;
    reject: (error: any) => void;
  }> = new Map();

  constructor(ipAddress: string) {
    // Handle IP with or without protocol
    const cleanIp = ipAddress.replace(/^https?:\/\//, '').replace(/\/$/, '');
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
          console.log('Connected to Zaparoo WebSocket');
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

        this.ws.onmessage = this.handleMessage.bind(this);

      } catch (error) {
        reject(error);
      }
    });
  }

  private handleMessage(event: MessageEvent) {
    try {
      const data = JSON.parse(event.data) as ZaparooResponse | ZaparooNotification;
      
      // Handle notifications
      if (!('id' in data)) {
        this.handleNotification(data as ZaparooNotification);
        return;
      }

      // Handle responses
      const response = data as ZaparooResponse;
      const pending = this.pendingRequests.get(response.id);
      
      if (pending) {
        if (response.error) {
          pending.reject(response.error);
        } else {
          pending.resolve(response.result);
        }
        this.pendingRequests.delete(response.id);
      }
    } catch (error) {
      console.error('Error handling WebSocket message:', error);
    }
  }

  private handleNotification(notification: ZaparooNotification) {
    // Handle different notification types
    switch (notification.method) {
      case 'launching':
        console.log('New ZapScript launching:', notification.params);
        break;
      case 'media.started':
        console.log('Media started:', notification.params);
        break;
      case 'media.stopped':
        console.log('Media stopped:', notification.params);
        break;
      default:
        console.log('Received notification:', notification);
    }
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

  async request<T = any>(method: string, params?: any): Promise<T> {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error('WebSocket not connected');
    }

    const id = uuidv4();
    const request: ZaparooRequest = {
      jsonrpc: '2.0',
      id,
      method,
      ...(params && { params })
    };

    return new Promise((resolve, reject) => {
      this.pendingRequests.set(id, { resolve, reject });
      this.ws!.send(JSON.stringify(request));

      // Request timeout
      setTimeout(() => {
        if (this.pendingRequests.has(id)) {
          this.pendingRequests.delete(id);
          reject(new Error('Request timeout'));
        }
      }, 10000);
    });
  }

  // High-level API methods
  async launchGame(path: string): Promise<void> {
    await this.request('launch', { path });
  }

  async stopGame(): Promise<void> {
    await this.request('stop');
  }

  async searchGames(query: string): Promise<any> {
    return this.request('media.search', { query });
  }

  async getActiveSystems(): Promise<any> {
    return this.request('systems');
  }

  async getActiveMedia(): Promise<any> {
    return this.request('media.active');
  }
}