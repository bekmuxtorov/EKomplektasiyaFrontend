// services/webSocket.ts

export type MessageCallback = (message: string) => void;

class WebSocketService {
  private socket: WebSocket | null = null;
  private url: string = "";
  private messageCallback: MessageCallback | null = null;
  private reconnectTimeout: number | null = null;
  private reconnectInterval = 3000; // ms
  private manuallyClosed = false;

  /**
   * WebSocketga ulanadi
   */
  public connect(url: string, onMessage?: MessageCallback): void {
    this.url = url;
    this.messageCallback = onMessage ?? null;
    this.manuallyClosed = false;

    // Agar avvaldan ochiq bo'lsa — avval yopamiz
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      console.warn("⚠️ WebSocket allaqachon ulangan.");
      return;
    }

    this.socket = new WebSocket(this.url);

    this.socket.onopen = () => {
      console.log("✅ WebSocket ulandi:", this.url);
    };

    this.socket.onmessage = (event: MessageEvent) => {
      console.log("📩 Xabar keldi:", event.data);
      if (this.messageCallback) {
        this.messageCallback(event.data);
      }
    };

    this.socket.onerror = (error) => {
      console.error("❌ WebSocket xato:", error);
    };

    this.socket.onclose = () => {
      console.log("🔌 WebSocket uzildi");
      this.socket = null;

      // reconnect agar foydalanuvchi manual yopmagan bo'lsa
      if (!this.manuallyClosed) {
        this.reconnect();
      }
    };
  }

  /*
    Ulanishni uzadi
   */
  public disconnect(): void {
    this.manuallyClosed = true;

    if (this.socket) {
      this.socket.close();
      this.socket = null;
      console.log("🔴 WebSocket aloqasi yopildi");
    }

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
  }

  /**
   * Xabar yuboradi
   */
  public sendMessage(message: string): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(message);
      console.log("📤 Xabar yuborildi:", message);
    } else {
      console.warn("⚠️ WebSocket ochiq emas, xabar yuborilmadi.");
    }
  }

  /**
   * Serverdan keladigan xabarlarni o‘qish uchun callback belgilaydi
   */
  public onMessage(callback: MessageCallback): void {
    this.messageCallback = callback;
  }

  /**
   * Ulanish holatini tekshirish
   */
  public isConnected(): boolean {
    return this.socket !== null && this.socket.readyState === WebSocket.OPEN;
  }

  /**
   * Reconnect mexanizmi (avtomatik qayta ulanish)
   */
  private reconnect(): void {
    if (this.reconnectTimeout) return;

    console.log(
      `♻️ ${this.reconnectInterval / 1000} soniyadan so‘ng qayta ulaniladi...`
    );

    this.reconnectTimeout = window.setTimeout(() => {
      console.log("🔄 Qayta ulanmoqda...");
      this.connect(this.url, this.messageCallback || undefined);
      this.reconnectTimeout = null;
    }, this.reconnectInterval);
  }
}

const webSocketService = new WebSocketService();
export default webSocketService;
