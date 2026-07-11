// Minimal stub so TypeScript compiles without the `ioredis` package installed.
// The real types take over once `npm install ioredis` is run.
declare module 'ioredis' {
  interface RedisOptions {
    lazyConnect?: boolean;
    maxRetriesPerRequest?: number | null;
    enableOfflineQueue?: boolean;
  }
  class Redis {
    constructor(url: string, options?: RedisOptions);
    get(key: string): Promise<string | null>;
    setex(key: string, seconds: number, value: string): Promise<'OK'>;
    del(key: string): Promise<number>;
    on(event: string, listener: (...args: unknown[]) => void): this;
  }
  export default Redis;
}
