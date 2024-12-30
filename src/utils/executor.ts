// biome-ignore lint/suspicious/noExplicitAny: <explanation>
type EventData = Record<string, any>;

export class CodeExecutor {
  private worker: Worker;
  private listeners: Record<string, ((data: EventData) => void)[]> = {};

  constructor(code: string) {
    this.worker = new Worker(
      URL.createObjectURL(new Blob([code], { type: 'application/javascript' })),
    );
    this.worker.addEventListener('message', this.listen.bind(this));
  }

  public terminate() {
    this.worker.removeEventListener('message', this.listen);
    this.worker.terminate();
  }

  public on(event: string, fn: (data: EventData) => void) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }

    this.listeners[event].push(fn);
  }

  private listen(e: MessageEvent) {
    const data = JSON.parse(e.data) as EventData;

    if (this.listeners[data.type]) {
      this.listeners[data.type].forEach((fn) => fn(data));
    }
  }
}
