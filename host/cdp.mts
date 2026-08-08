// Minimal Chrome DevTools Protocol client, enough to inject a script and mirror logs.

import WebSocket from "ws";

const DEFAULT_ATTACH_TIMEOUT_MS = 60_000;
const ATTACH_POLL_MS = 500;

export interface CdpTarget {
  id: string;
  type: string;
  url: string;
  webSocketDebuggerUrl?: string;
}

export interface RemoteObject {
  type: string;
  subtype?: string;
  className?: string;
  value?: unknown;
  unserializableValue?: string;
  description?: string;
  preview?: { properties?: Array<{ name: string; value: string }> };
}

export interface ExceptionDetails {
  text?: string;
  exception?: RemoteObject;
}

type EventHandler = (params: Record<string, any>) => void;

export const listTargets = async (port: number): Promise<CdpTarget[]> => {
  const response = await fetch(`http://127.0.0.1:${port}/json/list`);
  return response.json() as Promise<CdpTarget[]>;
};

export const isDebuggerUp = async (port: number): Promise<boolean> => {
  try {
    const response = await fetch(`http://127.0.0.1:${port}/json/version`, {
      signal: AbortSignal.timeout(2000),
    });
    return response.ok;
  } catch {
    return false;
  }
};

// Waits for a page target matching `urlPattern` to exist, then connects to it.
export const attach = async (
  port: number,
  urlPattern: RegExp,
  timeoutMs = DEFAULT_ATTACH_TIMEOUT_MS,
): Promise<CdpSession> => {
  const deadline = Date.now() + timeoutMs;

  for (;;) {
    let target: CdpTarget | undefined;
    try {
      const targets = await listTargets(port);
      target = targets.find((t) => t.type === "page" && urlPattern.test(t.url ?? ""));
    } catch {
      // debugger not up yet
    }

    if (target?.webSocketDebuggerUrl) {
      return new CdpSession(target.webSocketDebuggerUrl, target);
    }
    if (Date.now() >= deadline) {
      throw new Error(`No page target matching ${urlPattern} appeared within ${timeoutMs}ms`);
    }
    await new Promise((resolve) => setTimeout(resolve, ATTACH_POLL_MS));
  }
};

export class CdpSession {
  readonly target: CdpTarget;
  readonly ready: Promise<unknown>;
  closed = false;

  private readonly ws: WebSocket;
  private nextId = 1;
  private readonly pending = new Map<
    number,
    { resolve: (value: any) => void; reject: (error: Error) => void }
  >();
  private readonly handlers = new Map<string, EventHandler[]>();

  constructor(wsUrl: string, target: CdpTarget) {
    this.target = target;
    this.ws = new WebSocket(wsUrl, { maxPayload: 2 ** 28 });

    this.ready = new Promise((resolve, reject) => {
      this.ws.once("open", resolve);
      this.ws.once("error", reject);
    });

    this.ws.on("message", (raw: WebSocket.RawData) => {
      let message: any;
      try {
        message = JSON.parse(raw.toString());
      } catch {
        return;
      }

      if (message.id !== undefined) {
        const entry = this.pending.get(message.id);
        if (!entry) return;
        this.pending.delete(message.id);
        if (message.error) entry.reject(new Error(message.error.message ?? "CDP error"));
        else entry.resolve(message.result);
        return;
      }

      for (const listener of this.handlers.get(message.method) ?? []) {
        listener(message.params ?? {});
      }
    });

    this.ws.on("close", () => {
      this.closed = true;
      for (const listener of this.handlers.get("__closed") ?? []) listener({});
    });
  }

  on(method: string, handler: EventHandler): void {
    const listeners = this.handlers.get(method) ?? [];
    listeners.push(handler);
    this.handlers.set(method, listeners);
  }

  send<T = any>(method: string, params: Record<string, unknown> = {}): Promise<T> {
    if (this.closed) return Promise.reject(new Error("CDP session is closed"));
    const id = this.nextId++;
    return new Promise<T>((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  async evaluate<T = unknown>(
    expression: string,
    { awaitPromise = true, returnByValue = true } = {},
  ): Promise<T> {
    const result = await this.send<{
      result?: { value?: T };
      exceptionDetails?: ExceptionDetails;
    }>("Runtime.evaluate", { expression, awaitPromise, returnByValue });

    if (result.exceptionDetails) {
      const detail = result.exceptionDetails;
      throw new Error(detail.exception?.description ?? detail.text ?? "evaluation failed");
    }
    return result.result?.value as T;
  }

  close(): void {
    this.closed = true;
    try {
      this.ws.close();
    } catch {
      // already gone
    }
  }
}
